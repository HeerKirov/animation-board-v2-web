<template lang="pug">
div.ui.icon.input.fluid.transparent
    input(type="text", placeholder="搜索...", v-model="value", @keydown.enter="onSearch")
    i.search.icon
</template>

<script lang="ts">
import { defineComponent, ref, watch, watchEffect } from 'vue'

export interface SearchEvent {
    text: string | undefined
}

export default defineComponent({
    props: {
        value: String
    },
    emits: ["search", "update:value"],
    setup(props, {emit}) {
        const value = ref("")

        watchEffect(() => value.value = props.value || "")

        watch(value, () => emit("update:value", value.value || undefined))

        const onSearch = () => {
            const e: SearchEvent = {text: value.value || undefined}
            emit("search", e)
        }

        return {value, onSearch}
    }
})
</script>