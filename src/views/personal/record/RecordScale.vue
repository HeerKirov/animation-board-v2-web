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
    ScalePanel(:data="data", :lower="panelBound.lower", :upper="panelBound.upper")
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
        const panelBound = computed(() => {
            return {
                lower: calendarToDate(bound.value.lower),
                upper: calendarToDate(bound.value.upper)
            }
        })

        const { editorValue, onSearch } = useEditor(bound, updateQuery)

        watchQuery({'bound': queryToBound(bound)})

        const fetcher = useBoundFetcher(bound)
        const { loading, data: origin } = useSWR('/api/personal/records/scale', fetcher)
        const data = computed(() => origin.value ? (origin.value as any[]).map(mapItem) : [])

        return {editorValue, onSearch, data, panelBound}
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

function mapItem(item: any): Instance {
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
