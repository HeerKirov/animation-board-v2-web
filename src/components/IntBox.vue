<template lang="pug">
input.ui.input(:placeholder="placeholder", v-model="value", type="number", :min="min", :max="max")
div.ui.pointing.label.red.basic(v-if="error") {{error}}
</template>

<script lang="ts">
import { defineComponent, ref, watch, Ref, PropType } from 'vue'

export default defineComponent({
    props: {
        modelValue: Number,
        placeholder: String,
        notNull: {type: Boolean, default: false},
        min: Number,
        max: Number
    },
    emits: ["update:modelValue"],
    setup(props, {emit}) {
        const value: Ref<number | ""> = ref("")

        const error: Ref<string | null> = ref(null)

        watch(() => props.modelValue, () => {
            if(props.modelValue !== undefined) {
                value.value = props.modelValue
            }
        }, {immediate: true})

        watch(value, () => {
            if(value.value === "") {
                if(props.notNull) {
                    error.value = "输入不能为空。"
                    emit("update:modelValue", undefined)
                }else{
                    error.value = null
                    emit("update:modelValue", null)
                }
            }else{
                error.value = null
                emit("update:modelValue", value.value)
            }
        })

        return {value, error}
    }
})
</script>

<style scoped>

</style>
