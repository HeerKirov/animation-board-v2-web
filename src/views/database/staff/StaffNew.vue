<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'new'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
        a.right.item(@click="onSubmit", :class="{disabled: !valueExists}")
            i.check.icon
            = '提交'
    div.ui.grid
        div.ui.eight.wide.centered.column
            Editor(@update:value="onEditorChanged")
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed } from 'vue'
import Editor, { Instance } from '@/layouts/staff/edit/Editor.vue'
import { secondaryBarItems, newItem } from '@/definitions/secondary-bar'
import { useServer } from '@/functions/server'
import { useRouter } from 'vue-router'

export default defineComponent({
    components: {Editor},
    computed: {
        barItems: () => [secondaryBarItems.database.staff, newItem]
    },
    setup() {
        const { request } = useServer()
        const router = useRouter()

        const outValue: Ref<Instance | undefined> = ref() 

        const valueExists = computed(() => !!outValue.value)

        const onEditorChanged = (v: Instance) => { outValue.value = v }

        const onSubmit = async () => {
            if(outValue.value) {
                const r = await request('/api/database/staffs', 'POST', remapData(outValue.value))
                if(r.ok) { router.push({name: 'Staff.Detail', params: {id: r.data['id']}}) }
            }else{
                console.warn("Some error exist, cannot save.")
            }
        }

        return {valueExists, onEditorChanged, onSubmit}
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