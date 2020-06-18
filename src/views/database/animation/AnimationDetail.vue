<template lang="pug">
div.container.level
    div.level-left
        TabBar(color='info', :items="[{title: '动画', icon: 'fa-film', link: '/database/animations/list'}, {title: '详情', icon: 'fa-info', link: '', active: true}]")
    div.level-right
        TabBar.mr-2(:items="[{title: '编辑', icon: 'fa-edit', link: '/database/animations/new'}]")
section.hero.is-bold.is-info
    div.hero-body
        div.container.level
            div.level-left
                div
                    h1.title.mb-0 某科学的超电磁炮T
                    span.is-size-7(style='position: absolute') つある科学のレイルグン / 科学超电磁炮T
            div.level-right
                //- i.fa.fa-venus-mars.mr-1
                //- = 'R12'
                //- i.fa.fa-hand-grab-o.mr-1
                //- = 'A'
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute } from 'vue-router'
import TabBar from '@/components/elements/TabBar.vue'

export default defineComponent({
    components: {TabBar},
    setup() {
        const route = useRoute()
    }
})
</script>

<style scoped>

</style>