<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'staff'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
        router-link.right.item(:to="{name: 'Staff.New'}")
            i.plus.icon
            = '新建'
    div.ui.grid
        div.twelve.wide.column
            div.ui.stackable.three.columns.grid
                div.column(v-for="i in list")
                    div.ui.segment.p-2
                        router-link(:to="{name: 'Staff.Detail', params: {id: 1}}")
                            img.item-image(:src="img")
                        div.item-content
                            div.is-weight 
                                router-link(:to="{name: 'Staff.Detail', params: {id: 1}}") {{i}}
                            div.font-size-12 {{i}} / {{i}}
                            div.font-size-12
                                i.user.icon
                                span 动画制作人员
        div.four.wide.column
            div.ui.segment.pb-4
                SearchBox
                div.ui.divider
                SortSelector.px-2(:items="orders")
                div.ui.divider
                div.ui.stackable.grid
                    div.four.wide.column.px-0.font-size-12.text-right.py-2 组织性质
                    div.twelve.wide.column.pt-1.pb-2
                        ItemSelector(:items="isOrganizations")
                    div.four.wide.column.px-0.font-size-12.text-right.py-2 职业分类
                    div.twelve.wide.column.pt-1.pb-2
                        ItemSelector(:items="occupations")
            PageSelector(:total="300", :limit="20")
            div.mt-2 共45条记录
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SortSelector from '@/components/SortSelector.vue'
import SearchBox from '@/components/SearchBox.vue'
import ItemSelector from '@/components/ItemSelector.vue'
import PageSelector from '@/components/PageSelector.vue'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import { isOrganizations, occupations } from '@/definitions/staff-definition'

const img = require('@/assets/empty_avatar.jpg')

const orders = [
    {name: 'NAME', title: '名称', icon: 'tags icon', argument: 'name'},
    {name: 'CREATE_TIME', title: '创建时间', icon: 'folder plus icon', argument: 'create_time'},
    {name: 'UPDATE_TIME', title: '更新时间', icon: 'pen nib icon', argument: 'update_time'}
]

export default defineComponent({
    components: {SearchBox, SortSelector, ItemSelector, PageSelector},
    computed: {
        img: () => img,
        barItems: () => secondaryBarItems.database,
        orders: () => orders,
        isOrganizations: () => isOrganizations,
        occupations: () => occupations
    },
    setup() {
        const list = ['今石洋之', 'J.C.STAFF']
        return {list}
    }
})
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