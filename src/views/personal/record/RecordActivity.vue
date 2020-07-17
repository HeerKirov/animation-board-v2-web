<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'activity'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
    div.ui.grid
        div.twelve.wide.column
            div.ui.inline.active.centered.loader(v-if="loading")
            div.ui.feed.ml-2(v-else)
                div.event(v-for="item in items")
                    div.label
                        img(:src="item.cover")
                    div.content
                        div.summary
                            router-link.user(:to="{name: 'Record.Detail', params: {id: item.id}}") {{item.title}}
                            = ' {{item.activeEvent}}'
                            div.date {{item.activeTime}}
                            div.float-right(v-if="item.progress") {{item.progress}}%
                            //- TODO 做一个进度条
        div.four.wide.column
            div.ui.segment
                SearchBox(:value="search", @search="onSearch")
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
import { usePagination } from '@/functions/parameters'
import { toFriendlyTime } from '@/functions/display'
import { useSWR } from '@/functions/server'
import cover from '@/plugins/cover'

const limit = 15

export default defineComponent({
    components: {SearchBox, PageSelector, ItemSelector},
    computed: {
        barItems() { return secondaryBarItems.record }
    },
    setup() {
        const { updateQuery, watchQuery } = useRouterQueryUtil({resetField: {field: 'page', value: undefined, excludes: ['order']}})

        const items = ref([])
        const totalNum: Ref<number | null> = ref(null)

        const search: Ref<string | undefined> = ref()
        const { page, pageMax, offset, pageToQuery, pageFromQuery } = usePagination(totalNum, limit)

        const onSearch = (e: SearchEvent) => updateQuery('search', e.text)
        const onPageChanged = (e: PageChangedEvent) => updateQuery('page', pageToQuery(e.page))

        watchQuery({
            'search'(value) { search.value = value || undefined },
            'page': pageFromQuery
        })

        const fetcher = reactive({
            'search': search,
            'limit': limit,
            'offset': offset
        })

        const { loading, data } = useSWR('/api/personal/records/activity', fetcher, {byAuthorization: 'LOGIN'})

        watchEffect(() => {
            if(data.value) {
                items.value = data.value['result'].map(mapItem)
                totalNum.value = data.value['total']
            }else{
                items.value = []
                totalNum.value = null
            }
        })

        return {search, onSearch, page, pageMax, onPageChanged, loading, items, totalNum}
    }
})

function mapItem(item: any) {
    const eventType = item['active_event']['type']
    const activeEvent = eventType === 'CREATE_RECORD' ? '加入日记'
        : eventType === 'CREATE_PROGRESS' ? '创建新的进度'
        : eventType === 'WATCH_EPISODE' ? `观看第${(item['active_event']['episode'] as number[]).join(', ')}话`
        : '未知类型的事件'
    return {
        id: item['animation_id'],
        title: item['title'],
        cover: cover.animationOrEmpty(item['cover']),
        progress: item['progress'] ? Math.floor(item['progress'] * 100) : null,
        activeTime: item['active_time'] ? toFriendlyTime(new Date(item['active_time'])) : null,
        activeEvent
    }
}
</script>
