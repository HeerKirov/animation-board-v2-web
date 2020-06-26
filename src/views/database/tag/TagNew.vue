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
        div.ui.ten.wide.centered.column
            div.ui.form
                div.fields
                    div.five.wide.field.required
                        label 名称
                        input.ui.input(placeholder="标签的唯一识别名")
                    div.eleven.wide.field
                        label 描述
                        input.ui.input(placeholder="标签的定义描述")
                    div.one.wide.field
                        label.hidden delete
                        button.ui.red.icon.button
                            i.close.icon
                div.field
                    button.ui.green.basic.fluid.button
                        i.plus.icon
                        = '继续添加标签'
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { secondaryBarItems, newItem } from '@/definitions/secondary-bar'

export default defineComponent({
    computed: {
        barItems: () => [secondaryBarItems.database.tag, newItem]
    },
    setup() {

    }
})
</script>

<style scoped>
    .hidden {
        visibility: hidden;
    }
</style>