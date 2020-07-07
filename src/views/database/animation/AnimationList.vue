<template lang='pug'>
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'animation'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
        router-link.right.item(v-if="isStaff", :to="{name: 'Animation.New'}")
            i.plus.icon
            = '新建'
    div.ui.grid
        div.twelve.wide.column
            div.ui.inline.active.centered.loader(v-if="loading")
            div.ui.stackable.four.columns.grid(v-else)
                div.column(v-for="item in items", :key="item.id")
                    div.ui.card
                        router-link.image(:to="{name: 'Animation.Detail', params: {id: item.id}}")
                            img(:src='item.cover')
                        div.content
                            router-link.header.font-size-14(:to="{name: 'Animation.Detail', params: {id: item.id}}") {{item.title}}
                            div.meta
                                span.date.font-size-11 {{item.episode}}
                            label.font-size-11(v-if="item.publishTime") {{item.publishTime}}
        div.four.wide.column
            div.ui.segment.pb-4
                SearchBox(:value="search", @search="onSearch")
                div.ui.divider
                SortSelector.px-2(:items="orders", :selected="sortValue", :direction="sortDirection", @changed="onSortChanged")
                div.ui.divider
                div.ui.stackable.grid
                    div.four.wide.column.px-0.font-size-12.text-right.py-2 原作类型
                    div.twelve.wide.column.pt-1.pb-2
                        ItemSelector(:items="originalWorkTypes", :selected="original", @changed="onOriginalChanged")
                    div.four.wide.column.px-0.font-size-12.text-right.py-2 放送类型
                    div.twelve.wide.column.pt-1.pb-2
                        ItemSelector(:items="publishTypes", :selected="publishType", @changed="onPublishTypeChanged")
                    div.four.wide.column.px-0.font-size-12.text-right.py-2 
                        i.venus.mars.icon
                        = '分级'
                    div.twelve.wide.column.pt-1.pb-2
                        ItemSelector(:items="sexLimitLevels", :selected="sex", @changed="onSexChanged")
                    div.four.wide.column.px-0.font-size-12.text-right.py-2 
                        i.hand.rock.outline.icon
                        = '分级'
                    div.twelve.wide.column.pt-1.pb-2
                        ItemSelector(:items="violenceLimitLevels", :selected="violence", @changed="onViolenceChanged")
                    div.four.wide.column.px-0.font-size-12.text-right.py-2 放送时间
                    div.twelve.wide.column.pt-1.pb-2
                        DatePicker(:value="publishTime", @changed="onPublishTimeChanged")
                    div.four.wide.column.px-0.font-size-12.text-right.py-2 标签
                    LabelPicker(url="/api/database/tags", placeholder="搜索标签", :value="tag", @update:value="onTagChanged")
                    div.four.wide.column.px-0.font-size-12.text-right.py-2 STAFF
                    LabelPicker(url="/api/database/staffs", placeholder="搜索STAFF", :value="staff", @update:value="onStaffChanged")
            PageSelector(:max="pageMax", :current="page", @changed="onPageChanged")
            div(v-if="totalNum != null") 共{{totalNum}}条记录
</template>

<script lang="ts">
import {defineComponent, ref, reactive, watchEffect, Ref, toRef} from 'vue'
import SearchBox, { SearchEvent } from '@/components/SearchBox.vue'
import SortSelector, { ChangedEvent as SortChangedEvent } from '@/components/SortSelector.vue'
import ItemSelector, { ChangedEvent as ItemChangedEvent } from '@/components/ItemSelector.vue'
import PageSelector, { ChangedEvent as PageChangedEvent } from '@/components/PageSelector.vue'
import DatePicker, { ChangedEvent as DateChangedEvent } from '@/components/DatePicker.vue'
import LabelPicker from '@/layouts/animation/list/LabelPicker.vue'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import { publishTypes, originalWorkTypes, sexLimitLevels, violenceLimitLevels } from '@/definitions/animation-definition'
import { toNameSet } from '@/definitions/util'
import { useAuth } from '@/functions/auth'
import { useSWR } from '@/functions/server'
import { useRouterQueryUtil } from '@/functions/routers'
import { useSort, usePagination, useSelector } from '@/functions/parameters'
import config from '@/config'

const img = require('@/assets/empty_cover.jpg')

const orders = [
    {name: 'PUBLISH_TIME', title: '放送时间', icon: 'video icon', argument: ['publish_time', 'create_time']},
    {name: 'CREATE_TIME', title: '创建时间', icon: 'folder plus icon', argument: 'create_time'},
    {name: 'UPDATE_TIME', title: '更新时间', icon: 'pen nib icon', argument: 'update_time'},
    {name: 'SEX_LIMIT_LEVEL', title: '分级', icon: 'venus mars icon', forceIcon: true, argument: ['sex_limit_level,violence_limit_level', 'create_time']},
    {name: 'VIOLENCE_LIMIT_LEVEL', title: '分级', icon: 'hand rock outline icon', forceIcon: true, argument: ['violence_limit_level,sex_limit_level', 'create_time']}
]
const defaultOrderValue = "PUBLISH_TIME"
const defaultOrderDirection = -1

const limit = 16

export default defineComponent({
    components: {LabelPicker, SearchBox, SortSelector, ItemSelector, PageSelector, DatePicker},
    computed: {
        barItems: () => secondaryBarItems.database,
        orders() { return orders },
        publishTypes() { return publishTypes },
        originalWorkTypes() { return originalWorkTypes },
        sexLimitLevels() { return sexLimitLevels },
        violenceLimitLevels() { return violenceLimitLevels }
    },
    setup() {
        const { updateQuery, watchQuery } = useRouterQueryUtil({resetField: {field: 'page', value: undefined, excludes: ['order']}})

        const items = ref([])
        const totalNum: Ref<number | null> = ref(null)

        const search: Ref<string | undefined> = ref()
        const { page, pageMax, offset, pageToQuery, pageFromQuery } = usePagination(totalNum, limit)
        const { sortValue, sortDirection, order, sortToQuery, sortFromQuery } = useSort(orders, defaultOrderValue, defaultOrderDirection)
        const { selected: original, toQuery: originalToQuery, fromQuery: originalFromQuery } = useSelector(toNameSet(originalWorkTypes))
        const { selected: publishType, toQuery: publishTypeToQuery, fromQuery: publishTypeFromQuery } = useSelector(toNameSet(publishTypes))
        const { selected: sex, toQuery: sexToQuery, fromQuery: sexFromQuery } = useSelector(toNameSet(sexLimitLevels))
        const { selected: violence, toQuery: violenceToQuery, fromQuery: violenceFromQuery } = useSelector(toNameSet(violenceLimitLevels))
        const publishTime: Ref<string | undefined> = ref()
        const tag: Ref<string | undefined> = ref()
        const staff: Ref<string | undefined> = ref()

        const onSearch = (e: SearchEvent) => updateQuery('search', e.text)
        const onPageChanged = (e: PageChangedEvent) => updateQuery('page', pageToQuery(e.page))
        const onSortChanged = (e: SortChangedEvent) => updateQuery('order', sortToQuery(e.name, e.direction))
        const onOriginalChanged = (e: ItemChangedEvent) => updateQuery('original_work_type', originalToQuery(e.name))
        const onPublishTypeChanged = (e: ItemChangedEvent) => updateQuery('publish_type', publishTypeToQuery(e.name))
        const onSexChanged = (e: ItemChangedEvent) => updateQuery('sex_limit_level', sexToQuery(e.name))
        const onViolenceChanged = (e: ItemChangedEvent) => updateQuery('violence_limit_level', violenceToQuery(e.name))
        const onPublishTimeChanged = (e: DateChangedEvent) => updateQuery('publish_time', e.value || undefined)
        const onTagChanged = (value: string | undefined) => updateQuery('tag', value)
        const onStaffChanged = (value: string | undefined) => updateQuery('staff', value)
        
        watchQuery({
            'search'(value) { search.value = value || undefined },
            'page': pageFromQuery,
            'order': sortFromQuery,
            'original_work_type': originalFromQuery,
            'publish_type': publishTypeFromQuery,
            'sex_limit_level': sexFromQuery,
            'violence_limit_level': violenceFromQuery,
            'publish_time'(value) { publishTime.value = checkPublishTime(value) || undefined },
            'tag'(value) { tag.value = value || undefined },
            'staff'(value) { staff.value = value || undefined }
        })

        const fetcher = reactive({
            'search': search,
            'limit': limit, 
            'offset': offset,
            'order': order,
            'original_work_type': original,
            'publish_type': publishType,
            'sex_limit_level': sex,
            'violence_limit_level': violence,
            'publish_time': publishTime,
            'tag': tag,
            'staff': staff
        })

        const { loading, data } = useSWR('/api/database/animations', fetcher)

        watchEffect(() => {
            if(data.value) {
                items.value = data.value['result'].map(mapItem)
                totalNum.value = data.value['total']
            }else{
                items.value = []
                totalNum.value = null
            }
        })

        const { stats } = useAuth()

        return {
            search, onSearch,
            sortValue, sortDirection, onSortChanged, 
            page, pageMax, onPageChanged,
            original, onOriginalChanged,
            publishType, onPublishTypeChanged,
            sex, onSexChanged,
            violence, onViolenceChanged,
            publishTime, onPublishTimeChanged,
            tag, onTagChanged,
            staff, onStaffChanged,
            loading, items, totalNum,
            isStaff: toRef(stats, 'isStaff')
        }
    }
})

function mapItem(item: any) {
    return {
        id: item['id'],
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

function checkPublishTime(date: string | null): string | null {
    if(!date) return null
    else if(date.indexOf('-') >= 0) {
        try {
            const [year, month] = date.split('-', 2)
            return `${parseInt(year)}-${parseInt(month)}`
        }catch(e) {
            return null
        }
    }else{
        try {
            return parseInt(date).toString()
        }catch(e) {
            return null
        }
    }
}
</script>
