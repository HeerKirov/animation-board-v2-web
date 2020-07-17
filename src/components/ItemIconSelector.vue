<template lang="pug">
div.ui.centered.grid
    div.text-center.px-0.py-1(v-for='item in items', :class='item.name == selected ? "eight wide column" : "two wide column"')
        button.ui.tertiary.button(:class='{[color || item.color]: item.name == selected}', @click='onClick(item.name)', style='padding-right: 2px!important; padding-left: 2px!important')
            i.mx-0(:class='item.icon')
            span(v-if='item.name == selected') {{item.title || item.name}}
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue'

export interface Item {
    name: string
    title: string
    icon: string
    color?: string
}

export default defineComponent({
    props: {
        showNone: {type: Boolean, default: true},
        noneName: {type: (null as any) as PropType<string | null>, default: null},
        color: {type: String, default: "primary"},
        items: (null as any) as PropType<Item[]>,
        selected: {type: (null as any) as PropType<string>, required: true}
    },
    emits: ['update:selected'],
    setup(props, {emit}) {
        const selected = ref(props.selected || props.noneName)

        watch(() => props.selected, v => { selected.value = v || props.noneName })

        const onClick = (itemName: string) => {
            selected.value = itemName
            emit('update:selected', itemName)
        }

        return {selected, onClick}
    }
})
</script>
