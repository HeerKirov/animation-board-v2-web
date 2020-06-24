<template lang="pug">
footer.div-footer(v-if="visible")
    div.div-title Animation Board @ Heer Kirov
    a.div-case(:href='caseURL', target='_blank') {{caseNumber}}
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import config from "@/config"

export default defineComponent(function () {
    const visible = ref(true)

    const route = useRoute()

    watchEffect(() => visible.value = !route.meta.hideFooter)

    return {
        visible,
        caseNumber: config.CASE.NUMBER,
        caseURL: config.CASE.URL
    }
})
</script>

<style scoped>
    .div-footer {
        margin-top: 72px;
        margin-bottom: 36px;
        text-align: center;
    }
    .div-title {
        font-size: 15px;
    }
    .div-case {
        font-size: 10px;
        color: #2c3e50;
    }
</style>
