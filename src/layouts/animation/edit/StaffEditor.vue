<template lang="pug">
div.ui.segment
    div.ui.label(v-for="item in items") {{item.name}}
        i.close.icon
</template>

<script lang="ts">
import { defineComponent, PropType, reactive } from 'vue'

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
        const items: StaffItem[] = reactive(props.value || [])

        return {items}
    }
})
</script>