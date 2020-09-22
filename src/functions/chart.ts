import { Ref, computed, ref } from 'vue'
import { PositionType, ChartData, ChartOptions, ChartType } from 'chart.js'

export interface LegendOption {
    display?: boolean
    position?: PositionType
}

export interface DoughnutOption {
    title?: string,
    legend?: LegendOption,
    aspectRatio?: number
}

export interface DoughnutData {
    labels?: string[]
    data?: number[]
    backgroundColor?: string[]
}

export function useDoughnut(doughnutData: Ref<DoughnutData>, doughnutOptions?: DoughnutOption) {
    const data: Ref<ChartData> = computed(() => {
        return {
            labels: doughnutData.value.labels,
            datasets: [{data: doughnutData.value.data, backgroundColor: doughnutData.value.backgroundColor}]
        }
    })

    const options = {
        title: {display: doughnutOptions?.title != null, text: doughnutOptions?.title},
        legend: !doughnutOptions?.legend ? undefined : {
            display: doughnutOptions.legend.display ?? false,
            position: doughnutOptions.legend.position ?? 'right',
            labels: {fontSize: 10, boxWidth: 10}
        },
        aspectRatio: doughnutOptions?.aspectRatio
    }
    
    return {data, options}
}