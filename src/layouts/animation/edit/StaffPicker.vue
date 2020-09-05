<template lang="pug">
template(v-if="!creatorMode")
    div.ui.icon.input.fluid.transparent
        input(placeholder="搜索STAFF", v-model="searchBoxText", @keydown.enter="requestForFirst")
        i.search.icon
    div.ui.divider.mt-1
    div.list-content
        div.ui.small.label.mb-1.pointer(v-for="item in result", :key="item.id", draggable="true", @dragstart="onDragStart($event, item)") {{item.name}}
        button.ui.tertiary.mini.button(v-if="hasNext", @click="requestForNext") 获取更多结果
        p.mb-0: button.ui.tertiary.mini.button(@click="creatorMode = true") {{hasRequested ? '找不到想要的？新建STAFF条目' : '新建STAFF条目'}}
template(v-else)
    SimpleEditor(@update:value="onCreatorChanged", :default-name="searchBoxText")
    div.ui.form
        div.ui.field
            label 将此条目直接添加到
            ItemSelector(:items="creatorActions", v-model:selected="creatorAction", none-title="不添加")
        button.ui.fluid.green.small.icon.button.disabled(v-if="createLoading")
            i.notched.circle.loading.icon
            = '新建'
        button.ui.fluid.green.small.icon.button(@click="onCreate", v-else)
            i.plus.icon
            = '新建'
        div.ui.field
            button.ui.tertiary.mini.button.right.floated(@click="creatorMode = false")
                i.close.icon
                = '放弃'
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue'
import ItemSelector from '@/components/ItemSelector.vue'
import SimpleEditor from '@/layouts/staff/edit/SimpleEditor.vue'
import { Instance } from '@/layouts/staff/edit/Editor.vue'
import { StaffItem } from '@/layouts/animation/edit/StaffEditor.vue'
import { DefinitionItem } from '@/definitions/util'
import { useContinuous } from '@/functions/server'
import { useCreatorForm } from '@/functions/editor'

const creatorActions: DefinitionItem[] = [
    {name: 'AUTHOR', title: '原作者/原案'},
    {name: 'COMPANY', title: '制作公司'},
    {name: 'STAFF', title: 'STAFF'}
]

const limit = 40
const order = '-update_time'

export interface AppendEvent {
    type: string
    item: StaffItem
}

export default defineComponent({
    components: {SimpleEditor, ItemSelector},
    computed: {
        creatorActions() { return creatorActions }
    },
    emits: ['append'],
    setup(_, {emit}) {
        const board = useBoard()

        const drag = useDrag()

        const creator = useCreator((type, item) => {
            if(type != null) {
                emit('append', {type, item} as AppendEvent)
                board.searchBoxText.value = ""
                board.clear()
            }else{
                board.searchBoxText.value = item.name
                board.requestForFirst()
            }
        })

        return {...board, ...drag, ...creator}
    }
})

function useBoard() {
    const searchBoxText: Ref<string> = ref("")

    const { result, requestForFirst, requestForNext, hasNext, hasRequested, clear } = useContinuous('/api/database/staffs', {
        findTotal(data) { return data['total'] },
        findData(data) { return (data['result'] as any[]).map(mapItem) },
        query(count, total, queryData) { return {offset: count, search: queryData, limit, order} },
        queryData: searchBoxText
    })

    requestForFirst()

    return {result, hasNext, requestForNext, requestForFirst, hasRequested, searchBoxText, clear}
}

function useDrag() {
    const onDragStart = (e: DragEvent, item: any) => {
        e.dataTransfer?.setData('item', JSON.stringify(item))
    }

    return {onDragStart}
}

function useCreator(onCreatedItem: (type: string | null, item: StaffItem) => void) {
    const creatorMode = ref(false)

    const onOpenCreator = () => {
        creatorMode.value = true
    }

    const creatorAction: Ref<string | null> = ref(null)

    const { updateLoading, onEditorChanged, onSubmit } = useCreatorForm('/api/database/staffs', remapData, {
        success(r) {
            onCreatedItem(creatorAction.value, mapItem(r.data))
            creatorMode.value = false
        }
    })

    return {creatorMode, creatorAction, onOpenCreator, createLoading: updateLoading, onCreatorChanged: onEditorChanged, onCreate: onSubmit }
}

function mapItem(item: any) {
    return {
        id: item['id'],
        name: item['name']
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
    .list-content {
        overflow: auto;
        max-height: 575px
    }
</style>
