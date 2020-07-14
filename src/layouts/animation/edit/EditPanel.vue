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
import { StaffItem } from './StaffEditor.vue'
import { RelationItem } from './RelationEditor.vue'
import { editInjectionKey, swrInjectionKey } from '@/definitions/injections'
import { useEditorForm, useEditorUploadImage } from '@/functions/editor'
import { dateToCalendar, Calendar } from '@/functions/format'
import { secondaryBarItems, editItem } from '@/definitions/secondary-bar'
import config from '@/config'

const emptyCover = require('@/assets/empty_cover.jpg')

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
    for(let staff of item['staffs']) {
        let arr = staffs[staff['staff_type']]
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
                        cover: item['cover'] ? `${config.SERVER_URL}/api/database/cover/animation/${item['cover']}` : emptyCover
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
        tags: item['tags'],
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
        cover: item['cover'] ? `${config.SERVER_URL}/api/database/cover/animation/${item['cover']}` : null,
        coverFile: null
    }
}

function remapData(item: Instance, originItem: Instance) {
    return {
        //TODO
    }
}

function mapPublishTimeToCalendar(publishTime: string): Calendar {
    const [year, month] = publishTime.split('-')
    return {year: parseInt(year), month: parseInt(month)}
}
</script>
