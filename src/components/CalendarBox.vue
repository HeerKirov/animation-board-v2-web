<template lang="pug">
div.ui.left.icon.input(ref="refInput")
    input(:placeholder="placeholder", readonly="readonly", @focus="onOpen")
    i.calendar.link.icon(@click="onOpen")
div(v-if="visible", ref="refPanel")
    div.ui.segment.panel.pt-1
        button.ui.tertiary.mini.button 2020年
        button.ui.tertiary.mini.button 12月
        button.ui.tertiary.mini.button 16时30分
        div.ui.divider.mt-0
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, Ref } from 'vue'

export default defineComponent({
    props: {
        placeholder: {type: String, default: ""}
    },
    setup(props, {emit}) {
        const { visible, onOpen, refInput, refPanel } = useVisibleControl()

        return {visible, onOpen, refInput, refPanel}
    }
})

function useVisibleControl() {
    const refInput: Ref = ref(null)
    const refPanel: Ref = ref(null)

    const visible = ref(false)

    const onOpen = () => { visible.value = true }

    const documentClickEvent = (e: MouseEvent) => {
        const target = e.target
        if(visible.value && !(refInput.value == target || refInput.value.contains(target) || (refPanel.value != null && (refPanel.value == target || refPanel.value.contains(target))))) {
            visible.value = false
        }
    }

    onMounted(() => { document.addEventListener("click", documentClickEvent) })
    onUnmounted(() => { document.removeEventListener("click", documentClickEvent) })

    return {visible, onOpen, refInput, refPanel}
}
</script>

<style scoped>
    .panel {
        transform: translateY(5px);
        position: absolute; 
        z-index: 1
    }
</style>