<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'tag'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
        a.right.item(v-if="isStaff", @click="editMode = !editMode")
            i.align.left.icon
            = '{{editMode ? "退出编辑模式" : "编辑模式"}}'
        router-link.item(v-if="isStaff", :to="{name: 'Tag.New'}")
            i.plus.icon
            = '新建'
    div.ui.grid
        div.twelve.wide.column
            div.ui.segment.px-6.main-panel
                div.ui.active.inverted.dimmer(v-if="loading")
                    div.ui.loader
                template(v-else)
                    template(v-for="group in items")
                        div.font-size-14.is-weight.mb-1(v-if="group.group != null", @dragover.prevent="", @drop.prevent="onDrop($event, group.group, null)") {{group.group}}
                        div.font-size-14.is-weight.mb-1(v-else) 未分组标签
                        router-link.ui.large.label.mr-1.mb-1(v-for="(item, index) in group.items", :key="item.id", :to="editMode ? '' : {name: 'Tag.Detail', params: {id: item.id}}", 
                                                            :class="isMarked(item.name) ? 'primary' : editMode ? 'grey' : ''", 
                                                            :draggable="editMode", @dragstart="onDragStart($event, item.id)",
                                                            @dragover.prevent="", @drop.prevent="onDrop($event, group.group, index + 1)") {{item.name}}
        div.four.wide.column
            div.ui.segment
                SearchBox(:value="search", @search="onSearch")
            div.mt-2 共{{count.groupCount}}个分组，{{count.tagCount}}个标签
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, Ref, toRef, watch, toRefs } from 'vue'
import SortSelector, { ChangedEvent as SortChangedEvent } from '@/components/SortSelector.vue'
import ItemSelector, { ChangedEvent as ItemChangedEvent } from '@/components/ItemSelector.vue'
import SearchBox, { SearchEvent } from '@/components/SearchBox.vue'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import { useRouterQueryUtil } from '@/functions/routers'
import { useSWR, useServer } from '@/functions/server'
import { useSort, useSelector } from '@/functions/parameters'
import { useAuth } from '@/functions/auth'
import { toNameSet } from '@/definitions/util'

interface Group {group: string | null, items: Instance[]}

interface Instance {id: number, name: string}

//TODO 重构drag/drop回归双index定位，手动移动数据，不再全局刷新数据，避免闪屏
//TODO 添加group的drag/drop移动和group的重命名
export default defineComponent({
    components: {SearchBox, SortSelector, ItemSelector},
    computed: {
        barItems() { return secondaryBarItems.database }
    },
    setup() {
        const { loading, data, manual } = useSWR('/api/database/tags/groups')
        const items = computed(() => data.value ? (data.value as any[]).map(mapGroup) : [])
        const count = computed(() => sumGroup(items.value))

        const { stats } = useAuth()

        return {
            loading, items, count, 
            isStaff: toRef(stats, 'isStaff'),
            ...useFilter(),
            ...useEditor(items, manual)
        }
    }
})

function useFilter() {
    const search: Ref<string | undefined> = ref()
    const onSearch = (e: SearchEvent) => { search.value = e.text }

    const isMarked = (name: string) => search.value != null && name.indexOf(search.value) >= 0

    return {search, onSearch, isMarked}
}

function useEditor(items: Ref<Group[]>, manualUpdate: () => void) {
    const { request } = useServer()

    const editMode = ref(false)

    let dragId: number | null = null

    const onDragStart = (e: DragEvent, id: number) => { dragId = id }

    const onDrop = async (e: DragEvent, group: string, ordinal: number | null) => {
        const r = await request(`/api/database/tags/${dragId}`, 'PATCH', {group, ordinal})
        if(r.ok) {
            manualUpdate()
        }
        dragId = null
    }

    return {editMode, onDragStart, onDrop}
}

function mapGroup(group: any): Group {
    return {
        group: group['group'],
        items: (group['items'] as any[]).map(mapItem)
    }
}

function mapItem(item: any): Instance {
    return {
        id: item['id'],
        name: item['name']
    }
}

function sumGroup(groups: Group[]): {groupCount: number, tagCount: number} {
    let groupCount = 0, tagCount = 0
    for(const {group, items} of groups) {
        if(group != null) { groupCount += 1 }
        tagCount += items.length
    }
    return {groupCount, tagCount}
}
</script>

<style scoped>
    .main-panel {
        min-height: 50px;
    }
</style>
