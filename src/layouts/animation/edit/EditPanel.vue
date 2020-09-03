<template lang="pug">
div.ui.secondary.pointing.menu
    router-link.item(v-for="item in barItems", :class="{active: item.name === 'edit'}", :to="item.link")
        i(:class="item.icon")
        = '{{item.title}}'
    template(v-if="updateLoading")
        a.right.item.disabled
            i.notched.circle.loading.icon
            = '保存'
        a.item.disabled
            i.close.icon
            = '放弃更改'
    template(v-else)
        a.right.item(@click="onSubmit", :class="{disabled: !valueExists}")
            i.check.icon
            = '保存'
        a.item(@click="onCancel")
            i.close.icon
            = '放弃更改'
div.ui.centered.grid
    div.ui.three.wide.column
        div.ui.vertical.fluid.tabular.menu
            each item, index in ['介绍', '放送信息', '制作信息', '关联的动画']
                a.item(:class=`{active: panelIndex === ${index}}`, @click="panelIndex = " + index)= item
    div.ui.eleven.wide.column
        Editor(:panel-index="panelIndex", :value="editorValue", @update:value="onEditorChanged")
</template>

<script lang="ts">
import { defineComponent, ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import Editor, { Instance } from './Editor.vue'
import { TagItem } from './TagEditor.vue'
import { StaffItem } from './StaffEditor.vue'
import { RelationItem } from './RelationEditor.vue'
import { useEditorForm, useEditorUploadImage } from '@/functions/editor'
import { dateToCalendar, Calendar, dateToUTCString, calendarToString, calendarEquals } from '@/functions/format'
import { editInjectionKey, swrInjectionKey } from '@/definitions/injections'
import { secondaryBarItems, editItem } from '@/definitions/secondary-bar'
import { staffTypes } from '@/definitions/staff-definition'
import { relations } from '@/definitions/animation-definition'
import { sets, objects } from '@/functions/util'
import cover from '@/plugins/cover'

export default defineComponent({
    components: {Editor},
    computed: {
        barItems: () => [secondaryBarItems.database.animation, editItem]
    },
    setup() {
        const router = useRouter()

        const panelIndex = ref(0)

        const swr = inject(swrInjectionKey)!
        const editMode = inject(editInjectionKey)!

        const { beforeSubmit } = useEditorUploadImage<Instance>(v => v.coverFile, v => `/api/database/animations/${v.id}/cover`)
        const form = useEditorForm<Instance>(swr, editMode, mapItem, remapData, {
            method: 'PATCH',
            beforeSubmit,
            afterDelete() { router.push({name: 'Animation.List'}) }
        })

        return {panelIndex, ...form}
    }
})

function mapItem(item: any): Instance {
    const staffs: {[type: string]: StaffItem[]} = {'AUTHOR': [], 'COMPANY': [], 'STAFF': []}
    for(const staff of item['staffs']) {
        const arr = staffs[staff['staff_type']]
        if(arr != null) {
            arr.push({id: staff['id'], name: staff['name']})
        }
    }

    const relations: {[t: string]: RelationItem[]} = {}
    const originalRelations = item['relations'] as {[t: string]: number[]}
    const originalTopology = item['relations_topology'] as any[]
    for(const type in originalRelations) {
        relations[type] = originalRelations[type].map(id => {
            for (let item of originalTopology) {
                if(item['id'] === id) {
                    return {
                        id: item['id'],
                        title: item['title'],
                        cover: cover.animationOrEmpty(item['cover'])
                    }
                }
            }
            throw new Error(`Cannot find relation ${id} in relations_topology.`)
        })
    }

    return {
        id: item['id'],
        title: item['title'],
        originTitle: item['origin_title'],
        otherTitle: item['other_title'],
        keyword: item['keyword'],
        tags: (item['tags'] as any[]).map(i => ({id: i['id'], name: i['name']})),
        sexLimitLevel: item['sex_limit_level'],
        violenceLimitLevel: item['violence_limit_level'],
        introduction: item['introduction'],
        publishType: item['publish_type'],
        publishTime: item['publish_time'] ? mapPublishTimeToCalendar(item['publish_time']) : null,
        episodeDuration: item['episode_duration'],
        totalEpisodes: item['total_episodes'],
        publishedEpisodes: item['published_episodes'],
        publishPlan: (item['publish_plan'] as string[]).map(s => new Date(s)),
        originalWorkType: item['original_work_type'],
        staffs, relations,
        cover: cover.animationOrNull(item['cover']),
        coverFile: null
    }
}

function mapPublishTimeToCalendar(publishTime: string): Calendar {
    const [year, month] = publishTime.split('-')
    return {year: parseInt(year), month: parseInt(month)}
}

function remapData(item: Instance, originItem: Instance) {
    const data: {[key: string]: any} = {}
    if(item.title !== originItem.title) data['title'] = item.title
    if(item.originTitle !== originItem.originTitle) data['origin_title'] = item.originTitle || ''
    if(item.otherTitle !== originItem.otherTitle) data['other_title'] = item.otherTitle || ''
    if(item.introduction !== originItem.introduction) data['introduction'] = item.introduction || ''
    if(item.keyword !== originItem.keyword) data['keyword'] = item.keyword || ''
    if(item.sexLimitLevel !== originItem.sexLimitLevel) data['sex_limit_level'] = item.sexLimitLevel
    if(item.violenceLimitLevel !== originItem.violenceLimitLevel) data['violence_limit_level'] = item.violenceLimitLevel
    if(item.originalWorkType !== originItem.originalWorkType) data['original_work_type'] = item.originalWorkType
    if(item.publishType !== originItem.publishType) data['publish_type'] = item.publishType
    if(item.episodeDuration !== originItem.episodeDuration) data['episode_duration'] = item.episodeDuration
    if(!calendarEquals(item.publishTime, originItem.publishTime)) data['publish_time'] = item.publishTime ? calendarToString(item.publishTime) : null
    if(item.totalEpisodes !== originItem.totalEpisodes) data['total_episodes'] = item.totalEpisodes
    if(item.publishedEpisodes !== originItem.publishedEpisodes) data['published_episodes'] = item.publishedEpisodes
    if(!equalPublishPlan(item.publishPlan, originItem.publishPlan)) data['publish_plan'] = item.publishPlan.map(dateToUTCString)
    if(!equalTags(item.tags, originItem.tags)) data['tags'] = item.tags.map(t => t.id ?? t.name)
    if(!equalStaffs(item.staffs, originItem.staffs)) data['staffs'] = objects.mapEntry(item.staffs, v => v.map(i => i.id))
    if(!equalRelations(item.relations, originItem.relations)) data['relations'] = objects.mapEntry(item.relations, v => v.map(i => i.id))

    return data
}

function equalPublishPlan(a: Date[], b: Date[]): boolean {
    if(a.length !== b.length) return false
    for(let i = 0; i < a.length; ++i) {
        if(a[i].getTime() !== b[i].getTime()) {
            return false
        }
    }
    return true
}
function equalTags(a: TagItem[], b: TagItem[]): boolean {
    if(a.length !== b.length) return false
    const setA = new Set(a.map(t => t.name)), setB = new Set(b.map(t => t.name))
    return sets.equals(setA, setB)
}
function equalStaffs(a: {[type: string]: StaffItem[]}, b: {[type: string]: StaffItem[]}): boolean {
    for(const { name } of staffTypes) {
        const itemA = a[name], itemB = b[name]
        if(itemA.length !== itemB.length) return false
        const setA = new Set(itemA.map(i => i.id)), setB = new Set(itemB.map(i => i.id))
        if(!sets.equals(setA, setB)) return false
    }
    return true
}
function equalRelations(a: {[type: string]: RelationItem[]}, b: {[type: string]: RelationItem[]}): boolean {
    for(const { name } of relations) {
        const itemA = a[name], itemB = b[name]
        if(itemA == null && itemB == null) continue
        if((itemA != null && itemB == null) || (itemA == null && itemB != null) || itemA.length !== itemB.length) return false
        for(let i = 0; i < itemA.length; ++i) {
            if(itemA[i].id !== itemB[i].id) {
                return false
            }
        }
    }
    return true
}
</script>
