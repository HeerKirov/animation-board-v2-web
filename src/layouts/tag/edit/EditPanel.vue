<template lang="pug">
div.ui.secondary.pointing.menu
    router-link.item(v-for="item in barItems", :class="{active: item.name === 'edit'}", :to="item.link")
        i(:class="item.icon")
        = '{{item.title}}'
    template(v-if="updateLoading")
        a.right.item.disabled
            i.notched.circle.loading.icon
            = '保存'
        a.item.disabled
            i.close.icon
            = '放弃更改'
    template(v-else)
        a.right.item(@click="onSubmit", :class="{disabled: !valueExists}")
            i.check.icon
            = '保存'
        a.item(@click="onCancel")
            i.close.icon
            = '放弃更改'
div.ui.grid
    div.ui.centered.row
        h2.ui.icon.header
            i.tag.icon
    div.ui.row
        div.ui.four.wide.centered.column
            div.ui.form
                div.ui.field
                    label 名称
                    InputBox(v-model="data.name", :max-length="16", :not-blank="true", placeholder="标签的唯一识别名")
                div.ui.field
                    label 描述
                    InputBox(v-model="data.introduction", placeholder="标签的定义描述")
    div.ui.row
        div.ui.eight.wide.centered.column
            button.ui.tertiary.button.float-right(@click="onDelete")
                i.trash.icon
                = '删除此条目'
</template>

<script lang="ts">
import { defineComponent, inject, ref, watch, Ref } from 'vue'
import { useRouter } from 'vue-router'
import InputBox from '@/components/InputBox.vue'
import { secondaryBarItems, editItem } from '@/definitions/secondary-bar'
import { editInjectionKey, swrInjectionKey } from '@/definitions/injections'
import { useEditorForm, watchEditorValidate } from '@/functions/editor'

interface Instance {
    id: number | null
    name: string | undefined
    introduction: string | null | undefined
}

function defaultInstance(): Instance {
    return {
        id: null,
        name: undefined,
        introduction: null
    }
}

export default defineComponent({
    components: {InputBox},
    computed: {
        barItems: () => [secondaryBarItems.database.tag, editItem]
    },
    setup() {
        const router = useRouter()

        const swr = inject(swrInjectionKey)!
        const editMode = inject(editInjectionKey)!

        const { editorValue, valueExists, updateLoading, onEditorChanged, onSubmit, onCancel, onDelete } = useEditorForm<Instance>(swr, editMode, mapItem, remapData, {
            afterDelete() { router.push({name: 'Tag.List'}) }
        })

        const data: Ref<Instance> = ref(editorValue.value || defaultInstance())

        watch(editorValue, () => { data.value = editorValue.value || defaultInstance() })

        watchEditorValidate<Instance>(data, onEditorChanged, v => {
            return v.name === undefined
        })

        return {data, valueExists, updateLoading, onSubmit, onCancel, onDelete}
    }
})

function mapItem(item: any) {
    return {
        id: item['id'],
        name: item['name'],
        introduction: item['introduction']
    }
}

function remapData(item: Instance) {
    return {
        name: item['name'],
        introduction: item['introduction'] || ''
    }
}
</script>

<style scoped>

</style>
