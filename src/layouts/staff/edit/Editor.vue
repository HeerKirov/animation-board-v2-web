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
                a.image(@click="onClickUpload")
                    img(:src="data.cover || emptyAvatar")
    div.ui.fields
        div.ui.four.wide.field
            label 组织性质
            ItemSelector(:items="isOrganizations", :show-none="false", :selected="data.isOrganization.toString()", @update:selected="v => { data.isOrganization = v === 'true' }")
        div.ui.twelve.wide.field
            label 职业分类
            ItemSelector(:items="occupations", :show-none="false", v-model:selected="data.occupation")
    input.hidden-input(type="file", ref="uploader", @change="onUpload")
</template>

<script lang="ts">
import { defineComponent, ref, watch, PropType, Ref } from 'vue'
import InputBox from '@/components/InputBox.vue'
import ItemSelector, { ChangedEvent as ItemChangedEvent } from '@/components/ItemSelector.vue'
import { isOrganizations, occupations } from '@/definitions/staff-definition'
import { watchEditorValidate } from '@/functions/editor'

const emptyAvatar = require('@/assets/empty_avatar.jpg')

export interface Instance {
    id: number | null
    name: string | undefined
    originName: string | null | undefined
    remark: string | null | undefined
    isOrganization: boolean
    occupation: string | null
    cover: string | null
    coverFile: File | null
}

function defaultInstance(): Instance {
    return {
        id: null,
        name: undefined,
        originName: null,
        remark: null,
        isOrganization: false,
        occupation: null,
        cover: null,
        coverFile: null
    }
}

export default defineComponent({
    components: {InputBox, ItemSelector},
    props:{
        value: (null as any) as PropType<Instance | null>
    },
    emits:['update:value'],
    computed: {
        emptyAvatar: () => emptyAvatar,
        isOrganizations() { return isOrganizations },
        occupations() { return occupations }
    },
    setup(props, {emit}) {
        const data = ref(props.value || defaultInstance())

        watch(() => props.value, () => {
            if(props.value != undefined) {
                data.value = props.value || defaultInstance()
            }
        })

        watchEditorValidate(data, v => emit('update:value', v), v => {
            return v.name === undefined
                || v.originName === undefined
                || v.remark === undefined
        })

        const imageUploader = useImageUploader(data)

        return {data, ...imageUploader}
    }
})

function useImageUploader(data: Ref<Instance>) {
    const uploader: Ref<any> = ref(null)

    const onClickUpload = () => { uploader.value.click() }

    const onUpload = () => {
        let file = uploader.value.files[0]
        if(file != undefined) {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onloadend = e => {
                data.value.cover = e.target?.result?.toString() ?? null
            }
            data.value.coverFile = file
        }
    }

    return {uploader, onClickUpload, onUpload}
}
</script>

<style scoped>
    .hidden-input {
        visibility: hidden; 
        height: 0; 
        padding: 0 !important; 
        border: 0 !important;
    }
</style>
