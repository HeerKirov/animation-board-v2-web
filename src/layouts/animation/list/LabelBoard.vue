<template lang="pug">
div.ui.divider.mt-0
div.ui.icon.input.fluid.transparent
    input(placeholder="搜索标签", v-model="searchBox", @keydown.enter="requestForData")
    i.search.icon
div.ui.divider
div.list-content
    button.ui.tertiary.mini.button(v-for="item in items", :key="item.id", @click="onChoose") {{item.name}}
    button.ui.tertiary.mini.button(v-if="hasNext", @click="requestForNext") 获取更多结果...
div.ui.divider
</template>

<script lang="ts">
import { defineComponent, computed, reactive, ref, Ref } from 'vue'
import { useServer } from '@/functions/server'

export interface ChooseEvent {
    id: number
    name: string
}

export default defineComponent({
    props: {
        url: {type: String, required: true},
        limit: {type: Number, default: 20},
        order: String
    },
    emits: ['choose'],
    setup(props, {emit}) {
        const { request } = useServer()

        const total: Ref<number | null> = ref(null)
        const items: Ref<any[]> = ref([])
        const hasNext = computed(() => total.value != null && items.value.length < total.value)

        const searchBox: Ref<string> = ref("")

        let search: string | undefined = undefined

        const requestForData = async () => {
            search = searchBox.value || undefined
            const r = await request(props.url, 'GET', {
                search,
                limit: props.limit,
                offset: 0
            })
            if(r.ok) {
                items.value = r.data['result'].map(mapItem)
                total.value = r.data['total']
            }else{
                items.value = []
                total.value = null
            }
            for(let item of items.value) {
                if(item === search) {
                    emit('choose', item)
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
            emit('choose', item)
        }

        requestForData().finally(() => {})

        return {items, hasNext, searchBox, requestForData, requestForNext, onChoose}
    }
})

function mapItem(item: any) {
    return {
        id: item['id'],
        name: item['name']
    }
}
</script>

<style scoped>
    .list-content {
        max-height: 200px;
        overflow: auto;
    }
</style>