<template lang='pug'>
section.hero.is-bold.is-primary
    div.hero-body
        div.container
            h1.title 动画数据库
    div.hero-foot
        div.container.level
            div.level-left
                TabBar(:items="secondaryBarItems")
            div.level-right
                TabBar.mr-2(:items="[{title: '新建', icon: 'fa-plus', link: '/database/animations/new'}]")
div.container.mt-5
    div.columns.ml-1.mr-1
        div.column.is-9
            div.columns.is-multiline.is-mobile
                div.column.is-one-fifth-widescreen.is-3-desktop.is-3-tablet.is-one-third-mobile(v-for="i in list")
                    div
                        figure.image.is-1by1
                            img(:src='img')
                        div.content.ml-1.mt-2.mr-1
                            p.title.is-6.has-text-dark {{i}}
                            p.is-size-7 2020年1月
        div.column
            div.notification
                SearchInput
                div.mt-3 放送类型
                    a TV & Web
                    a 剧场版
                    a OVA & OAD
</template>

<script>
import { defineComponent } from 'vue'
import TabBar from '@/components/elements/TabBar.vue'
import SearchInput from '@/components/elements/SearchInput.vue'
import { useSecondaryBarItems } from '@/router/nav'

const img = require('@/assets/empty_avatar.jpg')

export default defineComponent({
    components: {TabBar, SearchInput},
    setup() {
        const secondaryBarItems = useSecondaryBarItems('database', 'animation')

        return {
            secondaryBarItems,
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
