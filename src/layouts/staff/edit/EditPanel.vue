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
    div.ui.eight.wide.centered.column
        Editor(:value="editorValue", @update:value="onEditorChanged")
        button.ui.tertiary.button.float-right(@click="onDelete")
            i.trash.icon
            = '删除此条目'
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue'
import { useRouter } from 'vue-router'
import Editor, { Instance } from './Editor.vue'
import { secondaryBarItems, editItem } from '@/definitions/secondary-bar'
import { editInjectionKey, swrInjectionKey } from '@/definitions/injections'
import { useEditorForm, useEditorUploadImage } from '@/functions/editor'
import config from '@/config'

export default defineComponent({
    components: {Editor},
    computed: {
        barItems: () => [secondaryBarItems.database.staff, editItem]
    },
    setup() {
        const router = useRouter()

        const swr = inject(swrInjectionKey)!
        const editMode = inject(editInjectionKey)!

        const { beforeSubmit } = useEditorUploadImage<Instance>(v => v.coverFile, v => `/api/database/staffs/${v.id}/cover`)
        const form = useEditorForm<Instance>(swr, editMode, mapItem, remapData, {
            beforeSubmit,
            afterDelete() { router.push({name: 'Staff.List'}) }
        })

        return {...form}
    }
})

function mapItem(item: any): Instance {
    return {
        id: item['id'],
        name: item['name'],
        originName: item['origin_name'],
        remark: item['remark'],
        isOrganization: item['is_organization'],
        occupation: item['occupation'],
        cover: item['cover'] ? `${config.SERVER_URL}/api/database/cover/staff/${item['cover']}` : null,
        coverFile: null
    }
}

function remapData(item: Instance) {
    return {
        name: item.name,
        origin_name: item.originName,
        remark: item.remark,
        is_organization: item.isOrganization,
        occupation: item.occupation
    }
}
</script>

<style scoped>

</style>
