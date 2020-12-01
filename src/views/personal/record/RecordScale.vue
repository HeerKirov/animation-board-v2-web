<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'scale'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
    div
        CalendarBox.is-inline-block(max-width="140px", placeholder="最早时间点", v-model="editorValue.lower", first="day", until="day")
        i.arrow.right.icon.ml-1
        CalendarBox.is-inline-block(max-width="140px", placeholder="最晚时间点", v-model="editorValue.upper", first="day", until="day")
        a.ui.green.icon.button.ml-1.text-top(@click="onSearch"): i.search.icon
        div.float-right
            a.ui.tertiary.small.button(@click="onGroupByChaseChanged", :class="{primary: groupByChase}") 
                i.check.icon(v-if="groupByChase")
                = '分组显示'
        div.ui.basic.red.label.ml-1(v-if="searchError") {{searchError}}
        template(v-else)
            a.ui.primary.tertiary.small.button.text-top(@click="onClickFastPrev")
                i.double.left.angle.icon
                = '向前{{fastLabel}}'
            a.ui.primary.tertiary.small.button.text-top(@click="onClickFastNext")
                = '向后{{fastLabel}}'
                i.double.right.angle.icon
            a.ui.primary.tertiary.small.button.text-top(@click="onClickCurrentYear")
                i.calendar.alternate.outline.icon
                = '今年'
    ScalePanel(:loading="loading", :data="data", :lower="panelBound.lower", :upper="panelBound.upper", :groupByChase="groupByChase")
</template>

<script lang="ts">
import { defineComponent, ref, Ref, reactive, computed, watch } from 'vue'
import CalendarBox from '@/components/CalendarBox.vue'
import ScalePanel, { Instance } from '@/layouts/record/ScalePanel.vue'
import { useRouterQueryUtil } from '@/functions/routers'
import { useSWR } from '@/functions/server'
import { Calendar, dateToCalendar, CalendarUntilPart, calendarToDate, dateToUTCString } from '@/functions/format'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import cover from '@/plugins/cover'
import { dates } from '@/functions/util'

const msInDay = 86400000

export default defineComponent({
    components: {CalendarBox, ScalePanel},
    computed: {
        barItems() { return secondaryBarItems.record }
    },
    setup() {
        const { updateQuery, watchQuery } = useRouterQueryUtil()

        const groupByChase: Ref<boolean> = ref(false)

        const [lowerDate, upperDate] = getBound()
        const bound: Ref<{lower: Calendar, upper: Calendar}> = ref({
            lower: dateToCalendar(lowerDate, CalendarUntilPart.Day),
            upper: dateToCalendar(upperDate, CalendarUntilPart.Day)
        })
        const panelBound = computed(() => {
            return {
                lower: calendarToDate(bound.value.lower),
                upper: dates.nextDay(calendarToDate(bound.value.upper), 1)
            }
        })

        const onGroupByChaseChanged = () => updateQuery('group_by_chase', !groupByChase.value ? 'true' : undefined)

        watchQuery({
            'bound': queryToBound(bound), 
            'group_by_chase'(value) { groupByChase.value = value == "true" }
        })

        const fetcher = useBoundFetcher(bound)
        const { loading, data: origin } = useSWR('/api/personal/records/scale', fetcher)
        const data = computed(() => origin.value ? (origin.value as any[]).map(mapItem) : [])

        const { editorValue, onSearch, searchError } = useEditor(bound, updateQuery)
        const { fastLabel, onClickFastNext, onClickFastPrev, onClickCurrentYear } = useFastButton(bound, updateQuery)

        return {editorValue, onSearch, searchError, fastLabel, onClickFastNext, onClickFastPrev, onClickCurrentYear, panelBound, loading, data, groupByChase, onGroupByChaseChanged}
    }
})

function useEditor(bound: Ref<{lower: Calendar, upper: Calendar}>, updateQuery: (key: string, value: any) => void) {
    const editorValue = reactive({
        lower: bound.value.lower,
        upper: bound.value.upper
    })
    const searchError: Ref<string | null> = ref(null)

    watch(bound, () => {
        editorValue.lower = bound.value.lower
        editorValue.upper = bound.value.upper
    })

    const onSearch = () => {
        const lower = calendarToDate(editorValue.lower)
        const upper = calendarToDate(editorValue.upper)
        if(upper.getTime() - lower.getTime() <= 0) {
            searchError.value = '无效的查询时间范围。'
        }else{
            searchError.value = null
            updateQuery('bound', `${editorValue.lower.year}-${editorValue.lower.month}-${editorValue.lower.day}~${editorValue.upper.year}-${editorValue.upper.month}-${editorValue.upper.day}`)
        }
    }

    return {editorValue, searchError, onSearch}
}

function useFastButton(bound: Ref<{lower: Calendar, upper: Calendar}>, updateQuery: (key: string, value: any) => void) {
    const fastType = computed(() => {
        const delta = (calendarToDate(bound.value.upper).getTime() - calendarToDate(bound.value.lower).getTime()) / msInDay
        if(delta >= 365 * 2) {
            return 'year1'
        }else if(delta >= 365) {
            return 'month6'
        }else if(delta >= 30 * 6) {
            return 'month3'
        }else if(delta >= 30 * 3) {
            return 'month1'
        }else if(delta >= 7 * 4) {
            return 'week2'
        }else if(delta >= 7 * 2) {
            return 'week1'
        }else{
            return 'day1'
        }
    })

    const labels = {year1: '1年', month6: '6个月', month3: '3个月', month1: '1个月', week2: '2周', week1: '1周', day1: '1天'}
    const fastLabel = computed(() => labels[fastType.value])

    const actions = {
        year1(d: Date, direction: number) { d.setFullYear(d.getFullYear() + direction, d.getMonth(), d.getDate()) },
        month6(d: Date, direction: number) { d.setMonth(d.getMonth() + direction * 6, d.getDate()) },
        month3(d: Date, direction: number) { d.setMonth(d.getMonth() + direction * 3, d.getDate()) },
        month1(d: Date, direction: number) { d.setMonth(d.getMonth() + direction, d.getDate()) },
        week2(d: Date, direction: number) { d.setDate(d.getDate() + direction * 14) },
        week1(d: Date, direction: number) { d.setDate(d.getDate() + direction * 7) },
        day1(d: Date, direction: number) { d.setDate(d.getDate() + direction) },
    }
    const onClickFastPrev = () => fast(-1, actions[fastType.value])
    const onClickFastNext = () => fast(1, actions[fastType.value])
    const fast = (direction: number, action: (d: Date, direction: number) => void) => {
        const lower = calendarToDate(bound.value.lower), upper = calendarToDate(bound.value.upper)
        action(lower, direction)
        action(upper, direction)
        updateQuery('bound', `${lower.getFullYear()}-${lower.getMonth() + 1}-${lower.getDate()}~${upper.getFullYear()}-${upper.getMonth() + 1}-${upper.getDate()}`)
    }

    const onClickCurrentYear = () => {
        const year = new Date().getFullYear()
        updateQuery('bound', `${year}-01-01~${year}-12-31`)
    }

    return {fastLabel, onClickFastPrev, onClickFastNext, onClickCurrentYear}
}

function useBoundFetcher(bound: Ref<{lower: Calendar, upper: Calendar}>) {
    return reactive(computed(() => {
        return {
            lower: dateToUTCString(calendarToDate(bound.value.lower)),
            upper: dateToUTCString(dates.nextDay(calendarToDate(bound.value.upper), 1))
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
            const [startDate, endDate] = getBound()
            bound.value = {
                lower: dateToCalendar(startDate, CalendarUntilPart.Day),
                upper: dateToCalendar(endDate, CalendarUntilPart.Day)
            }
        }
    }
}

function getBound(startDate?: Date, endDate?: Date) {
    const end =  endDate != undefined && !isNaN(endDate.getTime()) ? endDate : new Date()
    const start = startDate != undefined && !isNaN(startDate.getTime()) ? startDate : dates.nextMonth(new Date(end), -6)

    return [start, end]
}

function mapItem(item: any): Instance {
    const startTime = new Date(item['start'])
    const endTime = new Date(item['end'])
    return {
        id: item['animation_id'],
        title: item['title'],
        cover: cover.animationOrEmpty(item['cover']),
        ordinal: item['ordinal'],
        chaseType: item['chase_type'],
        finished: item['finished'],
        startTime, endTime
    }
}
</script>
