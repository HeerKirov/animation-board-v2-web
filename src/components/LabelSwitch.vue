<template lang="pug">
a.ui.label.px-3.select-forbidden(:class="value ? (onColor ?? offColor) : (offColor ?? onColor)", @click="onClick")
    i(:class="value ? (onIcon ?? offIcon) : (offIcon ?? onIcon)")
    = '{{value ? (onTitle ?? offTitle) : (offTitle ?? onTitle)}}'
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
    props: {
        onTitle: String,
        onIcon: String,
        onColor: String,
        offTitle: String,
        offIcon: String,
        offColor: String,
        modelValue: Boolean
    },
    emits: ['update:modelValue'],
    setup(props, {emit}) {
        const value = ref(props.modelValue)

        watch(() => props.modelValue, () => { value.value = props.modelValue })

        const onClick = () => {
            value.value = !value.value
            emit('update:modelValue', value.value)
        }

        return {value, onClick}
    }
})
</script>

<style scoped>

</style>