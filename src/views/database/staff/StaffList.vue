<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'staff'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
        router-link.right.item(v-if="isStaff", :to="{name: 'Staff.New'}")
            i.plus.icon
            = '新建'
    div.ui.grid
        div.twelve.wide.column
            div.ui.stackable.three.columns.grid
                div.column(v-for="item in items")
                    div.ui.segment.p-2
                        router-link(:to="{name: 'Staff.Detail', params: {id: item.id}}")
                            img.item-image(:src="item.cover")
                        div.item-content
                            div.is-weight 
                                router-link(:to="{name: 'Staff.Detail', params: {id: item.id}}") {{item.name}}
                            div.font-size-12 {{item.otherName}}
                            div.font-size-12
                                i.kaaba.icon(v-if="item.isOrganization")
                                i.user.icon(v-else)
                                span {{item.occupation}}
        div.four.wide.column
            div.ui.segment.pb-4
                SearchBox(:value="search", @search="onSearch")
                div.ui.divider
                SortSelector.px-2(:items="orders", :selected="sortValue", :direction="sortDirection", @changed="onSortChanged")
                div.ui.divider
                div.ui.stackable.grid
                    div.four.wide.column.px-0.font-size-12.text-right.py-2 组织性质
                    div.twelve.wide.column.pt-1.pb-2
                        ItemSelector(:items="isOrganizations", :selected="org", @changed="onOrgChanged")
                    div.four.wide.column.px-0.font-size-12.text-right.py-2 职业分类
                    div.twelve.wide.column.pt-1.pb-2
                        ItemSelector(:items="occupations", :selected="occupation", @changed="onOccupationChanged")
            PageSelector(:max="pageMax", :current="page", @changed="onPageChanged")
            div.mt-2(v-if="totalNum != null") 共{{totalNum}}条记录
</template>

<script lang="ts">
import { defineComponent, ref, Ref, reactive, watchEffect, toRef } from 'vue'
import SortSelector, { ChangedEvent as SortChangedEvent } from '@/components/SortSelector.vue'
import SearchBox, { SearchEvent } from '@/components/SearchBox.vue'
import PageSelector, { ChangedEvent as PageChangedEvent } from '@/components/PageSelector.vue'
import ItemSelector, { ChangedEvent as ItemChangedEvent } from '@/components/ItemSelector.vue'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import { isOrganizations, occupations } from '@/definitions/staff-definition'
import { toMap, toNameSet } from '@/definitions/util'
import { toSubTitle } from '@/functions/display'
import { useRouterQueryUtil } from '@/functions/routers'
import { usePagination, useSort, useSelector } from '@/functions/parameters'
import { useAuth } from '@/functions/auth'
import { useSWR } from '@/functions/server'
import cover from '@/plugins/cover'

const occupationMap = toMap(occupations)

const orders = [
    {name: 'NAME', title: '名称', icon: 'tags icon', argument: 'name'},
    {name: 'CREATE_TIME', title: '创建时间', icon: 'folder plus icon', argument: 'create_time'},
    {name: 'UPDATE_TIME', title: '更新时间', icon: 'pen nib icon', argument: 'update_time'}
]
const defaultOrderValue = "CREATE_TIME"
const defaultOrderDirection = -1

const limit = 24

export default defineComponent({
    components: {SearchBox, SortSelector, ItemSelector, PageSelector},
    computed: {
        barItems: () => secondaryBarItems.database,
        orders: () => orders,
        isOrganizations: () => isOrganizations,
        occupations: () => occupations
    },
    setup() {
        const { updateQuery, watchQuery } = useRouterQueryUtil({resetField: {field: 'page', value: undefined, excludes: ['order']}})

        const items = ref([])
        const totalNum: Ref<number | null> = ref(null)

        const search: Ref<string | undefined> = ref()
        const { page, pageMax, offset, pageToQuery, pageFromQuery } = usePagination(totalNum, limit)
        const { sortValue, sortDirection, order, sortToQuery, sortFromQuery } = useSort(orders, defaultOrderValue, defaultOrderDirection)
        const { selected: occupation, toQuery: occupationToQuery, fromQuery: occupationFromQuery } = useSelector(toNameSet(occupations))
        const { selected: org, toQuery: orgToQuery, fromQuery: orgFromQuery } = useSelector(toNameSet(isOrganizations), null, "lower")

        const onSearch = (e: SearchEvent) => updateQuery('search', e.text)
        const onPageChanged = (e: PageChangedEvent) => updateQuery('page', pageToQuery(e.page))
        const onSortChanged = (e: SortChangedEvent) => updateQuery('order', sortToQuery(e.name, e.direction))
        const onOccupationChanged = (e: ItemChangedEvent) => updateQuery('occupation', occupationToQuery(e.name))
        const onOrgChanged = (e: ItemChangedEvent) => updateQuery('is_organization', orgToQuery(e.name))

        watchQuery({
            'search'(value) { search.value = value || undefined },
            'page': pageFromQuery,
            'order': sortFromQuery,
            'occupation': occupationFromQuery,
            'is_organization': orgFromQuery
        })

        const fetcher = reactive({
            'search': search,
            'limit': limit, 
            'offset': offset,
            'order': order,
            'occupation': occupation,
            'is_organization': org
        })

        const { loading, data } = useSWR('/api/database/staffs', fetcher)

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
            occupation, onOccupationChanged,
            org, onOrgChanged,
            loading, items, totalNum,
            isStaff: toRef(stats, 'isStaff')
        }
    }
})

function mapItem(item: any) {
    return {
        id: item['id'],
        name: item['name'],
        otherName: toSubTitle(item['origin_name'], item['remark']),
        isOrganization: item['is_organization'],
        occupation: item['occupation'] ? occupationMap[item['occupation']].title : null,
        cover: cover.staffOrEmpty(item['cover'])
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
</style>
