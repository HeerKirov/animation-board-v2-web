<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'new'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
        a.right.item 
            i.check.icon
            = '提交'
    div.ui.centered.grid
        div.ui.three.wide.column
            div.ui.vertical.steps
                each item, index in ['介绍', '放送信息', '制作信息', '关联的动画']
                    a.step(:class=`{active: panelIndex === ${index}}`, @click="panelIndex = " + index)
                        div.content
                            div.title= item
        div.ui.eleven.wide.column
            Editor(:panel-index="panelIndex")
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import Editor from '@/layouts/animation/edit/Editor.vue'
import { secondaryBarItems, newItem } from '@/definitions/secondary-bar'

const img = require('@/assets/empty_cover.jpg')

export default defineComponent({
    components: {Editor},
    computed: {
        img: () => img,
        barItems: () => [secondaryBarItems.database.animation, newItem]
    },
    setup() {
        const panelIndex = ref(0)

        return {panelIndex}
    }
})
</script>
