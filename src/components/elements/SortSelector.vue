<template lang="pug">
div.ui.grid
    div.text-center.px-0.py-1(v-for='item in items', :class='item.name == selected ? "eight wide column" : "two wide column"')
        button.ui.tertiary.button(:class='{primary: item.name == selected}', @click='onClick(item)', style='padding-right: 2px!important; padding-left: 2px!important')
            i.mx-0(v-if='item.icon && (item.forceIcon || item.name != selected)', :class='item.icon')
            span(v-if='item.name == selected') {{item.title}}
            i.ml-1(v-if='item.name == selected', :class="direction === 1 ? 'toggle up icon' : 'toggle down icon'")
</template>

<script lang="ts">
import { defineComponent, PropType, toRef, ref, watch } from 'vue'

export interface SortSelectorItem {
    name: string
    title: string
    icon: string
    forceIcon?: boolean
    argument: string|string[]
}

export interface ChangedEvent {
    name: string
    argument: string
}

type Direction = -1|1

export default defineComponent({
    props: {
        items: (null as any) as PropType<SortSelectorItem[]>,
        modelValue: String,
        direction: (null as any) as PropType<Direction>
    },
    setup(props, {emit}) {
        const selected = ref(props.modelValue)
        const direction = ref(props.direction || -1)

        watch(props, () => {
            selected.value = props.modelValue
            direction.value = props.direction || -1
        })

        const onClick = (item: SortSelectorItem) => {
            const name = item.name
            if(name === selected.value) {
                direction.value = direction.value == 1 ? -1 : 1
                emit('update:direction', direction.value)

                const e: ChangedEvent = {
                    name,
                    argument: generateArgument(item.argument, direction.value)
                }
                emit('changed', e)
            }else{
                selected.value = name
                emit('update:modelValue', name) 

                const e: ChangedEvent = {
                    name,
                    argument: generateArgument(item.argument, direction.value)
                }
                emit('changed', e)
            }
        }

        return {
            selected, 
            direction,
            onClick
        }
    }
})

function generateArgument(argument: string|string[], direction: Direction): string {
    if(typeof argument == "string") {
        return (direction == -1 ? "-" : "") + argument
    }else{
        return argument.map(a => (direction == -1 ? "-" : "") + a).join(",")
    }
}
</script>