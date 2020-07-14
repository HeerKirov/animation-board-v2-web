<template lang="pug">
div.twelve.wide.column.pt-1.pb-2
    div.ui.label(v-if="value") 
        span.pointer.mr-1(@click="onSwitch") {{value}}
        i.close.icon(@click="onDelete")
    button.ui.tertiary.mini.button(v-else, @click="onSwitch") 未选择
div.sixteen.wide.column.py-0(v-if="showBoard")
    div.ui.divider.mt-0
    div.ui.icon.input.fluid.transparent
        input(:placeholder="placeholder", v-model="searchBoxText", @keydown.enter="requestForFirst")
        i.search.icon
    div.ui.divider
    div.list-content
        button.ui.tertiary.mini.button(v-for="item in result", :key="item.id", @click="onChoose(item)") {{item.name}}
        button.ui.tertiary.mini.button(v-if="hasNext", @click="requestForNext") 获取更多结果...
    div.ui.divider.mb-0(v-if="items.length > 0")
</template>

<script lang="ts">
import { defineComponent, ref, watch, Ref, computed } from 'vue'
import { useContinuous } from '@/functions/server'

export interface ChangedEvent {
    value: string | undefined
}

export default defineComponent({
    props: {
        value: String,
        placeholder: String,
        url: {type: String, required: true},
        limit: {type: Number, default: 20},
        order: String
    },
    emits: ['update:value'],
    setup(props, {emit}) {
        const value = ref(props.value)
        watch(() => props.value, v => { value.value = v })
        watch(value, () => emit('update:value', value.value))

        const boards = useBoard(value, props)

        return {value, ...boards}
    }
})

function useBoard(value: Ref<string | undefined>, props: any) {
    const showBoard = ref(false)
    const onSwitch = () => { showBoard.value = !showBoard.value }
    const onDelete = () => { 
        value.value = undefined
        showBoard.value = false
        searchBoxText.value = ""
        clear()
    }

    const searchBoxText: Ref<string> = ref("")

    const { result, requestForFirst, requestForNext, hasNext, clear } = useContinuous(props.url, {
        findTotal(data) { return data['total'] },
        findData(data) { return (data['result'] as any[]).map(mapItem) },
        query(count, total, queryData) { return {offset: count, search: queryData, limit: props.limit, order: props.order} },
        queryData: searchBoxText
    })

    const onChoose = (item: any) => {
        value.value = item.name
    }

    return {showBoard, onSwitch, onDelete, searchBoxText, result, hasNext, requestForFirst, requestForNext, onChoose}
}

function mapItem(item: any) {
    return {
        id: item['id'],
        name: item['name']
    }
}
</script>

<style scoped>
    .list-content {
        overflow: auto;
        max-height: 450px
    }
</style>