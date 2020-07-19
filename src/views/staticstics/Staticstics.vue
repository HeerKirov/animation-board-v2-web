<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'statistics'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
    div.ui.placeholder.segment
        div.ui.icon.header
            i.industry.icon
            h2 施工中...
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { topBarItems } from '@/definitions/secondary-bar'

export default defineComponent({
    computed: {
        barItems() { return [topBarItems.statistics] },
    },
    setup() {

    }
})
</script>

<style scoped>

</style>