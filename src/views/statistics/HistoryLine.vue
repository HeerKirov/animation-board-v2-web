<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'historyline'}", :to="item.link")
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
                div.ui.column(v-if="currentView !== 'score'")
                    ChartCanvas(type="bar", :data="stackedData", :options="stackedOptions")
                div.ui.column(v-else)
                    ChartCanvas(type="bar", :data="tiledData", :options="tiledOptions")
            div.ui.row
                div.ui.column.text-right
                    span.ui.grey.text.font-size-11 上次更新时间 {{metadata.updateTime}}
    StatisticModal(title="历史线", v-model:visible="showHelp", @refresh="onFullUpdate")
        div 以动画发布时间为基准，纵向比对所看的不同年代的动画的数量和质量。
        h5 聚合信息
        p - 时间粒度: 要浏览的数据的最小时间点。可选的时间点为季度或年。由于大部分TV动画集中在1、4、7、10月放送，按月聚合意义不大。
        p - 最早/最晚时间点: 要浏览的数据前后范围。
        h5 视图
        p - 动画数量: 每个时间点看过的动画的数量。
        p - 评分分布: 每个时间点看过的动画的评分情况，包括最低分、最高分、平均分。
</template>

<script lang="ts">
import { ChartData } from 'chart.js'
import { defineComponent, computed, ref, Ref, reactive, watch } from 'vue'
import ChartCanvas from '@/components/ChartCanvas'
import CalendarBox from '@/components/CalendarBox.vue'
import ItemSelector from '@/components/ItemSelector.vue'
import StatisticModal from '@/layouts/StatisticModal.vue'
import { useSWR, useServer } from '@/functions/server'
import { Calendar, digit } from '@/functions/format'
import { toCNStringDate } from '@/functions/display'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import { colorCSS } from '@/definitions/fomantic-ui-colors'
import { DefinitionItem } from '@/definitions/util'
import { arrays } from '@/functions/util'

interface Bound {lower: Calendar | null, upper: Calendar | null}

interface Metadata extends Bound {updateTime: string | null}

interface DataItem {
    label: string
    chaseAnimations: number
    supplementAnimations: number
    maxScore: number
    minScore: number
    avgScore: number
    scoreCounts: {[score: number]: number}
}

const scoreBackgroundColors = ['grey', 'brown', 'brown', 'yellow', 'yellow', 'yellow', 'yellow', 'orange', 'orange', 'red'].map(i => colorCSS[i])

const views: DefinitionItem[] = [
    {name: 'count', title: '动画数量'},
    {name: 'score', title: '评分概况'},
    {name: 'scoreMap', title: '评分分布'}
]

const aggregations: DefinitionItem[] = [
    {name: 'YEAR', title: '年'},
    {name: 'SEASON', title: '季度'}
]

export default defineComponent({
    components: {CalendarBox, ItemSelector, StatisticModal, ChartCanvas},
    computed: {
        barItems() { return secondaryBarItems.statistics },
        views() { return views },
        aggregations() { return aggregations }
    },
    setup() {
        const { loading, updateLoading, notFound, metadata, onFullUpdate } = useOverviewData()

        const { currentView, bound, aggregateTimeUnit } = useFilter(metadata)

        const { data, updateData } = useData(bound, aggregateTimeUnit)

        const { stackedData, tiledData, stackedOptions, tiledOptions } = useChartDisplay(data, currentView)

        const showHelp = ref(false)

        return {
            loading, updateLoading, notFound, showHelp,
            metadata,
            currentView, bound, aggregateTimeUnit,
            stackedData, tiledData, stackedOptions, tiledOptions,
            async onFullUpdate() {
                await onFullUpdate()
                updateData()
            }
        }
    }
})

function useOverviewData() {
    const { loading, data, updateLoading, update } = useSWR('/api/statistics/historyline/overview', null)
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
            metadata.lower = {year: data.value['begin_year'], month: (data.value['begin_season'] - 1) * 3 + 1}
            metadata.upper = {year: data.value['end_year'], month: data.value['end_season'] * 3}
        }
    })
    const onFullUpdate = async () => { await update(null, {url: '/api/statistics/historyline', method: 'POST'}) }

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

    const url = computed(() => query.value.lower && query.value.upper ? '/api/statistics/historyline' : null)

    const { data, manual: updateData } = useSWR(url, reactive(query))

    const items: Ref<DataItem[] | null> = ref(null)
    watch(data, () => { items.value = data.value ? (data.value['items'] as any[]).map(i => mapDataItem(i, aggregateTimeUnit.value)) : null })

    return {data: items, updateData}
}

function useChartDisplay(data: Ref<DataItem[] | null>, currentView: Ref<string>) {
    const tiledSet = new Set(['score'])

    const stackedData: Ref<ChartData> = computed(() => {
        return data.value == null ? {labels: [], datasets: []} : {
            labels: data.value.map(i => i.label),
            datasets: currentView.value === 'count' ? [
                {label: '追番数量', backgroundColor: colorCSS.blue + '4F', borderColor: colorCSS.blue, borderWidth: 1, data: data.value.map(i => i.chaseAnimations)},
                {label: '非追番数量', backgroundColor: colorCSS.blue, borderWidth: 1, data: data.value.map(i => i.supplementAnimations)}
            ] : currentView.value === 'scoreMap' ? arrays.range(1, 10 + 1).map(score => {
                return {label: score.toString(), backgroundColor: scoreBackgroundColors[score - 1], borderWidth: 1, data: data.value!.map(i => i.scoreCounts[score])}
            }) : []
        }
    })
    const stackedOptions = {
        aspectRatio: 3,
        scales: {
            yAxes: [{stacked: true, ticks: {beginAtZero: true}}],
            xAxes: [{stacked: true, gridLines: {display: false}}]
        }
    }

    const tiledData: Ref<ChartData> = computed(() => {
        return !tiledSet.has(currentView.value) || data.value == null ? {labels: [], datasets: []} : {
            labels: data.value.map(i => i.label),
            datasets: [
                {label: '最低分', backgroundColor: colorCSS.pink, data: data.value.map(i => i.minScore)},
                {label: '平均分', backgroundColor: colorCSS.purple, data: data.value.map(i => i.avgScore)},
                {label: '最高分', backgroundColor: colorCSS.violet, data: data.value.map(i => i.maxScore)}
            ]
        }
    })
    const tiledOptions = {
        aspectRatio: 3,
        scales: {
            yAxes: [{ticks: {beginAtZero: true, suggestedMax: 10}}],
            xAxes: [{gridLines: {display: false}}]
        }
    }

    return {stackedData, tiledData, stackedOptions, tiledOptions}
}

function dateToBoundString(date: Calendar, aggregateTimeUnit: string) {
    if(aggregateTimeUnit === 'YEAR') {
        return `${date.year}`
    }else{
        return `${date.year}-${Math.floor((date.month - 1) / 3) + 1}`
    }
}

function mapDataItem(item: any, aggregateTimeUnit: string): DataItem {
    return {
        label: mapTimeToLabel(item['time'] as string, aggregateTimeUnit),
        chaseAnimations: item['chase_animations'],
        supplementAnimations: item['supplement_animations'],
        maxScore: item['max_score'] ?? 0,
        minScore: item['min_score'] ?? 0,
        avgScore: digit(item['avg_score']) ?? 0,
        scoreCounts: analyseScoreCounts(item['score_counts'])
    }
}

function mapTimeToLabel(time: string, aggregateTimeUnit: string): string {
    if(aggregateTimeUnit === 'YEAR') {
        return `${time}年`
    }else{
        const [y, s] = time.split('-')
        return `${y}年${'冬春夏秋'[parseInt(s) - 1]}季`
    }
}

function analyseScoreCounts(original: {[score: number]: number}): {[score: number]: number} {
    let sum = 0
    for(let i = 1; i <= 10; ++i) { sum += original[i] ?? 0 }
    let ret: {[score: number]: number} = {}
    if(sum > 0) {
        for(let i = 1; i <= 10; ++i) {
            if(original[i]) {
                ret[i] = original[i] / sum
            }
        }
    }
    return ret
}
</script>
