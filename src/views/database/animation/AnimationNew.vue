<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'new'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
        a.right.item.disabled(v-if="updateLoading")
            i.notched.circle.loading.icon
            = '提交'
        a.right.item(@click="onSubmit", :class="{disabled: !valueExists}", v-else)
            i.check.icon
            = '提交'
    div.ui.centered.grid
        div.ui.three.wide.column
            div.ui.vertical.fluid.tabular.menu
                each item, index in ['介绍', '放送信息', '制作信息', '关联的动画']
                    a.item(:class=`{active: panelIndex === ${index}}`, @click="panelIndex = " + index)= item
        div.ui.eleven.wide.column
            Editor(:panel-index="panelIndex", @update:value="onEditorChanged")
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import Editor, { Instance } from '@/layouts/animation/edit/Editor.vue'
import { useCreatorForm, useEditorUploadImage } from '@/functions/editor'
import { calendarToString, dateToUTCString } from '@/functions/format'
import { objects } from '@/functions/util'
import { secondaryBarItems, newItem } from '@/definitions/secondary-bar'

export default defineComponent({
    components: {Editor},
    computed: {
        barItems: () => [secondaryBarItems.database.animation, newItem]
    },
    setup() {
        const panelIndex = ref(0)

        const router = useRouter()

        const { afterSubmit } = useEditorUploadImage<Instance>(v => v.coverFile, (v, d) => `/api/database/animations/${d['id']}/cover`)
        const form = useCreatorForm('/api/database/animations', remapData, {
            afterSubmit,
            success(r) { router.push({name: 'Animation.Detail', params: {id: r.data['id']}}) }
        })

        return {panelIndex, ...form}
    }
})

function remapData(item: Instance) {
    return {
        title: item.title,
        origin_title: item.originTitle,
        other_title: item.otherTitle,
        introduction: item.introduction,
        keyword: item.keyword,
        sex_limit_level: item.sexLimitLevel,
        violence_limit_level: item.violenceLimitLevel,
        original_work_type: item.originalWorkType,
        publish_type: item.publishType,
        episode_duration: item.episodeDuration,
        publish_time: item.publishTime ? calendarToString(item.publishTime) : null,
        total_episodes: item.totalEpisodes,
        published_episodes: item.publishedEpisodes,
        publish_plan: item.publishPlan.map(dateToUTCString),
        tags: item.tags.map(t => t.id ?? t.name),
        staffs: objects.mapEntry(item.staffs, v => v.map(i => i.id)),
        relations: objects.mapEntry(item.relations, v => v.map(i => i.id))
    }
}
</script>
