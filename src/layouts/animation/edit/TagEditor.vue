<template lang="pug">
div.ui.segment
    div.ui.grid
        div.thirteen.wide.column
            div.ui.label(v-for="item in items") {{item.name}}
                i.delete.icon(v-if="editMode")
        div.three.wide.column
            button.ui.mini.button.float-right(:class="{basic: !editMode}", @click="editMode = !editMode")
                i.edit.icon
                = '编辑'
    template(v-if="editMode")
        div.ui.divider
        div.ui.transparent.input
            input.py-0.px-0(placeholder="搜索备选标签或创建新标签")
        div.ui.divider
        h5.ui.header.mt-1 备选标签
        div
            a.ui.label(v-for="item in searchResults") {{item.name}}
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref } from 'vue'

export interface TagItem {
    id?: number
    name: string
}

export default defineComponent({
    props: {value: (null as any) as PropType<TagItem[]>},
    emits: ['update:value'],
    setup(props, {emit}) {
        const items: TagItem[] = reactive(props.value || [])

        const editMode = ref(false)

        const searchResults: TagItem[] = reactive([{name: "A"}, {name: "B"}])

        return {items, editMode, searchResults}
    }
})
</script>