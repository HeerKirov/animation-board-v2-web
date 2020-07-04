<template lang="pug">
div.twelve.wide.column.pt-1.pb-2
    div.ui.label(v-if="value") 
        span.pointer.mr-1(@click="onSwitch") {{value}}
        i.close.icon(@click="onDelete")
    button.ui.tertiary.mini.button(v-else, @click="onSwitch") 未选择
div.sixteen.wide.column.py-0(v-if="showBoard")
    div.ui.divider.mt-0
    div.ui.icon.input.fluid.transparent
        input(:placeholder="placeholder", v-model="searchBoxText", @keydown.enter="requestForData")
        i.search.icon
    div.ui.divider
    div.list-content
        button.ui.tertiary.mini.button(v-for="item in items", :key="item.id", @click="onChoose(item)") {{item.name}}
        button.ui.tertiary.mini.button(v-if="hasNext", @click="requestForNext") 获取更多结果...
    div.ui.divider.mb-0(v-if="items.length > 0")
</template>

<script lang="ts">
import { defineComponent, ref, watch, Ref, computed } from 'vue'
import { useServer } from '@/functions/server'

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
    const { request } = useServer()

    const showBoard = ref(false)
    const onSwitch = () => { showBoard.value = !showBoard.value }
    const onDelete = () => { 
        value.value = undefined
        showBoard.value = false
        searchBoxText.value = ""
        total.value = null
        items.value = []
    }

    const total: Ref<number | null> = ref(null)
    const items: Ref<any[]> = ref([])
    const hasNext = computed(() => total.value != null && items.value.length < total.value)
    
    const searchBoxText: Ref<string> = ref("")

    let search: string | undefined = undefined

    const requestForData = async () => {
        search = searchBoxText.value || undefined
        const r = await request(props.url, 'GET', {
            search,
            limit: props.limit,
            offset: 0,
            order: props.order
        })
        if(r.ok) {
            items.value = r.data['result'].map(mapItem)
            total.value = r.data['total']
        }else{
            items.value = []
            total.value = null
        }
        for(let item of items.value) {
            if(item.name === search) {
                value.value = item.name
                break
            }
        }
    }

    const requestForNext = async () => {
        if(hasNext.value) {
            const r = await request(props.url, 'GET', {
                search,
                limit: props.limit,
                offset: items.value.length
            })
            if(r.ok) {
                total.value = r.data['total']
                items.value = items.value.concat(r.data['result'].map(mapItem))
            }
        }
    }

    const onChoose = (item: any) => {
        value.value = item.name
    }

    return {showBoard, onSwitch, onDelete, searchBoxText, items, hasNext, requestForData, requestForNext, onChoose}
}

function mapItem(item: any) {
    return {
        id: item['id'],
        name: item['name']
    }
}
</script>

<style scoped>
    .pointer {
        cursor: pointer;
    }
</style>