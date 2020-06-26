<template lang="pug">
div.ui.secondary.pointing.menu
    router-link.item(v-for="item in barItems", :class="{active: item.name === 'detail'}", :to="item.link")
        i(:class="item.icon")
        = '{{item.title}}'
    a.right.item 
        i.edit.icon
        = '编辑'
div.ui.grid
    div.ui.centered.row
        h2.ui.icon.header
            i.tag.icon
            div.content 轻百合
                div.sub.header 轻百合～
    div.ui.row
        div.ui.twelve.wide.centered.column
            span.is-weight 相关动画
            div.ui.three.columns.grid
                each item in [{title: '魔法禁书目录', relation: '正传'}, {title: '魔法禁书目录II', relation: '正传'}, {title: '魔法禁书目录III', relation: '正传'}, {title: '某科学的超电磁炮', relation: '前作'}, {title: '某科学的超电磁炮S', relation: '前作'}, {title: '某科学的一方通行', relation: '同系列'}]
                    div.column.pb-0
                        a
                            img.relations.item-image(:src='img')
                        div.relations.item-content
                            router-link.is-weight(to='')= item.title
                            div.font-size-13= item.relation
            div.mt-4
                a.ui.tertiary.button.right.floated 查看更多
                    i.right.double.angle.icon
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { secondaryBarItems, detailItem } from '@/definitions/secondary-bar'

const img = require('@/assets/empty_avatar.jpg')

export default defineComponent({
    computed: {
        img: () => img,
        barItems: () => [secondaryBarItems.database.tag, detailItem]
    },
    setup() {

    }
})
</script>

<style scoped>
    .relations.item-image {
        width: 25%;
    }
    .relations.item-content {
        width: 75%;
        padding-left: 2px;
        vertical-align: top;
        display: inline-block;
    }
</style>