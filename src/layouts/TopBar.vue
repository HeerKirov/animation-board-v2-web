<template lang="pug">
-   
    const topBarItems = [
        {name: '日记', icon: 'book icon', link: 'Record'},
        {name: '评价', icon: 'bookmark icon', link: 'Comment'},
        {name: '统计', icon: 'chart bar icon', link: 'Statistics'},
        {name: '数据库', icon: 'database icon', link: 'Database'}
    ]
div.ui.top.fixed.menu.blue.inverted.top-bar
    div.ui.container
        router-link.item.header(:to="{name: 'Home'}") Animation Board
        - for(let item of topBarItems)
            router-link.item.px-3(:to=`{name: '${item.link}'}`, v-if="isLogin")
                i(class=item.icon)
                span= item.name
        template(v-if="isLogin")
            a.right.item
                i.envelope.icon
                span 1
            router-link.item.px-2(:to="{name: 'UserInfo'}")
                img.avatar(:src='userInfo.cover')
                span.ml-1 {{userInfo.name}}
        template(v-else-if="isLogin === false")
            router-link.right.item(:to="{name: 'Login'}") 
                i.sign.in.alternate.icon
                span 登录
            a.item 
                i.user.circle.outline.icon
                span 注册
</template>

<script lang="ts">
import { defineComponent, computed, toRef } from 'vue'
import { useAuth } from '@/functions/auth'
import { useSWR } from '@/functions/server'
import config from '@/config'

const emptyAvatar = require('@/assets/empty_avatar.jpg')

export default defineComponent({
    setup() {
        const { stats } = useAuth()

        const { data } = useSWR('/api/user/', null, {baseUrl: config.BASIC_SERVICE_URL})

        const userInfo = computed(() => data.value ? mapUserInfo(data.value) : {})

        return {
            isLogin: toRef(stats, 'isLogin'),
            userInfo
        }
    }
})

function mapUserInfo(data: any) {
    return {
        name: data['name'],
        cover: data['cover'] ? `${config.BASIC_SERVICE_URL}/static/cover/${data['cover']}` : emptyAvatar
    }
}

</script>

<style scoped>
    .top-bar {
        height: 44px
    }
    .avatar {
        margin: -.4em 0 !important;
        width: 31px !important;
        height: 31px !important;
        border-radius: 50%;
        border-width: 1px;
        border-color: white;
        border-style: solid;
    }
</style>
