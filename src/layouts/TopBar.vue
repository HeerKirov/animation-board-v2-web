<template lang="pug">
-   
    const topBarItems = [
        {name: '日记', icon: 'book icon', color: 'info', link: 'Record'},
        {name: '评价', icon: 'bookmark icon', color: 'warning', link: 'Comment'},
        {name: '统计', icon: 'chart bar icon', color: 'danger', link: 'Statistics'},
        {name: '数据库', icon: 'database icon', color: 'primary', link: 'Database'}
    ]
div.ui.top.fixed.menu.blue.inverted.top-bar
    div.ui.container
        router-link.item.header(:to="{name: 'Home'}") Animation Board
        - for(let item of topBarItems)
            router-link.item.px-3(:to=`{name: '${item.link}'}`)
                i(class=item.icon)
                span= item.name
        template(v-if="false")
            router-link.right.item(:to="{name: 'Login'}") 
                i.sign.in.alternate.icon
                span 登录
            a.item 
                i.user.circle.outline.icon
                span 注册
        template(v-else)
            a.right.item
                i.envelope.icon
                span 1
            router-link.item.px-2(:to="{name: 'UserInfo'}")
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
