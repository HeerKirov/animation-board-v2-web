<template lang="pug">
button.ui.tertiary.mini.button(v-if="showNone", :class="{[color || noneColor]: selected === noneName}", @click="onClick(noneName)") {{noneTitle}}
button.ui.tertiary.mini.button(v-for='item in items', :class="{[color || item.color]: selected === item.name}", @click="onClick(item.name)") {{item.title || item.name}}
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'

export interface Item {
    name: string
    title: string
    color?: string
}
export interface ChangedEvent {
    none: boolean
    name: string
}

export default defineComponent({
    props: {
        showNone: {type: Boolean, default: true},
        noneName: {type: (null as any) as PropType<string|null>, default: null},
        noneTitle: {type: String, default: "全部"},
        noneColor: {type: String, default: "primary"},
        color: {type: String, default: "primary"},
        items: (null as any) as PropType<Item[]>,
        selected: (null as any) as PropType<string|null>
    },
    emits: ['changed', 'update:selected'],
    setup(props, {emit}) {
        const selected = ref(props.selected || props.noneName)

        const onClick = (itemName: string) => {
            selected.value = itemName

            const e: ChangedEvent = {
                none: itemName === props.noneName,
                name: itemName
            }
            emit('changed', e)
            emit('update:selected', itemName)
        }

        return {selected, onClick}
    }
})
</script>