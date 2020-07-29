import { ref, Ref, onMounted, onUnmounted, watch } from 'vue'
import { Chart, ChartDataSets, ChartType, PositionType } from 'chart.js'

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
    const ctx: Ref<any> = ref(null)
    let chart: Chart | null = null

    onMounted(() => {
        watch(ctx, () => {
            if(ctx.value != null && chart == null) {
                chart = new Chart(ctx.value, {
                    type: options?.type ?? 'doughnut',
                    data: {
                        labels: data.value.labels,
                        datasets: [{
                            data: data.value.data,
                            backgroundColor: data.value.backgroundColor
                        }]
                    },
                    options: {
                        title: {display: options?.title != null, text: options?.title},
                        legend: !options?.legend ? undefined : {
                            display: options.legend.display ?? false,
                            position: options.legend.position ?? 'right',
                            labels: {fontSize: 10, boxWidth: 10}
                        },
                        aspectRatio: options?.aspectRatio
                    }
                })
            }else if(ctx.value == null && chart != null) {
                chart.destroy()
                chart = null
            }
        })

        watch(data, () => {
            if(chart != null) {
                chart.data.labels = data.value.labels
                chart.data.datasets![0]!.data = data.value.data
                chart.data.datasets![0]!.backgroundColor = data.value.backgroundColor
                chart.update()
            }
        }, {deep: true})
    })

    onUnmounted(() => {
        if(chart != null) {
            chart.destroy()
        }
    })

    return {ctx}
}

export interface BarOption extends GeneralOption {
    horizontal?: boolean
    stacked?: boolean
    xSuggestedMax?: number
    ySuggestedMax?: number
}

export interface BarData {
    labels?: string[]
    datasets?: ChartDataSets[]
}

export function useBar(data: Ref<BarData>, options?: BarOption) {
    const ctx: Ref<any> = ref(null)
    let chart: Chart | null = null

    onMounted(() => {
        watch(ctx, () => {
            if(ctx.value != null && chart == null) {
                chart = new Chart(ctx.value, {
                    type: options?.horizontal ? 'horizontalBar' : 'bar',
                    data: {
                        labels: data.value.labels,
                        datasets: data.value.datasets
                    },
                    options: {
                        title: {display: options?.title != null, text: options?.title},
                        legend: !options?.legend ? undefined : {
                            display: options.legend.display ?? false,
                            position: options.legend.position ?? 'right',
                            labels: {fontSize: 10, boxWidth: 10}
                        },
                        aspectRatio: options?.aspectRatio,
                        scales: {
                            xAxes: [{stacked: options?.stacked ?? false, ticks: {beginAtZero: true, suggestedMax: options?.xSuggestedMax ?? undefined}}],
                            yAxes: [{stacked: options?.stacked ?? false, ticks: {beginAtZero: true, suggestedMax: options?.ySuggestedMax ?? undefined}}]
                        }
                    }
                })
            }else if(ctx.value == null && chart != null) {
                chart.destroy()
                chart = null
            }
        })

        watch(data, () => {
            if(chart != null) {
                chart.data.labels = data.value.labels
                chart.data.datasets = data.value.datasets
                chart.update()
            }
        }, {deep: true})
    })

    onUnmounted(() => {
        if(chart != null) {
            chart.destroy()
        }
    })

    return {ctx}
}
