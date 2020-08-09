<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'history'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
    div.ui.grid
        div.twelve.wide.column
            div.ui.inline.active.centered.loader(v-if="loading")
            table.ui.very.basic.table.ml-1(v-else)
                tbody
                    tr(v-for="item in items")
                        td: h4.ui.image.header
                            img.ui.mini.rounded.image(:src="item.cover")
                            div.content
                                router-link.black-text(:to="{name: 'Record.Detail', params: {id: item.id}}") {{item.title}}
                                div.sub.header(v-if="item.ordinal > 1") {{item.ordinal}}周目
                        td: div.text-right {{item.time}}
        div.four.wide.column
            div.ui.segment
                SearchBox(:value="search", @search="onSearch")
                div.ui.divider
                div.ui.stackable.grid
                    div.four.wide.column.px-0.font-size-12.text-right.py-2 进度筛选
                    div.twelve.wide.column.pt-1.pb-2
                        ItemSelector(:items="ordinals", :selected="ordinal", @changed="onOrdinalChanged")
            PageSelector(:max="pageMax", :current="page", @changed="onPageChanged")
            div.mt-2(v-if="totalNum != null") 共{{totalNum}}条记录
</template>

<script lang="ts">
import { defineComponent, ref, Ref, reactive, watchEffect } from 'vue'
import SearchBox, { SearchEvent } from '@/components/SearchBox.vue'
import PageSelector, { ChangedEvent as PageChangedEvent } from '@/components/PageSelector.vue'
import ItemSelector, { ChangedEvent as ItemChangedEvent } from '@/components/ItemSelector.vue'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import { useRouterQueryUtil } from '@/functions/routers'
import { usePagination, useSelector } from '@/functions/parameters'
import { toCNStringDate } from '@/functions/display'
import { useSWR } from '@/functions/server'
import cover from '@/plugins/cover'
import { toNameSet } from '@/definitions/util'

const ordinals = [
    {name: 'LAST', title: '最新进度'},
    {name: 'FIRST', title: '首次进度'},
    {name: 'REWATCHED', title: '重看进度'}
]

const limit = 15

export default defineComponent({
    components: {SearchBox, PageSelector, ItemSelector},
    computed: {
        barItems() { return secondaryBarItems.record },
        ordinals() { return ordinals }
    },
    setup() {
        const { updateQuery, watchQuery } = useRouterQueryUtil({resetField: {field: 'page', value: undefined, excludes: ['order']}})

        const items = ref([])
        const totalNum: Ref<number | null> = ref(null)

        const search: Ref<string | undefined> = ref()
        const { page, pageMax, offset, pageToQuery, pageFromQuery } = usePagination(totalNum, limit)
        const { selected: ordinal, toQuery: ordinalToQuery, fromQuery: ordinalFromQuery } = useSelector(toNameSet(ordinals))

        const onSearch = (e: SearchEvent) => updateQuery('search', e.text)
        const onPageChanged = (e: PageChangedEvent) => updateQuery('page', pageToQuery(e.page))
        const onOrdinalChanged = (e: ItemChangedEvent) => updateQuery('ordinal', ordinalToQuery(e.name))

        watchQuery({
            'search'(value) { search.value = value || undefined },
            'ordinal': ordinalFromQuery,
            'page': pageFromQuery
        })

        const fetcher = reactive({
            'search': search,
            'ordinal': ordinal,
            'limit': limit,
            'offset': offset
        })

        const { loading, data } = useSWR('/api/personal/records/history', fetcher, {byAuthorization: 'LOGIN'})

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
            ordinal, onOrdinalChanged,
            page, pageMax, onPageChanged,
            loading, items, totalNum
        }
    }
})

function mapItem(item: any) {
    const startTime = item['start_time'] ? toCNStringDate(new Date(item['start_time'])) : null
    const finishTime = item['finish_time'] ? toCNStringDate(new Date(item['finish_time'])) : null
    return {
        id: item['animation_id'],
        title: item['title'],
        cover: cover.animationOrEmpty(item['cover']),
        ordinal: item['ordinal'],
        time: startTime != null ? `${startTime} → ${finishTime}` : finishTime
    }
}
</script>

<style scoped>
    .black-text {
        color: black;
    }
</style>
