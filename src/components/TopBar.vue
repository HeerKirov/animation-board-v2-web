<template lang="pug">
-   
    const topBarItems = [
        {name: '日记', icon: 'fa-book', color: 'info', link: '/personal/records'},
        {name: '记录', icon: 'fa-bookmark', color: 'success', link: '/personal/comments'},
        {name: '数据库', icon: 'fa-database', color: 'primary', link: '/database'},
        {name: '统计', icon: 'fa-bar-chart', color: 'danger', link: '/statistics'}
    ]
NavBar
    template(v-slot:brand)
        router-link.navbar-item(to="/") Animation Board
    div.navbar-start
        - for(let item of topBarItems)
            router-link.navbar-item(to=item.link)
                i.fa.pl-1.mr-1.fa-book(class=[`has-text-${item.color}`, item.icon])
                span.pr-1= item.name
    div.navbar-end
        template(v-if="false")
            div.navbar-item.buttons
                router-link.button.is-primary(to="/login") 登录
                button.button.is-light 注册
        template(v-else)
            a.navbar-item
                i.fa.fa-envelope.ml-1.mr-1
                span.mr-1 1
            router-link.navbar-item(to="/user/info")
                img.mr-2(:src='emptyAvatar')
                span Heer Kirov
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch, toRef, isReactive, isRef } from 'vue'
import { useRoute, RouteLocationNormalizedLoaded } from "vue-router"
import NavBar from "@/components/elements/NavBar.vue"

const emptyAvatar = require('@/assets/empty_avatar.jpg')

export default defineComponent({
    components: {NavBar},
    computed: {
        emptyAvatar: () => emptyAvatar
    },
    setup() {

    }
})

</script>

<style scoped>

</style>
