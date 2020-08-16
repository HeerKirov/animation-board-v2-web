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
                    template(v-for="(group, i) in groups")
                        div.font-size-14.is-weight.mb-1(v-if="grouped == 'true'", @dragover.prevent="", @drop.prevent="onDrop($event, i, group.items.length - 1)") {{group.group || '未分组标签'}}
                        router-link.ui.large.label.mr-1.mb-1(v-for="(item, j) in group.items", :to="{name: 'Tag.Detail', params: {id: item.id}}", :class="{primary: item.searchFlag}", 
                                                            draggable="true", @dragstart="onDragStart($event, i, j)",
                                                            @dragover.prevent="", @drop.prevent="onDrop($event, i, j)") {{item.name}}
        div.four.wide.column
            div.ui.segment
                SearchBox(:value="search", @search="onSearch")
                div.ui.divider
                div.ui.stackable.grid
                    div.four.wide.column.px-0.font-size-12.text-right.py-2 分组显示
                    div.twelve.wide.column.pt-1.pb-2
                        ItemSelector(:items="isGroups", :show-none="false", v-model:selected="grouped")
            div.mt-2 共
                span(v-if="grouped == 'true'") {{groups.length}}个分组，
                span {{count}}个标签
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, Ref, toRef, watch } from 'vue'
import SortSelector, { ChangedEvent as SortChangedEvent } from '@/components/SortSelector.vue'
import ItemSelector, { ChangedEvent as ItemChangedEvent } from '@/components/ItemSelector.vue'
import SearchBox, { SearchEvent } from '@/components/SearchBox.vue'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import { useRouterQueryUtil } from '@/functions/routers'
import { useSWR, useServer } from '@/functions/server'
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
        const onSearch = (e: SearchEvent) => { search.value = e.text }

        const { loading, data, manual } = useSWR('/api/database/tags', {order: 'ordinal'})
        const items = computed(() => data.value ? data.value['result'].map(mapItem) : [])
        const count = computed(() => items.value.length)
        const { groups } = useDisplayData(items, search)
        const { onDragStart, onDrop } = useDrag(groups, manual)

        const { stats } = useAuth()

        return {
            grouped,
            search, onSearch,
            loading, groups, count,
            onDragStart, onDrop,
            isStaff: toRef(stats, 'isStaff')
        }
    }
})

function useDisplayData(items: Ref<Instance[]>, search: Ref<string | undefined>) {
    const groups = computed(() => {
        const s = search.value
        const list: Group[] = []
        const map: {[key: string]: Group} = {}
        const nullGroup: Group = {group: null, items: []}

        for(const instance of items.value) {
            const item: GroupItem = {id: instance.id, name: instance.name, searchFlag: s != undefined && instance.name.indexOf(s) >= 0}
            if(instance.group == null) {
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

function useDrag(groups: Ref<Group[]>, manualUpdate: () => void) {
    const { request } = useServer()

    let fromGroup: number | null = null
    let fromIndex: number | null = null

    const onDragStart = (e: DragEvent, groupIndex: number, itemIndex: number) => {
        fromGroup = groupIndex
        fromIndex = itemIndex
    }

    const onDrop = async (e: DragEvent, groupIndex: number, itemIndex: number) => {
        if(!(groupIndex == fromGroup && itemIndex == fromIndex)) {
            const group = groups.value[groupIndex!].group
            const ordinal = (() => {
                let ordinal = 0
                for(let i = 0; i < groupIndex; ++i) { ordinal += groups.value[groupIndex].items.length }
                return ordinal + itemIndex + 2
            })()

            const r = await request(`/api/database/tags/${groups.value[fromGroup!].items[fromIndex!].id}`, 'PATCH', {group, ordinal})
            if(r.ok) {
                manualUpdate()
            }
        }        
    }

    return {onDragStart, onDrop}
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
