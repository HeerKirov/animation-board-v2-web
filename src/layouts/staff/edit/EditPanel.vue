<template lang="pug">
div.ui.secondary.pointing.menu
    router-link.item(v-for="item in barItems", :class="{active: item.name === 'edit'}", :to="item.link")
        i(:class="item.icon")
        = '{{item.title}}'
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
import { defineComponent, inject, ref, Ref, computed } from 'vue'
import Editor, { Instance } from './Editor.vue'
import { secondaryBarItems, editItem } from '@/definitions/secondary-bar'
import { editInjectionKey, swrInjectionKey } from '@/definitions/injections'
import { useServer } from '@/functions/server'
import { useNotification } from '@/functions/notification'
import { useEditorForm } from '@/functions/editor'
import config from '@/config'

export default defineComponent({
    components: {Editor},
    computed: {
        barItems: () => [secondaryBarItems.database.staff, editItem]
    },
    setup() {
        const { request } = useServer()
        const { notify } = useNotification()

        const swr = inject(swrInjectionKey)!
        const editMode = inject(editInjectionKey)!

        //
        const { editorValue, valueExists, onEditorChanged, onCancel, onSubmit } = useEditorForm<Instance>(swr, editMode, mapItem, remapData, {
            async beforeSubmit(editorValue) {
                if(editorValue.coverFile == null) return true

                const formData = new FormData()
                formData.append('file', editorValue.coverFile)
                const r2 = await request(`/api/database/staffs/${editorValue.id}/cover`, 'POST', formData, {
                    errorHandler(code, data, parent) {
                        if(code >= 400) {
                            try {
                                const message = data['message']
                                notify('图片上传失败', 'error', message)
                            }catch(e) {
                                parent?.(code, data)
                            }
                        }
                    }
                })
                return r2.ok
            }
        })

        const onDelete = async () => {
            //TODO delete method & 删除前检查
        }

        return {editorValue, valueExists, onEditorChanged, onSubmit, onCancel, onDelete}
    }
})

function mapItem(item: any) {
    return {
        id: item['id'],
        name: item['name'],
        originName: item['origin_name'],
        remark: item['remark'],
        isOrganization: item['is_organization'],
        occupation: item['occupation'],
        cover: item['cover'] ? `${config.SERVER_URL}/api/database/cover/staff/${item['cover']}` : null
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
