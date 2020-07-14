<template lang="pug">
div.ui.fields
    div.ui.three.wide.field
        div.ui.secondary.vertical.menu.w-100
            a.item(v-for="r in relations", :class="{active: r.name === currentPanel}", 
                   @click="currentPanel = r.name", @dragover.prevent="", @drop.prevent="dropOnTypeButton($event, r.name)") {{r.title}}
                div.ui.left.pointing.label(:class="{'teal': value[r.name]?.length}") {{value[r.name]?.length || 0}}
    div.ui.four.wide.field
        template(v-if="value[currentPanel]")
            div.ui.segment.p-2(v-for="(item, index) in value[currentPanel]", 
                               draggable="true", @dragstart="onDragFromData($event, item)", @dragend="onDragEnd"
                               @dragover.prevent="", @drop.prevent="dropOnContent($event, index)")
                img.relations.item-image(:src="item.cover")
                div.relations.item-content
                    label.is-weight.font-size-12 {{item.title}}
        div.text-center.drag-content(v-if="dragFrom === 'board'", @dragover.prevent="", @drop.prevent="dropOnContent")
            i.font-size-11 拖拽到这里添加
    div.ui.one.wide.field
    div.ui.eight.wide.field
        div.ui.transparent.icon.input.py-0
            input(type="text", :placeholder="placeholder", v-model="searchBoxText", @keydown.enter="requestForFirst")
            i.search.icon
        div.ui.divider.mt-1
        div.ui.two.columns.grid.px-2
            div.trash-content(v-if="dragFrom === 'data'", @dragover.prevent="", @drop.prevent="dropOnTrash")
                i.trash.icon
                i.font-size-14 拖拽到这里移除
            template(v-else)
                template(v-for="item in result")
                    div.ui.column.p-1(v-if="!id || item.id !== id")
                        div.ui.segment.p-2(draggable="true", @dragstart="onDragFromBoard($event, item)", @dragend="onDragEnd")
                            img.relations.item-image(:src="item.cover")
                            div.relations.item-content
                                label.is-weight.font-size-12 {{item.title}}
        button.ui.tertiary.mini.button(v-if="hasNext", @click="requestForNext") 获取更多结果
</template>

<script lang="ts">
import { defineComponent, PropType, ref, Ref, computed } from 'vue'
import { relations } from '@/definitions/animation-definition'
import { useContinuous } from '@/functions/server'
import config from '@/config'

const emptyCover = require('@/assets/empty_cover.jpg')

const limit = 8
const order = '-update_time'

export interface RelationItem {
    id: number
    title: string
    cover: string
}

export default defineComponent({
    props: {
        value: {type: (null as any) as PropType<{[t: string]: RelationItem[]}>, required: true},
        title: String,
        id: Number
    },
    computed: {
        relations() { return relations }
    },
    setup(props) {
        const data = ref(props.value)

        const editor = useEditor(data)

        const placeholder = computed(() => props.title?.split(' ')[0])

        const board = useBoard(placeholder)

        return {...editor, ...board, placeholder}
    }
})

function useEditor(data: Ref<{[t: string]: RelationItem[]}>) {
    const currentPanel = ref(relations[0].name)

    const dragFrom: Ref<"board" | "data" | null> = ref(null)

    const onDragFromBoard = (e: DragEvent, item: RelationItem) => {
        dragFrom.value = "board"
    }
    const onDragFromData = (e: DragEvent, item: RelationItem) => {
        dragFrom.value = "data"
    }
    const onDragEnd = () => { dragFrom.value = null }

    const dropOnContent = (e: DragEvent, index?: number) => {
        
    }
    const dropOnTypeButton = (e: DragEvent, relation: string) => {
        
    }
    const dropOnTrash = (e: DragEvent) => {
        
    }

    return {currentPanel, onDragFromBoard, onDragFromData, onDragEnd, dropOnContent, dropOnTypeButton, dropOnTrash, dragFrom}
}

function useBoard(placeholder: Ref<string | undefined>) {
    const searchBoxText: Ref<string> = ref("")

    const searchValue = computed(() => searchBoxText.value?.trim() || placeholder.value || undefined)

    const { result, requestForFirst, requestForNext, hasNext, hasRequested } = useContinuous('/api/database/animations', {
        findTotal(data) { return data['total'] },
        findData(data) { return (data['result'] as any[]).map(mapItem) },
        query(count, total, queryData) { return {offset: count, search: queryData, limit, order} },
        queryData: searchValue
    })

    return {result, hasNext, requestForNext, requestForFirst, hasRequested, searchBoxText}
}

function mapItem(item: any): RelationItem {
    return {
        id: item['id'],
        title: item['title'],
        cover: item['cover'] ? `${config.SERVER_URL}/api/database/cover/animation/${item['cover']}` : emptyCover
    }
}
</script>

<style scoped>
    .drag-content {
        height: 100px;
        color: #DADADA;
    }
    .trash-content {
        width: 100%;
        height: 100px;
        color: #DADADA;
        padding-top: 10px;
        text-align: center;
    }
    .relations.item-image {
        width: 20%;
    }
    .relations.item-content {
        width: 80%;
        padding-left: 2px;
        vertical-align: top;
        display: inline-block;
    }
</style>
