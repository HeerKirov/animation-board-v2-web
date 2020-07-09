<template lang="pug">
div.ui.segment.panel(v-if="loading")
    div.ui.active.inverted.dimmer
        div.ui.loader
div.ui.segment.panel(v-else-if="data")
    div.mb-3
        router-link(:to="{name: 'Record.Detail', params: {id}}")
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
                div.value {{Math.floor(data.watchedEpisodes * 100 / data.totalEpisodes)}}%
            div.ui.tiny.horizontal.statistic(v-else)
                div.value {{data.progressCount}}
                div.label 周目
        div.column
            div.ui.tiny.horizontal.statistic(v-if="data.status === 'NO_PROGRESS'")
                div.value ···
                div.label 无进度
            div.ui.tiny.horizontal.statistic(v-else)
                template(v-if="data.status === 'COMPLETED'")
                    div.value {{data.totalEpisodes}}
                    div.label 已看完
                template(v-else)
                    div.value {{data.watchedEpisodes}}/{{data.totalEpisodes}}
                    div.label 已看
div.ui.placeholder.segment.panel(v-else)
    template(v-if="guide === 'default'")
        span.font-size-14.text-center.is-weight.mb-1 未订阅此动画
        button.ui.primary.button(@click="onClickFirst")
            i.book.icon
            = '加入日记'
    template(v-else-if="guide === 'choose'")
        span.text-center.is-weight.mb-2 以何种方式将此动画加入日记？
        div.ui.three.columns.center.aligned.grid
            div.middle.aligned.row.pb-2
                div.column.px-1
                    i.thumbtack.icon.font-size-42
                    div.sub-title 从头开始观看
                    button.ui.green.mini.fluid.button(@click="onSubscribe") 订阅
                div.column.px-1
                    i.pencil.alternate.icon.font-size-42
                    div.sub-title 早就看过了？
                    button.ui.mini.fluid.button(@click="onSupplement") 补齐记录
                div.column.px-1
                    i.flag.icon.font-size-42
                    div.sub-title 只是随便看看
                    button.ui.mini.fluid.button.px-1(@click="onRecord") 仅列入日记
</template>

<script lang="ts">
import { defineComponent, ref, computed, Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSWR } from '@/functions/server'

export default defineComponent({
    setup() {
        const route = useRoute()

        const id = computed(() => route.params['id'])
        
        const { loading, data } = useSWR(computed(() => route.params['id'] ? `/api/personal/records/${route.params['id']}` : null), null, {
            errorHandler(code, data, parent) {
                if(code !== 404 && code !== 403 && code !== 401) parent?.(code, data)
            }
        })
        const dataComputed = computed(() => data.value ? mapData(data.value) : null)
        
        const { guide, onClickFirst, onSubscribe, onSupplement, onRecord } = useNewPanel(id)

        return {id, loading, data: dataComputed, guide, onClickFirst, onSubscribe, onSupplement, onRecord}
    }
})

function useNewPanel(id: Ref<any>) {
    const router = useRouter()

    const guide = ref("default")

    const onClickFirst = () => {
        guide.value = "choose"
    }

    const onSupplement = () => {
        router.push({name: 'Record.Supplement', params: {id: id.value}})
    }
    //TODO 完成新建record的实现代码
    const onSubscribe = () => {

    }
    const onRecord = () => {

    }

    return {guide, onClickFirst, onSubscribe, onSupplement, onRecord}
}

function mapData(item: any) {
    return {
        status: item['status'],
        inDiary: item['in_diary'],
        seenOriginal: item['seen_original'],
        progressCount: item['progress_count'],
        watchedEpisodes: item['watched_episodes'],
        totalEpisodes: item['total_episodes']
    }
}
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
