<template lang="pug">
template(v-if="visible")
    div.ui.dimmer.active
    div.ui.modal.active.center-box
        div.header {{header}}
        div.content {{content}}
        div.actions
            button.ui.button(v-for="action in actions", :class="action.color", @click="onClick(action.value)") {{action.name}}
div#modal-target
</template>

<script lang="ts">
import { defineComponent, watch, reactive, toRefs } from 'vue'
import { useMessageBox, MessageBoxAction } from '@/functions/message-box'

const actionNames = {
    TRUE: '是',
    FALSE: '否',
    OK: '确定',
    CANCEL: '取消'
}

interface Action {
    name: string
    value: MessageBoxAction
    color: string | undefined
}

interface Data {
    visible: boolean
    header: string | undefined
    content: string
    actions: Action[]
}

export default defineComponent({
    setup() {
        const { messageBoxData, messageBoxResult } = useMessageBox()

        watch(messageBoxData, () => {
            if(messageBoxData.value != null) {
                data.header = messageBoxData.value.header
                data.content = messageBoxData.value.content
                data.actions = messageBoxData.value.actions?.map(a => mapAction(a, messageBoxData.value?.type || 'INFO')) ?? [mapAction('OK', 'INFO')]
                data.visible = true
            }else{
                data.visible = false
            }
        })

        const data: Data = reactive({
            visible: false,
            header: undefined,
            content: '',
            actions: []
        })

        const onClick = (action: MessageBoxAction) => {
            messageBoxResult.value = action
            messageBoxData.value = null
        }

        return {...toRefs(data), onClick}
    }
})

function mapAction(action: MessageBoxAction, type: "INFO" | "WARNING" | "REQUEST"): Action {
    return {
        name: actionNames[action],
        value: action,
        color: action === 'TRUE' || action === 'OK' ? (
            type === 'WARNING' ? 'negative' : type === 'REQUEST' ? 'positive' : undefined
        ) : undefined
    }
}
</script>

<style scoped>
    .center-box {
        max-width: 350px;
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%)
    }
</style>
