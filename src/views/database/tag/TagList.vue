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
                template(v-for="(group, groupIndex) in items", :key="group.group")
                    div.font-size-14.is-weight.mb-1(v-if="group.group == null") 未分组标签
                    GroupText(v-else-if="editMode", :value="group.group", @update:value="manual",
                              @dragover.prevent="", @drop.prevent="onDrop($event, groupIndex, null)",
                              :draggable="editMode", @dragstart="onDragGroup($event, group.group)")
                    div.font-size-14.is-weight.mb-1(v-else) {{group.group}}
                    router-link.ui.large.label.mr-1.mb-1(v-for="(item, index) in group.items", :key="item.id", :to="editMode ? '' : {name: 'Tag.Detail', params: {id: item.id}}", 
                                                        :class="isMarked(item.name) ? 'primary' : editMode ? 'grey' : ''", 
                                                        :draggable="editMode", @dragstart="onDragTag($event, item.id)",
                                                        @dragover.prevent="", @drop.prevent="onDrop($event, groupIndex, index + 1)") {{item.name}}
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
import GroupText from '@/layouts/tag/list/GroupText.vue'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import { useRouterQueryUtil } from '@/functions/routers'
import { useSWR, useServer } from '@/functions/server'
import { useSort, useSelector } from '@/functions/parameters'
import { useAuth } from '@/functions/auth'
import { toNameSet } from '@/definitions/util'

interface Group {group: string | null, items: Instance[]}

interface Instance {id: number, name: string}

export default defineComponent({
    components: {SearchBox, SortSelector, ItemSelector, GroupText},
    computed: {
        barItems() { return secondaryBarItems.database }
    },
    setup() {
        const { loading, data, manual } = useSWR('/api/database/tags/groups')
        const items = computed(() => data.value ? (data.value as any[]).map(mapGroup) : [])
        const count = computed(() => sumGroup(items.value))

        const { stats } = useAuth()

        return {
            loading, items, count, manual,
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
    let dragGroup: string | null = null

    const onDragTag = (e: DragEvent, id: number) => {
        dragId = id 
        dragGroup = null
    }

    const onDragGroup = (e: DragEvent, group: string) => {
        dragGroup = group
        dragId = null
    }

    const onDrop = async (e: DragEvent, groupIndex: number, itemIndex: number | null) => {
        if(dragGroup != null) {
            const ordinal = groupIndex + 1
            const r = await request(`/api/database/tags/groups/${dragGroup}`, 'PATCH', {ordinal})
            if(r.ok) {
                manualUpdate()
            }
        }else if(dragId != null) {
            const group = items.value[groupIndex].group
            const ordinal = itemIndex != null ? itemIndex + 1 : null
            const r = await request(`/api/database/tags/${dragId}`, 'PATCH', {group, ordinal})
            if(r.ok) {
                manualUpdate()
            }
        }
        
        dragId = null
        dragGroup = null
    }

    return {editMode, onDragTag, onDragGroup, onDrop}
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
