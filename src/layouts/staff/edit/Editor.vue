<template lang="pug">
div.ui.form
    div.ui.fields
        div.ui.twelve.wide.field
            div.ui.field
                label 名称
                input.ui.input
            div.ui.fields
                div.ui.eight.wide.field
                    label 原语言名称
                    input.ui.input
                div.ui.eight.wide.field
                    label 非正式备注名称
                    input.ui.input
        div.ui.four.wide.field
            div.ui.card
                a.image
                    img(:src="img")
    div.ui.fields
        div.ui.four.wide.field
            label 组织性质
            ItemSelector(:items="isOrganizations", :show-none="false")
        div.ui.twelve.wide.field
            label 职业分类
            ItemSelector(:items="occupations", :show-none="false")
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ItemSelector from '@/components/ItemSelector.vue'
import { isOrganizations, occupations } from '@/definitions/staff-definition'

const img = require('@/assets/empty_avatar.jpg')

export default defineComponent({
    components: {ItemSelector},
    computed: {
        img: () => img,
        isOrganizations: () => isOrganizations,
        occupations: () => occupations
    },
    setup() {

    }
})
</script>

<style scoped>

</style>