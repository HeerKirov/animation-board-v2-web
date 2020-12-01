<template lang="pug">
div.axis
    div.point(v-for="point in axisPoints", :style="{left: `${point.position}%`, height: `${point.label ? 20 : 10}px`}")
        label(v-if="point.label") {{point.label}}
div.ui.inline.active.centered.loader.mt-4(v-if="loading")
div.main-panel(v-else, :style="{height: `${rowCount * unitHeight}px`}")
    router-link.progress(v-for="(item, index) in items", :key="`${item.id}-${item.ordinal}`", :to="{name: 'Record.Detail', params: {id: item.id}}"
                        :style="item.style", :class="item.class", @mouseenter="onMouseOver(index)", @mouseleave="onMouseOut")
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
import { localTimestamp } from '@/functions/format'
import { dates } from '@/functions/util'
import { colorCSS } from '@/definitions/fomantic-ui-colors'

export interface Instance {
    id: number
    title: string
    cover: string
    ordinal: number
    chaseType: "CHASE"|"SUPPLEMENT"|"REWATCHED"
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

function calcGranularity(boundRange: number) {
    //粒度计算保证一个最小粒度不会发生显著重叠，但又不至于距离差过大。
    if(boundRange <= 1000 * 60 * 60 * 200) return 1000 * 60 * 60 * 0.5  //200小时以内的范围只能用0.5小时的粒度了，不能再小了
    else if(boundRange <= 1000 * 60 * 60 * 400) return 1000 * 60 * 60 * 1   //400小时以内的范围用1小时粒度
    else if(boundRange <= 1000 * 60 * 60 * 800) return 1000 * 60 * 60 * 2   //800小时以内的范围用2小时粒度
    else if(boundRange <= 1000 * 60 * 60 * 24 * 50) return 1000 * 60 * 60 * 3   //50天以内的范围用3小时粒度
    else if(boundRange <= 1000 * 60 * 60 * 24 * 100) return 1000 * 60 * 60 * 6  //100天以内的范围用6小时粒度
    else if(boundRange <= 1000 * 60 * 60 * 24 * 200) return 1000 * 60 * 60 * 12 //200天以内的范围用12小时粒度
    else if(boundRange <= 1000 * 60 * 60 * 24 * 400) return 1000 * 60 * 60 * 24 //400天以内的范围用24小时粒度
    else return 1000 * 60 * 60 * 48 //再多的范围就用48小时粒度
}

export default defineComponent({
    props: {
        loading: {type: Boolean, required: true},
        data: {type: (null as any) as PropType<Instance[]>, required: true},
        lower: {type: (null as any) as PropType<Date>, required: true},
        upper: {type: (null as any) as PropType<Date>, required: true},
        groupByChase: {type: Boolean, default: true}
    },
    computed: {
        unitHeight() { return unitHeight }
    },
    setup(props) {
        const items: Ref<any[]> = ref([])
        const rowCount: Ref<number> = ref(0)
        watch(() => [props.data, props.groupByChase], () => {
            const lowerTimestamp = localTimestamp(props.lower)
            const upperTimestamp = localTimestamp(props.upper)
            const granularity = calcGranularity(upperTimestamp - lowerTimestamp)
            if(props.groupByChase) {
                const distributors = {
                    "CHASE": createDistributor(Math.floor(lowerTimestamp / granularity), Math.ceil(upperTimestamp / granularity)),
                    "SUPPLEMENT": createDistributor(Math.floor(lowerTimestamp / granularity), Math.ceil(upperTimestamp / granularity)),
                    "REWATCHED": createDistributor(Math.floor(lowerTimestamp / granularity), Math.ceil(upperTimestamp / granularity))
                }
                const tempItems = props.data.map(instance => mapRow(instance, granularity, distributors[instance.chaseType].distribute))
                rowCount.value = distributors.CHASE.count() + distributors.SUPPLEMENT.count() + distributors.REWATCHED.count()
                const supplementAddRow = distributors.CHASE.count(), rewatchedAddRow = distributors.CHASE.count() + distributors.SUPPLEMENT.count()
                items.value = tempItems
                    .map(({ instance, row }) => ({
                        instance, 
                        row: row + (instance.chaseType === "CHASE" ? 0 : instance.chaseType === "SUPPLEMENT" ? supplementAddRow : rewatchedAddRow)
                    }))
                    .map(({ instance, row }) => mapItem(instance, lowerTimestamp, upperTimestamp, row))
            }else{
                const { distribute, count } = createDistributor(Math.floor(lowerTimestamp / granularity), Math.ceil(upperTimestamp / granularity))
                items.value = props.data.map(instance => mapRow(instance, granularity, distribute)).map(({ instance, row }) => mapItem(instance, lowerTimestamp, upperTimestamp, row))
                rowCount.value = count()
            }
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
        while (localTimestamp(d) <= options.upper) {
            const timestamp = localTimestamp(d)
            if(timestamp >= options.lower && (!options.filter || options.filter(d, timestamp))) {
                list.push({label: options.map(d, timestamp), position: (timestamp - options.lower) * 100 / delta})
            }
            d = options.step(d)
        }

        return list
    }

    return computed(() => {
        const lower = localTimestamp(bound.lower), upper = localTimestamp(bound.upper)
        const lowerDay = Math.ceil(lower / msInDay), upperDay = Math.floor(upper / msInDay) //ceil floor与别处相反是为了保证day的时间点都包在实际时间范围内
        const deltaDay = upperDay - lowerDay
        if(deltaDay >= 1460) {//超过4年只显示年刻度
            return iterator({
                initValue: dates.onlyYear(new Date(lowerDay * msInDay)),
                lower, upper,
                step(d) { return dates.nextYear(d) },
                map(d) { return `${d.getFullYear()}年` }
            })
        }else if(deltaDay >= 730) {//超过2年显示年刻度和季度刻度
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
        }else if(deltaDay >= 365) {//超过1年显示年刻度和月刻度，且4/7/10月会显示
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
                map(d) { return d.getMonth() % 3 === 0 ? `${d.getMonth() + 1}月` : null }
            }))
        }else if(deltaDay >= 90) {//超过3个月显示月刻度
            return iterator({
                initValue: dates.onlyMonth(new Date(lowerDay * msInDay)),
                lower, upper,
                step(d) { return dates.nextMonth(d) },
                map(d) { return `${d.getMonth() + 1}月` }
            })
        }else if(deltaDay >= 60) {//超过2个月显示月刻度和奇数日刻度
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
        }else if(deltaDay >= 30) {//超过30天显示月刻度和日刻度
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
        }else if(deltaDay >= 18) {//超过18天隔天显示月+日刻度
            let main = false
            return iterator({
                initValue: dates.onlyDay(new Date(lowerDay * msInDay)),
                lower, upper,
                step(d) { return dates.nextDay(d) },
                map(d) { return (main = !main) ? `${d.getMonth() + 1}月${d.getDate()}日` : null }
            })
        }else{//再短显示月+日刻度
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

function mapRow(instance: Instance, granularity: number, distribute: (begin: number, end: number) => number) {
    const startTimestamp = localTimestamp(instance.startTime)
    const endTimestamp = localTimestamp(instance.endTime)
    const row = distribute(Math.floor(startTimestamp / granularity), Math.ceil(endTimestamp / granularity))
    return {instance, row}
}

function mapItem(instance: Instance, lowerTimestamp: number, upperTimestamp: number, row: number) {
    const startTimestamp = localTimestamp(instance.startTime)
    const endTimestamp = localTimestamp(instance.endTime)

    const [originLeft, originRight] = calculateScale(startTimestamp, endTimestamp, lowerTimestamp, upperTimestamp)
    const [left, right] = calculateRealScale(originLeft, originRight)

    const style = instance.chaseType === "CHASE" ? {
        'background-color': colors[instance.id % colors.length] + '4F',
        'border-color': colors[instance.id % colors.length]
    } : instance.chaseType === "SUPPLEMENT" ? {
        'background-color': colors[instance.id % colors.length]
    } : {
        'border-color': colors[instance.id % colors.length],
        'background': `linear-gradient(0deg, 
            #fff 25%, 
            ${colors[instance.id % colors.length]} 0, 
            ${colors[instance.id % colors.length]} 50%, 
            #fff 0, 
            #fff 75%, 
            ${colors[instance.id % colors.length]} 0)`,
        'background-size': '5px 5px'
    }

    return {
        id: instance.id,
        title: instance.title,
        cover: instance.cover,
        ordinal: instance.ordinal,
        finished: instance.finished,
        date: getDateInfo(instance.startTime, instance.endTime),
        class: {
            [instance.chaseType.toLowerCase()]: true,
            'left-border': startTimestamp >= lowerTimestamp,
            'right-border': endTimestamp <= upperTimestamp
        },
        style: {
            left: `${left}%`,
            right: `${right}%`,
            top: `${row * unitHeight}px`,
            ...style
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
    const f = 0.4
    return (100 - f < originLeft + originRight) ? (100 < f + originLeft ? [100 - f, 0] : [originLeft, 100 - f - originLeft]) : [originLeft, originRight]
}

function getDateInfo(startTime: Date, endTime: Date) {
    const start = toCNStringDate(startTime)
    const end = toCNStringDate(endTime)
    
    return `${start} 至 ${end}`
}
</script>

<style lang="sass" scoped>
.axis
    margin-top: 20px
    position: relative
    width: 100%
    height: 40px
    .point
        position: absolute
        width: 1px
        background-color: black
        label
            position: absolute
            min-width: 45px
            top: 20px
            transform: translateX(-50%)
            font-size: 10px
            text-align: center

.main-panel
    position: relative
    width: 100%
    min-height: 50px
    border-color: black
    border-style: solid
    border-width: 0 1px
    .progress
        position: absolute
        height: 13px
        border-radius: 1px
        border-width: 0px
        &:hover
            transform: translateY(-1px)
        &.supplement
        &.rewatched,
        &.chase
            border-style: solid
            border-top-width: 2px
            border-bottom-width: 2px
        &.left-border
            border-left-width: 2px
        &.right-border
            border-right-width: 2px
    .tooltip
        padding: 4px
        position: fixed
        img
            height: 40px
            width: 40px
            border-radius: 2px
            margin: 2px
            vertical-align: top
        .content
            display: inline-block
            min-width: 50px
            max-width: 250px
            min-height: 40px
            margin: 2px
            padding-right: 2px
            border-radius: 3px
            background-color: #0000008F
            color: white
        .title
            font-size: 12px
            padding: 0 2px
        .tag
            font-size: 10px
            color: wheat
            display: inline-block
            padding: 0 2px
        .date
            font-size: 10px
            padding: 0 2px
            color: azure
</style>
