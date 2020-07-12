<template lang="pug">
div.ui.left.icon.input(ref="refInput")
    input(:placeholder="placeholder", readonly="readonly", @focus="onOpen")
    i.calendar.link.icon(@click="onOpen")
div(v-if="visible", ref="refPanel")
    div.ui.segment.panel.pt-1
        button.ui.tertiary.mini.button(:class="{primary: currentPanel === 'year'}", @click="currentPanel = 'year'") {{editorValue.year}}年
        button.ui.tertiary.mini.button(v-if="editorValue.year != null", :class="{primary: currentPanel === 'month'}", @click="currentPanel = 'month'") {{editorValue.month}}月
        button.ui.tertiary.mini.button(v-if="editorValue.month != null", :class="{primary: currentPanel === 'day'}", @click="currentPanel = 'day'") {{editorValue.day}}日
        button.ui.tertiary.mini.button(v-if="editorValue.day != null", :class="{primary: currentPanel === 'time'}", @click="currentPanel = 'time'") {{editorValue.hour}}时{{editorValue.minute}}分
        div.ui.divider.mt-0
        div.ui.three.columns.grid.px-1(v-if="currentPanel === 'year'")
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
                    a.ui.tertiary.mini.button(:class="{primary: editorValue.year === i}") {{i}}年
        div.ui.three.columns.grid.px-1(v-else-if="currentPanel === 'month'")
            div.ui.column.px-1.py-1.text-center(v-for="i in Array(12).fill(null).map((_, i) => i + 1)")
                a.ui.tertiary.mini.button(:class="{primary: editorValue.month === i}") {{i}}月
        div.ui.seven.columns.grid.px-1(v-else-if="currentPanel === 'day'")
            div.ui.row.py-2
                each header in ['M', 'T', 'W', 'T', 'F', 'S', 'S']
                    div.ui.column.px-1.text-center.is-weight= header
            div.ui.row.pt-1.pb-2
                div.ui.column.px-1.text-center(v-for="i in dayPanel.items")
                    a.ui.tertiary.mini.button(v-if="i", :class="{primary: editorValue.day === i}") {{i}}
        div.ui.two.columns.grid.px-1(v-else-if="currentPanel === 'time'")
            div.ui.column.text-center
                DigitalRoulette(v-model="editorValue.hour", :min="0", :max="23", :loop="true")
            div.ui.column.text-center
                DigitalRoulette(v-model="editorValue.minute", :min="0", :max="59", :step="5", :loop="true")
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, Ref, reactive, computed, watch, PropType } from 'vue'
import DigitalRoulette from './DigitalRoulette.vue'
import { getDayCountOfMonth } from '@/functions/format'

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
        until: {type: (null as any) as PropType<PanelType>, default: "time"},
        modelValue: String
    },
    emits: ['update:modelValue'],
    setup(props, {emit}) {
        const modelValue = computed(() => props.modelValue)

        const visibleControl = useVisibleControl()

        const panel = usePanel(modelValue)

        return {...visibleControl, ...panel}
    }
})

function useVisibleControl() {
    const refInput: Ref = ref(null)
    const refPanel: Ref = ref(null)

    const visible = ref(false)

    const onOpen = () => { visible.value = true }

    const documentClickEvent = (e: MouseEvent) => {
        const target = e.target
        if(visible.value && !(refInput.value == target || refInput.value.contains(target) || (refPanel.value != null && (refPanel.value == target || refPanel.value.contains(target))))) {
            visible.value = false
        }
    }

    onMounted(() => { document.addEventListener("click", documentClickEvent) })
    onUnmounted(() => { document.removeEventListener("click", documentClickEvent) })

    return {visible, onOpen, refInput, refPanel}
}

function usePanel(modelValue: Ref<String | undefined>) {
    const currentPanel: Ref<PanelType> = ref("day")
    const editorValue: EditorValue = reactive({year: 2020, month: 7, day: 12, hour: 0, minute: 0})

    watch(editorValue, v => console.log(v))

    const yearPanel = useYearPanel(editorValue)
    const monthPanel = useMonthPanel(editorValue)
    const dayPanel = useDayPanel(editorValue)
    const timePanel = useTimePanel(editorValue)

    return {currentPanel, editorValue, yearPanel, monthPanel, dayPanel, timePanel}
}

function useYearPanel(editorValue: EditorValue) {
    const era = ref(Math.floor(((editorValue.year ?? new Date().getFullYear()) - 1) / 10) * 10 + 1)

    const items = computed(() => Array(12).fill(null).map((_, i) => i + era.value))

    const returnToSelected = () => { era.value = Math.floor(((editorValue.year ?? new Date().getFullYear()) - 1) / 10) * 10 + 1 }

    return {era, items, returnToSelected}
}

function useMonthPanel(editorValue: EditorValue) {
    return {}
}

function useDayPanel(editorValue: EditorValue) {
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

    return {items}
}

function useTimePanel(editorValue: EditorValue) {
    return {}
}
</script>

<style scoped>
    .panel {
        transform: translateY(5px);
        position: absolute; 
        z-index: 1
    }
</style>