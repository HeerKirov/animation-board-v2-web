import { ref, Ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { Chart, ChartType, PositionType, ChartData, ChartOptions } from 'chart.js'

export interface LegendOption {
    display?: boolean
    position?: PositionType
}

export interface GeneralOption {
    title?: string,
    legend?: LegendOption,
    aspectRatio?: number
}

export interface DoughnutOption extends GeneralOption {
    type?: 'doughnut' | 'pie' | 'polarArea'
}

export interface DoughnutData {
    labels?: string[]
    data?: number[]
    backgroundColor?: string[]
}

export function useDoughnut(data: Ref<DoughnutData>, options?: DoughnutOption) {
    const d: Ref<ChartData> = computed(() => {
        return {
            labels: data.value.labels,
            datasets: [{data: data.value.data, backgroundColor: data.value.backgroundColor}]
        }
    })
    return useChart(d, options?.type ?? 'doughnut', {
        title: {display: options?.title != null, text: options?.title},
        legend: !options?.legend ? undefined : {
            display: options.legend.display ?? false,
            position: options.legend.position ?? 'right',
            labels: {fontSize: 10, boxWidth: 10}
        },
        aspectRatio: options?.aspectRatio
    })
}

export function useChart(data: Ref<ChartData>, type: ChartType, options?: ChartOptions) {
    const ctx: Ref<any> = ref(null)
    let chart: Chart | null = null

    onMounted(() => {
        watch(ctx, () => {
            if(ctx.value != null && chart == null) {
                chart = new Chart(ctx.value, {
                    type,
                    data: data.value,
                    options
                })
            }else if(ctx.value == null && chart != null) {
                chart.destroy()
                chart = null
            }
        }, {immediate: true})

        watch(data, () => {
            if(chart != null) {
                chart.data = data.value
                chart.update()
            }
        }, {deep: true})
    })

    onUnmounted(() => {
        if(chart != null) {
            chart.destroy()
            chart = null
        }
    })

    return {ctx}
}
