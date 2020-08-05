<template lang="pug">
canvas(ref='ctx')
div.float-right: a.ui.tertiary.button(@click="onGroup", :class="{disabled: groupLoading}")
    i.notched.circle.loading.icon(v-if="groupLoading")
    i.stream.icon(v-else)
    = '沉降进度'
div.is-weight.font-size-13.mt-1 增加离散记录
div.ui.segment.mb-0
    div.ui.dimmer.inverted.active(v-if="addLoading")
        div.ui.loader
    div.ui.ten.columns.grid
        div.ui.column.px-2.py-2(v-for="i in publishedEpisodes")
            a.ui.basic.mini.fluid.button(@click="onAddScatter(i)") {{i}}
div.text-right(v-if="undoItem != null")
    a.ui.tertiary.mini.button(@click="undo", :class="{disabled: undoLoading}")
        i.notched.circle.loading.icon(v-if="undoLoading")
        i.undo.icon(v-else)
        = '撤销第{{undoItem}}话的记录'
    a.ui.tertiary.mini.icon.button(@click="clearUndo")
        i.close.icon
</template>

<script lang="ts">
import { defineComponent, ref, Ref, onMounted, computed, watch, watchEffect, onUnmounted } from 'vue'
import { Chart } from 'chart.js'
import { useSWR, useServer } from '@/functions/server'
import { useNotification } from '@/functions/notification'

interface ScatterItem {
    episode: number
    progressTimes: number
    scatterTimes: number
}

interface Scatters {
    episodes: string[]
    progressTimes: number[]
    scatterTimes: number[]
}

interface GroupResult {
    groupTo: "CURRENT" | "NEW" | "NONE"
    progressOrdinal: number
    watchedEpisodes: number
    appendEpisodes: number
}

export default defineComponent({
    props: {
        id: String,
        totalEpisodes: {type: Number, required: true},
        publishedEpisodes: {type: Number, required: true}
    },
    emits: ['detailChanged'],
    setup(props, {emit}) {
        const idRef: Ref<string | null> = computed(() => props.id ?? null)
        const totalEpisodes: Ref<number> = computed(() => props.totalEpisodes)
        const publishedEpisodes: Ref<number> = computed(() => props.publishedEpisodes)

        const { data, manual } = useSWR(computed(() => idRef.value ? `/api/personal/records/${idRef.value}/scatter` : null), null, {byAuthorization: 'LOGIN'})

        const scatters: Ref<Scatters> = ref({episodes: [], progressTimes: [], scatterTimes: []})

        watchEffect(() => {
            const len = props.totalEpisodes ?? data.value?.length ?? 0
            const episodes = Array(len).fill(0).map((_, i) => i + 1 + '')
            const progressTimes = Array(len).fill(0)
            const scatterTimes = Array(len).fill(0)

            if(data.value) {
                for(const item of (data.value as any[]).map(mapItem)) {
                    progressTimes[item.episode - 1] = item.progressTimes
                    scatterTimes[item.episode - 1] = item.scatterTimes
                }
            }

            scatters.value = {episodes, progressTimes, scatterTimes}
        })

        const { ctx } = useChart(scatters)

        const { undoItem, undoLoading, pushUndoItem, undo, clearUndo } = useUndoStack(idRef, manual)

        const { onGroup, groupLoading, onAddScatter, addLoading } = useController(idRef, totalEpisodes, scatters, pushUndoItem, () => emit('detailChanged'))

        return {ctx, onGroup, groupLoading, onAddScatter, addLoading, undoItem, undoLoading, undo, clearUndo}
    }
})

function useController(idRef: Ref<string | null>, totalEpisodes: Ref<number>, scatters: Ref<Scatters>, pushUndoItem: (episode: number) => void, emitDetailChanged: () => void) {
    const { request } = useServer()

    const groupLoading = ref(false)
    const onGroup = async () => {
        groupLoading.value = true
        const r = await request(`/api/personal/records/${idRef.value!}/scatter/group`, 'POST')
        if(r.ok) {
            const result = mapGroupResult(r.data)
            if(result.groupTo !== 'NONE') {
                const progressTimes = Array(scatters.value.progressTimes.length)
                const scatterTimes = Array(scatters.value.scatterTimes.length)
                for(let i = 0; i < result.watchedEpisodes - result.appendEpisodes; ++i) {
                    progressTimes[i] = scatters.value.progressTimes[i]
                    scatterTimes[i] = scatters.value.scatterTimes[i]
                }
                for(let i = result.watchedEpisodes - result.appendEpisodes; i < result.watchedEpisodes; ++i) {
                    progressTimes[i] = scatters.value.progressTimes[i] + 1
                    scatterTimes[i] = scatters.value.scatterTimes[i] - 1
                }
                for(let i = result.watchedEpisodes; i < progressTimes.length; ++i) {
                    progressTimes[i] = scatters.value.progressTimes[i]
                    scatterTimes[i] = scatters.value.scatterTimes[i]
                }
                scatters.value = {episodes: scatters.value.episodes, progressTimes, scatterTimes}
            }
            if(result.groupTo === 'NEW' || (result.groupTo === 'CURRENT' && result.watchedEpisodes >= totalEpisodes.value)) {
                emitDetailChanged()
            }
        }
        groupLoading.value = false
    }

    const addLoading = ref(false)
    const onAddScatter = async (episode: number) => {
        addLoading.value = true
        const r = await request(`/api/personal/records/${idRef.value!}/scatter/watch`, 'POST', {episode})
        if(r.ok) {
            scatters.value.scatterTimes[episode - 1] += 1
            pushUndoItem(episode)
        }
        addLoading.value = false
    }

    return {onGroup, groupLoading, onAddScatter, addLoading}
}

function useUndoStack(idRef: Ref<string | null>, emitUndoSuccess: () => void) {
    const { request } = useServer()
    const { notify } = useNotification()

    const stack: number[] = []
    const undoItem: Ref<number | null> = ref(null)
    const undoLoading = ref(false)

    const pushUndoItem = (episode: number) => {
        if(undoItem.value != null) {
            stack.push(undoItem.value)
        }
        undoItem.value = episode
    }

    const undo = async () => {
        undoLoading.value = true
        const r = await request(`/api/personal/records/${idRef.value!}/scatter/undo`, 'POST', null, {
            errorHandler(code, data, parent) {
                if(code !== 400) { 
                    parent?.(code, data) 
                }else{
                    notify('撤销失败', 'error', '上次记录时间过于久远，已经不能撤销。')
                    clearUndo()
                }
            }
        })
        if(r.ok) {
            emitUndoSuccess()
            if(stack.length > 0) {
                const [ item ] = stack.splice(stack.length - 1, 1)
                undoItem.value = item
            }else{
                undoItem.value = null
            }
        }
        undoLoading.value = false
    }

    const clearUndo = () => {
        stack.splice(0, stack.length)
        undoItem.value = null
    }

    return {undoItem, undoLoading, pushUndoItem, undo, clearUndo}
}

function useChart(data: Ref<Scatters>) {
    const ctx: Ref<any> = ref(null)
    let chart: Chart | null = null

    onMounted(() => {
        chart = new Chart(ctx.value, {
            type: 'bar',
            data: {
                labels: data.value.episodes,
                datasets: [
                    {
                        label: '进度数量',
                        data: data.value.progressTimes,
                        backgroundColor: '#2185D0',
                        borderColor: '#2185D0',
                        borderWidth: 1,
                        barPercentage: 1,
                        categoryPercentage: 1
                    },
                    {
                        label: '离散数量',
                        data: data.value.scatterTimes,
                        backgroundColor: '#2185D014',
                        borderColor: '#2185D0',
                        borderWidth: 1,
                        barPercentage: 1,
                        categoryPercentage: 1
                    }
                ]
            },
            options: {
                aspectRatio: 3,
                scales: {
                    xAxes: [{stacked: true, gridLines: {display: false}}],
                    yAxes: [{stacked: true, ticks: {beginAtZero: true, stepSize: 1, suggestedMax: 6}}]
                }
            }
        })
    })

    watch(data, () => {
        if(chart != null) {
            chart.data.labels = data.value.episodes
            chart.data.datasets![0]!.data = data.value.progressTimes
            chart.data.datasets![1]!.data = data.value.scatterTimes
            chart.update()
        }
    }, {deep: true})

    onUnmounted(() => {
        chart = null
    })

    return {ctx}
}

function mapItem(item: any): ScatterItem {
    return {
        episode: item['episode'],
        progressTimes: item['progress_times'],
        scatterTimes: item['scatter_times']
    }
}

function mapGroupResult(data: any): GroupResult {
    return {
        groupTo: data['group_to'],
        progressOrdinal: data['progress_ordinal'],
        watchedEpisodes: data['watched_episodes'],
        appendEpisodes: data['append_episodes']
    }
}
</script>
