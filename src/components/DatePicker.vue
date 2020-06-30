<template lang="pug">
div
    button.ui.tertiary.mini.button 2020 年
    button.ui.tertiary.mini.button 4 月
    a.icon-button: i.delete.icon
ItemSelector(:items="years", none-title="全部年")
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from 'vue'
import ItemSelector from './ItemSelector.vue'

const years: {name: string, title: string}[] = range(new Date().getFullYear() + 1, 1995).map(i => {return {name: i.toString(), title: `${i}年`}})
const months: {name: string, title: string}[] = range(1, 12).map(i => {return {name: i.toString(), title: `${i}月`}})

export default defineComponent({
    components: {ItemSelector},
    computed: {
        years: () => years,
        months: () => months
    },
    setup() {
        const editMode = ref(true)
        
        return {editMode}
    }
})

function range(start: number, end: number): number[] {
    const array = []
    if(start <= end) {
        for(let i = start; i <= end; ++i) array.push(i)
    }else{
        for(let i = end; i >= start; --i) array.push(i)
    }
    return array
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