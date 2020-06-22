<template lang="pug">
div.ui.container
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
                div.ui.four.wide.column
                    div.ui.card
                        div.image
                            img(:src="img")
                div.ui.twelve.wide.column
                    div.ui.grid
                        div.ui.row
                            div.ui.thirteen.wide.column
                                h1.text.ui.header.is-inline-block 某科学的超电磁炮T
                                label.sub-header.mb-2 つある科学のレイルグンT / 科学超电磁炮T
                                div
                                    div.ui.tag.label 炮姐
                                    div.ui.tag.label 魔法禁书目录外传
                                    each item in ['轻百合', '科幻', '战斗']
                                        div.ui.label= item
                            div.ui.three.wide.column
                                div.ui.two.columns.grid
                                    div.ui.column.pr-1.pl-2
                                        div.ui.blue.fluid.right.label.text-center.px-0
                                            i.mr-0.mb-1.venus.mars.icon
                                            div R12
                                    div.ui.column.pl-1.pr-2
                                        div.ui.green.fluid.right.label.text-center.px-0
                                            i.mr-0.mb-1.hand.rock.outline.icon
                                            div 无暴力
                        div.ui.row
                            div.ui.column
                                div This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. This is a part of description. 
            div.ui.grid
                div.ui.labeled.button
                    div.ui.button.teal TV & Web
                    div.ui.left.pointing.basic.label 2020年04月
            div.mt-5 TODO 下次放送时间 & 放送时间表
            div TODO 单集时长
            div TODO 已发布/全部集数
            div TODO 原作类型
            div TODO 原作者(原案) & 制作公司 & STAFF
            template(v-if="true")
                div.ui.divider
                div.sub-title.mb-2 相关动画
                div.ui.four.columns.grid
                    each item in [{title: '魔法禁书目录', relation: '正传'}, {title: '魔法禁书目录II', relation: '正传'}, {title: '魔法禁书目录III', relation: '正传'}, {title: '某科学的超电磁炮', relation: '前作'}, {title: '某科学的超电磁炮S', relation: '前作'}, {title: '某科学的一方通行', relation: '同系列'}]
                        div.ui.column.pb-0
                            img.item-image(:src='img')
                            div.item-content
                                router-link.is-weight(to='')= item.title
                                div.font-size-13= item.relation

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { secondaryBarItems, detailItem } from '@/router/secondary-bar'

const img = require('@/assets/empty_avatar.jpg')

export default defineComponent({
    components: {},
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
    .item-image {
        width: 25%;
    }
    .item-content {
        width: 75%;
        padding-left: 2px;
        vertical-align: top;
        display: inline-block;
    }
</style>