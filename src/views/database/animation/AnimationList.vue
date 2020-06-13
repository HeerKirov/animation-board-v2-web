<template lang='pug'> 
div.columns
    div.column.is-9
        div.columns.is-multiline.is-mobile.ml-1.mr-1
            div.column.is-one-fifth-widescreen.is-3-desktop.is-one-third-mobile(v-for="i in list")
                div
                    figure.image.is-1by1
                        img(:src='img')
                    div.content.ml-1.mt-2.mr-1
                        p.title.is-6.has-text-dark {{i}}
                        p.is-size-7 2020年1月
    div.column
        div.notification
            p.level-item
                a.button.is-success
                    i.fa.fa-plus.mr-1
                    = '新建'
            p.level-item.has-icons.right.control
                input.input(type="text")
                span.icon.is-small.is-right
                    i.fa.fa-search
</template>

<script>
import { defineComponent } from 'vue'

const img = require('@/assets/empty_avatar.jpg')

export default defineComponent(function() {
    return {list: [
        "辉夜大小姐想让我告白？ ～天才们的恋爱头脑战～",
        "某科学的超电磁炮T",
        "隐瞒之事",
        "邪神与厨二病少女",
        "BNA",
        "放学后海堤日记",
        "转生成为了只有乙女游戏破灭Flag的邪恶大小姐",
        "恋爱小行星"
    ], img}
})
</script>
