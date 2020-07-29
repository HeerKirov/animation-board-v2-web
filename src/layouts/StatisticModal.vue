<template lang="pug">
teleport(to='#modal-target')
    template(v-if="visible")
        div.ui.dimmer.active(@click="onClose")
        div.ui.modal.active.center-box
            div.header {{title}}
            div.content
                slot
            div.actions
                a.ui.basic.button(@click="onRefresh") 
                    i.refresh.icon
                    = '手动刷新数据'
</template>

<script lang="ts">
import { defineComponent, watch, ref } from 'vue'

export default defineComponent({
    props: {
        visible: Boolean,
        title: String
    },
    emits: ['update:visible', 'refresh'],
    setup(props, {emit}) {
        const visible = ref(props.visible || false)
        watch(() => props.visible, () => { visible.value = props.visible || false })
        
        const onClose = () => { 
            visible.value = false 
            emit('update:visible', false)
        }
        const onRefresh = () => {
            emit('refresh')
            onClose()
        }
    }
})
</script>