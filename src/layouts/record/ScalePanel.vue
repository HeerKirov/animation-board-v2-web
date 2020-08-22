<template lang="pug">
div.main-panel(:style="{height: `${data.length * 10}px`}")
    div.progress(v-for="item in items", :key="`${item.id}-${item.ordinal}`", :style="item.style")
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { colorCSS } from '@/definitions/fomantic-ui-colors'

export interface Instance {
    id: number
    title: string
    cover: string
    ordinal: number
    finished: boolean
    startTime: Date
    endTime: Date
    left: number
    right: number
    row: number
}

const colors = [colorCSS.red, colorCSS.orange, colorCSS.yellow, colorCSS.green, colorCSS.teal, colorCSS.blue, colorCSS.purple]

export default defineComponent({
    props: {
        data: {type: (null as any) as PropType<Instance[]>, required: true}
    },
    setup(props) {
        return {
            items: computed(() => props.data.map(mapItem))
        }
    }
})

function mapItem(instance: Instance) {
    //强制每行都拥有一个最小宽度，以免太窄看不清
    const f = 0.5
    const [left, right] = (100 - f < instance.left + instance.right) ? (instance.right <= 0 ? [100 - f, 0] : [instance.left, 100 - f - instance.left]) : [instance.left, instance.right]
    const leftRadius = left > 0 ? '4px' : '0', rightRadius = right > 0 ? '4px' : '0'
    return {
        id: instance.id,
        title: instance.title,
        cover: instance.cover,
        ordinal: instance.ordinal,
        style: {
            left: `${left}%`,
            right: `${right}%`,
            top: `${instance.row * 10}px`,
            'border-radius': `${leftRadius} ${rightRadius} ${rightRadius} ${leftRadius}`,
            'background-color': colors[instance.id % colors.length]
        }
    }
}
</script>

<style scoped>
    .main-panel {
        margin-top: 20px;
        position: relative;
        width: 100%;
        min-height: 50px;
        border-color: black;
        border-style: solid;
        border-width: 0 1px;
    }
    .main-panel .progress {
        position: absolute;
        height: 8px;
    }
</style>