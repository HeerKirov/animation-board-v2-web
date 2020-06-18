<template lang='pug'>
div.ui.container
    div.ui.secondary.pointing.menu
        a.item.active 
            i.film.icon
            = '动画'
        a.item 
            i.tags.icon
            = '标签'
        a.item 
            i.users.icon
            = 'STAFF'
        a.right.item 
            i.plus.icon
            = '新建'
    div.ui.grid
        div.twelve.wide.column
            div.ui.stackable.four.columns.grid
                div.column(v-for="i in list")
                    div.ui.card
                        router-link.image(to='/database/animations/detail/1')
                            img(:src='img')
                        div.content
                            router-link.header.font-size-14(to='/database/animations/detail/1') {{i}}
                            div.meta
                                span.date.font-size-11 11/24话
                            label.font-size-11 2020年1月
        div.four.wide.column
            div.ui.segment
                SearchInput
                div.ui.divider
                SortSelector.px-2(:items="orders", v-model="sortValue", v-model:direction="sortDirection", @changed="onSortChanged")
                div.ui.divider
                //- vue控制逻辑时，哪一项有筛选条件，则脱离openMoreFilter条件单独显示。如果所有的都脱离，那么此条件默认为true。
                button.ui.tertiary.mini.button(style="margin: 0 2.5px !important", v-if='!openMoreFilter', @click="onOpenMoreFilter") 更多筛选条件...

            div.columns(v-if='openMoreFilter')
                div.column.is-4.pr-0.is-size-7.is-weight 放送时间
                div.column.pl-0.is-size-7.has-text-black 2020 年 4 月
                    i.fa.fa-close.ml-1
            div.columns(v-if='openMoreFilter')
                div.column.is-4.pr-0.is-size-7.is-weight 放送类型
                div.column.pl-0.is-size-7.has-text-black
                    div.columns.is-multiline.is-mobile.pb-2
                        div.column.pb-0.is-nowrap.is-6-desktop.is-6-tablet.is-3-mobile(v-for='v, i in publishTypes', :class="{'has-text-info': i == '_'}") {{v}}
            div.columns(v-if='openMoreFilter')
                div.column.is-4.pr-0.is-size-7.is-weight 原作类型
                div.column.pl-0.is-size-7.has-text-black
                    div.columns.is-multiline.is-mobile.pb-2
                        div.column.pb-0.is-nowrap.is-3-desktop.is-4-tablet.is-2-mobile(v-for='v, i in originalWorkTypes', :class="{'has-text-info': i == '_'}") {{v}}
            div.columns(v-if='openMoreFilter')
                div.column.is-4.pr-0.is-size-7.is-weight 分级
                    i.fa.fa-venus-mars.ml-1
                div.column.pl-0.is-size-7.has-text-black
                    div.columns.is-multiline.is-mobile.pb-2
                        div.column.pb-0.is-nowrap.is-3-desktop.is-4-tablet.is-2-mobile(v-for='v, i in sexLimitLevels', :class="{'has-text-info': i == '_'}") {{v}}
            div.columns(v-if='openMoreFilter')
                div.column.is-4.pr-0.is-size-7.is-weight 分级
                    i.fa.fa-hand-grab-o.ml-1
                div.column.pl-0.is-size-7.has-text-black
                    div.columns.is-multiline.is-mobile.pb-2
                        div.column.pb-0.is-nowrap.is-3-desktop.is-4-tablet.is-2-mobile(v-for='v, i in violenceLimitLevels', :class="{'has-text-info': i == '_'}") {{v}}
            div.columns(v-if='openMoreFilter')
                div.column.is-4.pr-0.is-size-7.is-weight 标签过滤
                div.column.pl-0.is-size-7.has-text-black
                    i.fa.fa-plus
            div.columns(v-if='openMoreFilter')
                div.column.is-4.pr-0.is-size-7.is-weight STAFF过滤
                div.column.pl-0.is-size-7.has-text-black
                    span.has-text-dark 作为STAFF的 
                    span 庵野秀明
                    i.fa.fa-close.ml-1
            //- TODO 排序组件化
            div.ui.mini.borderless.nine.item.menu
                a.item: i.angle.double.left.icon
                a.item: i.angle.left.icon
                each item in [1, 2, 3, 4, 5]
                    a.item= item
                a.item: i.angle.right.icon
                a.item: i.angle.double.right.icon
            div 共414条记录

</template>

<script>
import { defineComponent, ref, watch } from 'vue'
import TabBar from '@/components/elements/TabBar.vue'
import SearchInput from '@/components/elements/SearchInput.vue'
import SortSelector from '@/components/elements/SortSelector.vue'
import { useSecondaryBarItems } from '@/router/nav'

const img = require('@/assets/empty_avatar.jpg')

const orders = [
    {name: 'PUBLISH_TIME', title: '放送时间', icon: 'video icon', argument: ['publish_time', 'create_time']},
    {name: 'CREATE_TIME', title: '创建时间', icon: 'folder plus icon', argument: 'create_time'},
    {name: 'UPDATE_TIME', title: '更新时间', icon: 'pen nib icon', argument: 'update_time'},
    {name: 'SEX_LIMIT_LEVEL', title: '分级', icon: 'venus mars icon', forceIcon: true, argument: ['sex_limit_level,violence_limit_level', 'create_time']},
    {name: 'VIOLENCE_LIMIT_LEVEL', title: '分级', icon: 'hand rock outline icon', forceIcon: true, argument: ['violence_limit_level,sex_limit_level', 'create_time']}
]
const publishTypes = {_: '全部', TV_AND_WEB: 'TV&Web', OVA_AND_OAD: 'OVA&OAD', MOVIE: '剧场版动画'}
const originalWorkTypes = {_: '全部', MANGA: '漫画', NOVEL: '小说', GAME: '游戏', ORIGINAL: '原创', OTHER: '其他'}
const sexLimitLevels = {_: '全部', ALL: '全年龄', R12: 'R12', R15: 'R15', R17: 'R17', R18: 'R18'}
const violenceLimitLevels = {_: '全部', NO: '无暴力', NORMAL: 'A', MILD: 'B', SEVERE: 'C', RESTRICTED: 'D'}

export default defineComponent({
    components: {TabBar, SearchInput, SortSelector},
    computed: {
        orders: () => orders,
        publishTypes: () => publishTypes,
        originalWorkTypes: () => originalWorkTypes,
        sexLimitLevels: () => sexLimitLevels,
        violenceLimitLevels: () => violenceLimitLevels
    },
    setup() {
        const secondaryBars = useSecondaryBarItems('database', 'animation')

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

        return {
            secondaryBars,
            openMoreFilter, onOpenMoreFilter,
            sortValue, sortDirection, onSortChanged,
            list: [
                "辉夜大小姐想让我告白？ ～天才们的恋爱头脑战～",
                "某科学的超电磁炮T",
                "隐瞒之事",
                "邪神与厨二病少女",
                "BNA",
                "放学后海堤日记",
                "转生成为了只有乙女游戏破灭Flag的邪恶大小姐",
                "恋爱小行星"
            ], 
            img
        }
    }
})
</script>

<style scoped>
    .is-nowrap {
        white-space: nowrap;
    }
    .is-weight {
        font-weight: 450
    }
    .is-radius {
        border-radius: .285rem;
    }
</style>