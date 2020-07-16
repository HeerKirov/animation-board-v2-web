<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'rank'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
    div.ui.grid
        div.twelve.wide.column
            div.ui.stackable.three.columns.grid
                div.column.px-2.pb-1(v-for="item in items")
                    div.ui.segment.py-2.pl-2.pr-0
                        router-link(:to="{name: 'Comment.Detail', params: {id: item.id}}")
                            img.item-image(:src="item.cover")
                        div.item-content
                            div: router-link.ui.tertiary.button(:to="{name: 'Comment.Detail', params: {id: item.id}}") {{item.title}}
                            div.starlight: Starlight(:value="item.score")
        div.four.wide.column
            div.ui.segment.pb-4
                SearchBox(:value="search", @search="onSearch")
                div.ui.divider
                div.ui.three.columns.grid
                    div.ui.column
                        DigitalRoulette(:up-button="true", :min="1", :max="10", :modelValue="minScore", @update:modelValue="onMinScoreUpdate")
                    div.ui.column.arrow-icon
                        i.arrow.right.icon
                    div.ui.column
                        DigitalRoulette(:up-button="true", :min="1", :max="10", :modelValue="maxScore", @update:modelValue="onMaxScoreUpdate")
            PageSelector(:max="pageMax", :current="page", @changed="onPageChanged")
            div.mt-2(v-if="totalNum != null") 共{{totalNum}}项评分
</template>

<script lang="ts">
import { defineComponent, ref, Ref, reactive, watchEffect, toRef } from 'vue'
import SearchBox, { SearchEvent } from '@/components/SearchBox.vue'
import PageSelector, { ChangedEvent as PageChangedEvent } from '@/components/PageSelector.vue'
import DigitalRoulette from '@/components/DigitalRoulette.vue'
import Starlight from '@/components/Starlight.vue'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import { useRouterQueryUtil } from '@/functions/routers'
import { usePagination, useSort, useSelector } from '@/functions/parameters'
import { cast } from '@/functions/util'
import { useSWR } from '@/functions/server'
import cover from '@/plugins/cover'

const limit = 24

export default defineComponent({
    components: {SearchBox, PageSelector, DigitalRoulette, Starlight},
    computed: {
        barItems() { return secondaryBarItems.comment }
    },
    setup() {
        const { updateQuery, watchQuery } = useRouterQueryUtil({resetField: {field: 'page', value: undefined, excludes: ['order']}})

        const items = ref([])
        const totalNum: Ref<number | null> = ref(null)

        const search: Ref<string | undefined> = ref()
        const minScore: Ref<number> = ref(1), maxScore: Ref<number> = ref(10)
        const { page, pageMax, offset, pageToQuery, pageFromQuery } = usePagination(totalNum, limit)

        const onSearch = (e: SearchEvent) => updateQuery('search', e.text)
        const onMinScoreUpdate = (value: number) => updateQuery('min_score', value > 1 ? value : undefined)
        const onMaxScoreUpdate = (value: number) => updateQuery('max_score', value < 10 ? value : undefined)
        const onPageChanged = (e: PageChangedEvent) => updateQuery('page', pageToQuery(e.page))
        
        watchQuery({
            'search'(value) { search.value = value || undefined },
            'min_score'(value) { minScore.value = cast.parseInt(value) || 1 },
            'max_score'(value) { maxScore.value = cast.parseInt(value) || 10 },
            'page': pageFromQuery
        })

        const fetcher = reactive({
            'search': search,
            'min_score': minScore,
            'max_score': maxScore,
            'limit': limit, 
            'offset': offset
        })

        const { loading, data } = useSWR('/api/personal/comments/rank', fetcher, {byAuthorization: 'LOGIN'})

        watchEffect(() => {
            if(data.value) {
                items.value = data.value['result'].map(mapItem)
                totalNum.value = data.value['total']
            }else{
                items.value = []
                totalNum.value = null
            }
        })

        return {
            search, onSearch,
            minScore, maxScore, onMinScoreUpdate, onMaxScoreUpdate,
            page, pageMax, onPageChanged,
            loading, items, totalNum
        }
    }
})

function mapItem(item: any) {
    return {
        id: item['animation_id'],
        title: item['title'],
        cover: cover.animationOrEmpty(item['cover']),
        score: item['score']
    }
}
</script>

<style scoped>
    .item-image {
        width: 25%;
    }
    .item-content {
        width: 75%;
        padding-left: 5px;
        vertical-align: top;
        display: inline-block;
    }
    .starlight {
        position: absolute;
        bottom: 15px;
        transform: translateX(3px);
    }
    .arrow-icon {
        text-align: center;
        line-height: 75px;
    }
</style>