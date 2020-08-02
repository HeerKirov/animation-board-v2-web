<template lang="pug">
div.ui.top.fixed.menu.blue.inverted.top-bar
    div.ui.container
        router-link.item.header(:to="{name: 'Home'}") Animation Board
        router-link.item.px-3(v-for="item in topBarItems", :to="item.link", v-if="isLogin")
            i(:class="item.icon")
            span {{item.title}}
        template(v-if="isLogin")
            a.right.item(@click="message.openMessage")
                i.mr-0(:class="message.num ? 'envelope icon' : 'envelope outline icon'")
                span.ml-1(v-if="message.num") {{message.num}}
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
template(v-if="message.isOpen")
    div.message-dimmer(@click="message.closeMessage")
    div.message-content
        button.ui.fluid.button(:class="{disabled: !message.data.length}", @click="message.onTrashAll")
            i.check.icon
            = '全部已读'
        div.no-message-notice(v-if="!message.data.length"): i 没有未读消息
        div.ui.card(v-for="(item, index) in message.data", @mouseover="message.onMouseOver(index)", @mouseout="message.onMouseOut(index)")
            div.content
                img.right.floated.mini.ui.image(v-if="item.cover", :src="item.cover")
                a.header(v-if="item.link", @click="message.onClickLink(index)") {{item.header}}
                div.header(v-else) {{item.header}}
                div.meta(v-if="item.meta") {{item.meta}}
                div.description(v-if="item.description") {{item.description}}
            a.ui.right.corner.mini.label(v-show="message.mouseOverIndex === index", @click="message.onTrash(index)")
                i.close.icon

</template>

<script lang="ts">
import { defineComponent, computed, toRef, ref, reactive, Ref } from 'vue'
import { useRouter } from 'vue-router'
import { arrays } from '@/functions/util'
import { useAuth } from '@/functions/auth'
import { useSWR, useServer } from '@/functions/server'
import { topBarItems } from '@/definitions/secondary-bar'
import cover from '@/plugins/cover'
import config from '@/config'

interface Message {
    id: number
    header: string
    meta?: string
    description?: string
    cover?: string
    link?: any
}

export default defineComponent({
    computed: {
        topBarItems() { return topBarItems }
    },
    setup() {
        const { stats } = useAuth()
        const { data } = useSWR('/api/user/', null, {baseUrl: config.BASIC_SERVICE_URL, byAuthorization: "LOGIN"})

        return {
            isLogin: toRef(stats, 'isLogin'), 
            userInfo: reactive(computed(() => data.value ? mapUserInfo(data.value) : {})), 
            message: reactive(useMessage())
        }
    }
})

function useMessage() {
    const router = useRouter()
    const { request } = useServer()

    const { data: messageCountData } = useSWR('/api/user/messages/count', {unread: true}, {byAuthorization: 'LOGIN'})
    const num = computed(() => latestId.value != null ? data.length : (messageCountData.value || 0))

    const isOpen = ref(false)
    const closeMessage = () => { isOpen.value = false }
    const openMessage = async () => {
        isOpen.value = true

        const r = await request('/api/user/messages', 'GET', {unread: true, from: latestId.value ?? undefined})
        if(r.ok) {
            const messages = (r.data as any[]).map(mapMessage)
            if(messages.length > 0) {
                latestId.value = messages[0].id
                data.splice(0, 0, ...messages)
            }
        }
    }

    const onClickLink = async (index: number) => {
        router.push(data[index].link)
        await onTrash(index)
        isOpen.value = false
    }
    const onTrash = async (index: number) => {
        const [{ id }] = data.splice(index, 1)
        await request('/api/user/messages/mark-as-read', 'POST', {message_ids: [id]})
    }
    const onTrashAll = async () => {
        isOpen.value = false
        const messages = data.splice(0, data.length)
        await request('/api/user/messages/mark-as-read', 'POST', {message_ids: messages.map(m => m.id)})
    }

    const data: Message[] = reactive([])
    const latestId: Ref<number | null> = ref(null)

    const mouseOver = useMouseOver()


    return {num, isOpen, openMessage, closeMessage, data, onClickLink, onTrash, onTrashAll, ...mouseOver}
}

function useMouseOver() {
    const mouseOverIndex: Ref<number | null> = ref(null)
    const onMouseOver = (index: number) => {
        mouseOverIndex.value = index
    }
    const onMouseOut = (index: number) => {
        if(mouseOverIndex.value === index) {
            mouseOverIndex.value = null
        }
    }
    return {mouseOverIndex, onMouseOver, onMouseOut}
}

function mapUserInfo(data: any) {
    return {
        name: data['name'],
        cover: cover.userOrEmpty(data['cover'])
    }
}

function mapMessage(item: any): Message {
    if(item['type'] === 'PUBLISH') {
        return {
            id: item['id'],
            header: item['content']['title'],
            cover: cover.animationOrEmpty(item['content']['cover']),
            meta: `第${arrays.range(item['content']['old_episodes'] + 1, item['content']['new_episodes'] + 1).join('、')}话更新了`,
            link: {name: 'Record.Detail', params: {id: item['content']['animation_id']}}
        }
    }else{
        return {
            id: item['id'],
            header: '消息',
            description: item['content']
        }
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
    .message-dimmer {
        background-color: black;
        opacity: 0.3;
        z-index: 1001;
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
    }
    .message-content {
        position: fixed;
        z-index: 1002;
        width: 300px;
        top: 0;
        right: 0;
        padding: 10px;
    }
    .no-message-notice {
        text-align: center;
        color: white;
        margin-top: 5px;
    }
</style>
