<template lang="pug">
div.ui.form
    div.ui.field
        label 名称
        InputBox(v-model="data.name", :max-length="64", :not-blank="true")
    div.ui.fields
        div.ui.eight.wide.field
            label 原语言名称
            InputBox(v-model="data.originName", :max-length="64")
        div.ui.eight.wide.field
            label 非正式备注名称
            InputBox(v-model="data.remark", :max-length="64")
    div.ui.fields
        div.ui.five.wide.field
            label 组织性质
            ItemSelector(:items="isOrganizations", :show-none="false", :selected="data.isOrganization.toString()", @update:selected="v => { data.isOrganization = v === 'true' }")
        div.ui.eleven.wide.field
            label 职业分类
            ItemSelector(:items="occupations", :show-none="false", v-model:selected="data.occupation")
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import InputBox from '@/components/InputBox.vue'
import ItemSelector from '@/components/ItemSelector.vue'
import { isOrganizations, occupations } from '@/definitions/staff-definition'
import { watchEditorValidate } from '@/functions/editor'
import { Instance, defaultInstance } from './Editor.vue'

export default defineComponent({
    components: {InputBox, ItemSelector},
    props: {
        defaultName: String
    },
    emits:['update:value'],
    computed: {
        isOrganizations() { return isOrganizations },
        occupations() { return occupations }
    },
    setup(props, {emit}) {
        const data = ref(defaultInstance())
        watch(() => props.defaultName, () => {
            if(props.defaultName?.trim()) {
                data.value.name = props.defaultName.trim()
                emit('update:value', data.value)
            }
        }, {immediate: true})

        watchEditorValidate<Instance>(data, v => emit('update:value', v), v => {
            return v.name === undefined
                || v.originName === undefined
                || v.remark === undefined
        })

        return {data}
    }
})
</script>
