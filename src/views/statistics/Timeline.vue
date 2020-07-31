<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'timeline'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
        a.right.icon.item(@click="showHelp = true"): i.question.circle.icon
    div.ui.active.centered.inline.loader.mt-4(v-if="loading || updateLoading")
    div.ui.placeholder.segment(v-else-if="notFound")
        div.ui.icon.header
            i.industry.icon
            h2 查询不到任何统计信息
            a.ui.green.button(@click="onFullUpdate") 手动生成数据
    div.ui.centered.grid(v-else): div.ui.fourteen.wide.column
        div.ui.grid
            div.ui.row
                div.ui.column
                    div.ui.secondary.menu
                        a.item(v-for="view in views", :class="{active: currentView === view.name}", @click="currentView = view.name") {{view.title}}
                        div.right.menu
                            ItemSelector(:items="aggregations", v-model:selected="aggregateTimeUnit", :show-none="false")
            div.ui.row
                div.ui.eight.wide.column
                        CalendarBox(max-width="140px", placeholder="最早时间点", v-model="bound.lower", first="year", until="month")
                div.ui.eight.wide.column
                        CalendarBox.float-right(max-width="140px", placeholder="最晚时间点", v-model="bound.upper", first="year", until="month")
            div.ui.row
                div.ui.column(v-if="currentView === 'score'")
                    canvas(ref="scoreCtx")
                div.ui.column(v-else)
                    canvas(ref="countCtx")
            div.ui.row
                div.ui.column.text-right
                    span.ui.grey.text.font-size-11 上次更新时间 {{metadata.updateTime}}
    StatisticModal(title="时间线", v-model:visible="showHelp", @refresh="onFullUpdate")
        div 以观看时间为基准，纵向比对生涯不同时期所看动画的数量和质量。
        h5 聚合信息
        p: i - 时间粒度: 要浏览的数据的最小时间点。可选的时间点为月、季度或年。将在这些尺度上呈现数据。
        p: i - 最早/最晚时间点: 要浏览的数据前后范围。
        h5 视图
        p: i - 动画数量: 每个时间点看完的进度的数量。仅以看完时间为准。
        p: i - 累计集数：每个时间点看完的动画总集数。任何存在观看记录时间点，或观看记录时间点可推断的数据都会被记录。
        p: i - 累计时长: 每个时间点看完的动画总时长，单位分钟。其原理同上。
        p: i - 评分分布: 每个时间点新看完的动画的评分情况，包括最低分、最高分、平均分。
        h5 维度
        p: i - 首次看完: 第一次看完的动画或集数。
        p: i - 重看看完: 重复观看时看完的动画或集数。二周目及以上的进度计算在内。
        p: i - 离散数据: 通过离散标记的集数。
</template>

<script lang="ts">
import { ChartData } from 'chart.js'
import { defineComponent, computed, ref, Ref, reactive, watch } from 'vue'
import CalendarBox from '@/components/CalendarBox.vue'
import ItemSelector from '@/components/ItemSelector.vue'
import StatisticModal from '@/layouts/StatisticModal.vue'
import { useChart } from '@/functions/chart'
import { useSWR } from '@/functions/server'
import { Calendar } from '@/functions/format'
import { toCNStringDate } from '@/functions/display'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import { colorCSS } from '@/definitions/fomantic-ui-colors'
import { DefinitionItem } from '@/definitions/util'

interface Bound {lower: Calendar | null, upper: Calendar | null}

interface Metadata extends Bound {updateTime: string | null}

interface DataItem {
    label: string
    watchedAnimations: number
    rewatchedAnimations: number
    watchedEpisodes: number
    rewatchedEpisodes: number
    scatterEpisodes: number
    watchedDuration: number
    rewatchedDuration: number
    scatterDuration: number
    maxScore: number
    minScore: number
    avgScore: number
}

const views: DefinitionItem[] = [
    {name: 'count', title: '动画数量'},
    {name: 'episode', title: '累计集数'},
    {name: 'duration', title: '累计时长'},
    {name: 'score', title: '评分分布'}
]

const aggregations: DefinitionItem[] = [
    {name: 'MONTH', title: '月'},
    {name: 'SEASON', title: '季度'},
    {name: 'YEAR', title: '年'}
]

export default defineComponent({
    components: {CalendarBox, ItemSelector, StatisticModal},
    computed: {
        barItems() { return secondaryBarItems.statistics },
        views() { return views },
        aggregations() { return aggregations }
    },
    setup() {
        const { loading, updateLoading, notFound, metadata, onFullUpdate } = useOverviewData()

        const { currentView, bound, aggregateTimeUnit } = useFilter(metadata)

        const { data } = useData(bound, aggregateTimeUnit)

        const { countCtx, scoreCtx } = useChartDisplay(data, currentView)

        const showHelp = ref(false)

        return {
            loading, updateLoading, notFound, showHelp,
            metadata, onFullUpdate,
            currentView, bound, aggregateTimeUnit,
            countCtx, scoreCtx
        }
    }
})

function useOverviewData() {
    const { loading, data, updateLoading, update } = useSWR('/api/statistics/timeline/overview', null, {byAuthorization: 'LOGIN'})
    const notFound = ref(false)
    const metadata: Metadata = reactive({
        updateTime: null,
        lower: null,
        upper: null
    })
    watch(data, () => {
        if(data.value['update_time'] == null) {
            notFound.value = true
        }else{
            notFound.value = false
            metadata.updateTime = toCNStringDate(new Date(data.value['update_time']))
            metadata.lower = {year: data.value['begin_year'], month: data.value['begin_month']}
            metadata.upper = {year: data.value['end_year'], month: data.value['end_month']}
        }
    })
    const onFullUpdate = async () => { await update(null, {url: '/api/statistics/timeline', method: 'POST'}) }

    return {loading, updateLoading, notFound, metadata, onFullUpdate}
}

function useFilter(metadata: Metadata) {
    const bound: Bound = reactive({
        lower: null,
        upper: null
    })
    watch(metadata, () => {
        if(bound.lower == null) bound.lower = metadata.lower
        if(bound.upper == null) bound.upper = metadata.upper
    })

    const aggregateTimeUnit: Ref<string> = ref(aggregations[0].name)

    const currentView = ref(views[0].name)

    return {currentView, bound, aggregateTimeUnit}
}

function useData(bound: Bound, aggregateTimeUnit: Ref<string>) {
    const query = computed(() => {
        return {
            aggregate: aggregateTimeUnit.value,
            lower: bound.lower ? dateToBoundString(bound.lower, aggregateTimeUnit.value) : undefined,
            upper: bound.upper ? dateToBoundString(bound.upper, aggregateTimeUnit.value) : undefined
        }
    })

    const url = computed(() => query.value.lower && query.value.upper ? '/api/statistics/timeline' : null)

    const { data } = useSWR(url, reactive(query))

    const items: Ref<DataItem[] | null> = ref(null)
    watch(data, () => { items.value = data.value ? (data.value['items'] as any[]).map(i => mapDataItem(i, aggregateTimeUnit.value)) : null })

    return {data: items}
}

function useChartDisplay(data: Ref<DataItem[] | null>, currentView: Ref<string>) {
    const countData: Ref<ChartData> = computed(() => {
        return currentView.value === 'score' || data.value == null ? {labels: [], datasets: []} : {
            labels: data.value.map(i => i.label),
            datasets: currentView.value === 'count' ? [
                {label: '首次看完动画', backgroundColor: colorCSS.blue, data: data.value.map(i => i.watchedAnimations)},
                {label: '重看看完动画', backgroundColor: colorCSS.olive, data: data.value.map(i => i.rewatchedAnimations)}
            ] : currentView.value === 'episode' ? [
                {label: '首次看完集数', backgroundColor: colorCSS.blue, data: data.value.map(i => i.watchedEpisodes)},
                {label: '重看看完集数', backgroundColor: colorCSS.olive, data: data.value.map(i => i.rewatchedEpisodes)},
                {label: '离散看完集数', backgroundColor: colorCSS.yellow, data: data.value.map(i => i.scatterEpisodes)}
            ] : currentView.value === 'duration' ? [
                {label: '首次看完集数时长', backgroundColor: colorCSS.blue, data: data.value.map(i => i.watchedDuration)},
                {label: '重看看完集数时长', backgroundColor: colorCSS.olive, data: data.value.map(i => i.rewatchedDuration)},
                {label: '离散看完集数时长', backgroundColor: colorCSS.yellow, data: data.value.map(i => i.scatterDuration)}
            ] : []
        }
    })

    const { ctx: countCtx } = useChart(countData, 'bar', {
        aspectRatio: 3,
        scales: {
            yAxes: [{stacked: true, ticks: {beginAtZero: true}}],
            xAxes: [{stacked: true, gridLines: {display: false}}]
        }
    })

    const scoreData: Ref<ChartData> = computed(() => {
        return currentView.value !== 'score' || data.value == null ? {labels: [], datasets: []} : {
            labels: data.value.map(i => i.label),
            datasets: [
                {label: '最低分', backgroundColor: colorCSS.pink, data: data.value.map(i => i.minScore)},
                {label: '平均分', backgroundColor: colorCSS.purple, data: data.value.map(i => i.avgScore)},
                {label: '最高分', backgroundColor: colorCSS.violet, data: data.value.map(i => i.maxScore)}
            ]
        }
    })

    const { ctx: scoreCtx } = useChart(scoreData, 'bar', {
        aspectRatio: 3,
        scales: {
            yAxes: [{ticks: {beginAtZero: true, suggestedMax: 10}}],
            xAxes: [{gridLines: {display: false}}]
        }
    })

    return {countCtx, scoreCtx}
}

function dateToBoundString(date: Calendar, aggregateTimeUnit: string) {
    if(aggregateTimeUnit === 'YEAR') {
        return `${date.year}`
    }else if(aggregateTimeUnit === 'SEASON') {
        return `${date.year}-${Math.floor((date.month - 1) / 3) + 1}`
    }else{
        return `${date.year}-${date.month}`
    }
}

function mapDataItem(item: any, aggregateTimeUnit: string): DataItem {
    return {
        label: mapTimeToLabel(item['time'] as string, aggregateTimeUnit),
        watchedAnimations: item['watched_animations'],
        rewatchedAnimations: item['rewatched_animations'],
        watchedEpisodes: item['watched_episodes'],
        rewatchedEpisodes: item['rewatched_episodes'],
        scatterEpisodes: item['scatter_episodes'],
        watchedDuration: item['watched_duration'],
        rewatchedDuration: item['rewatched_duration'],
        scatterDuration: item['scatter_duration'],
        maxScore: item['max_score'] ?? 0,
        minScore: item['min_score'] ?? 0,
        avgScore: item['avg_score'] ?? 0
    }
}

function mapTimeToLabel(time: string, aggregateTimeUnit: string): string {
    if(aggregateTimeUnit === 'YEAR') {
        return `${time}年`
    }else if(aggregateTimeUnit === 'SEASON') {
        const [y, s] = time.split('-')
        return `${y}年${'冬春夏秋'[parseInt(s) - 1]}季`
    }else{
        const [y, m] = time.split('-')
        return `${y}年${parseInt(m)}月`
    }
}
</script>

<style scoped>

</style>
