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
    offset: number
    limit: number
}

export default defineComponent({
    props: {
        total: Number,
        limit: Number,
        offset: Number
    },
    setup(props, {emit}) {
        const originData = useOriginData(props, emit)

        const {pageData, onJumpTo} = usePageData(originData)

        const ui = useUI(pageData)

        return {ui, onJumpTo}
    }
})

function useOriginData(props: any, emit: (fn: string, ...args: any) => void) {
    const originData = reactive({
        total: validTotal(props.total),
        limit: validLimit(props.limit),
        offset: validOffset(props.offset, validLimit(props.limit))
    })

    watch(props, () => {
        originData.total = validTotal(props.total)
        originData.limit = validLimit(props.limit)
        originData.offset = validOffset(props.offset, originData.limit)
    })

    watch(() => originData.offset, value => {
        const e: ChangedEvent = {
            offset: value,
            limit: originData.limit
        }
        emit('update:offset', value)
        emit('changed', e)
    })

    return originData
}

function usePageData(originData: {total: number, limit: number, offset: number}) {
    const pageData = reactive({
        max: Math.ceil(originData.total / originData.limit),
        current: Math.floor(originData.offset / originData.limit) + 1
    })

    watch(originData, () => {
        pageData.max = Math.ceil(originData.total / originData.limit)
        pageData.current = Math.floor(originData.offset / originData.limit) + 1
    })

    watch(() => pageData.current, () => originData.offset = (pageData.current - 1) * originData.limit)

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
        let first = current - Math.floor(ITEM_COUNT / 2)
        let last = current + Math.floor(ITEM_COUNT / 2)
        if(first < 1) {
            first = 1
            last = first + ITEM_COUNT - 1
        }else if(last > pageData.max) {
            last = pageData.max
            first = last - ITEM_COUNT + 1
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

function validTotal(total: number|undefined): number {
    return total != undefined && total >= 0 ? total : 0
}

function validLimit(limit: number|undefined): number {
    return limit != undefined && limit > 0 ? limit : DEFAULT_LIMIT
}

function validOffset(offset: number|undefined, limit: number): number {
    if(offset == undefined || offset < 0) {
        return 0
    }else if(offset % limit != 0) {
        return offset - offset % limit
    }else{
        return offset
    }
}
</script>