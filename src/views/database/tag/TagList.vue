<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'tag'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
        router-link.right.item(:to="{name: 'Tag.New'}")
            i.plus.icon
            = '新建'
    div.ui.grid
        div.twelve.wide.column
            div.ui.segment.px-6
                router-link.ui.large.label.mr-2(v-for="item in tags", :to="{name: 'Tag.Detail', params: {id: 1}}") {{item.name}}
        div.four.wide.column
            div.ui.segment.pb-4
                SearchBox
                div.ui.divider
                SortSelector.px-2(:items="orders")
                div.mt-2 共45条记录
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SortSelector from '@/components/SortSelector.vue'
import SearchBox from '@/components/SearchBox.vue'
import { secondaryBarItems } from '@/definitions/secondary-bar'

const orders = [
    {name: 'NAME', title: '名称', icon: 'tags icon', argument: 'name'},
    {name: 'CREATE_TIME', title: '创建时间', icon: 'folder plus icon', argument: 'create_time'},
    {name: 'UPDATE_TIME', title: '更新时间', icon: 'pen nib icon', argument: 'update_time'}
]

export default defineComponent({
    components: {SearchBox, SortSelector},
    computed: {
        barItems: () => secondaryBarItems.database,
        orders: () => orders,
    },
    setup() {
        const tags = [{name: '科幻'}, {name: '奇幻'}, {name: '魔幻'}, {name: '神幻'}, {name: '轻百合'}, {name: '百合'}]
        return {tags}
    }
})
</script>