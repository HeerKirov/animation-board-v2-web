<template lang="pug">
template(v-if="!loading")
    div.ui.grid(v-if="progressFirst")
        div.ui.row.pb-0
            div.ui.twelve.wide.column.pr-1half
                span.ui.label {{progressFirst.ordinal > 1 ? `${progressFirst.ordinal}周目` : "首次订阅"}}
                a.ui.tertiary.mini.button.right.floated(v-if="publishedEpisodes > (progressFirst.watchedEpisodes ?? 0)", @click="onNext")
                    i.notched.circle.loading.icon.ml-1.mr-0(v-if="progressFirst.updateLoading")
                    i.plane.icon(v-else)
                    = 'NEXT 第{{progressFirst.watchedEpisodes + 1}}话'
            div.ui.four.wide.column
                a.ui.tertiary.mini.button.right.floated(@click="onDeleteProgress(null)")
                        = '删除这一条进度'
                        i.close.icon.mr-0.ml-1
        div.ui.row
            div.ui.twelve.wide.column
                span {{Math.floor(progressFirst.watchedEpisodes / totalEpisodes * 100)}}%
                div.float-right.bottom-gap(v-if="editEpisodeMode")
                    IntBox.mini(:not-null="true", :min="0", :max="totalEpisodes", v-model="editEpisodeValue")
                    button.ui.green.tertiary.mini.button(@click="onSaveEpisode", :class="{disabled: editEpisodeLoading}")
                        i.notched.circle.loading.icon(v-if="editEpisodeLoading")
                        i.save.icon(v-else)
                        = '保存'
                span.float-right.bottom-gap(v-else) 已看完
                    a.ui.label.mini(@click="editEpisodeMode = true") {{progressFirst.watchedEpisodes}}
                    = '话'
                div.progress-bar
                    div.secondary-content(:style="{width: `${Math.floor(publishedEpisodes / totalEpisodes * 100)}%`}")
                    div.content(:style="{width: `${Math.floor(progressFirst.watchedEpisodes / totalEpisodes * 100)}%`}")
            div.ui.four.wide.column.px-2
                div 
                    i.calendar.plus.outline.icon
                    = '订阅时间 {{progressFirst.startTime}}'
                div.mt-1
                    i.calendar.check.icon
                    = '完成时间 {{progressFirst.finishTime}}'
    div.ui.divider.mb-0
    table.ui.very.basic.table.mt-0(v-if="progress.length > 0")
        tbody
            tr(v-for="(item, index) in progress")
                td
                    div.ui.label {{item.ordinal}}
                    = '周目'
                td
                    i {{item.watchedEpisodes}}
                    = '话 已完成'
                td.right.aligned.collapsing {{item.startTime ?? '(未知时间)'}}
                td.collapsing →
                td.collapsing {{item.finishTime}}
                td.collapsing: a.ui.tertiary.mini.icon.button(@click="onDeleteProgress(index)"): i.close.icon
    div.text-center(v-if="!progressFirst")
        = '还没有任何进度。'
        a.ui.tertiary.button(@click="openProgressModal")
            i.plus.icon
            = '创建第一条进度'
    a.ui.tertiary.mini.button.right.floated(v-else-if="progressFirst.watchedEpisodes >= totalEpisodes", @click="openProgressModal")
        = '新建进度'
        i.plus.icon.mr-0.ml-1
    ProgressModal(v-model:visible="progressModalVisible", :id="id", :published-episodes="publishedEpisodes", @success="onProgressModalSuccess")
</template>

<script lang="ts">
import { defineComponent, Ref, ref, watch, computed } from 'vue'
import IntBox from '@/components/IntBox.vue'
import ProgressModal from './ProgressModal.vue'
import { useSWR, useServer } from '@/functions/server'
import { useMessageBox } from '@/functions/message-box'
import { toCNStringDate } from '@/functions/display'

interface Progress {
    ordinal: number
    watchedEpisodes: number
    startTime: string | null
    finishTime: string | null
    updateLoading?: boolean
}

export default defineComponent({
    components: {IntBox, ProgressModal},
    props: {
        id: String,
        totalEpisodes: Number,
        publishedEpisodes: Number
    },
    emits: ['detailChanged'],
    setup(props, {emit}) {
        const { request } = useServer()
        const { message } = useMessageBox()

        const idRef: Ref<string | null> = computed(() => props.id ?? null)
        const { loading, data, manual } = useSWR(computed(() => idRef.value ? `/api/personal/records/${idRef.value}/progress` : null), null, {byAuthorization: 'LOGIN'})

        const progress: Ref<Progress[]> = ref([])
        const progressFirst: Ref<Progress | null> = ref(null)

        watch(data, () => { 
            const list = data.value ? (data.value as any[]).map(mapProgress).reverse() : []
            if(list.length === 0) {
                progress.value = []
                progressFirst.value = null
            }else if(list.length === 1) {
                progress.value = []
                progressFirst.value = list[0]
            }else{
                progress.value = list.slice(1)
                progressFirst.value = list[0]
            }
        }, {immediate: true})

        const updateProgress = (value: Progress | null, oldValue: Progress | null) => {
            if(value == null || oldValue == null || (value.finishTime !== oldValue.finishTime) || 
               (value.watchedEpisodes !== oldValue.watchedEpisodes && 
               (value.watchedEpisodes === props.totalEpisodes || oldValue.watchedEpisodes === props.totalEpisodes))) {
                emit('detailChanged')
            }
        }

        const onDeleteProgress = async (index: number | null) => {
            const action = await message({
                header: '删除确认',
                content: '确认要删除这一条进度吗？该操作不可撤销。',
                type: 'WARNING',
                actions: ['TRUE', 'FALSE']
            })
            if(action === 'TRUE') {
                const p = index == null ? progressFirst.value! : progress.value[index]
                const r = await request(`/api/personal/records/${idRef.value}/progress/${p.ordinal}`, 'DELETE')
                if(r.ok) {
                    if(index == null) {
                        if(progress.value.length > 0) {
                            const [second] = progress.value.splice(0, 1)
                            updateProgress(second, progressFirst.value!)
                            progressFirst.value = second
                        }else{
                            updateProgress(null, progressFirst.value!)
                            progressFirst.value = null
                        }
                    }else{
                        progress.value.splice(index, 1)
                        if(progress.value.length === 0) {
                            emit('detailChanged')
                        }
                    }
                }
            }
        }

        const editEpisode = useEditEpisode(idRef, progressFirst, updateProgress)

        const progressModalVisible = ref(false)
        const openProgressModal = () => { progressModalVisible.value = true }
        const onProgressModalSuccess = () => {
            manual()
            updateProgress(null, null)
        }

        return {loading, progress, progressFirst, onDeleteProgress, ...editEpisode, progressModalVisible, openProgressModal, onProgressModalSuccess}
    }
})

function useEditEpisode(idRef: Ref<string | null>, progressFirst: Ref<Progress | null>, updateProgress: (v: Progress, ov: Progress) => void) {
    const { request } = useServer()

    const editEpisodeMode = ref(false)
    const editEpisodeLoading = ref(false)
    const editEpisodeValue = ref(progressFirst.value?.watchedEpisodes ?? 0)
    watch(progressFirst, () => { editEpisodeValue.value = progressFirst.value?.watchedEpisodes ?? 0 })

    const onSaveEpisode = async () => {
        if(editEpisodeValue.value === (progressFirst.value?.watchedEpisodes ?? 0)) {
            editEpisodeMode.value = false
            return
        }
        editEpisodeLoading.value = true
        const r = await request(`/api/personal/records/${idRef.value}/progress`, 'PUT', {watched_episodes: editEpisodeValue.value || 0})
        if(r.ok) {
            const newValue = mapProgress(r.data)
            updateProgress(newValue, progressFirst.value!)
            progressFirst.value = newValue
            editEpisodeMode.value = false
        }
        editEpisodeLoading.value = false
    }

    const onNext = async () => {
        progressFirst.value!.updateLoading = true
        const r = await request(`/api/personal/records/${idRef.value}/progress`, 'PUT', {watched_episodes: progressFirst.value!.watchedEpisodes + 1})
        if(r.ok) {
            const newValue = mapProgress(r.data)
            updateProgress(newValue, progressFirst.value!)
            progressFirst.value = newValue
        }
        progressFirst.value!.updateLoading = false
    }

    return {editEpisodeMode, editEpisodeValue, editEpisodeLoading, onSaveEpisode, onNext}
}

function mapProgress(item: any): Progress {
    return {
        ordinal: item['ordinal'],
        watchedEpisodes: item['watched_episodes'],
        startTime: item['start_time'] ? toCNStringDate(new Date(item['start_time'])) : null,
        finishTime: item['finish_time'] ? toCNStringDate(new Date(item['finish_time'])) : null
    }
}
</script>

<style scoped>
    .progress-bar {
        height: 15px; 
        width: 100%; 
        background-color: #767676; 
        border-radius: 3px;
        overflow: hidden;
        position: relative;
    }
    .progress-bar .secondary-content {
        height: 100%;
        background-color: #E8E8E8;
        position: absolute;
    }
    .progress-bar .content {
        height: 100%;
        background-color: #21BA45;
        position: absolute;
    }
    .pr-1half {
        padding-right: 7px !important;
    }
    .bottom-gap {
        margin-bottom: 3px;
    }
</style>