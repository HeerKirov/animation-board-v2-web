<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'period'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
        a.right.icon.item(@click="showHelp = true"): i.question.circle.icon
    div.ui.active.centered.inline.loader.mt-4(v-if="loading || updateLoading")
    div.ui.placeholder.segment(v-else-if="notFound")
        div.ui.icon.header
            i.industry.icon
            h2 统计数据暂未生成
            a.ui.green.button(@click="onFullUpdate") 手动生成数据
    div.ui.centered.grid(v-else)
        div.ui.four.wide.column
            div.ui.tabular.vertical.menu.mt-2
                a.item(:class="{active: bound === 'all'}", @click="bound = 'all'") 全时段
                a.item(v-for="i in boundList", :key="i", :class="{active: bound === i}", @click="bound = i") {{i}}年
        div.ui.ten.wide.column
            div.ui.active.centered.inline.loader.mt-4(v-if="dataLoading")
            div.ui.placeholder.segment(v-else-if="dataNotFound")
                div.ui.icon.header
                    i.industry.icon
                    h2 未找到数据
            div(v-else)
                div.ui.secondary.menu
                    div.right.menu
                        ItemSelector(:items="views", v-model:selected="currentView", :show-none="false")
                div
                div.ui.two.columns.grid.pt-6
                    div.ui.column: canvas(ref="hourCtx")
                    div.ui.column: canvas(ref="weekdayCtx")
            div.ui.column.text-right.mt-4(v-if="data")
                span.ui.grey.text.font-size-11 上次更新时间 {{data.updateTime}}
    StatisticModal(title="周期", v-model:visible="showHelp", @refresh="onFullUpdate")
        div 横向对比一个周期时间内的看番数量，了解看番的习惯时间。
        h5 周期时间
        p 周期时间可以24小时或7天为周期，统计在一个周期的时间内，每个时间点看动画的频率。
        p 频率的方案有两种，按时间点频数统计或按时间点看番集数统计。
        p 可以统计全部时间的数据，或者统计某一年的数据。
</template>

<script lang="ts">
import { ChartData } from 'chart.js'
import { defineComponent, computed, ref, Ref, reactive, watch, toRef } from 'vue'
import CalendarBox from '@/components/CalendarBox.vue'
import ItemSelector from '@/components/ItemSelector.vue'
import StatisticModal from '@/layouts/StatisticModal.vue'
import { useChart } from '@/functions/chart'
import { useSWR } from '@/functions/server'
import { Calendar } from '@/functions/format'
import { toCNStringDate } from '@/functions/display'
import { arrays } from '@/functions/util'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import { colorCSS } from '@/definitions/fomantic-ui-colors'
import { DefinitionItem } from '@/definitions/util'

interface Metadata {lower: number | null, upper: number | null}

interface DataResult {
    episodeOfHours: number[],
    episodeOfWeekdays: number[],
    dayOfHours: number[],
    dayOfWeekdays: number[],
    updateTime: string
}

const weekdayLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const hourLabels = arrays.range(0, 24).map(i => `${i}时`)

const views: DefinitionItem[] = [
    {name: 'sum', title: '集数频数'},
    {name: 'count', title: '时间频数'}
]

export default defineComponent({
    components: {CalendarBox, ItemSelector, StatisticModal},
    computed: {
        barItems() { return secondaryBarItems.statistics },
        views() { return views }
    },
    setup() {
        const { loading, updateLoading, notFound, metadata, onFullUpdate } = useOverviewData()

        const { currentView, bound, boundList } = useFilter(metadata)

        const { dataLoading, dataNotFound, data } = useData(bound)

        const { hourCtx, weekdayCtx } = useChartDisplay(data, currentView)

        const showHelp = ref(false)

        return {
            loading, updateLoading, notFound, showHelp, onFullUpdate,
            currentView, bound, boundList,
            dataLoading, dataNotFound, data,
            hourCtx, weekdayCtx,
        }
    }
})

function useOverviewData() {
    const { loading, data, updateLoading, update } = useSWR('/api/statistics/period/overview', null)
    const notFound = ref(false)
    const metadata: Metadata = reactive({
        lower: null,
        upper: null
    })
    watch(data, () => {
        if(data.value['update_time'] == null) {
            notFound.value = true
        }else{
            notFound.value = false
            metadata.lower = data.value['begin_year']
            metadata.upper = data.value['end_year']
        }
    })
    const onFullUpdate = async () => { await update(null, {url: '/api/statistics/period', method: 'POST'}) }

    return {loading, updateLoading, notFound, metadata, onFullUpdate}
}

function useFilter(metadata: Metadata) {
    const bound: Ref<string> = ref("all")

    const boundList: Ref<string[]> = computed(() => metadata.lower != null && metadata.upper != null ? arrays.range(metadata.lower, metadata.upper + 1).map(i => i.toString()).reverse() : [])

    const currentView = ref(views[0].name)

    return {currentView, bound, boundList}
}

function useData(bound: Ref<string>) {
    const url = computed(() => `/api/statistics/period/${bound.value}`)

    const { loading, data, error } = useSWR(url, null, {
        byAuthorization: 'LOGIN',
        errorHandler(code, data, parent) { if(code !== 404) { parent?.(code, data) } }
    })
    const notFound = computed(() => error.value?.code === 404)
    const dataResult: Ref<DataResult | null> = computed(() => data.value ? mapData(data.value) : null)

    return {dataLoading: loading, dataNotFound: notFound, data: dataResult}
}

function useChartDisplay(data: Ref<DataResult | null>, view: Ref<string>) {
    const hourData: Ref<ChartData> = computed(() => {
        return data.value == null ? {labels: [], datasets: []} : {
            labels: hourLabels,
            datasets: [{backgroundColor: colorCSS.blue, data: view.value === 'count' ? data.value.dayOfHours : data.value.episodeOfHours},]
        }
    })

    const { ctx: hourCtx } = useChart(hourData, 'polarArea', {
        title: {display: true, text: '24小时'},
        legend: {display: false},
        aspectRatio: 1,
    })

    const weekdayData: Ref<ChartData> = computed(() => {
        return data.value == null ? {labels: [], datasets: []} : {
            labels: weekdayLabels,
            datasets: [{backgroundColor: colorCSS.blue, data: view.value === 'count' ? data.value.dayOfWeekdays : data.value.episodeOfWeekdays},]
        }
    })

    const { ctx: weekdayCtx } = useChart(weekdayData, 'polarArea', {
        title: {display: true, text: '7天'},
        legend: {display: false},
        aspectRatio: 1,
    })

    return {hourCtx, weekdayCtx}
}

function mapData(data: any): DataResult {
    return {
        episodeOfHours: arrays.range(0, 24).map(i => data['episode_of_hours'][i] ?? 0),
        dayOfHours: arrays.range(0, 24).map(i => data['day_of_hours'][i] ?? 0),
        episodeOfWeekdays: arrays.range(0, 7).map(i => data['episode_of_weekdays'][i + 1] ?? 0),
        dayOfWeekdays: arrays.range(0, 7).map(i => data['day_of_weekdays'][i + 1] ?? 0),
        updateTime: toCNStringDate(new Date(data['update_time']))
    }
}
</script>
