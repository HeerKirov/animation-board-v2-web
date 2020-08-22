<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'scale'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
    div.ui.grid
        div.ui.row
            div.ui.two.wide.column
                CalendarBox(max-width="140px", placeholder="最早时间点", v-model="editorValue.lower", first="day", until="day")
            div.ui.two.wide.column
                CalendarBox(max-width="140px", placeholder="最晚时间点", v-model="editorValue.upper", first="day", until="day")
            div.ui.one.wide.column
                a.ui.green.icon.button(@click="onSearch"): i.search.icon
    ScalePanel(:data="data")
</template>

<script lang="ts">
import { defineComponent, ref, Ref, reactive, watchEffect, computed, watch } from 'vue'
import CalendarBox from '@/components/CalendarBox.vue'
import ScalePanel, { Instance } from '@/layouts/record/ScalePanel.vue'
import { useRouterQueryUtil } from '@/functions/routers'
import { usePagination, useSelector } from '@/functions/parameters'
import { useSWR } from '@/functions/server'
import { toCNStringDate } from '@/functions/display'
import { Calendar, dateToCalendar, CalendarUntilPart, calendarToDate, dateToUTCString } from '@/functions/format'
import { toNameSet } from '@/definitions/util'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import cover from '@/plugins/cover'

interface Item {
    id: number
    title: string
    cover: string
    ordinal: number
    finished: boolean
    startTime: Date
    endTime: Date
}

//TODO 下一步将所有涉及坐标的计算都移到panel内进行，view只提供timestamp数值
//TODO 因此需要为panel提供lower和upper范围
//TODO 由于上述改动，可以判断progress的头尾是否溢出显示范围。只有确实溢出显示范围(而不是顶到显示范围边界)的progress，其圆角不显示
//TODO 可以提供更多详细信息的progress
//TODO 进度堆叠算法
export default defineComponent({
    components: {CalendarBox, ScalePanel},
    computed: {
        barItems() { return secondaryBarItems.record }
    },
    setup() {
        const { updateQuery, watchQuery } = useRouterQueryUtil()

        const [lowerDate, upperDate] = getDefaultBound()
        const bound: Ref<{lower: Calendar, upper: Calendar}> = ref({
            lower: dateToCalendar(lowerDate, CalendarUntilPart.Day),
            upper: dateToCalendar(upperDate, CalendarUntilPart.Day)
        })

        const { editorValue, onSearch } = useEditor(bound, updateQuery)

        watchQuery({
            'bound': queryToBound(bound)
        })

        const fetcher = useBoundFetcher(bound)

        const { loading, data: origin } = useSWR('/api/personal/records/scale', fetcher)

        const data: Ref<Instance[]> = ref([])

        watch(origin, () => {
            if(origin.value) {
                const lowerTimestamp = calendarToDate(bound.value.lower).getTime()
                const upperTimestamp = calendarToDate(bound.value.upper).getTime()
                let i = 0
                data.value = (origin.value as any[]).map(mapItem).map(item => {
                    const left = (Math.max(lowerTimestamp, item.startTime.getTime()) - lowerTimestamp) * 100 / (upperTimestamp - lowerTimestamp)
                    const right = (upperTimestamp - Math.min(upperTimestamp, item.endTime.getTime())) * 100 / (upperTimestamp - lowerTimestamp)
                    return {
                        id: item.id,
                        title: item.title,
                        cover: item.cover,
                        ordinal: item.ordinal,
                        finished: item.finished,
                        startTime: item.startTime,
                        endTime: item.endTime,
                        left,
                        right,
                        row: i++
                    }
                })
            }else{
                data.value = []
            }
        }, {immediate: true})

        return {editorValue, onSearch, data}
    }
})

function useEditor(bound: Ref<{lower: Calendar, upper: Calendar}>, updateQuery: (key: string, value: any) => void) {
    const editorValue = reactive({
        lower: bound.value.lower,
        upper: bound.value.upper
    })

    watch(bound, () => {
        editorValue.lower = bound.value.lower
        editorValue.upper = bound.value.upper
    })

    const onSearch = () => {
        updateQuery('bound', `${editorValue.lower.year}-${editorValue.lower.month}-${editorValue.lower.day}~${editorValue.upper.year}-${editorValue.upper.month}-${editorValue.upper.day}`)
    }

    return {editorValue, onSearch}
}

function useBoundFetcher(bound: Ref<{lower: Calendar, upper: Calendar}>) {
    return reactive(computed(() => {
        return {
            lower: dateToUTCString(calendarToDate(bound.value.lower)),
            upper: dateToUTCString(calendarToDate(bound.value.upper))
        }
    }))
}

function queryToBound(bound: Ref<{lower: Calendar, upper: Calendar}>) {
    return (value: string | null) => {
        if(value) {
            const [start, end] = value.split('~')
            const [startYear, startMonth, startDay] = start.split('-')
            const [endYear, endMonth, endDay] = end.split('-')

            const [startDate, endDate] = getBound(new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay)), new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay)))
            bound.value = {
                lower: dateToCalendar(startDate, CalendarUntilPart.Day),
                upper: dateToCalendar(endDate, CalendarUntilPart.Day)
            }
        }else{
            const [startDate, endDate] = getDefaultBound()
            bound.value = {
                lower: dateToCalendar(startDate, CalendarUntilPart.Day),
                upper: dateToCalendar(endDate, CalendarUntilPart.Day)
            }
        }
    }
}

function getBound(startDate: Date, endDate: Date) {
    const end = !isNaN(endDate.getTime()) ? endDate : new Date()
    const start = !isNaN(startDate.getTime()) ? startDate : (() => {
        const d = new Date(end)
        d.setMonth(d.getMonth() - 3)
        return d
    })()

    return [start, end]
}

function getDefaultBound() {
    const upperDate = new Date()
    const lowerDate = new Date(upperDate)
    lowerDate.setMonth(upperDate.getMonth() - 3)
    return [lowerDate, upperDate]
}

function mapItem(item: any): Item {
    const startTime = new Date(item['start'])
    const endTime = new Date(item['end'])
    return {
        id: item['animation_id'],
        title: item['title'],
        cover: cover.animationOrEmpty(item['cover']),
        ordinal: item['ordinal'],
        finished: item['finished'],
        startTime, endTime
    }
}
</script>
