<template lang="pug">
div.ui.left.icon.input(ref="refInput")
    input(:placeholder="placeholder", readonly="readonly", @focus="onOpen", :value="displayValue")
    i.calendar.link.icon(@click="onOpen")
div(v-if="visible", ref="refPanel")
    div.ui.segment.panel.pt-1
        button.ui.tertiary.mini.button.is-inline-block(:class="{primary: currentPanel === 'year'}", @click="currentPanel = 'year'") {{editorValue.year}}年
        button.ui.tertiary.mini.button.is-inline-block(v-if="showTab.month && editorValue.year != null", :class="{primary: currentPanel === 'month'}", @click="currentPanel = 'month'") {{editorValue.month}}月
        button.ui.tertiary.mini.button.is-inline-block(v-if="showTab.day && editorValue.month != null", :class="{primary: currentPanel === 'day'}", @click="currentPanel = 'day'") {{editorValue.day}}日
        button.ui.tertiary.mini.button.is-inline-block(v-if="showTab.time && editorValue.day != null", :class="{primary: currentPanel === 'time'}", @click="currentPanel = 'time'") {{editorValue.hour ?? '...'}}时{{editorValue.minute ?? '...'}}分
        div.ui.divider.mt-0
        div.ui.three.columns.grid.px-1(v-show="currentPanel === 'year'")
            div.ui.row.pt-1.pb-0
                div.ui.column.px-1.text-center
                    a.ui.tertiary.mini.button(@click="yearPanel.era -= 10")
                        i.angle.double.left.icon.mr-0
                div.ui.column.px-1.text-center
                    a.ui.tertiary.mini.button(@click="yearPanel.returnToSelected") {{yearPanel.items[0]}}~{{yearPanel.items[yearPanel.items.length - 1]}}
                div.ui.column.px-1.text-center
                    a.ui.tertiary.mini.button(@click="yearPanel.era += 10")
                        i.angle.double.right.icon.ml-0
            div.ui.row.pt-1.pb-2
                div.ui.column.px-1.text-center(v-for=" i in yearPanel.items")
                    a.ui.tertiary.mini.button(:class="{primary: editorValue.year === i}", @click="yearPanel.select(i)") {{i}}年
        div.ui.three.columns.grid.px-1(v-show="currentPanel === 'month'")
            div.ui.column.px-1.py-1.text-center(v-for="i in Array(12).fill(null).map((_, i) => i + 1)")
                a.ui.tertiary.mini.button(:class="{primary: editorValue.month === i}", @click="monthPanel.select(i)") {{i}}月
        div.ui.seven.columns.grid.px-1(v-show="currentPanel === 'day'")
            div.ui.row.py-2
                each header in ['M', 'T', 'W', 'T', 'F', 'S', 'S']
                    div.ui.column.px-1.text-center.is-weight= header
            div.ui.row.pt-1.pb-2
                div.ui.column.px-1.text-center(v-for="i in dayPanel.items")
                    a.ui.tertiary.mini.button(v-if="i", :class="{primary: editorValue.day === i}", @click="dayPanel.select(i)") {{i}}
        div.ui.two.columns.grid.px-1(v-show="currentPanel === 'time'")
            div.ui.column.text-center
                DigitalRoulette(v-model="editorValue.hour", :min="0", :max="23", :loop="true")
            div.ui.column.text-center
                DigitalRoulette(v-model="editorValue.minute", :min="0", :max="59", :step="5", :loop="true")
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, Ref, reactive, computed, watch, PropType } from 'vue'
import DigitalRoulette from './DigitalRoulette.vue'
import { Calendar, calendarToDate, dateToCalendar, getDayCountOfMonth, calendarToString } from '@/functions/format'

type PanelType = "year" | "month" | "day" | "time"

interface EditorValue {
    year: number | null
    month: number | null
    day: number | null
    hour: number | null
    minute: number | null
}

export default defineComponent({
    components: {DigitalRoulette},
    props: {
        placeholder: {type: String, default: ""},
        first: {type: (null as any) as PropType<PanelType>, default: "day"},
        until: {type: (null as any) as PropType<PanelType>, default: "time"},
        modelValue: (null as any) as PropType<Calendar>
    },
    emits: ['update:modelValue'],
    setup(props, {emit}) {
        const modelValue = computed(() => props.modelValue)

        const tryEmit = () => {
            const until = props.until
            const editorValue = panel.editorValue
            if(until === 'year') {
                if(editorValue.year != null) {
                    emit('update:modelValue', {year: editorValue.year, month: 1})
                }
            }else if(until === 'month') {
                if(editorValue.year != null && editorValue.month != null) {
                    emit('update:modelValue', {year: editorValue.year, month: editorValue.month})
                }
            }else if(until === 'day') {
                if(editorValue.year != null && editorValue.month != null && editorValue.day != null) {
                    emit('update:modelValue', {year: editorValue.year, month: editorValue.month, day: editorValue.day})
                }
            }else if(until === 'time') {
                if(editorValue.year != null && editorValue.month != null && editorValue.day != null && editorValue.hour != null && editorValue.minute != null) {
                    emit('update:modelValue', {year: editorValue.year, month: editorValue.month, day: editorValue.day, hour: editorValue.hour, minute: editorValue.minute})
                }
            }
        }

        const visibleControl = useVisibleControl(tryEmit)

        const panel = usePanel(props as any)

        const showTab = reactive({
            month: props.until === 'month' || props.until === 'day' || props.until === 'time',
            day: props.until === 'day' || props.until === 'time',
            time: props.until === 'time'
        })

        const displayValue = computed(() => props.modelValue != undefined ? calendarToString(props.modelValue) : '')

        return {displayValue, ...visibleControl, ...panel, showTab}
    }
})

function useVisibleControl(emit: () => void) {
    const refInput: Ref = ref(null)
    const refPanel: Ref = ref(null)

    const visible = ref(false)

    const onOpen = () => { visible.value = true }

    const documentClickEvent = (e: MouseEvent) => {
        const target = e.target
        if(visible.value && !(refInput.value == target || refInput.value.contains(target) || (refPanel.value != null && (refPanel.value == target || refPanel.value.contains(target))))) {
            visible.value = false
            emit()
        }
    }

    onMounted(() => { document.addEventListener("click", documentClickEvent) })
    onUnmounted(() => { document.removeEventListener("click", documentClickEvent) })

    return {visible, onOpen, refInput, refPanel}
}

function usePanel(props: {first: PanelType, until: PanelType, modelValue: Calendar | undefined}) {
    const currentPanel: Ref<PanelType> = ref(props.first)
    const editorValue: EditorValue = reactive(modelValueToEditor(props.modelValue, props.first))
    watch(() => props.modelValue, () => { 
        const newValue = modelValueToEditor(props.modelValue, props.first)
        if(newValue.minute != editorValue.minute) editorValue.minute = newValue.minute
        if(newValue.hour != editorValue.hour) editorValue.hour = newValue.hour
        if(newValue.day != editorValue.day) editorValue.day = newValue.day
        if(newValue.month != editorValue.month) editorValue.month = newValue.month
        if(newValue.year != editorValue.year) editorValue.year = newValue.year
        currentPanel.value = props.first
    })

    const yearPanel = useYearPanel(editorValue, currentPanel, props.until)
    const monthPanel = useMonthPanel(editorValue, currentPanel, props.until)
    const dayPanel = useDayPanel(editorValue, currentPanel, props.until)
    const timePanel = useTimePanel(editorValue, currentPanel, props.until)

    return {currentPanel, editorValue, yearPanel, monthPanel, dayPanel, timePanel}
}

function useYearPanel(editorValue: EditorValue, currentPanel: Ref<PanelType>, until: PanelType) {
    const era = ref(Math.floor(((editorValue.year ?? new Date().getFullYear()) - 1) / 10) * 10 + 1)

    const items = computed(() => Array(12).fill(null).map((_, i) => i + era.value))

    const returnToSelected = () => { era.value = Math.floor(((editorValue.year ?? new Date().getFullYear()) - 1) / 10) * 10 + 1 }

    const select = (i: number) => { 
        editorValue.year = i
        if(until !== 'year') { currentPanel.value = 'month' }
    }

    return {era, items, returnToSelected, select}
}

function useMonthPanel(editorValue: EditorValue, currentPanel: Ref<PanelType>, until: PanelType) {
    const select = (i: number) => { 
        editorValue.month = i
        if(until !== 'month') { currentPanel.value = 'day' }
    }

    return {select}
}

function useDayPanel(editorValue: EditorValue, currentPanel: Ref<PanelType>, until: PanelType) {
    const spaceNum = [6, 0, 1, 2, 3, 4, 5]

    const items = computed(() => {
        if(editorValue.year != null && editorValue.month != null) {
            const date = new Date(editorValue.year, editorValue.month - 1, 1)
            const spaceArray = Array(spaceNum[date.getDay()]).fill(null)
            const valueArray = Array(getDayCountOfMonth(editorValue.year, editorValue.month)).fill(null).map((_, i) => i + 1)
            return spaceArray.concat(valueArray)
        }
        return []
    })

    const select = (i: number) => { 
        editorValue.day = i
        if(until !== 'day') { currentPanel.value = 'time' }
    }

    return {items, select}
}

function useTimePanel(editorValue: EditorValue, currentPanel: Ref<PanelType>, until: PanelType) {
    return {}
}

function modelValueToEditor(modelValue: Calendar | undefined, to: PanelType): EditorValue {
    if(modelValue) {
        return {
            year: modelValue.year,
            month: modelValue.month,
            day: modelValue.day || null,
            hour: modelValue.hour || 0,
            minute: modelValue.minute || 0
        }
    }else{
        const now = dateToCalendar(new Date())
        return {
            year: now.year,
            month: to === 'day' || to === 'time' ? now.month : null,
            day: to === 'time' ? now.day! : null,
            hour: 0,
            minute: 0
        }
    }
    
}
</script>

<style scoped>
    .panel {
        transform: translateY(5px);
        position: absolute; 
        z-index: 1;
        min-width: 230px;
        max-width: 300px;
    }
</style>