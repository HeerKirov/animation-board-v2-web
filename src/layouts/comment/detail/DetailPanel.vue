<template lang="pug">
div.ui.secondary.pointing.menu
    router-link.item(v-for="item in barItems", :class="{active: item.name === 'detail'}", :to="item.link")
        i(:class="item.icon")
        = '{{item.title}}'
    router-link.right.item(v-if="obj", :to="{name: 'Animation.Detail', params: {id: obj.id}}")
        i.database.icon
        = '数据库页面'
    a.item(@click="onEdit")
        i.edit.icon
        = '编辑'
div.ui.centered.grid
    div.ui.active.centered.inline.loader.mt-4(v-if="loading")
    div.ui.fourteen.wide.column(v-else-if="obj")
        div.ui.stackable.grid
            div.three.wide.column
                div.ui.card
                    img.cover-image(:src="obj.cover")
            div.nine.wide.column
                h1.text.ui.header.is-inline-block {{obj.title}}
                div.article-title(v-if="obj.articleTitle")
                    i.left.quote.icon
                    span {{obj.articleTitle}}
                    i.right.quote.icon
            div.four.wide.column
                div.float-right(v-if="obj.score")
                    Starlight(:value="obj.score", :large="true")
                    div.text-right.mt-1: span.ui.large.text {{scoreDescriptions[obj.score].header}}
                    div.text-right: span.ui.grey.text {{scoreDescriptions[obj.score].content}}
            div.three.wide.column
            div.twelve.wide.column(v-if="obj.article")
                div(v-html="obj.article")
</template>

<script lang="ts">
import { computed, defineComponent, inject } from 'vue'
import Starlight from '@/components/Starlight.vue'
import { detailItem, topBarItems } from '@/definitions/secondary-bar'
import { scoreDescriptions } from '@/definitions/comment-definition'
import { editInjectionKey, swrInjectionKey } from '@/definitions/injections'
import { calendarToString, dateToCalendar } from '@/functions/format'
import { toHtmlStr } from '@/functions/display'
import cover from '@/plugins/cover'

export default defineComponent({
    components: {Starlight},
    computed: {
        barItems: () => [topBarItems.comment, detailItem],
        scoreDescriptions() { return scoreDescriptions }
    },
    setup() {
        const { loading, data } = inject(swrInjectionKey)!
        const obj = computed(() => data.value ? mapItem(data.value) : null)

        const editMode = inject(editInjectionKey)!
        const onEdit = () => { editMode.value = true }

        return {obj, loading, onEdit}
    }
})

function mapItem(item: any) {
    return {
        id: item['animation_id'],
        title: item['title'],
        cover: cover.animationOrEmpty(item['cover']),
        score: item['score'],
        articleTitle: item['article_title'],
        article: toHtmlStr(item['article']),
        updateTime: calendarToString(dateToCalendar(new Date(item['update_time'])))
    }
}
</script>

<style scoped>
    .cover-image {
        width: 100%;
    }
    .article-title {
        position: absolute;
        bottom: 22px;
    }
</style>
