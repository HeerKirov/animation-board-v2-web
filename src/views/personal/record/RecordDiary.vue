<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'diary'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
    div.ui.grid
        div.twelve.wide.column
            div.ui.inline.active.centered.loader(v-if="loading")
            template(v-else)
                div.ui.segment.diary-item(v-for="(item, index) in items", :key="item.id")
                    router-link.cover(:to="{name: 'Record.Detail', params: {id: item.id}}")
                        img(:src="item.cover")
                        div.title: h2 {{item.title}}
                    div.publish-plan: div.ui.teal.label(v-if="item.nextPublishPlan != null") {{item.nextPublishPlan}}
                        div.detail 第{{item.nextPublish}}话
                    div.episodes
                        template(v-if="item.watchedEpisodes != null")
                            span.ui.label {{item.watchedEpisodes}}
                            = '/'
                        template(v-if="item.publishedEpisodes < item.totalEpisodes")
                            span.ui.teal.label {{item.publishedEpisodes}}
                            = '/'
                        span.ui.grey.label {{item.totalEpisodes}}
                        div.next(v-if="item.nextWatch != null"): button.ui.tertiary.small.button(@click="onNext(index)", :class="{disabled: item.updateLoading}")
                            = 'NEXT 第{{item.nextWatch}}话'
                            i.notched.circle.loading.icon.ml-1.mr-0(v-if="item.updateLoading")
                            i.plane.icon.ml-1.mr-0(v-else)

        div.four.wide.column
            div.ui.segment.pb-4
                SearchBox(:value="search", @search="onSearch")
                div.ui.divider
                SortSelector.px-2(:items="orders", :selected="sortValue", :direction="sortDirection", @changed="onSortChanged")
                div.ui.divider
                ItemIconSelector.px-3(:items="filters", :selected="filter", @update:selected="onFilterUpdate", :show-none="false")
            div.mt-2 共{{items.length}}个订阅项
</template>

<script lang="ts">
import { defineComponent, ref, Ref, reactive, watchEffect, computed, watch } from 'vue'
import SearchBox, { SearchEvent } from '@/components/SearchBox.vue'
import SortSelector, { ChangedEvent as SortChangedEvent } from '@/components/SortSelector.vue'
import ItemIconSelector from '@/components/ItemIconSelector.vue'
import { toNameSet } from '@/definitions/util'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import { useRouterQueryUtil } from '@/functions/routers'
import { useSelector, useSort } from '@/functions/parameters'
import { toWeekdayTableTime } from '@/functions/display'
import { useSWR, useServer } from '@/functions/server'
import cover from '@/plugins/cover'

const orders = [
    {name: 'WEEKLY_CALENDAR', title: '周历排序', icon: 'calendar alternate icon', argument: 'weekly_calendar'},
    {name: 'UPDATE_SOON', title: '即将更新', icon: 'tv icon', argument: 'update_soon'},
    {name: 'SUBSCRIPTION', title: '订阅顺序', icon: 'thumbtack icon', argument: 'subscription_time'}
]
const defaultOrderValue = "WEEKLY_CALENDAR"
const defaultOrderDirection = 1

const filters = [
    {name: 'ACTIVE', title: '活跃', icon: 'paper plane icon'},
    {name: 'WATCHABLE', title: '有存货', icon: 'archive icon'},
    {name: 'UPDATING', title: '更新中', icon: 'smile icon'},
    {name: 'COMPLETED', title: '已完结', icon: 'sticky note icon'},
    {name: 'SHELVE', title: '已搁置', icon: 'pause icon'}
]

interface Instance {
    id: number
    title: string
    cover: string
    totalEpisodes: number
    publishedEpisodes: number
    watchedEpisodes: number | null
    nextPublishPlan: string | null
    nextPublish: number | null
    nextWatch: number | null
    updateLoading: boolean
}

export default defineComponent({
    components: {SearchBox, SortSelector, ItemIconSelector},
    computed: {
        barItems() { return secondaryBarItems.record },
        orders() { return orders },
        filters() { return filters }
    },
    setup() {
        const { request } = useServer()
        const { updateQuery, watchQuery } = useRouterQueryUtil()

        const search: Ref<string | undefined> = ref()
        const { selected: filter, toQuery: filterToQuery, fromQuery: filterFromQuery } = useSelector(toNameSet(filters), filters[0].name)
        const { sortValue, sortDirection, order, sortToQuery, sortFromQuery } = useSort(orders, defaultOrderValue, defaultOrderDirection)

        const onSearch = (e: SearchEvent) => updateQuery('search', e.text)
        const onFilterUpdate = (value: string) => updateQuery('filter', value)
        const onSortChanged = (e: SortChangedEvent) => updateQuery('order', sortToQuery(e.name, e.direction))

        watchQuery({
            'search'(value) { search.value = value || undefined },
            'filter': filterFromQuery,
            'order': sortFromQuery
        })

        const fetcher = reactive({
            'search': search,
            'order': order,
            'filter': filter
        })

        const { loading, data } = useSWR('/api/personal/records/diary', fetcher, {byAuthorization: 'LOGIN'})

        const items: Ref<Instance[]> = ref([])
        watch(data, () => {
            const now = new Date()
            items.value = data.value ? (data.value['result'] as any[]).map(i => mapItem(i, now, data.value['night_time_table'])) : []
        })

        const onNext = async (index: number) => {
            const item = items.value[index]
            item.updateLoading = true
            const r = await request(`/api/personal/records/${item.id}/next-episode`, 'POST')
            item.updateLoading = false
            if(r.ok) {
                item.watchedEpisodes = r.data['watched_episodes']
                item.nextWatch = item.publishedEpisodes > (item.watchedEpisodes ?? 0) ? (item.watchedEpisodes ?? 0) + 1 : null
            }
        }

        return {
            search, onSearch, filter, onFilterUpdate,
            sortValue, sortDirection, onSortChanged,
            loading, items, onNext
        }
    }
})

function mapItem(item: any, now: Date, nightTimeTable: boolean): Instance {
    const publishedEpisodes = item['published_episodes'] as number
    const watchedEpisodes = item['watched_episodes'] as number | null
    const nextPublishPlan = item['next_publish_plan'] ? toWeekdayTableTime(new Date(item['next_publish_plan']), now, nightTimeTable ? 2 : 0) : null

    return {
        id: item['animation_id'],
        title: item['title'],
        cover: cover.animationOrEmpty(item['cover']),
        totalEpisodes: item['total_episodes'], 
        publishedEpisodes, watchedEpisodes, nextPublishPlan,
        nextWatch: publishedEpisodes > (watchedEpisodes ?? 0) ? (watchedEpisodes ?? 0) + 1 : null,
        nextPublish: nextPublishPlan != null ? (publishedEpisodes + 1) : null,
        updateLoading: false
    }
}
</script>

<style scoped>
    .diary-item {
        height: 100px;
        padding: 0;
        overflow: hidden;
    }
    .diary-item .cover {
        float: left;
    }
    .diary-item .cover img {
        height: 100px;
        width: 100px;
    }
    .diary-item .title {
        position: absolute;
        left: 100px;
        top: 50%;
        width: calc((100% - 100px) * 0.45);
        transform: translateY(-55%);
        padding-left: 5px;
    }
    .diary-item .title h2 {
        font-size: 21px;
        color: black;
    }
    .diary-item .publish-plan {
        position: absolute;
        left: calc((100% - 100px) * 0.45 + 100px);
        top: 50%;
        width: calc((100% - 100px) * 0.3);
        transform: translateY(-50%);
        padding-left: 5px;
    }
    .diary-item .episodes {
        position: absolute;
        right: 0;
        top: 50%;
        width: calc((100% - 100px) * 0.25);
        transform: translateY(-50%);
        text-align: right;
        padding-right: 15px;
    }
    .diary-item .episodes .next {
        position: absolute; 
        right: 5px;
    }
</style>
