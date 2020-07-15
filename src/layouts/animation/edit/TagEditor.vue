<template lang="pug">
div.ui.segment
    div.ui.grid
        div.thirteen.wide.column
            div.ui.label(v-for="(item, index) in items", :class="{'green basic': !item.id}") {{item.name}}
                i.delete.icon(v-if="editMode", @click="onDelete(index)")
        div.three.wide.column
            button.ui.mini.button.float-right(:class="{basic: !editMode}", @click="editMode = !editMode")
                i.edit.icon
                = '编辑'
    template(v-if="editMode")
        div.ui.divider
        div.ui.transparent.icon.input
            input.py-0.px-0(placeholder="筛选备选标签或创建新标签", v-model="searchBoxText", @keydown.enter="onSearchEntered")
            i.filter.icon
        div.ui.divider
        h5.ui.header.mt-1 备选标签
        div: a.ui.label.small.mb-1(v-for="item in alternativeList", @click="onChoose(item)") {{item.name}}
</template>

<script lang="ts">
import { defineComponent, PropType, watch, ref, Ref } from 'vue'
import { useServer } from '@/functions/server'
import { sleep } from '@/functions/util'

export interface TagItem {
    id?: number
    name: string
}

export default defineComponent({
    props: {value: (null as any) as PropType<TagItem[]>},
    emits: ['update:value'],
    setup(props, {emit}) {
        const items: Ref<TagItem[]> = ref(props.value || [])
        watch(() => props.value, () => { items.value = props.value || [] })

        const editMode = ref(false)

        const board = useBoard(items, editMode)

        const onDelete = (index: number) => {
            items.value.splice(index, 1)
            emit('update:value', items.value)
        }

        return {items, editMode, onDelete, ...board}
    }
})

function useBoard(items: Ref<TagItem[]>, editMode: Ref<boolean>) {
    const { request } = useServer()

    const searchBoxText: Ref<string> = ref("")
    const searchValue: Ref<string | null> = ref(null)

    const tagList: Ref<TagItem[] | null> = ref(null)
    const alternativeList: Ref<TagItem[]> = ref([])

    watch(editMode, async (_v, _o, onInvalidate) => {
        if(editMode.value && tagList.value == null) {
            let invalidate = false
            onInvalidate(() => { invalidate = true })

            const r = await request('/api/database/tags', 'GET')
            if(invalidate) { return }
            if(r.ok) {
                tagList.value = r.data['result'] as TagItem[]
            }else{
                tagList.value = []
            }
            searchChanged()
        }
    })

    watch(searchBoxText, async (_v, _o, onInvalidate) => {
        let invalidate = false
        onInvalidate(() => { invalidate = true })
        await sleep(600)
        if(invalidate) { return }
        searchChanged()
    })

    function searchChanged() {
        const text = searchBoxText.value.split(' ').map(s => s.trim()).filter(s => s.length > 0)
        if(text.length === 0) {
            alternativeList.value = tagList.value!
        }else{
            alternativeList.value = tagList.value!.filter(s => {
                for(const t of text) {
                    if(s.name.indexOf(t) >= 0) {
                        return true
                    }
                }
                return false
            })
        }
    }

    const onSearchEntered = () => {
        const text = [...new Set(searchBoxText.value.split(' ').map(s => s.trim()).filter(s => s.length > 0))]
        if(text.length > 0) {
            const append = text.filter(s => {
                for(const item of items.value) {
                    if(item.name === s) {
                        return false
                    }
                }
                return true
            }).map(s => {
                for(const tag of tagList.value!) {
                    if(tag.name === s) {
                        return tag
                    }
                }
                return {name: s}
            })

            items.value.splice(items.value.length, 0, ...append)
        }
    }

    const onChoose = (append: TagItem) => {
        for(const item of items.value) {
            if(item.name === append.name) {
                return
            }
        }
        items.value.push(append)
    }

    return {searchBoxText, searchValue, alternativeList, onSearchEntered, onChoose}
}
</script>
