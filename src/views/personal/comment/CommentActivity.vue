<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'activity'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
    div.ui.grid
        div.twelve.wide.column
            div.ui.inline.active.centered.loader(v-if="loading")
            div.ui.feed.ml-2(v-else)
                div.event(v-for="item in items")
                    div.label
                        img(:src="item.cover")
                    div.content
                        div.summary
                            router-link.user(:to="{name: 'Comment.Detail', params: {id: item.id}}") {{item.title}}
                            template(v-if="item.articleTitle")
                                i.left.quote.icon
                                = '{{item.articleTitle}}'
                                i.right.quote.icon
                            div.date {{item.updateTime}}
                        div.starlight: Starlight(:value="item.score")
                        div.extra.text(v-if="item.article") {{item.article}}
        div.four.wide.column
            div.ui.segment.pb-4
                SearchBox(:value="search", @search="onSearch")
                div.ui.divider
                div.ui.stackable.grid
                    div.four.wide.column.px-0.font-size-12.text-right.py-2 有评分
                    div.twelve.wide.column.pt-1.pb-2
                        ItemSelector(:items="yesOrNo", :selected="hasScore", @changed="onHasScoreChanged")
                    div.four.wide.column.px-0.font-size-12.text-right.py-2 有评论
                    div.twelve.wide.column.pt-1.pb-2
                        ItemSelector(:items="yesOrNo", :selected="hasArticle", @changed="onHasArticleChanged")
            PageSelector(:max="pageMax", :current="page", @changed="onPageChanged")
            div.mt-2(v-if="totalNum != null") 共{{totalNum}}项动态
</template>

<script lang="ts">
import { defineComponent, ref, Ref, reactive, watchEffect } from 'vue'
import SearchBox, { SearchEvent } from '@/components/SearchBox.vue'
import PageSelector, { ChangedEvent as PageChangedEvent } from '@/components/PageSelector.vue'
import ItemSelector, { ChangedEvent as ItemChangedEvent } from '@/components/ItemSelector.vue'
import Starlight from '@/components/Starlight.vue'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import { toNameSet } from '@/definitions/util'
import { useRouterQueryUtil } from '@/functions/routers'
import { usePagination, useSelector } from '@/functions/parameters'
import { toFriendlyTime } from '@/functions/display'
import { useSWR } from '@/functions/server'
import cover from '@/plugins/cover'

const limit = 10

const yesOrNo = [{"name": "true", "title": "是"}, {"name": "false", "title": "否"}]

export default defineComponent({
    components: {SearchBox, PageSelector, ItemSelector, Starlight},
    computed: {
        barItems() { return secondaryBarItems.comment },
        yesOrNo() { return yesOrNo }
    },
    setup() {
        const { updateQuery, watchQuery } = useRouterQueryUtil({resetField: {field: 'page', value: undefined, excludes: ['order']}})

        const items: Ref<any[]> = ref([])
        const totalNum: Ref<number | null> = ref(null)

        const search: Ref<string | undefined> = ref()
        const { selected: hasScore, toQuery: hasScoreToQuery, fromQuery: hasScoreFromQuery } = useSelector(toNameSet(yesOrNo), null, "lower")
        const { selected: hasArticle, toQuery: hasArticleToQuery, fromQuery: hasArticleFromQuery } = useSelector(toNameSet(yesOrNo), null, "lower")
        const { page, pageMax, offset, pageToQuery, pageFromQuery } = usePagination(totalNum, limit)

        const onSearch = (e: SearchEvent) => updateQuery('search', e.text)
        const onHasScoreChanged = (e: ItemChangedEvent) => updateQuery('has_score', hasScoreToQuery(e.name))
        const onHasArticleChanged = (e: ItemChangedEvent) => updateQuery('has_article', hasArticleToQuery(e.name))
        const onPageChanged = (e: PageChangedEvent) => updateQuery('page', pageToQuery(e.page))

        watchQuery({
            'search'(value) { search.value = value || undefined },
            'has_score': hasScoreFromQuery,
            'has_article': hasArticleFromQuery,
            'page': pageFromQuery
        })

        const fetcher = reactive({
            'search': search,
            'has_score': hasScore,
            'has_article': hasArticle,
            'limit': limit,
            'offset': offset
        })

        const { loading, data } = useSWR('/api/personal/comments/activity', fetcher, {byAuthorization: 'LOGIN'})

        watchEffect(() => {
            if(data.value) {
                const now = new Date()
                items.value = (data.value['result'] as any[]).map(i => mapItem(i, now))
                totalNum.value = data.value['total']
            }else{
                items.value = []
                totalNum.value = null
            }
        })

        return {
            search, onSearch,
            hasScore, onHasScoreChanged,
            hasArticle, onHasArticleChanged,
            page, pageMax, onPageChanged,
            loading, items, totalNum
        }
    }
})

function mapItem(item: any, now: Date) {
    return {
        id: item['animation_id'],
        title: item['title'],
        cover: cover.animationOrEmpty(item['cover']),
        score: item['score'],
        articleTitle: item['article_title'],
        article: item['article'] ? splitArticle(item['article']) : null,
        updateTime: toFriendlyTime(new Date(item['update_time']), now)
    }
}

function splitArticle(article: string): string {
    const max = 100
    if(article.length > max) return article.substring(0, max) + "..."
    else return article
}
</script>

<style scoped>
    .starlight {
        transform: translateX(-6px);
    }
</style>
