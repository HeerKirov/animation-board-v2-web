<template lang="pug">
-   
    const topBarItems = [
        {name: '日记', icon: 'book icon', color: 'info', link: '/personal/records'},
        {name: '评价', icon: 'bookmark icon', color: 'warning', link: '/personal/comments'},
        {name: '统计', icon: 'chart bar icon', color: 'danger', link: '/statistics'},
        {name: '数据库', icon: 'database icon', color: 'primary', link: '/database'}
    ]
div.ui.top.fixed.menu.blue.inverted.top-bar
    div.ui.container
        router-link.item.header(to="/") Animation Board
        - for(let item of topBarItems)
            router-link.item.px-3(to=item.link)
                i(class=item.icon)
                span= item.name
        template(v-if="false")
            router-link.right.item(to="/login") 
                i.sign.in.alternate.icon
                span 登录
            a.item 
                i.user.circle.outline.icon
                span 注册
        template(v-else)
            a.right.item
                i.envelope.icon
                span 1
            router-link.item.px-2(to="/user/info")
                img.avatar(:src='emptyAvatar')
                span.ml-1 Heer Kirov
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch, toRef, isReactive, isRef } from 'vue'
import { useRoute, RouteLocationNormalizedLoaded } from "vue-router"

const emptyAvatar = require('@/assets/empty_avatar.jpg')

export default defineComponent({
    computed: {
        emptyAvatar: () => emptyAvatar
    },
    setup() {

    }
})

</script>

<style scoped>
    .top-bar {
        height: 44px
    }
    .avatar {
        margin: -.4em 0px !important;
        width: 28px !important;
        height: 28px !important;
    }
</style>
