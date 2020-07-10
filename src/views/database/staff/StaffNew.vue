<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'new'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
        a.right.item.disabled(v-if="updateLoading")
            i.notched.circle.loading.icon
            = '提交'
        a.right.item(@click="onSubmit", :class="{disabled: !valueExists}", v-else)
            i.check.icon
            = '提交'
    div.ui.grid
        div.ui.eight.wide.centered.column
            Editor(@update:value="onEditorChanged")
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Editor, { Instance } from '@/layouts/staff/edit/Editor.vue'
import { secondaryBarItems, newItem } from '@/definitions/secondary-bar'
import { useRouter } from 'vue-router'
import {useCreatorForm, useEditorUploadImage} from '@/functions/editor'

export default defineComponent({
    components: {Editor},
    computed: {
        barItems: () => [secondaryBarItems.database.staff, newItem]
    },
    setup() {
        const router = useRouter()

        const { afterSubmit } = useEditorUploadImage<Instance>(v => v.coverFile, (v, d) => `/api/database/staffs/${d['id']}/cover`)
        const form = useCreatorForm('/api/database/staffs', remapData, {
            afterSubmit,
            success(r) { router.push({name: 'Staff.Detail', params: {id: r.data['id']}}) }
        })

        return {...form}
    }
})

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
