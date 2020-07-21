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
                        router-link.image(:to="{name: 'Comment.New', params: {id: item.id}}")
                            img(:src='item.cover')
                        div.content
                            router-link.header.font-size-14(:to="{name: 'Comment.New', params: {id: item.id}}") {{item.title}}
                            div.meta
                                span.date.font-size-11
                                    template(v-if="sortValue === 'CREATE_TIME'") {{item.createTime}}
                                    template(v-else-if="sortValue === 'FINISH_TIME'") {{item.finishTime}}
                                    template(v-else) {{item.publishTime}}
        div.four.wide.column
            div.ui.segment.pb-4
                SearchBox(:value="search", @search="onSearch")
                div.ui.divider
                SortSelector.px-2(:items="orders", :selected="sortValue", :direction="sortDirection", @changed="onSortChanged")
            PageSelector(:max="pageMax", :current="page", @changed="onPageChanged")
            div.mt-2(v-if="totalNum != null") 共发现{{totalNum}}项未评价的动画
</template>

<script lang="ts">
import { defineComponent, ref, Ref, reactive, watchEffect } from 'vue'
import SearchBox, { SearchEvent } from '@/components/SearchBox.vue'
import PageSelector, { ChangedEvent as PageChangedEvent } from '@/components/PageSelector.vue'
import SortSelector, { ChangedEvent as SortChangedEvent } from '@/components/SortSelector.vue'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import { useRouterQueryUtil } from '@/functions/routers'
import { usePagination, useSort } from '@/functions/parameters'
import { toCNStringDate, toPublishTime } from '@/functions/display'
import { useSWR } from '@/functions/server'
import cover from '@/plugins/cover'

const orders = [
    {name: 'FINISH_TIME', title: '看完时间', icon: 'eye icon', argument: 'finish_time'},
    {name: 'CREATE_TIME', title: '创建时间', icon: 'folder plus icon', argument: 'create_time'},
    {name: 'PUBLISH_TIME', title: '放送时间', icon: 'video icon', argument: 'publish_time,-create_time'}
]
const defaultOrderValue = "CREATE_TIME"
const defaultOrderDirection = -1

const limit = 15

export default defineComponent({
    components: {SearchBox, PageSelector, SortSelector},
    computed: {
        barItems() { return secondaryBarItems.comment },
        orders() { return orders }
    },
    setup() {
        const { updateQuery, watchQuery } = useRouterQueryUtil({resetField: {field: 'page', value: undefined, excludes: ['order']}})

        const items = ref([])
        const totalNum: Ref<number | null> = ref(null)

        const search: Ref<string | undefined> = ref()
        const { page, pageMax, offset, pageToQuery, pageFromQuery } = usePagination(totalNum, limit)
        const { sortValue, sortDirection, order, sortToQuery, sortFromQuery } = useSort(orders, defaultOrderValue, defaultOrderDirection)

        const onSearch = (e: SearchEvent) => updateQuery('search', e.text)
        const onSortChanged = (e: SortChangedEvent) => updateQuery('order', sortToQuery(e.name, e.direction))
        const onPageChanged = (e: PageChangedEvent) => updateQuery('page', pageToQuery(e.page))

        watchQuery({
            'search'(value) { search.value = value || undefined },
            'order': sortFromQuery,
            'page': pageFromQuery
        })

        const fetcher = reactive({
            'search': search,
            'order': order,
            'limit': limit,
            'offset': offset
        })

        const { loading, data } = useSWR('/api/personal/comments/find', fetcher, {byAuthorization: 'LOGIN'})

        watchEffect(() => {
            if(data.value) {
                items.value = data.value['result'].map(mapItem)
                totalNum.value = data.value['total']
            }else{
                items.value = []
                totalNum.value = null
            }
        })

        return {
            search, onSearch,
            sortValue, sortDirection, onSortChanged,
            page, pageMax, onPageChanged,
            loading, items, totalNum
        }
    }
})

function mapItem(item: any) {
    return {
        id: item['animation_id'],
        title: item['title'],
        cover: cover.animationOrEmpty(item['cover']),
        publishTime: item['publish_time'] ? toPublishTime(item['publish_time']) : null,
        finishTime: item['finish_time'] ? toCNStringDate(new Date(item['finish_time'])) : null,
        createTime: toCNStringDate(new Date(item['create_time']))
    }
}
</script>