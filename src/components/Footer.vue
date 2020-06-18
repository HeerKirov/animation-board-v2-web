<template lang="pug">
footer.div-footer
    div.div-title Animation Board @ Heer Kirov
    a.div-case(:href='caseURL', target='_blank') {{caseNumber}}
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import config from "@/config"

export default defineComponent(function () {
    return {
        caseNumber: config.CASE_NUMBER,
        caseURL: config.CASE_URL
    }
})
</script>

<style scoped>
    .div-footer {
        margin-top: 72px;
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
