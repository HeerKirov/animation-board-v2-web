<template lang="pug">
div.ui.secondary.pointing.menu
    router-link.item(v-for="item in barItems", :class="{active: item.name === 'detail'}", :to="item.link")
        i(:class="item.icon")
        = '{{item.title}}'
    a.right.item 
        i.edit.icon
        = '编辑'
div.ui.centered.grid
    div.ui.fourteen.wide.column
        div.ui.grid
            div.four.wide.column
                img.cover-image(:src="img")
            div.twelve.wide.column
                div.ui.grid
                    div.row
                        div.thirteen.wide.column
                            h1.text.ui.header.is-inline-block 某科学的超电磁炮T
                            label.sub-header.mb-2 つある科学のレイルグンT / 科学超电磁炮T
                            div
                                div.ui.tag.label 炮姐
                                div.ui.tag.label 魔法禁书目录外传
                                each item in ['轻百合', '科幻', '战斗']
                                    div.ui.label= item
                        div.three.wide.column
                            div.ui.two.columns.grid
                                div.column.pr-1.pl-2
                                    div.ui.blue.fluid.right.label.text-center.px-0
                                        i.mr-0.mb-1.venus.mars.icon
                                        div R12
                                div.column.pl-1.pr-2
                                    div.ui.green.fluid.right.label.text-center.px-0
                                        i.mr-0.mb-1.hand.rock.outline.icon
                                        div 无暴力
                    div.row
                        div.column
                            div This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. 
        div.ui.grid
            div.four.wide.column
                div.ui.teal.large.fluid.label 
                    span.px-3 TV & Web
                    div.detail.ml-1 24分钟
            div.twelve.wide.column.pl-0
                span.ui.left.pointing.basic.label.large 2020年4月
                span.ml-3.is-weight 已发布15话，共24话
        div.ui.stackable.grid
            div.four.wide.column
                div.ui.stackable.grid.staff.list
                    div.seven.wide.column.staff.item-header
                        div.ui.red.label 漫画
                            div.detail.ml-2 原作
                    div.nine.wide.column.staff.item-content
                        router-link.ui.tertiary.mini.button(to='') 镰池和马
                        router-link.ui.tertiary.mini.button(to='') 冬川基
                    div.seven.wide.column.staff.item-header
                        div.ui.label 制作公司
                    div.nine.wide.column.staff.item-content
                        router-link.ui.tertiary.mini.button(to='') J.C.STAFF
                    div.seven.wide.column.staff.item-header
                        div.ui.label STAFF
                    div.nine.wide.column.staff.item-content
                        router-link.ui.tertiary.mini.button(to='') 有谁来着
            div.six.wide.column
                DiaryPanel
            div.six.wide.column(v-if="true")
                div.ui.segment
                    i.bookmark.icon
            div.six.wide.column(v-else)
                div.ui.placeholder.segment.min-height-0
                    i.bookmark.icon
        template(v-if="true")
            div.ui.divider
            div.sub-title.mb-2 相关动画
            div.ui.four.columns.grid
                each item in [{title: '魔法禁书目录', relation: '正传'}, {title: '魔法禁书目录II', relation: '正传'}, {title: '魔法禁书目录III', relation: '正传'}, {title: '某科学的超电磁炮', relation: '前作'}, {title: '某科学的超电磁炮S', relation: '前作'}, {title: '某科学的一方通行', relation: '同系列'}]
                    div.column.pb-0
                        a
                            img.relations.item-image(:src='img')
                        div.relations.item-content
                            router-link.is-weight(to='')= item.title
                            div.font-size-13= item.relation
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import DiaryPanel from './DiaryPanel.vue'
import { secondaryBarItems, detailItem } from '@/router/secondary-bar'

const img = require('@/assets/empty_avatar.jpg')

export default defineComponent({
    components: {DiaryPanel},
    computed: {
        img: () => img,
        barItems: () => [secondaryBarItems.database.animation, detailItem]
    },
    setup() {

    }
})
</script>

<style scoped>
    .sub-header {
        display: inline-block;
        vertical-align: top;
        margin-left: 10px;
        font-weight: 450;
        font-size: 12px;
    }
    .sub-title {
        font-weight: 450;
        font-size: 12px;
    }
    .cover-image {
        width: 100%;
    }
    .relations.item-image {
        width: 25%;
    }
    .relations.item-content {
        width: 75%;
        padding-left: 2px;
        vertical-align: top;
        display: inline-block;
    }
    .staff.list {
        padding-top: 0px !important;
    }
    .staff.item-header {
        padding: 2px 0px 8px 10px !important;
        text-align: right;
    }
    .staff.item-content {
        padding: 0px 1px 10px 2px !important;
    }
</style>