<template lang="pug">
div
    TopBar
    section.hero.is-primary
        div.hero-head
            
        div.hero-body
            div.container
                h1.title 动画数据库
        div.hero-foot
            div.container
                nav.tabs.is-boxed
                    ul
                        li.is-active
                            a
                                i.fa.fa-film.mr-1
                                = '动画'
                        li
                            a
                                i.fa.fa-tags.mr-1
                                = '标签'
                        li
                            a
                                i.fa.fa-user.mr-1
                                = 'STAFF'
    div.container.pt-5
        router-view
    Footer
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TopBar from "@/components/TopBar.vue"
import Breadcrumb from "@/components/Breadcrumb.vue"
import Footer from "@/components/Footer.vue"

export default defineComponent({
    components: {TopBar, Breadcrumb, Footer},
    setup() {
        return {}
    }
})
</script>

<style>
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
</style>
