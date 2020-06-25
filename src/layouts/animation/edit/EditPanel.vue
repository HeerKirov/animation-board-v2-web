<template lang="pug">
div.ui.secondary.pointing.menu
    router-link.item(v-for="item in barItems", :class="{active: item.name === 'edit'}", :to="item.link")
        i(:class="item.icon")
        = '{{item.title}}'
    a.right.item 
        i.check.icon
        = '保存'
    a.item 
        i.close.icon
        = '放弃更改'
div.ui.centered.grid
    div.ui.three.wide.column
        div.ui.vertical.fluid.tabular.menu
            each item, index in ['介绍', '放送信息', '制作信息', '关联的动画']
                a.item(:class=`{active: panelIndex === ${index}}`, @click="panelIndex = " + index)= item
    div.ui.eleven.wide.column
        Editor(:panel-index="panelIndex")
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import Editor from './Editor.vue'
import { secondaryBarItems, editItem } from '@/definitions/secondary-bar'

const img = require('@/assets/empty_avatar.jpg')

export default defineComponent({
    components: {Editor},
    computed: {
        img: () => img,
        barItems: () => [secondaryBarItems.database.animation, editItem]
    },
    setup() {
        const panelIndex = ref(0)

        return {panelIndex}
    }
})
</script>