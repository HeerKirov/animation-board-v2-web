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
                div.column(v-for="i in list")
                    div.ui.card
                        router-link.image(:to="{name: 'Animation.Detail', params: {id: 1}}")
                            img(:src='img')
                        div.content
                            router-link.header.font-size-14(:to="{name: 'Animation.Detail', params: {id: 1}}") {{i}}
                            div.meta
                                span.date.font-size-11 11/24话
                            label.font-size-11 2020年1月
        div.four.wide.column
            div.ui.segment.pb-4
                SearchBox
                div.ui.divider
                SortSelector.px-2(:items="orders", v-model:selected="sortValue", v-model:direction="sortDirection", @changed="onSortChanged")
                //- 当没有任何条件显示时，隐藏divier和grid
                template(v-if='openMoreFilter')
                    div.ui.divider
                    div.ui.stackable.grid
                        template(v-if='openMoreFilter')
                            div.four.wide.column.px-0.font-size-12.text-right.py-2 原作类型
                            div.twelve.wide.column.pt-1.pb-2
                                ItemSelector(:items="originalWorkTypes")
                        template(v-if='openMoreFilter')
                            div.four.wide.column.px-0.font-size-12.text-right.py-2 放送类型
                            div.twelve.wide.column.pt-1.pb-2
                                ItemSelector(:items="publishTypes")
                        template(v-if='openMoreFilter')
                            div.four.wide.column.px-0.font-size-12.text-right.py-2 
                                i.venus.mars.icon
                                = '分级'
                            div.twelve.wide.column.pt-1.pb-2
                                ItemSelector(:items="sexLimitLevels")
                        template(v-if='openMoreFilter')
                            div.four.wide.column.px-0.font-size-12.text-right.py-2 
                                i.hand.rock.outline.icon
                                = '分级'
                            div.twelve.wide.column.pt-1.pb-2
                                ItemSelector(:items="violenceLimitLevels")
                        template(v-if='openMoreFilter')
                            div.four.wide.column.px-0.font-size-12.text-right.py-2 放送时间
                            div.twelve.wide.column.pt-1.pb-2
                                DatePicker
                        template(v-if='openMoreFilter')
                            div.four.wide.column.px-0.font-size-12.text-right.py-2 标签
                            div.twelve.wide.column.py-2
                                TagFilter
                        template(v-if='openMoreFilter')
                            div.four.wide.column.px-0.font-size-12.text-right.py-2 STAFF
                            div.twelve.wide.column.py-2
                                StaffFilter
                //- vue控制逻辑时，哪一项有筛选条件，则脱离openMoreFilter条件单独显示。如果所有的都脱离，那么此条件默认为true。
                template(v-if='!openMoreFilter')
                    div.ui.divider
                    button.ui.tertiary.mini.button(style="margin: 0 2.5px !important", @click="onOpenMoreFilter") 更多筛选条件...
            PageSelector(:total="448", :limit="20", v-model:offset="offset", @changed="onPageChanged")
            div 共414条记录

</template>

<script>
import { defineComponent, ref, watch, watchEffect, reactive, toRef, computed } from 'vue'
import TagFilter from '@/layouts/animation/list/TagFilter.vue'
import StaffFilter from '@/layouts/animation/list/StaffFilter.vue'
import SearchBox from '@/components/SearchBox.vue'
import SortSelector from '@/components/SortSelector.vue'
import ItemSelector from '@/components/ItemSelector.vue'
import PageSelector from '@/components/PageSelector.vue'
import DatePicker from '@/components/DatePicker.vue'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import { publishTypes, originalWorkTypes, sexLimitLevels, violenceLimitLevels, withoutColor } from '@/definitions/animation-definition'
import {useSWR} from '@/functions/swr'
import config from '@/config'

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
        const fetcher = reactive({query: {limit: 20, offset}})
        watch(fetcher, v => console.log(`offset changed: ${v.query.offset}`))

        const swr = useSWR(`${config.SERVER_URL}/api/database/animations`, 'GET', fetcher)

        watchEffect(() => console.log(swr))

        const openMoreFilter = ref(false)

        const onOpenMoreFilter = () => {
            if(openMoreFilter.value == false) {
                openMoreFilter.value = true
            }
        }

        const sortValue = ref("PUBLISH_TIME")
        const sortDirection = ref(-1)
        const onSortChanged = e => {
            
        }

        const offset = toRef(fetcher.query, 'offset')
        const onPageChanged = e => {
            
        }

        const list = computed(() => swr.data ? swr.data['result'].map(i => i.title) : [])

        return {
            openMoreFilter, onOpenMoreFilter,
            sortValue, sortDirection, onSortChanged, 
            offset, onPageChanged,
            list, 
            img
        }
    }
})
</script>