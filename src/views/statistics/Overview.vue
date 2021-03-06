<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'overview'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
        a.right.icon.item(@click="showHelp = true"): i.question.circle.icon
    div.ui.active.centered.inline.loader.mt-4(v-if="loading || updateLoading")
    div.ui.placeholder.segment(v-else-if="notFound")
        div.ui.icon.header
            i.industry.icon
            h2 统计数据暂未生成
            a.ui.green.button(@click="onUpdate") 手动生成数据
    div.ui.centered.grid(v-else): div.ui.fourteen.wide.column
        div.ui.grid
            div.ui.row(v-if="basicData"): div.ui.column
                div.ui.statistic.px-2
                    div.value {{basicData.totalAnimations}}
                    div.label 动画总数
                div.ui.small.statistic.px-2
                    div.value {{basicData.totalEpisodes}}
                    div.label 累计观看集数
                div.ui.small.statistic.px-2
                    div.value {{basicData.totalDuration}}
                    div.label 累计观看时长
                div.ui.statistic.right.floated.px-2
                    div.value {{basicData.avgScore}}
                    div.label 平均分
            div.ui.row
                div.ui.five.wide.column
                    ChartCanvas(type="doughnut", :data="originalWorkTypeMeta.data", :options="originalWorkTypeMeta.options")
                div.ui.five.wide.column
                    ChartCanvas(type="doughnut", :data="publishTypeMeta.data", :options="publishTypeMeta.options")
                div.ui.six.wide.column
                    ChartCanvas(type="doughnut", :data="scoreMeta.data", :options="scoreMeta.options")
            div.ui.row
                div.ui.column
                    div.ui.secondary.pointing.two.item.menu
                        a.item(:class="{active: mode === 'count'}", @click="mode = 'count'") 计数
                        a.item(:class="{active: mode === 'average'}", @click="mode = 'average'") 平均分
            div.ui.row(v-if="mode === 'count'")
                div.ui.eight.wide.column.px-0
                    ChartCanvas(type="doughnut", :data="sexMeta.data", :options="sexMeta.options")
                div.ui.eight.wide.column.px-0
                    ChartCanvas(type="doughnut", :data="violenceMeta.data", :options="violenceMeta.options")
            div.ui.row(v-else)
                div.ui.eight.wide.column.px-0
                    ChartCanvas(type="polarArea", :data="sexAvgMeta.data", :options="sexAvgMeta.options")
                div.ui.eight.wide.column.px-0
                    ChartCanvas(type="polarArea", :data="violenceAvgMeta.data", :options="violenceAvgMeta.options")
            div.ui.row(v-if="mode === 'count'"): div.ui.column
                ChartCanvas(type="horizontalBar", :data="tagData", :options="tagOptions")
            div.ui.row(v-else): div.ui.column
                ChartCanvas(type="horizontalBar", :data="tagAvgData", :options="tagOptions")
            div.ui.row(v-if="basicData")
                div.ui.column.text-right
                    span.ui.grey.text.font-size-11 上次更新时间 {{basicData.updateTime}}
    StatisticModal(title="概览", v-model:visible="showHelp", @refresh="onUpdate")
        div 一份从数量和评分入手的基础数据概览。从总览和各个维度的角度出发，总结所有订阅的动画的数量和平均评分。
        h5 总览
        p: i - 动画总数: 所有订阅且至少有过任意观看记录的动画的数量。
        p: i - 累计观看集数: 全部观看记录中，记录在案的集数的累计总和。
        p: i - 累计观看时长: 全部观看记录中，记录在案的集数的累计总时长。
        p: i - 平均分: 全部动画的平均分。
        h5 维度信息
        p 提供的维度有原作类型、放送类型、评分、分级、标签。
        p 其中，原作类型、放送类型、评分只提供数量分布。其评分分布意义不大，或不能统计。
        p 分级和标签维度同时提供数量分布和评分分布，同时提供数量和维度的平均分信息。
</template>

<script lang="ts">
import { ChartData } from 'chart.js'
import { defineComponent, computed, ref, Ref } from 'vue'
import StatisticModal from '@/layouts/StatisticModal.vue'
import ChartCanvas from '@/components/ChartCanvas'
import { useDoughnut } from '@/functions/chart'
import { useSWR } from '@/functions/server'
import { toCNStringDate } from '@/functions/display'
import { digit } from '@/functions/format'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import { publishTypes, originalWorkTypes, sexLimitLevels, violenceLimitLevels } from '@/definitions/animation-definition'
import { colorCSS } from '@/definitions/fomantic-ui-colors'
import { DefinitionItem } from '@/definitions/util'

const originalWorkTypeLabels = generateLabelAndColor(originalWorkTypes)
const publishTypeLabels = generateLabelAndColor(publishTypes)
const sexLimitLevelLabels = generateLabelAndColor(sexLimitLevels)
const violenceLimitLevelLabels = generateLabelAndColor(violenceLimitLevels)
const scoreLabels = {
    backgroundColor: ['grey', 'brown', 'brown', 'yellow', 'yellow', 'yellow', 'yellow', 'orange', 'orange', 'red'].map(i => colorCSS[i]),
    keys: Array(10).fill(0).map((_, i) => `${i + 1}`),
    labels: Array(10).fill(0).map((_, i) => `${i + 1}`)
}

export default defineComponent({
    components: {StatisticModal, ChartCanvas},
    computed: {
        barItems() { return secondaryBarItems.statistics }
    },
    setup() {
        const { loading, data, error, updateLoading, update } = useSWR('/api/statistics/overview', null, {
            errorHandler(code, data, parent) { if(code !== 404) { parent?.(code, data) } }
        })
        const notFound = computed(() => error.value?.code === 404)
        const onUpdate = () => { update(null, {method: 'POST'}) }

        const basicData = computed(() => data.value ? mapBasicData(data.value) : null)

        const originalWorkTypeData = useDoughnutData(originalWorkTypeLabels, () => data.value?.['original_work_type_counts'])
        const originalWorkTypeMeta = useDoughnut(originalWorkTypeData, {title: '原作类型', aspectRatio: 1.6, legend: {display: true, position: 'top'}})

        const publishTypeData = useDoughnutData(publishTypeLabels, () => data.value?.['publish_type_counts'])
        const publishTypeMeta = useDoughnut(publishTypeData, {title: '放送时间', aspectRatio: 1.6, legend: {display: true, position: 'top'}})

        const scoreData = useDoughnutData(scoreLabels, () => data.value?.['score_counts'])
        const scoreMeta = useDoughnut(scoreData, {title: '评分', aspectRatio: 1.92, legend: {display: true, position: 'top'}})

        const sexData = useDoughnutData(sexLimitLevelLabels, () => data.value?.['sex_limit_level_counts'])
        const sexMeta = useDoughnut(sexData, {title: '分级·性', aspectRatio: 3, legend: {display: true}})

        const violenceData = useDoughnutData(violenceLimitLevelLabels, () => data.value?.['violence_limit_level_counts'])
        const violenceMeta = useDoughnut(violenceData, {title: '分级·暴力', aspectRatio: 3, legend: {display: true}})

        const sexAvgData = useDoughnutData(sexLimitLevelLabels, () => data.value?.['sex_limit_level_avg_scores'], true)
        const sexAvgMeta = useDoughnut(sexAvgData, {title: '分级·性', aspectRatio: 3, legend: {display: true}})

        const violenceAvgData = useDoughnutData(violenceLimitLevelLabels, () => data.value?.['violence_limit_level_avg_scores'], true)
        const violenceAvgMeta = useDoughnut(violenceAvgData, {title: '分级·暴力', aspectRatio: 3, legend: {display: true}})

        const tagData = useSingleBarData(() => data.value?.['tag_counts'], {backgroundColor: colorCSS.blue})
        const tagAvgData = useSingleBarData(() => data.value?.['tag_avg_scores'], {backgroundColor(_, s) { return scoreLabels.backgroundColor[Math.round(s) - 1] }, fixed: true})
        const tagOptions = getTagBarOption()

        const mode = ref("count")
        const showHelp = ref(false)

        return {
            loading, updateLoading, onUpdate, notFound, mode, showHelp, basicData, 
            tagData, tagAvgData, tagOptions,
            originalWorkTypeMeta, publishTypeMeta, scoreMeta, 
            sexMeta, sexAvgMeta, violenceMeta, violenceAvgMeta
        }
    }
})

function getTagBarOption() {
    return {
        title: {display: true, text: '标签'}, 
        legend: undefined, 
        aspectRatio: 0.7, 
        scales: {
            yAxes: [{ticks: {beginAtZero: true, stepSize: 1}, gridLines: {display: false}}], 
            xAxes: [{ticks: {beginAtZero: true, suggestedMax: 10}}]
        }
    }
}

function useSingleBarData(effect: () => {[key: string]: number} | null, options: {backgroundColor: string | ((string, number) => string), fixed?: boolean}) {
    const defaultBackgroundColor = typeof options.backgroundColor === 'string' ? options.backgroundColor : null
    return computed(() => {
        const items: {label: string, data: number, backgroundColor?: string}[] = []
        const effected = effect()
        if(effected != null) {
            for(const key in effected) {
                items.push({label: key, data: options.fixed ? digit(effected[key], 100)! : effected[key], backgroundColor: typeof options.backgroundColor == 'function' ? options.backgroundColor(key, effected[key]) : undefined})
            }
        }
        items.sort((a, b) => a.data === b.data ? 0 : a.data > b.data ? -1 : 1)
        const labels = items.map(i => i.label)
        const data = items.map(i => i.data)
        const backgroundColor = defaultBackgroundColor ?? items.map(i => i.backgroundColor!)

        return {labels, datasets: [{data, backgroundColor}]}
    })
}

function useDoughnutData(labels: {labels: string[], backgroundColor: string[], keys: string[]}, effect: () => {[key: string]: number} | null, fixed?: boolean) {
    return computed(() => {
        const effected = effect()
        const data = effected == null ? [] : fixed ? labels.keys.map(key => digit(effected[key])!) : labels.keys.map(key => effected[key])

        return {data, backgroundColor: labels.backgroundColor, labels: labels.labels}
    })
}

function generateLabelAndColor(items: DefinitionItem[]): {labels: string[], backgroundColor: string[], keys: string[]} {
    return {
        labels: items.map(i => i.title ?? i.name),
        backgroundColor: items.map(i => colorCSS[i.color!]),
        keys: items.map(i => i.name)
    }
}

function mapBasicData(data: any) {
    return {
        totalAnimations: data['total_animations'],
        totalEpisodes: data['total_episodes'],
        totalDuration: toFriendlyDuration(data['total_duration'] as number),
        avgScore: digit(data['avg_score'] as number | null),
        updateTime: toCNStringDate(new Date(data['update_time']))
    }
}

function toFriendlyDuration(duration: number): string {
    return `${Math.floor(duration / 60)}小时${duration % 60}分钟`
}
</script>
