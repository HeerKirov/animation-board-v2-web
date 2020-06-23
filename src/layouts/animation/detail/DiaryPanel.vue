<template lang="pug">
div.ui.segment(v-if="exists")
    div.mb-2
        template(v-if="data.inDiary")
            i.thumbtack.icon
            label 已订阅
        template(v-else)
            i.book.icon
            label 日记
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
div.ui.placeholder.segment.min-height-0(v-else)
    //- div.ui.icon.header
        i.book.icon
        = '还未订阅此动画'
    div.ui.primary.small.button 加入日记
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'

export default defineComponent({
    setup() {
        const exists = ref(false)
        const data = reactive({
            status: 'COMPLETED',
            inDiary: false,
            seenOriginal: false,
            progressCount: 1,
            watchedEpisodes: 24,
            totalEpisodes: 24
        })

        return {exists, data}
    }
})
</script>

<style scoped>
    .min-height-0 {
        min-height: 0 !important;
    }
</style>