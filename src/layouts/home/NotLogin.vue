<template lang="pug">
div.ui.grid
    div.three.wide.column
        div.ui.segment
            h5.ui.horizontal.divider.header TAG
            div.ui.inline.active.centered.loader(v-if="tag.loading")
            div.ui.stackable.two.columns.grid.text-center(v-else)
                div.column.py-2(v-for="item in tag.items"): router-link.ui.tertiary.mini.button(:to="{name: 'Animation.List', query: {tag: item}}") {{item}}
            div.text-right.mt-3: router-link.ui.tertiary.mini.button(:to="{name: 'Tag.List'}") 查看更多
                i.double.angle.right.icon
    div.ten.wide.column
        div.ui.segment
            h4.ui.horizontal.divider.header 动画数据库
            div.ui.inline.active.centered.loader(v-if="animation.loading")
            div.ui.stackable.five.cards(v-else)
                div.card(v-for="item in animation.items")
                    router-link.image(:to="{name: 'Animation.Detail', params: {id: item.id}}")
                        img(:src='item.cover')
                    div.content.p-1
                        router-link.header.font-size-12(:to="{name: 'Animation.Detail', params: {id: item.id}}") {{item.title}}
                        div.meta: span.date.font-size-11(v-if="item.publishTime") {{item.publishTime}}
            div.text-right.mt-3: router-link.ui.tertiary.mini.button(:to="{name: 'Animation.List'}") 查看更多
                i.double.angle.right.icon
    div.three.wide.column
        div.ui.primary.card
            div.content
                div.ui.icon.header
                    i.user.circle.icon
                    div.content
                        div.sub.header.mt-4 登录后，可以使用评价与日记功能
                router-link.ui.fluid.green.mini.button(:to="{name: 'Login'}") 登录
                a.ui.fluid.blue.mini.button.mt-1 新用户注册
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useSWR } from '@/functions/server'
import { toPublishTime } from '@/functions/display'
import cover from '@/plugins/cover'

export default defineComponent({
    setup() {
        const animation = useAnimations()

        const tag = useTags()

        return {animation, tag}
    }
})

function useAnimations() {
    const { loading, data } = useSWR('/api/database/animations', {limit: 10, order: '-publish_time,-create_time'})

    const items = computed(() => data.value ? (data.value['result'] as any[]).map(mapAnimationItem) : [])

    return {loading, items}
}

function useTags() {
    const { loading, data } = useSWR('/api/database/tags', {limit: 10, order: '-update_time'})

    const items = computed(() => data.value ? (data.value['result'] as any[]).map(i => i['name']) : [])

    return {loading, items}
}

function mapAnimationItem(item: any) {
    return {
        id: item['id'],
        title: item['title'],
        cover: cover.animationOrEmpty(item['cover']),
        episode: item['published_episodes'] >= item['total_episodes'] ? `全${item['total_episodes']}话` : `${item['published_episodes']}/${item['total_episodes']}话`,
        publishTime: item['publish_time'] && toPublishTime(item['publish_time'])
    }
}
</script>

<style scoped>

</style>