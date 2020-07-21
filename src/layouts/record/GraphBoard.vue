<template lang="pug">
canvas(ref='ctx')
div.text-right: a.ui.tertiary.button 
    i.stream.icon
    = '沉降进度'
</template>

<script lang="ts">
//@ts-ignore
import { Chart } from 'chart.js'
import { defineComponent, ref, Ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useSWR, useServer } from '@/functions/server'

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

export default defineComponent({
    props: {
        id: String,
        totalEpisodes: Number
    },
    emits: ['detailChanged'],
    setup(props) {
        const ctx: Ref<any> = ref(null)

        const idRef: Ref<string | null> = computed(() => props.id ?? null)
        const { loading, data, manual } = useSWR(computed(() => idRef.value ? `/api/personal/records/${idRef.value}/scatter` : null), null, {byAuthorization: 'LOGIN'})

        const scatters: Ref<Scatters> = computed(() => {
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

            return {episodes, progressTimes, scatterTimes}
        })

        useChart(ctx, scatters)

        const controller = useController(idRef, manual)

        return {ctx}
    }
})

//TODO 完成离散图的控制、刷新和更新事件
function useController(idRef: Ref<string | null>, update: () => void) {
    const { request } = useServer()
    const groupLoading = ref(false)
    const onGroup = async () => {
        groupLoading.value = true
        const r = await request(`/api/personal/records/${idRef.value!}/scatter/group`, 'POST')
        if(r.ok) {
            update()
        }
        groupLoading.value = false
    }

    return {onGroup, groupLoading}
}

function useChart(ctx: Ref<any>, data: Ref<Scatters>) {
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
                    yAxes: [{stacked: true, ticks: {beginAtZero: true, stepSize: 1, suggestedMax: 5}}]
                }
            }
        })
    })

    watch(data, () => {
        if(chart != null) {
            chart.data.label = data.value.episodes
            chart.data.datasets[0].data = data.value.progressTimes
            chart.data.datasets[1].data = data.value.scatterTimes
            chart.update()
        }
    })

    onUnmounted(() => {
        chart = null
    })
}

function mapItem(item: any): ScatterItem {
    return {
        episode: item['episode'],
        progressTimes: item['progress_times'],
        scatterTimes: item['scatter_times']
    }
}
</script>