<template lang="pug">
div.ui.card
    div.image
        img(:src="userInfo.cover")
    div.content
        div.header.text-center {{userInfo.name}}
    div.extra.content
        div.ui.two.columns.grid.text-center
            div.column: router-link(:to="{name: 'Comment.Activity'}") 评论动态
            div.column: router-link(:to="{name: 'Comment.Rank'}") 评分表
            div.column: router-link(:to="{name: 'Record.Activity'}") 日记动态
            div.column: router-link(:to="{name: 'Record.History'}") 足迹
</template>

<script lang="ts">
import { defineComponent, reactive, watch, computed, toRefs } from 'vue'
import { useSWR } from '@/functions/server'
import cover from '@/plugins/cover'
import config from '@/config'

export default defineComponent({
    setup() {
        const { data } = useSWR('/api/user/', null, {baseUrl: config.BASIC_SERVICE_URL, byAuthorization: "LOGIN"})

        const userInfo = computed(() => data.value ? mapUserInfo(data.value) : defaultUserInfo())

        return {userInfo}
    }
})

function mapUserInfo(data: any) {
    return {
        name: data['name'],
        cover: cover.userOrEmpty(data['cover'])
    }
}

function defaultUserInfo() {
    return {name: '', cover: cover.userOrEmpty(null)}
}
</script>