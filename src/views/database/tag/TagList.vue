<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'tag'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
        router-link.right.item(:to="{name: 'Tag.New'}")
            i.plus.icon
            = '新建'
    div.ui.grid
        div.twelve.wide.column
            div.ui.segment.px-6.main-panel
                div.ui.active.inverted.dimmer(v-if="loading")
                    div.ui.loader
                template(v-else)
                    router-link.ui.large.label.mr-2.mb-1(v-for="item in items", :to="{name: 'Tag.Detail', params: {id: item.id}}") {{item.name}}
        div.four.wide.column
            div.ui.segment.pb-4
                SearchBox(:value="search", @search="onSearch")
                div.ui.divider
                SortSelector.px-2(:items="orders", :selected="sortValue", :direction="sortDirection", @changed="onSortChanged")
            div.mt-2 共45条记录
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, Ref } from 'vue'
import SortSelector, { ChangedEvent as SortChangedEvent } from '@/components/SortSelector.vue'
import SearchBox, { SearchEvent } from '@/components/SearchBox.vue'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import { useRouterQueryUtil } from '@/functions/routers'
import { useSWR } from '@/functions/server'
import { useSort } from '@/functions/parameters'

const orders = [
    {name: 'NAME', title: '名称', icon: 'tags icon', argument: 'name'},
    {name: 'CREATE_TIME', title: '创建时间', icon: 'folder plus icon', argument: 'create_time'},
    {name: 'UPDATE_TIME', title: '更新时间', icon: 'pen nib icon', argument: 'update_time'}
]
const defaultOrderValue = "CREATE_TIME"
const defaultOrderDirection = 1

export default defineComponent({
    components: {SearchBox, SortSelector},
    computed: {
        barItems: () => secondaryBarItems.database,
        orders() { return orders }
    },
    setup() {
        const { updateQuery, watchQuery } = useRouterQueryUtil()

        const search: Ref<string | undefined> = ref()
        const { sortValue, sortDirection, order, sortToQuery, sortFromQuery } = useSort(orders, defaultOrderValue, defaultOrderDirection)

        const onSearch = (e: SearchEvent) => updateQuery('search', e.text)
        const onSortChanged = (e: SortChangedEvent) => updateQuery('order', sortToQuery(e.name, e.direction))

        watchQuery({
            'search'(value) { search.value = value || undefined },
            'order': sortFromQuery
        })

        const fetcher = reactive({order, search})

        const { loading, data } = useSWR('/api/database/tags', fetcher)

        const items = computed(() => {
            if(data.value) {
                return data.value['result'].map(mapItem)
            }else{
                return []
            }
        })

        return {
            search, onSearch,
            sortValue, sortDirection, onSortChanged,
            loading, items
        }
    }
})

function mapItem(item: any) {
    return {
        id: item['id'],
        name: item['name'],
        flag: false
    }
}
</script>

<style scoped>
    .main-panel {
        min-height: 50px;
    }
</style>