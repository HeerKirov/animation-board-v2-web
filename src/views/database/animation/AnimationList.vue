<template lang='pug'>
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'animation'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
        router-link.right.item(:to="{name: 'Animation.New'}")
            i.plus.icon
            = '新建'
    div.ui.grid
        div.twelve.wide.column
            div.ui.stackable.four.columns.grid
                div.column(v-for="item in items")
                    div.ui.card
                        router-link.image(:to="{name: 'Animation.Detail', params: {id: 1}}")
                            img(:src='item.cover')
                        div.content
                            router-link.header.font-size-14(:to="{name: 'Animation.Detail', params: {id: 1}}") {{item.title}}
                            div.meta
                                span.date.font-size-11 {{item.episode}}
                            label.font-size-11(v-if="item.publishTime") {{item.publishTime}}
        div.four.wide.column
            div.ui.segment.pb-4
                SearchBox
                div.ui.divider
                SortSelector.px-2(:items="orders", :selected="sortValue", :direction="sortDirection", @changed="onSortChanged")

                div.ui.divider
                div.ui.stackable.grid
                    div.four.wide.column.px-0.font-size-12.text-right.py-2 原作类型
                    div.twelve.wide.column.pt-1.pb-2
                        ItemSelector(:items="originalWorkTypes")
                    div.four.wide.column.px-0.font-size-12.text-right.py-2 放送类型
                    div.twelve.wide.column.pt-1.pb-2
                        ItemSelector(:items="publishTypes")
                    div.four.wide.column.px-0.font-size-12.text-right.py-2 
                        i.venus.mars.icon
                        = '分级'
                    div.twelve.wide.column.pt-1.pb-2
                        ItemSelector(:items="sexLimitLevels")
                    div.four.wide.column.px-0.font-size-12.text-right.py-2 
                        i.hand.rock.outline.icon
                        = '分级'
                    div.twelve.wide.column.pt-1.pb-2
                        ItemSelector(:items="violenceLimitLevels")
                    div.four.wide.column.px-0.font-size-12.text-right.py-2 放送时间
                    div.twelve.wide.column.pt-1.pb-2
                        DatePicker
                    div.four.wide.column.px-0.font-size-12.text-right.py-2 标签
                    div.twelve.wide.column.py-2
                        TagFilter
                    div.four.wide.column.px-0.font-size-12.text-right.py-2 STAFF
                    div.twelve.wide.column.py-2
                        StaffFilter
            PageSelector(:total="448", :limit="limit", :offset="offset", @changed="onOffsetChanged")
            div(v-if="totalNum != null") 共{{totalNum}}条记录

</template>

<script lang="ts">
import { defineComponent, ref, watch, reactive, toRef, computed, watchEffect, Ref } from 'vue'
import TagFilter from '@/layouts/animation/list/TagFilter.vue'
import StaffFilter from '@/layouts/animation/list/StaffFilter.vue'
import SearchBox from '@/components/SearchBox.vue'
import SortSelector, { ChangedEvent as SortChangedEvent } from '@/components/SortSelector.vue'
import ItemSelector from '@/components/ItemSelector.vue'
import PageSelector, { ChangedEvent as PageChangedEvent } from '@/components/PageSelector.vue'
import DatePicker from '@/components/DatePicker.vue'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import { publishTypes, originalWorkTypes, sexLimitLevels, violenceLimitLevels, withoutColor } from '@/definitions/animation-definition'
import { useSWR } from '@/functions/server'
import { useSortParams } from '@/functions/generator'
import config from '@/config'
import { useRoute, useRouter } from 'vue-router'

const img = require('@/assets/empty_avatar.jpg')

const orders = [
    {name: 'PUBLISH_TIME', title: '放送时间', icon: 'video icon', argument: ['publish_time', 'create_time']},
    {name: 'CREATE_TIME', title: '创建时间', icon: 'folder plus icon', argument: 'create_time'},
    {name: 'UPDATE_TIME', title: '更新时间', icon: 'pen nib icon', argument: 'update_time'},
    {name: 'SEX_LIMIT_LEVEL', title: '分级', icon: 'venus mars icon', forceIcon: true, argument: ['sex_limit_level,violence_limit_level', 'create_time']},
    {name: 'VIOLENCE_LIMIT_LEVEL', title: '分级', icon: 'hand rock outline icon', forceIcon: true, argument: ['violence_limit_level,sex_limit_level', 'create_time']}
]

export default defineComponent({
    components: {TagFilter, StaffFilter, SearchBox, SortSelector, ItemSelector, PageSelector, DatePicker},
    computed: {
        barItems: () => secondaryBarItems.database,
        orders: () => orders,
        publishTypes: () => withoutColor(publishTypes),
        originalWorkTypes: () => withoutColor(originalWorkTypes),
        sexLimitLevels: () => withoutColor(sexLimitLevels),
        violenceLimitLevels: () => withoutColor(violenceLimitLevels)
    },
    setup() {
        const router = useRouter()
        const route = useRoute()
        const updateQuery = (key: string, value: any) => {
            router.push({
                name: route.name!,
                query: {
                    ...route.query,
                    [key]: value
                }
            })
        }
        //TODO 完成基本循环和业务代码后将各部分模块化，route部分要单独抽离模块化
        const limit = 16
        const offset = ref(0)
        const onOffsetChanged = (e: PageChangedEvent) => updateQuery('page', e.page > 1 ? e.page : undefined)

        const { sortValue, sortDirection, order } = useSortParams(orders, "PUBLISH_TIME", -1)
        const onSortChanged = (e: SortChangedEvent) => updateQuery('order', (e.direction < 0 ? '-' : '') + e.name.toLowerCase())

        const fetcher = reactive({
            limit, 
            offset,
            order
        })

        //顺序保持不变，必须先应用参数再应用SWR
        watch(() => route.query, (query, old) => {
            //TODO 参数需要防爆，包括类型判断和转换合法性判断
            //这一部分也要模块化，避免模版性重复代码
            console.log(query)
            if(old == null || query['page'] != old['page']) {
                const page = query['page'] ? parseInt(query['page'] as string) : 1
                offset.value = (page - 1) * limit
            }
            if(old == null || query['order'] != old['order']) {
                if(!query['order']) {
                    sortDirection.value = -1
                    sortValue.value = "PUBLISH_TIME"
                }else{
                    const sort = query['order'] as string
                    if(sort.startsWith('-')) {
                        sortDirection.value = -1
                        sortValue.value = sort.substring(1).toUpperCase()
                    }else{
                        sortDirection.value = 1
                        sortValue.value = sort.toUpperCase()
                    }
                }
            }
        }, {immediate: true})

        const { data } = useSWR(`/api/database/animations`, fetcher)

        const items = ref([])
        const totalNum: Ref<number | null> = ref(null)

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
            sortValue, sortDirection, onSortChanged, 
            limit, offset, onOffsetChanged,
            items, totalNum
        }
    }
})

function mapItem(item: any) {
    return {
        title: item['title'],
        cover: item['cover'] ? `${config.SERVER_URL}/api/database/cover/animation/${item['cover']}` : img,
        episode: item['published_episodes'] >= item['total_episodes'] ? `全${item['total_episodes']}话` : `${item['published_episodes']}/${item['total_episodes']}话`,
        publishTime: item['publish_time'] && toPublishTime(item['publish_time'])
    }
}

function toPublishTime(publishTime: string): string {
    const [year, month] = publishTime.split('-')
    return `${year}年${month}月`
}
</script>