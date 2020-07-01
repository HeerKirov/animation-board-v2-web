<template lang="pug">
div.ui.mini.borderless.nine.item.menu
    a.item(:class="{disabled: ui.first.disabled}", @click="onJumpTo(ui.first.index)"): i.angle.double.left.icon
    a.item(:class="{disabled: ui.prev.disabled}", @click="onJumpTo(ui.prev.index)"): i.angle.left.icon
    a.item(v-for="item in ui.items", :class="{active: item.active}", @click="onJumpTo(item.index)") {{item.index}}
    a.item(:class="{disabled: ui.next.disabled}", @click="onJumpTo(ui.next.index)"): i.angle.right.icon
    a.item(:class="{disabled: ui.last.disabled}", @click="onJumpTo(ui.last.index)"): i.angle.double.right.icon
</template>

<script lang="ts">
import { defineComponent, watch, reactive, watchEffect } from 'vue'

const DEFAULT_LIMIT = 20
const ITEM_COUNT = 5

interface ButtonItem {
    index: number
    active: boolean
}
interface AngleItem {
    index: number
    disabled: boolean
}
export interface ChangedEvent {
    page: number
}

export default defineComponent({
    props: {
        current: Number,
        max: Number
    },
    emits: ['changed', 'update:current'],
    setup(props, {emit}) {
        const {pageData, onJumpTo} = usePageData(props, emit)

        const ui = useUI(pageData)

        return {ui, onJumpTo}
    }
})

function usePageData(props: any, emit: (fn: any, ...args: any) => void) {
    const pageData = reactive({max: 0, current: 1})

    watch(props, () => {
        pageData.max = props.max
        pageData.current = props.current
    }, {immediate: true})

    watch(() => pageData.current, v => {
        const e: ChangedEvent = {page: v}
        emit('update:current', v)
        emit('changed', e)
    })

    const onJumpTo = (page: number) => {
        pageData.current = page
    }

    return {pageData, onJumpTo}
}

function useUI(pageData: {max: number, current: number}) {
    const ui: {items: ButtonItem[], first: AngleItem, prev: AngleItem, next: AngleItem, last: AngleItem} = reactive({
        items: [],
        first: {index: 1, disabled: true},
        prev: {index: 1, disabled: true},
        next: {index: 1, disabled: true},
        last: {index: pageData.max, disabled: true}
    })

    watch(() => pageData.max, v => ui.last.index = v)

    watchEffect(() => {
        const current = pageData.current
        const itemCount = Math.min(ITEM_COUNT, pageData.max)
        let first = current - Math.floor(itemCount / 2)
        let last = current + Math.floor(itemCount / 2)
        if(first < 1) {
            first = 1
            last = first + itemCount - 1
        }else if(last > pageData.max) {
            last = pageData.max
            first = last - itemCount + 1
        }
        const items = []
        for(let i = first; i <= last; ++i) {
            items.push({index: i, active: current === i})
        }
        ui.items = items

        ui.first.disabled = current <= 1
        ui.prev.disabled = current <= 1
        ui.prev.index = current - 1
        ui.next.index = current + 1
        ui.next.disabled = current >= pageData.max
        ui.last.disabled = current >= pageData.max
    })

    return ui
}
</script>