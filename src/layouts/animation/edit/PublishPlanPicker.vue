<template lang="pug">
div.ui.segment
    div.ui.field
        label 起始时间点
        CalendarBox(placeholder="第一项更新时间", v-model="first")
        div.ui.pointing.label.red.basic(v-if="error.first") {{error.first}}
    div.ui.fields
        div.ui.field
            label 间隔时间(天)
            input.ui.input(type="number", min="1", v-model="interval")
            div.ui.pointing.label.red.basic(v-if="error.interval") {{error.interval}}
        div.ui.field
            label 项数
            input.ui.input(type="number", min="1", v-model="count")
            div.ui.pointing.label.red.basic(v-if="error.count") {{error.count}}
    button.ui.green.fluid.button.mt-2(@click="onSubmit") 添加
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue'
import CalendarBox from '@/components/CalendarBox.vue'
import { Calendar, calendarToDate } from '@/functions/format'

interface DataType {first: Calendar | undefined, interval: number, count: number}
interface ErrorType {first: string | null, interval: string | null, count: string | null}

export default defineComponent({
    components: {CalendarBox},
    props: {
        maxCount: {type: Number, required: true}
    },
    emits: ['pick'],
    setup(props, {emit}) {
        const data: DataType = reactive({
            first: undefined,
            interval: 7,
            count: props.maxCount
        })

        const error: ErrorType = reactive({
            first: null,
            interval: null,
            count: null
        })

        const onSubmit = () => {
            if(validate(data, error, props.maxCount)) {
                let d = calendarToDate(data.first!)
                const result = [d]
                for(let i = 1; i < data.count; ++i) {
                    d = new Date(d)
                    d.setDate(d.getDate() + data.interval)
                    result.push(d)
                }

                emit('pick', result)
                data.first = undefined
                data.count = props.maxCount - result.length > 0 ? props.maxCount - result.length : 0
            }
        }

        return {...toRefs(data), error, onSubmit}
    }
})
function validate(data: DataType, error: ErrorType, maxCount: number): boolean {
    error.first = null
    error.interval = null
    error.count = null
    let ret = true
    if(data.first == null) {
        error.first = '请指定起始时间点。'
        ret = false
    }
    if(data.interval <= 0) {
        error.interval = '间隔时间不能小于等于0。'
        ret = false
    }
    if(data.count <= 0) {
        error.count = '最少生成1项。'
        ret = false
    }else if(data.count > maxCount) {
        error.count = maxCount > 0 ? `最多再创建${maxCount}项。` : '不能再创建更多项了。'
        ret = false
    }

    return ret
}
</script>