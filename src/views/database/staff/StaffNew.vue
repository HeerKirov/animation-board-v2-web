<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'new'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
        a.right.item 
            i.check.icon
            = '提交'
    div.ui.grid
        div.ui.eight.wide.centered.column
            Editor
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Editor from '@/layouts/staff/edit/Editor.vue'
import { secondaryBarItems, newItem } from '@/definitions/secondary-bar'

export default defineComponent({
    components: {Editor},
    computed: {
        barItems: () => [secondaryBarItems.database.staff, newItem]
    },
    setup() {

    }
})
</script>

<style scoped>

</style>