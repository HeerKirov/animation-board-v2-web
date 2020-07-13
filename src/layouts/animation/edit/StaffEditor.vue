<template lang="pug">
div.ui.segment(@dragover.prevent='onDragOver', @drop.prevent='onDrop')
    div.ui.label.small.mb-1(v-for="(item, index) in items") {{item.name}}
        i.close.icon(@click="onDelete(index)")
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, watch, ref, Ref } from 'vue'

export interface StaffItem {
    id: number
    name: string
}

export default defineComponent({
    props: {
        value: (null as any) as PropType<StaffItem[]>
    },
    emits: ['update:value'],
    setup(props, {emit}) {
        const items: Ref<StaffItem[]> = ref(props.value || [])
        watch(() => props.value, () => { items.value = props.value || [] })

        const onDelete = (index: number) => {
            items.value.splice(index, 1)
            emit('update:value', items.value)
        }

        const { onDrop, onDragOver } = useDrag(items)

        return {items, onDelete, onDrop, onDragOver}
    }
})

function useDrag(items: Ref<StaffItem[]>) {
    const onDrop = (event: DragEvent) => {
        const s = event.dataTransfer?.getData('item')
        if(s != null) {
            const item = JSON.parse(s) as StaffItem
            for(let i of items.value) {
                if(i.id === item.id) {
                    return
                }
            }
            items.value.splice(items.value.length, 0, item)
        }
    }

    const onDragOver = () => { }

    return {onDrop, onDragOver}
}
</script>