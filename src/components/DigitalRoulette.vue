<template lang="pug">
div.text-center
    button.ui.tertiary.mini.button.is-inline-block(v-if="upButton", @click="plus") +{{step}}
    button.ui.tertiary.mini.button.is-inline-block(v-else, @click="minus") -{{step}}
    div.is-weight.font-size-18 {{value}}
    button.ui.tertiary.mini.button.is-inline-block(v-if="upButton", @click="minus") -{{step}}
    button.ui.tertiary.mini.button.is-inline-block(v-else, @click="plus") +{{step}}
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
    props: {
        modelValue: Number,
        min: Number,
        max: Number,
        step: {type: Number, default: 1},
        loop: {type: Boolean, default: false},
        upButton: {type: Boolean, default: false}
    },
    emits: ['update:modelValue'],
    setup(props, {emit}) {
        const value = ref(props.modelValue ?? 0)

        watch(() => props.modelValue, () => { value.value = props.modelValue ?? 0 })
        watch(value, () => emit('update:modelValue', value.value))

        const plus = () => {
            const newValue = value.value + props.step
            if(props.max != null && newValue > props.max) {
                if(props.loop && props.min != null) {
                    value.value = newValue - props.max + props.min - 1
                }else{
                    value.value = props.max
                }
            }else{
                value.value = newValue
            }
        }
        const minus = () => {
            const newValue = value.value - props.step
            if(props.min != null && newValue < props.min) {
                if(props.loop && props.max != null) {
                    value.value = newValue - props.min + 1 + props.max
                }else{
                    value.value = props.min
                }
            }else{
                value.value = newValue
            }
        }

        return {value, plus, minus}
    }
})
</script>

<style scoped>

</style>