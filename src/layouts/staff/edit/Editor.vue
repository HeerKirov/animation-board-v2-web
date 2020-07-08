<template lang="pug">
div.ui.form
    div.ui.fields
        div.ui.twelve.wide.field
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
        div.ui.four.wide.field
            div.ui.card
                a.image
                    img(:src="emptyAvatar")
    div.ui.fields
        div.ui.four.wide.field
            label 组织性质
            ItemSelector(:items="isOrganizations", :show-none="false", :selected="data.isOrganization.toString()", @update:selected="v => { data.isOrganization = v === 'true' }")
        div.ui.twelve.wide.field
            label 职业分类
            ItemSelector(:items="occupations", :show-none="false", v-model:selected="data.occupation")
</template>

<script lang="ts">
import { defineComponent, inject, ref, watch, isRef, isReactive, PropType } from 'vue'
import InputBox from '@/components/InputBox.vue'
import ItemSelector, { ChangedEvent as ItemChangedEvent } from '@/components/ItemSelector.vue'
import { isOrganizations, occupations } from '@/definitions/staff-definition'

const emptyAvatar = require('@/assets/empty_avatar.jpg')

export interface Instance {
    name: string
    originName: string | null
    remark: string | null
    isOrganization: boolean
    occupation: string | null
    cover: string | Blob | null
}

function defaultInstance(): Instance {
    return {
        name: '',
        originName: null,
        remark: null,
        isOrganization: false,
        occupation: null,
        cover: null
    }
}

//TODO create页面不做任何更改直接submit的情况怎么处理？也就是仍然需要一个提交前的临时检查
export default defineComponent({
    components: {InputBox, ItemSelector},
    props:{
        modelValue: (null as any) as PropType<Instance | null>
    },
    emits:['update:modelValue'],
    computed: {
        emptyAvatar: () => emptyAvatar,
        isOrganizations() { return isOrganizations },
        occupations() { return occupations }
    },
    setup(props, {emit}) {
        const data = ref(props.modelValue || defaultInstance())

        let anyError = false

        watch(() => props.modelValue, () => {
            if(props.modelValue != undefined) {
                data.value = props.modelValue || defaultInstance()
            }
        })

        watch(data, () => {
            if(data.value.name === undefined ||
                data.value.originName === undefined ||
                data.value.remark === undefined) {
                if(!anyError) {
                    emit('update:modelValue', undefined)
                    anyError = true
                }
            }else if(anyError) {
                emit('update:modelValue', data)
                anyError = false
            }
        }, {deep: true})

        return {data}
    }
})
</script>

<style scoped>

</style>
