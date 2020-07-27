<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'statistics'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
    div.ui.grid
        div.ui.centered.eleven.wide.column
            div.ui.three.columns.grid
                div.ui.column.px-4(v-for="item in statisticItems")
                    div.ui.segment.text-center(:class="colors[item.name]")
                        router-link.ui.icon.header(:to="item.link")
                            i(:class="item.icon")
                            div.content.mt-2 {{item.title}}
                                div.sub.header {{descriptions[item.name]}}
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { topBarItems, secondaryBarItems } from '@/definitions/secondary-bar'

const descriptions = {
    overview: '多维度基础数据概览',
    season: '各个季度的追番报表',
    timeline: '在时间线上查看聚合统计',
    historyline: '不同时代动画的聚合统计',
    period: '周期时间内的看番习惯'
}

const colors = {
    overview: 'blue',
    season: 'pink',
    timeline: 'green',
    historyline: 'olive',
    period: 'yellow'
}

export default defineComponent({
    computed: {
        barItems() { return [topBarItems.statistics] },
        statisticItems() { return secondaryBarItems.statistics },
        descriptions() { return descriptions },
        colors() { return colors }
    },
    setup() {

    }
})
</script>