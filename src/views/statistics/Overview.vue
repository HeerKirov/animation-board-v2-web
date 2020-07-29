<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'overview'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
        a.icon.item(@click="showHelp = true"): i.help.icon
    div.ui.active.centered.inline.loader.mt-4(v-if="loading || updateLoading")
    div.ui.placeholder.segment(v-else-if="notFound")
        div.ui.icon.header
            i.industry.icon
            h2 统计数据暂未生成
            a.ui.green.mini.button(@click="update") 手动生成数据
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
                    div.label 累计观看时长/分钟
                div.ui.statistic.right.floated.px-2
                    div.value {{basicData.avgScore}}
                    div.label 平均分
            div.ui.row
                div.ui.five.wide.column.px-0
                    canvas(ref="originalWorkTypeCtx")
                div.ui.five.wide.column.px-0
                    canvas(ref="publishTypeCtx")
                div.ui.six.wide.column.px-0
                    canvas(ref="scoreCtx")
            div.ui.row
                div.ui.column
                    div.ui.secondary.pointing.two.item.menu
                        a.item(:class="{active: mode === 'count'}", @click="mode = 'count'") 计数
                        a.item(:class="{active: mode === 'average'}", @click="mode = 'average'") 平均分
            div.ui.row(v-if="mode === 'count'")
                div.ui.eight.wide.column.px-0
                    canvas(ref="sexCtx")
                div.ui.eight.wide.column.px-0
                    canvas(ref="violenceCtx")
            div.ui.row(v-else)
                div.ui.eight.wide.column.px-0
                    canvas(ref="sexAvgCtx")
                div.ui.eight.wide.column.px-0
                    canvas(ref="violenceAvgCtx")
            div.ui.row(v-if="mode === 'count'"): div.ui.column
                canvas(ref="tagCtx")
            div.ui.row(v-else): div.ui.column
                canvas(ref="tagAvgCtx")
            div.ui.row(v-if="basicData")
                div.ui.column.text-right
                    span.ui.grey.text.font-size-11 上次更新时间 {{basicData.updateTime}}
    StatisticModal(v-model:visible="showHelp", @refresh="update")
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import StatisticModal from '@/layouts/StatisticModal.vue'
import { useDoughnut, useBar } from '@/functions/chart'
import { useSWR } from '@/functions/server'
import { toCNStringDate } from '@/functions/display'
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
    components: {StatisticModal},
    computed: {
        barItems() { return secondaryBarItems.statistics }
    },
    setup() {
        const { loading, data, error, updateLoading, update } = useSWR('/api/statistics/overview', null, {
            errorHandler(code, data, parent) { if(code !== 404) { parent?.(code, data) } }
        })
        const notFound = computed(() => error.value?.code === 404)

        const basicData = computed(() => data.value ? mapBasicData(data.value) : null)

        const originalWorkTypeData = useDoughnutData(originalWorkTypeLabels, () => data.value?.['original_work_type_counts'])
        const { ctx: originalWorkTypeCtx } = useDoughnut(originalWorkTypeData, {title: '原作类型', aspectRatio: 1.6, legend: {display: true, position: 'top'}})

        const publishTypeData = useDoughnutData(publishTypeLabels, () => data.value?.['publish_type_counts'])
        const { ctx: publishTypeCtx } = useDoughnut(publishTypeData, {title: '放送时间', aspectRatio: 1.6, legend: {display: true, position: 'top'}})

        const scoreData = useDoughnutData(scoreLabels, () => data.value?.['score_counts'])
        const { ctx: scoreCtx } = useDoughnut(scoreData, {title: '评分', aspectRatio: 1.92, legend: {display: true, position: 'top'}})

        const sexData = useDoughnutData(sexLimitLevelLabels, () => data.value?.['sex_limit_level_counts'])
        const { ctx: sexCtx } = useDoughnut(sexData, {title: '分级·性', aspectRatio: 3, legend: {display: true}})

        const violenceData = useDoughnutData(violenceLimitLevelLabels, () => data.value?.['violence_limit_level_counts'])
        const { ctx: violenceCtx } = useDoughnut(violenceData, {title: '分级·暴力', aspectRatio: 3, legend: {display: true}})

        const sexAvgData = useDoughnutData(sexLimitLevelLabels, () => data.value?.['sex_limit_level_avg_scores'])
        const { ctx: sexAvgCtx } = useDoughnut(sexAvgData, {title: '分级·性', aspectRatio: 3, legend: {display: true}, type: 'polarArea'})

        const violenceAvgData = useDoughnutData(violenceLimitLevelLabels, () => data.value?.['violence_limit_level_avg_scores'])
        const { ctx: violenceAvgCtx } = useDoughnut(violenceAvgData, {title: '分级·暴力', aspectRatio: 3, legend: {display: true}, type: 'polarArea'})

        const tagData = useSingleBarData(() => data.value?.['tag_counts'], {backgroundColor: colorCSS.blue, sorted: true})
        const { ctx: tagCtx } = useBar(tagData, {title: '标签', horizontal: true, aspectRatio: 0.8})

        const tagAvgData = useSingleBarData(() => data.value?.['tag_avg_scores'], {backgroundColor(_, s) { return scoreLabels.backgroundColor[Math.round(s) - 1] }, sorted: true})
        const { ctx: tagAvgCtx } = useBar(tagAvgData, {title: '标签', horizontal: true, aspectRatio: 0.8, xSuggestedMax: 10})

        const mode = ref("count")
        const showHelp = ref(false)

        return {loading, updateLoading, update, notFound, mode, showHelp, basicData, originalWorkTypeCtx, publishTypeCtx, scoreCtx, sexCtx, violenceCtx, tagCtx, sexAvgCtx, violenceAvgCtx, tagAvgCtx}
    }
})

function useSingleBarData(effect: () => {[key: string]: number} | null, options: {backgroundColor: string | ((string, number) => string), sorted?: boolean}) {
    const defaultBackgroundColor = typeof options.backgroundColor === 'string' ? options.backgroundColor : null
    return computed(() => {
        const items: {label: string, data: number, backgroundColor?: string}[] = []
        const effected = effect()
        if(effected != null) {
            for(const key in effected) {
                items.push({label: key, data: effected[key], backgroundColor: typeof options.backgroundColor == 'function' ? options.backgroundColor(key, effected[key]) : undefined})
            }
        }
        if(options.sorted) { items.sort((a, b) => a.data === b.data ? 0 : a.data > b.data ? -1 : 1) }
        const labels = items.map(i => i.label)
        const data = items.map(i => i.data)
        const backgroundColor = defaultBackgroundColor ?? items.map(i => i.backgroundColor!)

        return {labels, datasets: [{data, backgroundColor}]}
    })
}

function useDoughnutData(labels: {labels: string[], backgroundColor: string[], keys: string[]}, effect: () => {[key: string]: number} | null) {
    return computed(() => {
        const effected = effect()
        const data = effected == null ? [] : labels.keys.map(key => effected[key])

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
        totalDuration: data['total_duration'],
        avgScore: (data['avg_score'] as number | null)?.toFixed(1),
        updateTime: toCNStringDate(new Date(data['update_time']))
    }
}
</script>

<style scoped>

</style>
