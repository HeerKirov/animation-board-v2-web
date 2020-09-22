<template lang="pug">
div.ui.active.centered.inline.loader.mt-4(v-if="loading || updateLoading")
div.ui.placeholder.segment(v-else-if="notFound")
    div.ui.icon.header
        i.industry.icon
        h2 未找到，或本季没有数据
        a.ui.green.button(@click="onUpdate") 强制手动生成数据
div.ui.grid(v-else-if="data")
    div.ui.row: div.ui.column
        div.ui.statistic.px-2
            div.value {{data.totalAnimations}}
            div.label 动画总数
        div.ui.small.pink.statistic.px-2
            div.value {{data.minScore ?? '...'}}
            div.label 最低评分
        div.ui.small.purple.statistic.px-2
            div.value {{data.avgScore ?? '...'}}
            div.label 平均评分
        div.ui.small.violet.statistic.px-2
            div.value {{data.maxScore ?? '...'}}
            div.label 最高评分
        div.ui.small.green.statistic.right.floated.px-2.mt-3
            div.value {{data.avgPositivity ?? '...'}}
            div.label 平均积极性
    div.ui.row
        div.ui.eleven.wide.column
            div.mb-2(v-for="item in data.animations")
                div.ui.tiny.rounded.image
                    img(:src="item.cover")
                    div.ui.top.right.attached.green.tiny.label.p-1(v-if='item.completed') 未看完
                div.item.content 
                    div.title {{item.title}}
                    div.labels
                        div.ui.label.py-1(v-if="item.score")
                            i.star.icon
                            = '{{item.score}}'
                        div.ui.label.py-1(v-if="item.positivity")
                            i.tachometer.alternate.icon
                            = '{{item.positivity}}'
                    div.font-size-13(v-if="item.time") {{item.time}}
        div.ui.five.wide.column
            div: ChartCanvas(type="doughnut", :data="sexMeta.data", :options="sexMeta.options")
            div: ChartCanvas(type="doughnut", :data="violenceMeta.data", :options="violenceMeta.options")
            div.scroll-list.mt-3: div.ui.stackable.two.columns.grid.mt-0.mx-0
                div.ui.column.pr-1.pl-0.pt-0.pb-1(v-for="tag in data.tagCounts")
                    div.ui.fluid.label.text-center.px-0 {{tag.name}}
                        div.detail {{tag.count}}
    div.ui.row
        div.ui.column.text-right
            span.ui.grey.text.font-size-11 上次更新时间 {{data.updateTime}}
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import ChartCanvas from '@/components/ChartCanvas'
import { useSWR } from '@/functions/server'
import { useDoughnut } from '@/functions/chart'
import { toCNStringDate } from '@/functions/display'
import { digit } from '@/functions/format'
import { sexLimitLevels, violenceLimitLevels } from '@/definitions/animation-definition'
import { colorCSS } from '@/definitions/fomantic-ui-colors'
import { DefinitionItem } from '@/definitions/util'
import cover from '@/plugins/cover'

const sexLimitLevelLabels = generateLabelAndColor(sexLimitLevels)
const violenceLimitLevelLabels = generateLabelAndColor(violenceLimitLevels)

export default defineComponent({
    components: {ChartCanvas},
    props: {
        season: {type: String, required: true}
    },
    setup(props) {
        const { data: originData, loading, updateLoading, error, manual: updateData } = useSWR(computed(() => `/api/statistics/season/${props.season}`), null, {
            errorHandler(code, data, parent) { if(code !== 404) { parent?.(code, data) } }
        })
        const notFound = computed(() => error.value?.code === 404)

        const data = computed(() => originData.value ? mapData(originData.value) : null)

        const sexData = useDoughnutData(sexLimitLevelLabels, () => originData.value?.['sex_limit_level_counts'])
        const sexMeta = useDoughnut(sexData, {title: '分级·性', aspectRatio: 1.4, legend: {display: true}})

        const violenceData = useDoughnutData(violenceLimitLevelLabels, () => originData.value?.['violence_limit_level_counts'])
        const violenceMeta = useDoughnut(violenceData, {title: '分级·暴力', aspectRatio: 1.4, legend: {display: true}})

        return {loading, updateLoading, notFound, data, updateData, sexMeta, violenceMeta}
    }
})

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

function mapData(data: any) {
    return {
        totalAnimations: data['total_animations'],
        maxScore: data['max_score'],
        minScore: data['min_score'],
        avgScore: digit(data['avg_score'] as number | null),
        avgPositivity: digit(data['avg_positivity'] as number | null),
        tagCounts: mapTagCounts(data['tag_counts']),
        animations: (data['animations'] as any[]).map(mapAnimation),
        updateTime: toCNStringDate(new Date(data['update_time']))
    }
}

function mapTagCounts(tagCounts: {[t: string]: number}): {name: string, count: number}[] {
    const list: {name: string, count: number}[] = []
    for(const name in tagCounts) {
        list.push({name, count: tagCounts[name]})
    }
    list.sort((a, b) => a.count === b.count ? 0 : a.count > b.count ? -1 : 1)
    return list
}

function mapAnimation(item: any) {
    const subscription = item['subscription_time'] ? `${toCNStringDate(new Date(item['subscription_time']))}订阅` : ''
    const finish = item['finish_time'] ? `${toCNStringDate(new Date(item['finish_time']))}看完` : ''
    return {
        id: item['id'],
        title: item['title'],
        cover: cover.animationOrEmpty(item['cover']),
        time: `${subscription}${subscription && finish ? ' / ' : ''}${finish}`,
        completed: !finish,
        score: item['score'],
        positivity: item['positivity'] ? digit(item['positivity']) : null
    }
}
</script>

<style scoped>
    .scroll-list {
        overflow-y: auto;
        height: 200px;
    }
    .item.content {
        padding-left: 5px;
        display: inline-block;
        vertical-align: top;
        height: 80px;
        width: calc(100% - 80px)
    }
    .item.content .title {
        font-weight: 500;
        font-size: 16px;
        /* margin-bottom: 15px; */
        height: 40px;
    }
    .item.content .labels {
        height: 25px;
    }
</style>
