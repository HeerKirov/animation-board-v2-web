<template lang="pug">
div.ui.secondary.pointing.menu
    router-link.item(v-for="item in barItems", :class="{active: item.name === 'edit'}", :to="item.link")
        i(:class="item.icon")
        = '{{item.title}}'
    a.right.item(@click="onSave")
        i.check.icon
        = '保存'
    a.item(@click="onCancel")
        i.close.icon
        = '放弃更改'
div.ui.grid
    div.ui.eight.wide.centered.column
        Editor(v-model="value")
</template>

<script lang="ts">
import { defineComponent, inject, watchEffect, ref, Ref } from 'vue'
import Editor, { Instance } from './Editor.vue'
import { secondaryBarItems, editItem } from '@/definitions/secondary-bar'
import { editInjectionKey, swrInjectionKey } from '@/definitions/injections'

export default defineComponent({
    components: {Editor},
    computed: {
        barItems: () => [secondaryBarItems.database.staff, editItem]
    },
    setup() {
        const { data, update } = inject(swrInjectionKey)!

        const value: Ref<Instance | null> = ref(null)

        watchEffect(() => { value.value = data.value ? mapItem(data.value) : null })

        const editMode = inject(editInjectionKey)!
        const onCancel = () => { editMode.value = false }
        const onSave = async () => {
            if(value.value) {
                const r = await update(remapData(value.value))
                if(r.ok) { editMode.value = false }
            }else{
                console.warn("Some error exist, cannot save.")
            }
        }

        return {value, onSave, onCancel}
    }
})

function mapItem(item: any) {
    return {
        name: item['name'],
        originName: item['origin_name'],
        remark: item['remark'],
        isOrganization: item['is_organization'],
        occupation: item['occupation'],
        cover: item['cover']
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
