<template lang="pug">
-   
    const topBarItems = [
        {name: '日记', icon: 'book icon', color: 'info', link: 'Record', f: 'isLogin'},
        {name: '评价', icon: 'bookmark icon', color: 'warning', link: 'Comment', f: 'isLogin'},
        {name: '统计', icon: 'chart bar icon', color: 'danger', link: 'Statistics', f: 'isLogin'},
        {name: '数据库', icon: 'database icon', color: 'primary', link: 'Database', f: 'true'}
    ]
div.ui.top.fixed.menu.blue.inverted.top-bar
    div.ui.container
        router-link.item.header(:to="{name: 'Home'}") Animation Board
        - for(let item of topBarItems)
            router-link.item.px-3(:to=`{name: '${item.link}'}`, v-if="" + item.f)
                i(class=item.icon)
                span= item.name
        template(v-if="isLogin")
            a.right.item
                i.envelope.icon
                span 1
            router-link.item.px-2(:to="{name: 'UserInfo'}")
                img.avatar(:src='emptyAvatar')
                span.ml-1 Heer Kirov
        template(v-else-if="isLogin === false")
            router-link.right.item(:to="{name: 'Login'}") 
                i.sign.in.alternate.icon
                span 登录
            a.item 
                i.user.circle.outline.icon
                span 注册
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch, toRef, isReactive, isRef } from 'vue'
import { useRoute, RouteLocationNormalizedLoaded } from "vue-router"
import { useAuth } from '@/functions/auth'

const emptyAvatar = require('@/assets/empty_avatar.jpg')

export default defineComponent({
    computed: {
        emptyAvatar: () => emptyAvatar
    },
    setup() {
        const { stats } = useAuth()

        return {
            isLogin: toRef(stats, 'isLogin')
        }
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
