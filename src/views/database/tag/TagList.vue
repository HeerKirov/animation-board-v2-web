<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'tag'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
        router-link.right.item(v-if="isStaff", :to="{name: 'Tag.New'}")
            i.plus.icon
            = '新建'
    div.ui.grid
        div.twelve.wide.column
            div.ui.segment.px-6.main-panel
                div.ui.active.inverted.dimmer(v-if="loading")
                    div.ui.loader
                template(v-else)
                    template(v-for="group in groups")
                        div.font-size-14.is-weight.mb-1(v-if="grouped == 'true'") {{group.group || '未分组标签'}}
                        router-link.ui.large.label.mr-2.mb-1(v-for="item in group.items", :to="{name: 'Tag.Detail', params: {id: item.id}}", :class="{primary: item.searchFlag}") {{item.name}}
        div.four.wide.column
            div.ui.segment.pb-4
                SearchBox(:value="search", @search="onSearch")
                div.ui.divider
                SortSelector.px-2(:items="orders", :selected="sortValue", :direction="sortDirection", @changed="onSortChanged")
                div.ui.divider
                div.ui.stackable.grid
                    div.four.wide.column.px-0.font-size-12.text-right.py-2 分组
                    div.twelve.wide.column.pt-1.pb-2
                        ItemSelector(:items="isGroups", :show-none="false", v-model:selected="grouped")
            div.mt-2(v-if="count > 0") 共{{count}}个标签
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, Ref, toRef, watch } from 'vue'
import SortSelector, { ChangedEvent as SortChangedEvent } from '@/components/SortSelector.vue'
import ItemSelector, { ChangedEvent as ItemChangedEvent } from '@/components/ItemSelector.vue'
import SearchBox, { SearchEvent } from '@/components/SearchBox.vue'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import { useRouterQueryUtil } from '@/functions/routers'
import { useSWR } from '@/functions/server'
import { useSort, useSelector } from '@/functions/parameters'
import { useAuth } from '@/functions/auth'
import { toNameSet } from '@/definitions/util'

interface Instance {id: number, name: string, group: string | null}

interface Group {group: string | null, items: GroupItem[]}

interface GroupItem {id: number, name: string, searchFlag: boolean}

const isGroups = [
    {name: 'true', title: '是'},
    {name: 'false', title: '否'}
]
const orders = [
    {name: 'ORDINAL', title: '预设排序', icon: 'sort amount down icon', argument: 'ordinal'},
    {name: 'NAME', title: '名称', icon: 'tags icon', argument: 'name'},
    {name: 'COUNT', title: '动画数量', icon: 'calculator icon', argument: 'animation_count'},
    {name: 'CREATE_TIME', title: '创建时间', icon: 'folder plus icon', argument: 'create_time'},
    {name: 'UPDATE_TIME', title: '更新时间', icon: 'pen nib icon', argument: 'update_time'}
]
const defaultOrderValue = "ORDINAL"
const defaultOrderDirection = 1

export default defineComponent({
    components: {SearchBox, SortSelector, ItemSelector},
    computed: {
        barItems: () => secondaryBarItems.database,
        orders() { return orders },
        isGroups() { return isGroups }
    },
    setup() {
        const { updateQuery, watchQuery } = useRouterQueryUtil()

        const groupedValue = ref(true)
        const grouped = computed({
            set(v) { groupedValue.value = v === 'true'},
            get() { return groupedValue.value.toString() }
        })
        const search: Ref<string | undefined> = ref()
        const { sortValue, sortDirection, order, sortToQuery, sortFromQuery } = useSort(orders, defaultOrderValue, defaultOrderDirection)

        const onSearch = (e: SearchEvent) => updateQuery('search', e.text)
        const onSortChanged = (e: SortChangedEvent) => updateQuery('order', sortToQuery(e.name, e.direction))

        watchQuery({
            'search'(value) { search.value = value || undefined },
            'order': sortFromQuery
        })

        const fetcher = reactive({order})

        const { loading, data } = useSWR('/api/database/tags', fetcher)
        const items = computed(() => {
            if(data.value) {
                return data.value['result'].map(mapItem)
            }else{
                return []
            }
        })
        const count = computed(() => items.value.length)
        
        const { groups } = useDisplayData(items, search, groupedValue)

        const { stats } = useAuth()

        return {
            grouped,
            search, onSearch,
            sortValue, sortDirection, onSortChanged,
            loading, groups, count,
            isStaff: toRef(stats, 'isStaff')
        }
    }
})

function useDisplayData(items: Ref<Instance[]>, search: Ref<string | undefined>, grouped: Ref<boolean>) {
    const groups = computed(() => {
        const s = search.value
        const list: Group[] = []
        const map: {[key: string]: Group} = {}
        const nullGroup: Group = {group: null, items: []}

        for(const instance of items.value) {
            const item: GroupItem = {id: instance.id, name: instance.name, searchFlag: s != undefined && instance.name.indexOf(s) >= 0}
            if(!grouped.value || instance.group == null) {
                nullGroup.items.push(item)
            }else{
                let group = map[instance.group]
                if(group == null) {
                    group = {group: instance.group, items: []}
                    list.push(group)
                    map[instance.group] = group
                }
                group.items.push(item)
            }
        }
        if(nullGroup.items.length > 0) {
            list.push(nullGroup)
        }

        return list
    })

    return {groups}
}

function mapItem(item: any): Instance {
    return {
        id: item['id'],
        name: item['name'],
        group: item['group']
    }
}
</script>

<style scoped>
    .main-panel {
        min-height: 50px;
    }
</style>
