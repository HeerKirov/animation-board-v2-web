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
        h2.ui.icon.header.mb-0
            i.user.icon
    div.ui.row
        div.ui.eight.wide.centered.column
            Editor
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Editor from './Editor.vue'
import { secondaryBarItems, editItem } from '@/definitions/secondary-bar'


export default defineComponent({
    components: {Editor},
    computed: {
        barItems: () => [secondaryBarItems.database.staff, editItem]
    },
    setup() {

    }
})
</script>

<style scoped>

</style>