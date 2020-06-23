<template lang="pug">
button.ui.tertiary.mini.button(:class="{primary: selected === noneName}", @click="onClick(noneName)") {{noneTitle}}
button.ui.tertiary.mini.button(v-for='item in items', :class="{primary: selected === item.name}", @click="onClick(item.name)") {{item.title}}
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

export interface Item {
    name: string
    title: string
}
export interface ChangedEvent {
    none: boolean
    name: string
}

export default defineComponent({
    props: {
        noneName: {type: String, default: "_"},
        noneTitle: {type: String, default: "全部"},
        items: (null as any) as PropType<Item[]>,
        selected: String
    },
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