import { Chart, ChartData, ChartOptions, ChartType } from 'chart.js'
import { defineComponent, onMounted, onUnmounted, PropType, Ref, ref, toRef, watch } from "vue"

export default defineComponent({
    props: {
        type: {type: (null as any) as PropType<ChartType>, required: true},
        data: (null as any) as PropType<ChartData>,
        options: (null as any) as PropType<ChartOptions>
    },
    setup(props) {
        const data = toRef(props, 'data')

        const ctx: Ref<HTMLCanvasElement|null> = ref(null)
        let chart: Chart|null = null

        onMounted(() => {
            chart = new Chart(ctx.value!, {
                type: props.type,
                data: data.value,
                options: props.options
            })
        })

        watch(data, () => {
            if(chart != null && data.value != undefined) {
                chart.data = data.value
                chart.update()
            }
        }, {deep: true})

        onUnmounted(() => {
            if(chart != null) {
                chart.destroy()
                chart = null
            }
        })

        return () => <canvas ref={ctx}></canvas>
    }
})