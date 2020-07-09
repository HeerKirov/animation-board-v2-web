<template lang="pug">
div.notification-content
    div.ui.message(v-for="(item, index) in notifications", :class="notifyType[item.type]")
        i.close.icon(@click="removeItem(index)")
        div.header {{item.header}}
        p(v-for="p in item.content") {{p}}
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {useNotification} from "@/functions/notification";

export default defineComponent({
    computed: {
        notifyType() {
            return {
                'success': 'positive',
                'error': 'negative',
                'warning': 'warning',
                "info": "info",
                'plain': null
            }
        }
    },
    setup() {
        const { notifications } = useNotification()

        const removeItem = (index: number) => { notifications.splice(index, 1) }

        return {notifications, removeItem}
    }
})
</script>

<style scoped>
    .notification-content {
        position: fixed;
        right: 6px;
        top: 50px;
        min-width: 200px;
        max-width: 500px;
    }
</style>
