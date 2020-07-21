<template lang="pug">
input.ui.input(:placeholder="placeholder", v-model="value")
div.ui.pointing.label.red.basic(v-if="error") {{error}}
</template>

<script lang="ts">
import { defineComponent, ref, watch, Ref, PropType } from 'vue'

export default defineComponent({
    props: {
        modelValue: (null as any) as PropType<string | null | undefined>,
        placeholder: String,
        notBlank: {type: Boolean, default: false},
        maxLength: Number
    },
    emits: ["update:modelValue"],
    setup(props, {emit}) {
        const value = ref("")

        const error: Ref<string | null> = ref(null)

        watch(() => props.modelValue, () => {
            if(props.modelValue !== undefined) {
                value.value = props.modelValue || ""
            }
        }, {immediate: true})

        watch(value, () => {
            if(props.notBlank && !value.value) {
                error.value = "输入不能为空。"
                emit("update:modelValue", undefined)
            }else if(props.maxLength && value.value.length > props.maxLength) {
                error.value = `输入长度不能超过${props.maxLength}。`
                emit("update:modelValue", undefined)
            }else{
                error.value = null
                emit("update:modelValue", value.value || null)
            }
        })

        return {value, error}
    }
})
</script>
