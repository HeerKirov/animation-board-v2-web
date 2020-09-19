<template lang="pug">
div.axis
    div.point(v-for="point in axisPoints", :style="{left: `${point.position}%`, height: `${point.label ? 20 : 10}px`}")
        label(v-if="point.label") {{point.label}}
div.ui.inline.active.centered.loader.mt-4(v-if="loading")
div.main-panel(v-else, :style="{height: `${rowCount * unitHeight}px`}")
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
import { defineComponent, PropType, ref, computed, ComputedRef, Ref, watch, reactive } from 'vue'
import { useMousePosition } from '@/functions/document'
import { toCNStringDate } from '@/functions/display'
import { createMarkST, MarkSegmentTree } from '@/functions/segment-tree'
import { dates } from '@/functions/util'
import { colorCSS } from '@/definitions/fomantic-ui-colors'

export interface Instance {
    id: number
    title: string
    cover: string
    ordinal: number
    finished: boolean
    startTime: Date
    endTime: Date
}

interface AxisPoint {
    position: number
    label: string | null
}

const msInDay = 86400000

const unitHeight = 15
const colors = [colorCSS.red, colorCSS.orange, colorCSS.yellow, colorCSS.green, colorCSS.teal, colorCSS.blue, colorCSS.purple]

export default defineComponent({
    props: {
        loading: {type: Boolean, required: true},
        data: {type: (null as any) as PropType<Instance[]>, required: true},
        lower: {type: (null as any) as PropType<Date>, required: true},
        upper: {type: (null as any) as PropType<Date>, required: true}
    },
    computed: {
        unitHeight() { return unitHeight }
    },
    setup(props) {
        const items: Ref<any[]> = ref([])
        const rowCount: Ref<number> = ref(0)
        watch(() => props.data, () => {
            const lowerTimestamp = props.lower.getTime()
            const upperTimestamp = props.upper.getTime()
            //百分比方案 const { distribute, count } = createDistributor()
            const { distribute, count } = createDistributor(Math.floor(lowerTimestamp / msInDay), Math.ceil(upperTimestamp / msInDay))
            items.value = props.data.map(instance => mapItem(instance, lowerTimestamp, upperTimestamp, distribute))
            rowCount.value = count()
        }, {immediate: true})

        const { tooltip, onMouseOver, onMouseOut } = useTooltip()

        const axisPoints = useAxisPoints(props)

        return {items, rowCount, tooltip, axisPoints, onMouseOver, onMouseOut}
    }
})

function useAxisPoints(bound: {lower: Date, upper: Date}): ComputedRef<AxisPoint[]> {
    /* 刻度根据bound范围差delta来决定。首先要根据范围选择合适的刻度单位。刻度使用一大一小两种刻度来显示。大刻度要标明数值，小刻度则不。小刻度不必须存在。
     * 日刻度(选择所有day为大刻度)：delta >= 0
     * 日-部分日刻度(从lower开始第一day，隔1为大刻度，其他为小刻度)：delta >= 18日 = 18
     * 月-日刻度(month为大刻度，day去掉1为小刻度)：delta >= 1月 = 30
     * 月-部分日刻度(month为大刻度, day去掉1奇数为小刻度): delta >= 2月 = 60
     * 月刻度(month为大刻度)：delta >= 3月 = 90
     * 年-月刻度(year为大刻度，month去掉1为小刻度)：delta >= 1年 = 365
     * 年-季刻度(year为大刻度，month%3=0为小刻度): delta >= 2年 = 730
     * 年刻度(year为大刻度)：delta >= 4年 = 1460
     */
    function iterator(options: {initValue: Date, lower: number, upper: number, step: (Date) => Date, filter?: (Date, number) => boolean, map: (Date, number) => string | null}): AxisPoint[] {
        const list: AxisPoint[] = []
        const delta = options.upper - options.lower
        let d = options.initValue
        while (d.getTime() <= options.upper) {
            const timestamp = d.getTime()
            if(timestamp >= options.lower && (!options.filter || options.filter(d, timestamp))) {
                list.push({label: options.map(d, timestamp), position: (timestamp - options.lower) * 100 / delta})
            }
            d = options.step(d)
        }

        return list
    }

    return computed(() => {
        const lower = bound.lower.getTime(), upper = bound.upper.getTime()
        const lowerDay = Math.ceil(lower / msInDay), upperDay = Math.floor(upper / msInDay) //ceil floor与别处相反是为了保证day的时间点都包在实际时间范围内
        const deltaDay = upperDay - lowerDay
        if(deltaDay >= 1460) {
            return iterator({
                initValue: dates.onlyYear(new Date(lowerDay * msInDay)),
                lower, upper,
                step(d) { return dates.nextYear(d) },
                map(d) { return `${d.getFullYear()}年` }
            })
        }else if(deltaDay >= 730) {
            return iterator({
                initValue: dates.onlyYear(new Date(lowerDay * msInDay)),
                lower, upper,
                step(d) { return dates.nextYear(d) },
                map(d) { return `${d.getFullYear()}年` }
            }).concat(iterator({
                initValue: dates.onlyMonth(new Date(lowerDay * msInDay)),
                lower, upper,
                step(d) { return dates.nextMonth(d) },
                filter(d) { return d.getMonth() != 0 && d.getMonth() % 3 === 0 },
                map() { return null }
            }))
        }else if(deltaDay >= 365) {
            return iterator({
                initValue: dates.onlyYear(new Date(lowerDay * msInDay)),
                lower, upper,
                step(d) { return dates.nextYear(d) },
                map(d) { return `${d.getFullYear()}年` }
            }).concat(iterator({
                initValue: dates.onlyMonth(new Date(lowerDay * msInDay)),
                lower, upper,
                step(d) { return dates.nextMonth(d) },
                filter(d) { return d.getMonth() != 0 },
                map() { return null }
            }))
        }else if(deltaDay >= 90) {
            return iterator({
                initValue: dates.onlyMonth(new Date(lowerDay * msInDay)),
                lower, upper,
                step(d) { return dates.nextMonth(d) },
                map(d) { return `${d.getMonth() + 1}月` }
            })
        }else if(deltaDay >= 60) {
            return iterator({
                initValue: dates.onlyMonth(new Date(lowerDay * msInDay)),
                lower, upper,
                step(d) { return dates.nextMonth(d) },
                map(d) { return `${d.getMonth() + 1}月` }
            }).concat(iterator({
                initValue: dates.onlyDay(new Date(lowerDay * msInDay)),
                lower, upper,
                step(d) { return dates.nextDay(d) },
                filter(d) { return d.getDate() !== 1 && d.getDate() % 2 === 1 },
                map() { return null }
            }))
        }else if(deltaDay >= 30) {
            return iterator({
                initValue: dates.onlyMonth(new Date(lowerDay * msInDay)),
                lower, upper,
                step(d) { return dates.nextMonth(d) },
                map(d) { return `${d.getMonth() + 1}月` }
            }).concat(iterator({
                initValue: dates.onlyDay(new Date(lowerDay * msInDay)),
                lower, upper,
                step(d) { return dates.nextDay(d) },
                filter(d) { return d.getDate() != 1 },
                map() { return null }
            }))
        }else if(deltaDay >= 18) {
            let main = false
            return iterator({
                initValue: dates.onlyDay(new Date(lowerDay * msInDay)),
                lower, upper,
                step(d) { return dates.nextDay(d) },
                map(d) { return (main = !main) ? `${d.getMonth() + 1}月${d.getDate()}日` : null }
            })
        }else{
            return iterator({
                initValue: dates.onlyDay(new Date(lowerDay * msInDay)),
                lower, upper,
                step(d) { return dates.nextDay(d) },
                map(d) { return `${d.getMonth() + 1}月${d.getDate()}日` }
            })
        }
    })
}

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

function mapItem(instance: Instance, lowerTimestamp: number, upperTimestamp: number, distribute: (begin: number, end: number) => number) {
    const startTimestamp = instance.startTime.getTime()
    const endTimestamp = instance.endTime.getTime()

    const [originLeft, originRight] = calculateScale(startTimestamp, endTimestamp, lowerTimestamp, upperTimestamp)
    const [left, right] = calculateRealScale(originLeft, originRight)
    const [leftRadius, rightRadius] = calculateRadius(instance.finished, startTimestamp, endTimestamp, lowerTimestamp, upperTimestamp)
    //百分比方案 const row = distribute(Math.floor(originLeft), 100 - Math.floor(originRight))
    const row = distribute(Math.floor(startTimestamp / msInDay), Math.ceil(endTimestamp / msInDay))

    return {
        id: instance.id,
        title: instance.title,
        cover: instance.cover,
        ordinal: instance.ordinal,
        finished: instance.finished,
        date: getDateInfo(instance.startTime, instance.endTime),
        style: {
            left: `${left}%`,
            right: `${right}%`,
            top: `${row * unitHeight}px`,
            'border-radius': `${leftRadius} ${rightRadius} ${rightRadius} ${leftRadius}`,
            'background-color': colors[instance.id % colors.length]
        }
    }
}

function createDistributor(stLower: number = 0, stUpper: number = 100) {
    const distributors: MarkSegmentTree[] = []

    const distribute = (begin: number, end: number): number => {
        for(let i = 0; i < distributors.length; ++i) {
            const st = distributors[i]
            if(!st.query(begin, end)) {
                st.mark(begin, end)
                return i
            }
        }
        const newSt = createMarkST(stLower, stUpper)
        newSt.mark(begin, end)
        distributors.push(newSt)
        return distributors.length - 1
    }
    const count = (): number => {
        return distributors.length
    }

    return {distribute, count}
}

function calculateScale(startTimestamp: number, endTimestamp: number, lowerTimestamp: number, upperTimestamp: number) {
    const originLeft = (Math.max(lowerTimestamp, startTimestamp) - lowerTimestamp) * 100 / (upperTimestamp - lowerTimestamp)
    const originRight = (upperTimestamp - Math.min(upperTimestamp, endTimestamp)) * 100 / (upperTimestamp - lowerTimestamp)  

    return [originLeft, originRight]
}

function calculateRealScale(originLeft: number, originRight: number) {
    //强制每行都拥有一个最小宽度，以免太窄看不清
    //因此溢出右侧版边的，使其贴紧版边
    const f = 0.5
    return (100 - f < originLeft + originRight) ? (100 < f + originLeft ? [100 - f, 0] : [originLeft, 100 - f - originLeft]) : [originLeft, originRight]
}

function calculateRadius(isFinished: boolean, startTimestamp: number, endTimestamp: number, lowerTimestamp: number, upperTimestamp: number) {
    const leftRadius = startTimestamp >= lowerTimestamp ? '3px' : '0'
    const rightRadius = endTimestamp <= upperTimestamp && isFinished ? '3px' : '0'

    return [leftRadius, rightRadius]
}

function getDateInfo(startTime: Date, endTime: Date) {
    const start = toCNStringDate(startTime)
    const end = toCNStringDate(endTime)
    
    return `${start} 至 ${end}`
}
</script>

<style scoped>
    .axis {
        margin-top: 20px;
        position: relative;
        width: 100%;
        height: 40px;
    }
    .axis .point {
        position: absolute;
        width: 1px;
        background-color: black;
    }
    .axis .point label {
        position: absolute;
        min-width: 45px;
        top: 20px;
        transform: translateX(-50%);
        font-size: 10px;
        text-align: center;
    }
    .main-panel {
        position: relative;
        width: 100%;
        min-height: 50px;
        border-color: black;
        border-style: solid;
        border-width: 0 1px;
    }
    .main-panel .progress {
        position: absolute;
        height: 13px;
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
