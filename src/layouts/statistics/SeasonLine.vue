<template lang="pug">
div.ui.secondary.menu.mt-1
    a.item(v-for="view in views", :class="{active: currentView === view.name}", @click="currentView = view.name") {{view.title}}
div: canvas(ref="ctx")
div.ui.column.text-right.mt-4(v-if="updateTime")
    span.ui.grey.text.font-size-11 上次更新时间 {{updateTime}}
</template>

<script lang="ts">
import { defineComponent, PropType, ref, Ref, computed, reactive, watch } from 'vue'
import { ChartData } from 'chart.js'
import { useSWR } from '@/functions/server'
import { useChart } from '@/functions/chart'
import { toCNStringDate } from '@/functions/display'
import { digit } from '@/functions/format'
import { DefinitionItem } from '@/definitions/util'
import { colorCSS } from '@/definitions/fomantic-ui-colors'

interface Metadata {lowerYear: number | null, lowerSeason: number | null, upperYear: number | null, upperSeason: number | null}

interface DataItem {
    label: string
    totalAnimations: number
    maxScore: number
    minScore: number
    avgScore: number
    avgPositivity: number
}

const views: DefinitionItem[] = [
    {name: 'count', title: '动画数量'},
    {name: 'score', title: '评分分布'},
    {name: 'positivity', title: '积极性'}
]

export default defineComponent({
    props: {
        metadata: {type: (null as any) as PropType<Metadata>, required: true}
    },
    computed: {
        views() { return views }
    },
    setup(props) {
        const currentView = ref(views[0].name)

        const { data, updateTime, updateData } = useData(computed(() => props.metadata))

        const { ctx } = useChartDisplay(data, currentView)

        return {currentView, ctx, updateTime, updateData}
    }
})

function useData(metadata: Ref<Metadata>) {
    const query = computed(() => {
        return {
            lower: `${metadata.value.lowerYear}-${metadata.value.lowerSeason}`,
            upper: `${metadata.value.upperYear}-${metadata.value.upperSeason}`
        }
    })

    const { data, manual } = useSWR(computed(() => metadata.value.lowerYear != null && metadata.value.upperSeason != null ? '/api/statistics/season/line' : null), reactive(query))

    const items: Ref<DataItem[] | null> = computed(() => data.value ? (data.value['items'] as any[]).map(mapDataItem) : null)
    const updateTime = computed(() => data.value ? toCNStringDate(new Date(data.value['update_time'])) : null)

    return {data: items, updateTime, updateData: manual}
}

function useChartDisplay(data: Ref<DataItem[] | null>, currentView: Ref<string>) {
    const ctxData: Ref<ChartData> = computed(() => {
        return data.value == null ? {labels: [], datasets: []} : {
            labels: data.value.map(i => i.label),
            datasets: currentView.value === 'count' ? [
                {label: '动画数量', backgroundColor: colorCSS.blue, data: data.value.map(i => i.totalAnimations)},
            ] : currentView.value === 'score' ? [
                {label: '最低分', backgroundColor: colorCSS.pink, data: data.value.map(i => i.minScore)},
                {label: '平均分', backgroundColor: colorCSS.purple, data: data.value.map(i => i.avgScore)},
                {label: '最高分', backgroundColor: colorCSS.violet, data: data.value.map(i => i.maxScore)}
            ] : [
                {label: '平均积极性', backgroundColor: colorCSS.green, data: data.value.map(i => i.avgPositivity)},
            ]
        }
    })

    const { ctx } = useChart(ctxData, 'bar', {
        aspectRatio: 3,
        scales: {
            yAxes: [{ticks: {beginAtZero: true, suggestedMax: 5}}],
            xAxes: [{gridLines: {display: false}}]
        }
    })

    return {ctx}
}

function mapDataItem(item: any): DataItem {
    return {
        label: `${item['year']}年${'冬春夏秋'[item['season'] - 1]}`,
        totalAnimations: item['total_animations'],
        maxScore: item['max_score'] ?? 0,
        minScore: item['min_score'] ?? 0,
        avgScore: digit(item['avg_score']) ?? 0,
        avgPositivity: digit(item['avg_positivity']) ?? 0
    }
}
</script>
