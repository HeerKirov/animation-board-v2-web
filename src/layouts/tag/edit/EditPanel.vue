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
div.ui.grid
    div.ui.centered.row
        h2.ui.icon.header
            i.tag.icon
    div.ui.row
        div.ui.four.wide.centered.column
            div.ui.form
                div.ui.field
                    label 名称
                    input.ui.input
                div.ui.field
                    label 描述
                    input.ui.input
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { secondaryBarItems, editItem } from '@/definitions/secondary-bar'

export default defineComponent({
    computed: {
        barItems: () => [secondaryBarItems.database.tag, editItem]
    },
    setup() {

    }
})
</script>

<style scoped>

</style>