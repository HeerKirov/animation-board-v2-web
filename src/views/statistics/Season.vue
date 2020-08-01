<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'season'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
        a.right.icon.item(@click="showHelp = true"): i.question.circle.icon
    div.ui.active.centered.inline.loader.mt-4(v-if="loading || updateLoading")
    div.ui.placeholder.segment(v-else-if="notFound")
        div.ui.icon.header
            i.industry.icon
            h2 统计数据暂未生成
            a.ui.green.button(@click="onFullUpdate") 手动生成全部数据
    div.ui.centered.grid(v-else)
        div.ui.four.wide.column
            div.ui.tabular.vertical.menu.mt-2.mb-0
                a.item(:class="{active: season == null}", @click="season = null") 季度纵览
            div.scroll-list
                div.ui.tabular.vertical.menu.mt-0
                    a.item(v-for="item in seasonList", :key="item.name", :class="{active: item.name === season}", @click="season = item.name") {{item.label}}
        div.ui.ten.wide.column
            SeasonLine(v-if="season == null", :metadata="metadata")
            SeasonDetail(v-else, :season="season")
    StatisticModal(title="季度", v-model:visible="showHelp", @refresh="onFullUpdate")
        div 大部分TV动画都按照冬、春、夏、秋的季度发布和放送。以季度为单位，纵览追番状况和每个季度的追番详情。
        h5 季度纵览
        div 以柱状图的形式，展示所有季度的数量关系对比。这些数量关系包括动画数量、评分总览、积极性。
        h5 单季概览
        div 给出单个季度的详细数据，包括动画列表、部分维度统计数量、评分总览、积极性。
        h5 什么样的动画会被加入追番统计？
        p 1. 动画的发布时间是该季度的3个月之内(例如，春季为4～6月)，且动画的放送类型为"TV & Web";
        p 2. 动画加入日记，且至少存在1条进度;
        p 3. 订阅进度开始时间不晚于本季的结束时间。
        h5 积极性是什么？
        p 积极性是评价追番时，是否积极地追看更新的一项指标。它由每一集的发布时间和每一集的观看时间平均算出，一定程度上能够反映对一部动画的热衷与否。
        p 一般而言，在发布后2小时内看完算作最高积极性，而最低积极性在拖延超过2个月后才会评价。
        p 即使订阅的时间晚于一部分集数的发布时间，也不会因此导致积极性大减。这部分集数的积极性会按订阅时间酌情延后计算。
</template>

<script lang="ts">
import { defineComponent, ref, watch, reactive, computed, Ref } from 'vue'
import StatisticModal from '@/layouts/StatisticModal.vue'
import SeasonLine from '@/layouts/statistics/SeasonLine.vue'
import SeasonDetail from '@/layouts/statistics/SeasonDetail.vue'
import { useSWR } from '@/functions/server'
import { secondaryBarItems } from '@/definitions/secondary-bar'

interface Metadata {lowerYear: number | null, lowerSeason: number | null, upperYear: number | null, upperSeason: number | null}

export default defineComponent({
    components: {StatisticModal, SeasonLine, SeasonDetail},
    computed: {
        barItems() { return secondaryBarItems.statistics }
    },
    setup() {
        const { loading, updateLoading, notFound, metadata, onFullUpdate } = useOverviewData()

        const { seasonList, season } = useFilter(metadata)

        const showHelp = ref(false)

        return {
            loading, updateLoading, notFound, onFullUpdate, showHelp, 
            seasonList, season, metadata
        }
    }
})

function useOverviewData() {
    const { loading, data, updateLoading, update } = useSWR('/api/statistics/season/overview', null)
    const notFound = ref(false)
    const metadata: Metadata = reactive({lowerYear: null, lowerSeason: null, upperYear: null, upperSeason: null})
    watch(data, () => {
        if(data.value['update_time'] == null) {
            notFound.value = true
        }else{
            notFound.value = false
            metadata.lowerYear = data.value['begin_year']
            metadata.lowerSeason = data.value['begin_season']
            metadata.upperYear = data.value['end_year']
            metadata.upperSeason = data.value['end_season']
        }
    })
    const onFullUpdate = async () => { await update(null, {url: '/api/statistics/season', method: 'POST'}) }

    return {loading, updateLoading, notFound, metadata, onFullUpdate}
}

function useFilter(metadata: Metadata) {
    const seasonList: Ref<{label: string, name: string}[]> = computed(() => {
        if(metadata.lowerYear != null && metadata.upperYear != null && metadata.lowerSeason != null && metadata.upperSeason != null) {
            const list: {label: string, name: string}[] = []
            for(let year = metadata.lowerYear; year <= metadata.upperYear; ++year) {
                for(let season = (year === metadata.lowerYear ? metadata.lowerSeason : 1); season <= (year === metadata.upperYear ? metadata.upperSeason : 4); ++season) {
                    list.push({label: `${year}年${'冬春夏秋'[season - 1]}季`, name: `${year}-${season}`})
                }
            }
            return list.reverse()
        }else{
            return []
        }
    })
    const season: Ref<string | null> = ref(null)

    return {seasonList, season}
}
</script>

<style scoped>
    .scroll-list::-webkit-scrollbar {
        display: none;
    }
    .scroll-list {
        overflow-x: hidden;
        overflow-y: auto;
        max-height: 315px;
    }
</style>