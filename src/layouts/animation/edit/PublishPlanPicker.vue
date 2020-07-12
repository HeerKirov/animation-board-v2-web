<template lang="pug">
div.ui.segment
    div.ui.field
        label 起始时间点
        CalendarBox(placeholder="第一项更新时间", v-model="first")
    div.ui.fields
        div.ui.field
            label 间隔时间(天)
            input.ui.input(type="number", min="1", v-model="interval")
        div.ui.field
            label 项数
            input.ui.input(type="number", min="1", v-model="count")
    button.ui.green.fluid.button.mt-2(@click="onSubmit") 添加
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue'
import CalendarBox from '@/components/CalendarBox.vue'
import { Calendar, calendarToDate } from '@/functions/format'

export default defineComponent({
    components: {CalendarBox},
    props: {
        maxCount: {type: Number, required: true}
    },
    emits: ['pick'],
    setup(props, {emit}) {
        const data: {first: Calendar | undefined, interval: number, count: number} = reactive({
            first: undefined,
            interval: 7,
            count: props.maxCount
        })

        const onSubmit = () => {
            //TODO 添加警告信息框和合法性检查
            let d = calendarToDate(data.first!)
            const result = [d]
            for(let i = 1; i < data.count; ++i) {
                d = new Date(d)
                d.setDate(d.getDate() + data.interval)
                result.push(d)
            }

            emit('pick', result)
            data.first = undefined
        }

        return {...toRefs(data), onSubmit}
    }
})
</script>