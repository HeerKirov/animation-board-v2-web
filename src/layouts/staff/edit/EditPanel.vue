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
        Editor(v-model:value="editValue")
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
        watch(data, v => { editValue.value = v ? mapItem(v) : null}, {immediate: true})
        const onSave = async () => { await update(editValue.value) }

        const editMode = inject(editInjectionKey)!
        const onGiveUp = () => { editMode.value = false }

        return {editValue, onSave, onGiveUp}
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
</script>

<style scoped>

</style>