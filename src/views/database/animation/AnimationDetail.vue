<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'detail'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
        a.right.item 
            i.edit.icon
            = '编辑'
    div.ui.grid
        
        div.hero-body
            div.container.level
                div.level-left
                    div
                        h1.title.mb-0 某科学的超电磁炮T
                        span.is-size-7(style='position: absolute') つある科学のレイルグン / 魔法禁书目录外传
                div.level-right
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { secondaryBarItems, detailItem } from '@/router/secondary-bar'

export default defineComponent({
    components: {},
    computed: {
        barItems: () => [secondaryBarItems.database.animation, detailItem]
    },
    setup() {

    }
})
</script>

<style scoped>

</style>