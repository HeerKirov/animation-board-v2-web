<template lang="pug">
div.ui.segment.panel(v-if="exists")
    div.mb-3
        template(v-if="data.inDiary")
            i.thumbtack.icon
            = '已订阅'
        template(v-else)
            i.book.icon
            = '日记'
        template(v-if="data.seenOriginal")
            i.marker.icon.ml-1.ui.text.grey
            label.ui.text.grey 看过原作
    div.ui.two.columns.grid
        div.column
            div.ui.tiny.horizontal.statistic(v-if="data.progressCount <= 1")
                div.value {{parseInt(data.watchedEpisodes * 100 / data.totalEpisodes)}}%
            div.ui.tiny.horizontal.statistic(v-else)
                div.value {{data.progressCount}}
                div.label 周目
        div.column
            div.ui.tiny.horizontal.statistic(v-if="data.status === 'NO_PROGRESS'")
                div.value ···
                div.label 无进度
            div.ui.tiny.horizontal.statistic(v-else)
                div.value {{data.watchedEpisodes}}
                div.label(v-if="data.status === 'COMPLETED'") 已看完
                div.label(v-else) 已观看
div.ui.placeholder.segment.panel(v-else)
    template(v-if="guide === 'default'")
        span.font-size-14.text-center.is-weight.mb-1 未订阅此动画
        div.ui.primary.button
            i.book.icon
            = '加入日记'
    template(v-else-if="guide === 'choose'")
        span.text-center.is-weight.mb-2 以何种方式将此动画加入日记？
        div.ui.three.columns.center.aligned.grid
            div.middle.aligned.row.pb-2
                div.column.px-1
                    i.thumbtack.icon.font-size-42
                    div.sub-title 从头开始观看
                    div.ui.green.mini.fluid.button 订阅
                div.column.px-1
                    i.pencil.alternate.icon.font-size-42
                    div.sub-title 早就看过了？
                    div.ui.mini.fluid.button 补齐记录
                div.column.px-1
                    i.flag.icon.font-size-42
                    div.sub-title 只是随便看看
                    div.ui.mini.fluid.button.px-1 仅列入日记
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'

export default defineComponent({
    setup() {
        const exists = ref(true)
        const data = reactive({
            status: 'COMPLETED',
            inDiary: false,
            seenOriginal: false,
            progressCount: 1,
            watchedEpisodes: 24,
            totalEpisodes: 24
        })
        const guide = ref("default")

        return {exists, data, guide}
    }
})
</script>

<style scoped>
    .panel {
        min-height: 107px !important;
    }
    .font-size-42 {
        font-size: 42px;
    }
    .sub-title {
        margin-top: 10px;
        margin-bottom: 5px;
        font-size: 12px;
    }
</style>