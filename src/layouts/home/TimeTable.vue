<template lang="pug">
div.ui.segment.px-0
    h4.ui.horizontal.divider.header.mx-3 {{seasonHeader}}
    a.ui.tertiary.mini.icon.button.angle-button.left(@click="todayMinus")
        i.angle.left.icon
    a.ui.tertiary.mini.icon.button.angle-button.right(@click="todayPlus")
        i.angle.right.icon
    div.ui.five.columns.grid.px-6
        div.ui.column.px-0(v-for="weekday in weekdays")
            div.ui.horizontal.divider.mx-1: span.ui.text(:class="{primary: todayWeekday === weekday.day}") {{weekday.title}}
            template(v-for="item in weekday.items")
                div.publish-time {{item.nextPublishTime}}
                router-link.ui.primary.tertiary.mini.button.text-left(style="margin: 0!important; padding: 2px 5px!important", :to="{name: 'Record.Detail', params: {id: item.id}}") {{item.title}}
                router-link(:to="{name: 'Record.Detail', params: {id: item.id}}")
                    img.ui.rounded.image.cover(:src="item.cover")
</template>

<script lang="ts">
import { defineComponent, ref, computed, Ref, watch } from 'vue'
import { useSWR } from '@/functions/server'
import { arrays } from '@/functions/util'
import { toTimeTableTime } from '@/functions/display'
import cover from '@/plugins/cover'

const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

interface Weekday {
    day: number
    title: string
    items: any[]
}

export default defineComponent({
    computed: {
        seasonHeader() { return getHeader() }
    },
    setup() {
        const { data: originData } = useSWR('/api/personal/records/timetable', null, {byAuthorization: 'LOGIN'})
        const data: Ref<{[d: number]: any[]}> = computed(() => {
            if(originData.value == null) { return {} }
            const nightTimeTable = originData.value['night_time_table']
            const result = originData.value['result'] as {[d: string]: any[]}

            const ret: {[d: number]: any[]} = {}
            for(const day in result) {
                ret[parseInt(day)] = result[day].map(item => mapItem(item, nightTimeTable))
            }
            return ret
        })

        const {todayWeekday, today} = getTodayWeekday(computed(() => originData.value?.['night_time_table'] ?? false))

        const todayPlus = () => { today.value = (today.value + 1) % 7 }
        const todayMinus = () => { today.value = (today.value + 6) % 7 }

        const weekdays: Ref<Weekday[]> = computed(() => arrays.range(today.value - 2, today.value + 3).map(i => {
            const weekday = (i + 7) % 7
            return {day: weekday, title: weekdayNames[weekday], items: data.value[weekday] ?? []}
        }))

        return {todayWeekday, weekdays, todayPlus, todayMinus}
    }
})

function getHeader() {
    const now = new Date()
    const year = now.getFullYear()
    const season = ['冬', '春', '夏', '秋'][Math.floor(now.getMonth() / 3)]
    return `${year}年·${season}季`
}

function getTodayWeekday(nightTimeTable: Ref<boolean>) {
    const todayWeekday = computed(() => {
        const now = new Date()
        if(nightTimeTable) now.setHours(now.getHours() - 2)
        return now.getDay()
    })
    const today: Ref<number> = ref(todayWeekday.value)
    watch(todayWeekday, () => { today.value = todayWeekday.value })

    return {todayWeekday, today}
}

function mapItem(item: any, nightTimeTable: boolean) {
    return {
        id: item['animation_id'],
        title: item['title'],
        cover: cover.animationOrEmpty(item['cover']),
        nextPublishEpisodes: item['next_publish_episodes'],
        nextPublishTime: toTimeTableTime(new Date(item['next_publish_time']), nightTimeTable ? 2 : 0)
    }
}
</script>

<style scoped>
    .angle-button {
        position: absolute;
    }
    .angle-button.left {
        transform: translateY(6px);
        left: 0;
    }
    .angle-button.right {
        transform: translate(3px, 6px);
        right: 0;
    }
    .publish-time {
        color: grey;
        margin-left: 6px;
        margin-top: 10px;
    }
    .cover {
        margin-left: 6px;
        width: 40%;
    }
</style>