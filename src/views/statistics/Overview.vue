<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'overview'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
    div.ui.centered.grid
        div.ui.fourteen.wide.column
            div.ui.statistic.px-2
                div.value 450
                div.label 动画总数
            div.ui.small.statistic.px-2
                div.value 3500
                div.label 累计观看集数
            div.ui.small.statistic.px-2
                div.value 10550
                div.label 累计观看时长
            div.ui.statistic.right.floated.px-2
                div.value 6.7
                div.label 平均分
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Chart } from 'chart.js'
import { secondaryBarItems } from '@/definitions/secondary-bar'

export default defineComponent({
    computed: {
        barItems() { return secondaryBarItems.statistics }
    },
    setup() {

    }
})
</script>

<style scoped>

</style>