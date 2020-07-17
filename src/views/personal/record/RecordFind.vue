<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'find'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
    div.ui.grid
        div.twelve.wide.column
            div.ui.inline.active.centered.loader(v-if="loading")
            div.ui.stackable.five.columns.grid.px-1(v-else)
                div.column.p-2(v-for="item in items", :key="item.id")
                    div.ui.card
                        router-link.image(:to="item.link")
                            img(:src='item.cover')
                        div.content
                            router-link.header.font-size-14(:to="item.link") {{item.title}}
                            div.meta
                                span.date.font-size-11 {{item.episodes}}
                        div.extra.content.font-size-11(v-if="item.recordInfo")
                            i.bookmark.icon
                            = '{{item.recordInfo}}'
        div.four.wide.column
            div.ui.segment.pb-4
                SearchBox(:value="search", @search="onSearch")
                div.ui.divider
                SortSelector.px-2(:items="orders", :selected="sortValue", :direction="sortDirection", @changed="onSortChanged")
                div.ui.divider
                ItemSelector(:items="filters", :selected="filter", @changed="onFilterChanged", :show-none="false")
            PageSelector(:max="pageMax", :current="page", @changed="onPageChanged")
            div.mt-2(v-if="totalNum != null") 共发现{{totalNum}}条记录
</template>

<script lang="ts">
import { defineComponent, ref, Ref, reactive, watchEffect } from 'vue'
import SearchBox, { SearchEvent } from '@/components/SearchBox.vue'
import PageSelector, { ChangedEvent as PageChangedEvent } from '@/components/PageSelector.vue'
import SortSelector, { ChangedEvent as SortChangedEvent } from '@/components/SortSelector.vue'
import ItemSelector, { ChangedEvent as ItemChangedEvent } from '@/components/ItemSelector.vue'
import { toNameSet } from '@/definitions/util'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import { useRouterQueryUtil } from '@/functions/routers'
import { usePagination, useSort, useSelector } from '@/functions/parameters'
import { useSWR } from '@/functions/server'
import cover from '@/plugins/cover'

const orders = [
    {name: 'CREATE_TIME', title: '创建时间', icon: 'folder plus icon', argument: 'create_time'},
    {name: 'UPDATE_TIME', title: '更新时间', icon: 'pen nib icon', argument: 'update_time'},
    {name: 'PUBLISH_TIME', title: '放送时间', icon: 'video icon', argument: 'publish_time,-create_time'}
]
const defaultOrderValue = "CREATE_TIME"
const defaultOrderDirection = -1

const filters = [
    {name: 'NOT_SEEN', title: '没有看过'},
    {name: 'INCOMPLETE', title: '未订阅的进度'},
    {name: 'RECORDED', title: '在日记角落'}
]

const limit = 15

export default defineComponent({
    components: {SearchBox, PageSelector, SortSelector, ItemSelector},
    computed: {
        barItems() { return secondaryBarItems.record },
        orders() { return orders },
        filters() { return filters }
    },
    setup() {
        const { updateQuery, watchQuery } = useRouterQueryUtil({resetField: {field: 'page', value: undefined, excludes: ['order']}})

        const items: Ref<any[]> = ref([])
        const totalNum: Ref<number | null> = ref(null)

        const search: Ref<string | undefined> = ref()
        const { selected: filter, toQuery: filterToQuery, fromQuery: filterFromQuery } = useSelector(toNameSet(filters), filters[0].name)
        const { page, pageMax, offset, pageToQuery, pageFromQuery } = usePagination(totalNum, limit)
        const { sortValue, sortDirection, order, sortToQuery, sortFromQuery } = useSort(orders, defaultOrderValue, defaultOrderDirection)

        const onSearch = (e: SearchEvent) => updateQuery('search', e.text)
        const onFilterChanged = (e: ItemChangedEvent) => updateQuery('filter', e.name)
        const onSortChanged = (e: SortChangedEvent) => updateQuery('order', sortToQuery(e.name, e.direction))
        const onPageChanged = (e: PageChangedEvent) => updateQuery('page', pageToQuery(e.page))

        watchQuery({
            'search'(value) { search.value = value || undefined },
            'filter': filterFromQuery,
            'order': sortFromQuery,
            'page': pageFromQuery
        })

        const fetcher = reactive({
            'search': search,
            'order': order,
            'limit': limit,
            'offset': offset,
            'filter': filter
        })

        const { loading, data } = useSWR('/api/personal/records/find', fetcher, {byAuthorization: 'LOGIN'})

        watchEffect(() => {
            if(data.value) {
                items.value = (data.value['result'] as any[]).map(i => mapItem(i, filter.value!))
                totalNum.value = data.value['total']
            }else{
                items.value = []
                totalNum.value = null
            }
        })

        return {
            search, onSearch, filter, onFilterChanged,
            sortValue, sortDirection, onSortChanged,
            page, pageMax, onPageChanged,
            loading, items, totalNum
        }
    }
})

function mapItem(item: any, filter: string) {
    const watchedEpisodes = (item['watched_episodes'] == null ? '' : item['watched_episodes'] == 0 ? '未开始' : `已看${item['watched_episodes']}话`)
    const progress = item['progress'] == null ? '' : `(${Math.floor(item['progress'] * 100)}%)`
    return {
        title: item['title'],
        cover: cover.animationOrEmpty(item['cover']),
        episodes: item['published_episodes'] >= item['total_episodes'] ? `全${item['total_episodes']}话` : `${item['published_episodes']}/${item['total_episodes']}话`,
        recordInfo: watchedEpisodes + progress,
        link: {name: filter === 'NOT_SEEN' ? 'Animation.Detail' : 'Record.Detail', params: {id: item['animation_id']}}
    }
}
</script>

<style scoped>

</style>
