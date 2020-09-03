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
                a.image(@click="onUploadCover")
                    img(:src="data.cover || emptyAvatar")
    div.ui.fields
        div.ui.four.wide.field
            label 组织性质
            ItemSelector(:items="isOrganizations", :show-none="false", :selected="data.isOrganization.toString()", @update:selected="v => { data.isOrganization = v === 'true' }")
        div.ui.twelve.wide.field
            label 职业分类
            ItemSelector(:items="occupations", :show-none="false", v-model:selected="data.occupation")
    input.hidden-input(type="file", accept="image/png,image/jpeg", ref="uploader", @change="onUpload")
    ImagePicker(ref="imagePicker")
</template>

<script lang="ts">
import { defineComponent, ref, watch, PropType } from 'vue'
import InputBox from '@/components/InputBox.vue'
import ItemSelector from '@/components/ItemSelector.vue'
import ImagePicker, { useImagePicker } from '@/components/ImagePicker.vue'
import { isOrganizations, occupations } from '@/definitions/staff-definition'
import { watchEditorValidate, useImageUploader } from '@/functions/editor'
import { emptyAvatar } from '@/plugins/cover'
import { blobToDataURL } from '@/functions/util'

export interface Instance {
    id: number | null
    name: string | undefined
    originName: string | null | undefined
    remark: string | null | undefined
    isOrganization: boolean
    occupation: string | null
    cover: string | null
    coverFile: Blob | null
}

export function defaultInstance(): Instance {
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
    components: {InputBox, ItemSelector, ImagePicker},
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

        const { imagePicker, openImagePicker } = useImagePicker()
        const onUploadCover = async () => {
            const blob = await openImagePicker()
            if(blob != null) {
                data.value.coverFile = blob
                data.value.cover = await blobToDataURL(blob)
            }
        }

        return {data, imagePicker, onUploadCover}
    }
})
</script>

<style scoped>
    .hidden-input {
        visibility: hidden; 
        height: 0; 
        padding: 0 !important; 
        border: 0 !important;
    }
</style>
