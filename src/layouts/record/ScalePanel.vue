<template lang="pug">
div.main-panel(:style="{height: `${data.length * 12}px`}")
    router-link.progress(v-for="(item, index) in items", :key="`${item.id}-${item.ordinal}`", :to="{name: 'Record.Detail', params: {id: item.id}}"
                        :class="{selected: tooltip.itemIndex === index}", :style="item.style", @mouseenter="onMouseOver(index)", @mouseleave="onMouseOut")
        div.gradient(v-if="!item.finished")
    div.tooltip(v-if="tooltip.itemIndex != null", :style="{left: `${tooltip.x + 5}px`, top: `${tooltip.y + 5}px`}")
        img(:src="items[tooltip.itemIndex].cover")
        div.content
            div
                span.title {{items[tooltip.itemIndex].title}}
                span.tag(v-if="items[tooltip.itemIndex].ordinal > 1") {{items[tooltip.itemIndex].ordinal}}周目
            div
                span.date {{items[tooltip.itemIndex].date}}
                span.tag(v-if="!items[tooltip.itemIndex].finished") 进行中
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref, Ref, watch, onMounted, onUnmounted, reactive } from 'vue'
import { useMousePosition } from '@/functions/document'
import { colorCSS } from '@/definitions/fomantic-ui-colors'
import cover from '@/plugins/cover'
import { toCNStringDate } from '@/functions/display'

export interface Instance {
    id: number
    title: string
    cover: string
    ordinal: number
    finished: boolean
    startTime: Date
    endTime: Date
}

const colors = [colorCSS.red, colorCSS.orange, colorCSS.yellow, colorCSS.green, colorCSS.teal, colorCSS.blue, colorCSS.purple]

//TODO 进度堆叠算法
//TODO 时间刻度轴
export default defineComponent({
    props: {
        data: {type: (null as any) as PropType<Instance[]>, required: true},
        lower: {type: (null as any) as PropType<Date>, required: true},
        upper: {type: (null as any) as PropType<Date>, required: true}
    },
    setup(props) {
        const items: Ref<any[]> = ref([])
        watch(() => props.data, () => {
            const lowerTimestamp = props.lower.getTime()
            const upperTimestamp = props.upper.getTime()
            let i = 0
            items.value = props.data.map(instance => mapItem(instance, i++, lowerTimestamp, upperTimestamp))
        }, {immediate: true})

        const { tooltip, onMouseOver, onMouseOut } = useTooltip()

        return {items, tooltip, onMouseOver, onMouseOut}
    }
})

function useTooltip() {
    const { x, y } = useMousePosition()

    const tooltip: {x: number, y: number, itemIndex: number | null} = reactive({
        x, y, itemIndex: null
    })

    const onMouseOver = (index: number) => {
        tooltip.itemIndex = index
    }
    const onMouseOut = () => {
        tooltip.itemIndex = null
    }

    return {tooltip, onMouseOver, onMouseOut}
}

function mapItem(instance: Instance, idx: number, lowerTimestamp: number, upperTimestamp: number) {
    const startTimestamp = instance.startTime.getTime()
    const endTimestamp = instance.endTime.getTime()

    const [originLeft, originRight] = calculateScale(startTimestamp, endTimestamp, lowerTimestamp, upperTimestamp)
    const [left, right] = calculateRealScale(originLeft, originRight)
    const [leftRadius, rightRadius] = calculateRadius(instance.finished, startTimestamp, endTimestamp, lowerTimestamp, upperTimestamp)

    return {
        id: instance.id,
        title: instance.title,
        cover: cover.staffOrEmpty(null), //TODO 本地测试结束后改回instance.cover
        ordinal: instance.ordinal,
        finished: instance.finished,
        date: getDateInfo(instance.startTime, instance.endTime),
        style: {
            left: `${left}%`,
            right: `${right}%`,
            top: `${idx * 12}px`,
            'border-radius': `${leftRadius} ${rightRadius} ${rightRadius} ${leftRadius}`,
            'background-color': colors[instance.id % colors.length]
        }
    }
}

function calculateScale(startTimestamp: number, endTimestamp: number, lowerTimestamp: number, upperTimestamp: number) {
    const originLeft = (Math.max(lowerTimestamp, startTimestamp) - lowerTimestamp) * 100 / (upperTimestamp - lowerTimestamp)
    const originRight = (upperTimestamp - Math.min(upperTimestamp, endTimestamp)) * 100 / (upperTimestamp - lowerTimestamp)  

    return [originLeft, originRight]
}

function calculateRealScale(originLeft: number, originRight: number) {
    const f = 0.5//强制每行都拥有一个最小宽度，以免太窄看不清
    return (100 - f < originLeft + originRight) ? (originRight <= 0 ? [100 - f, 0] : [originLeft, 100 - f - originLeft]) : [originLeft, originRight]
}

function calculateRadius(isFinished: boolean, startTimestamp: number, endTimestamp: number, lowerTimestamp: number, upperTimestamp: number) {
    const leftRadius = startTimestamp >= lowerTimestamp ? '4px' : '0'
    const rightRadius = endTimestamp <= upperTimestamp && isFinished ? '4px' : '0'

    return [leftRadius, rightRadius]
}

function getDateInfo(startTime: Date, endTime: Date) {
    const start = toCNStringDate(startTime)
    const end = toCNStringDate(endTime)
    
    return `${start} 至 ${end}`
}
</script>

<style scoped>
    .main-panel {
        margin-top: 20px;
        position: relative;
        width: 100%;
        min-height: 50px;
        border-color: black;
        border-style: solid;
        border-width: 0 1px;
    }
    .main-panel .progress {
        position: absolute;
        height: 10px;
    }
    .main-panel .progress .gradient {
        background-image: linear-gradient(to right, #FFFFFF00, #FFFFFFFF);
        position: absolute;
        right: 0;
        width: 12px;
        height: 100%;
    }
    .main-panel .progress.selected {
        border: solid white 1px
    }
    .main-panel .tooltip {
        padding: 4px;
        position: fixed;
    }
    .main-panel .tooltip img {
        height: 40px;
        width: 40px;
        border-radius: 2px;
        margin: 2px;
        vertical-align: top;
    }
    .main-panel .tooltip .content {
        display: inline-block;
        min-width: 50px;
        max-width: 250px;
        min-height: 40px;
        margin: 2px;
        padding-right: 2px;
        border-radius: 3px;
        background-color: #0000008F;
        color: white;
    }
    .main-panel .tooltip .title {
        font-size: 12px;
        padding: 0 2px;
    }
    .main-panel .tooltip .tag {
        font-size: 10px;
        color: wheat;
        display: inline-block;
        padding: 0 2px;
    }
    .main-panel .tooltip .date {
        font-size: 10px;
        padding: 0 2px;
        color:azure;
    }
</style>