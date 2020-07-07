<template lang="pug">
div.ui.form
    div.ui.fields
        div.ui.twelve.wide.field
            div.ui.field
                label 名称
                input.ui.input(v-model="data.name")
            div.ui.fields
                div.ui.eight.wide.field
                    label 原语言名称
                    input.ui.input(v-model="data.originName")
                div.ui.eight.wide.field
                    label 非正式备注名称
                    input.ui.input(v-model="data.remark")
        div.ui.four.wide.field
            div.ui.card
                a.image
                    img(:src="emptyCover")
    div.ui.fields
        div.ui.four.wide.field
            label 组织性质
            ItemSelector(:items="isOrganizations", :show-none="false", :selected="data.isOrganization.toString()", @changed="onOrgChanged")
        div.ui.twelve.wide.field
            label 职业分类
            ItemSelector(:items="occupations", :show-none="false", v-model:selected="data.occupation")
</template>

<script lang="ts">
import { defineComponent, inject, ref, watch, isRef, isReactive } from 'vue'
import ItemSelector, { ChangedEvent as ItemChangedEvent } from '@/components/ItemSelector.vue'
import { isOrganizations, occupations } from '@/definitions/staff-definition'
import { editorInjectionKey } from '@/definitions/injections'

const emptyCover = require('@/assets/empty_cover.jpg')

export interface Instance {
    name: string
    originName: string | null
    remark: string | null
    isOrganization: boolean
    occupation: string
    cover: string | null
}

const defaultInstance = {
    name: '',
    originName: null,
    remark: null,
    isOrganization: false,
    occupation: null,
    cover: null
}

//TODO 完成参数合法性检查，优化数据输出手段
export default defineComponent({
    components: {ItemSelector},
    computed: {
        emptyCover: () => emptyCover,
        isOrganizations() { return isOrganizations },
        occupations() { return occupations }
    },
    setup() {
        const {} = inject(editorInjectionKey)!

        const onOrgChanged = (e: ItemChangedEvent) => { data.value.isOrganization = e.name == "true" }

        return {data, onOrgChanged}
    }
})
</script>

<style scoped>

</style>
