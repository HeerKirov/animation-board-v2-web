<template lang="pug">
div
    button.ui.tertiary.mini.button(@click="onClickYear", :class="{primary: year}") {{year || '...'}} 年
    button.ui.tertiary.mini.button(@click="onClickMonth", :class="{primary: year && month}") {{year != null && month || '...'}} 月
    a.icon-button(@click="onClickDelete"): i.delete.icon
div(v-if="edit === 'year'")
    ItemSelector(:items="years", :show-none="false", v-model:selected="year")
div(v-else-if="edit === 'month'")
    ItemSelector(:items="months", none-title="任意月份", :column="3", v-model:selected="month")
</template>

<script lang="ts">
import { defineComponent, ref, Ref, watchEffect, watch } from 'vue'
import ItemSelector from './ItemSelector.vue'

export interface ChangedEvent {
    year: number | null
    month: number | null
    value: string | null
}

const years: {name: string, title: string}[] = range(new Date().getFullYear(), 1995).map(i => {return {name: i.toString(), title: `${i}年`}})
const months: {name: string, title: string}[] = range(1, 12).map(i => {return {name: i.toString(), title: `${i}月`}})

export default defineComponent({
    components: {ItemSelector},
    props: {
        value: String
    },
    emits: ['update:value', 'changed'],
    computed: {
        years: () => years,
        months: () => months
    },
    setup(props, {emit}) {
        const edit: Ref<'year' | 'month' | null> = ref(null)

        const year: Ref<string | null> = ref(null)
        const month: Ref<string | null> = ref(null)

        watchEffect(() => {
            if(props.value) {
                const [y, m] = splitDate(props.value)
                year.value = y?.toString() ?? null
                month.value = m?.toString() ?? null
            }else{
                year.value = null
                month.value = null
            }
        })

        watch(() => [year.value, month.value], () => {
            const newValue = concatDate(year.value, month.value)
            emit('update:value', newValue)
            emit('changed', {
                year: year.value ? parseInt(year.value) : null,
                month: month.value ? parseInt(month.value) : null,
                value: newValue
            })
        })

        const onClickYear = () => { edit.value = edit.value === 'year' ? null : 'year' }
        const onClickMonth = () => { 
            if(year.value != null) {
                edit.value = edit.value === 'month' ? null : 'month' 
            }
        }
        const onClickDelete = () => { 
            edit.value = null
            year.value = null
            month.value = null
        }
        
        return {edit, year, month, onClickYear, onClickMonth, onClickDelete}
    }
})

function range(start: number, end: number): number[] {
    const array = []
    if(start <= end) {
        for(let i = start; i <= end; ++i) array.push(i)
    }else{
        for(let i = start; i >= end; --i) array.push(i)
    }
    return array
}

function splitDate(date: string): [number | null, number | null] {
    if(date.indexOf('-') >= 0) {
        try {
            const [year, month] = date.split('-', 2)
            return [parseInt(year), parseInt(month)]
        }catch(e) {
            return [null, null]
        }
    }else{
        try {
            return [parseInt(date), null]
        }catch(e) {
            return [null, null]
        }
    }
}

function concatDate(year: string | null, month: string | null): string | null {
    if(year == null) {
        return null
    }else if(month == null) {
        return year
    }else {
        return `${year}-${month}`
    }
}
</script>

<style scoped>
    .select-year {
        width: 40%
        
    }
    .select-month {
        width: 40%
    }
    .select-check {
        width: 20px
    }
    .icon-button {
        cursor: pointer;
        color: gray;
    }
</style>