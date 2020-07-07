<template lang="pug">
div.ui.secondary.pointing.menu
    router-link.item(v-for="item in barItems", :class="{active: item.name === 'edit'}", :to="item.link")
        i(:class="item.icon")
        = '{{item.title}}'
    a.right.item(@click="onSave")
        i.check.icon
        = '保存'
    a.item(@click="onGiveUp")
        i.close.icon
        = '放弃更改'
div.ui.grid
    div.ui.eight.wide.centered.column
        Editor(:value="editValue", @update:value="onUpdateValue")
</template>

<script lang="ts">
import { defineComponent, inject, computed, watch, ref, Ref } from 'vue'
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
        const editValue: Ref<Instance | null> = ref(null)
        watch(data, v => { 
            editValue.value = v ? mapItem(v) : null
            console.log('computed: ', editValue.value)
        }, {immediate: true})

        const onUpdateValue = (value: Instance) => {
            console.log("watch", value)
        }
        const onSave = async () => { 
            const r = await update(remapData(editValue.value!))
            if(r.ok) { editMode.value = false }
        }

        const editMode = inject(editInjectionKey)!
        const onGiveUp = () => { editMode.value = false }

        return {editValue, onUpdateValue, onSave, onGiveUp}
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