<template lang="pug">
div.ui.segment.panel(v-if="exists")
    div.mb-3
        i.bookmark.icon
        label 评价
        Starlight.float-right(:value="data.score")
    div
        i.quote.left.icon.font-size-11
        span(v-if='data.description') {{data.description}}
        i(v-else) 没有编写评论
        i.quote.right.icon.font-size-11
div.ui.placeholder.segment.panel(v-else)
    template(v-if="guide === 'default'")
        span.font-size-14.text-center.is-weight.mb-1 未订阅此动画
        div.ui.primary.button
            i.book.icon
            = '加入日记'
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'
import Starlight from '@/components/Starlight.vue'

export default defineComponent({
    components: {Starlight},
    setup() {
        const exists = ref(true)
        const guide = ref("default")

        const data = reactive({
            score: 9,
            description: '' //有title时使用title，无title有正文时截取一段正文，也没有时为空
        })

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