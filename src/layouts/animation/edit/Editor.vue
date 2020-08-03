<template lang="pug">
div.ui.form
    template(v-if="panelIndex === 0")
        div.ui.fields
            div.twelve.wide.field
                div.field.required
                    label 标题
                    InputBox(placeholder="动画的主标题", v-model="data.title", :not-blank="true", :max-length="128")
                div.fields
                    div.eight.wide.field
                        label 原语言标题
                        InputBox(placeholder="原语言中的标题", v-model="data.originTitle", :max-length="128")
                    div.eight.wide.field
                        label 其他标题
                        InputBox(placeholder="其他常用到的标题", v-model="data.otherTitle", :max-length="128")
                div.field
                    label 关键字
                    InputBox(placeholder="描绘动画独有特征的简单词组，使用空格分隔", v-model="data.keyword", :max-length="255")
            div.four.wide.field
                div.ui.card
                    a.image(@click="onClickUpload")
                        img(:src="data.cover || emptyCover")
        div.ui.field
            label 标签
            TagEditor(v-model:value="data.tags")
        div.ui.fields
            div.eight.wide.field
                label 分级
                    i.venus.mars.icon.ml-1
                div.ui.segment
                    ItemSelector(:items="sexLimitLevels", :color="null", :show-none="false", v-model:selected="data.sexLimitLevel")
                    ul.ui.bulleted.list.font-size-11(v-if="data.sexLimitLevel")
                        li.item(v-for="line in sexLimitIntroductions[data.sexLimitLevel]") {{line}}
            div.eight.wide.field
                label 分级
                    i.hand.rock.outline.icon.ml-1
                div.ui.segment
                    ItemSelector(:items="violenceLimitLevels", :color="null", :show-none="false", v-model:selected="data.violenceLimitLevel")
                    ul.ui.bulleted.list.font-size-11(v-if="data.violenceLimitLevel")
                        li.item(v-for="line in violenceLimitIntroductions[data.violenceLimitLevel]") {{line}}
        div.ui.field
            label 简介
            textarea.ui.input(placeholder="用不长的一段文字简要介绍此动画", v-model="data.introduction")
        input.hidden-input(type="file", accept="image/png,image/jpeg", ref="uploader", @change="onUpload")
    template(v-if="panelIndex === 1")
        div.field
            label 放送类型
            ItemSelector(:items="publishTypes", :show-none="false", v-model:selected="data.publishType")
        div.ui.fields
            div.six.wide.field
                label 放送时间
                CalendarBox(placeholder="动画发布的时间", v-model="data.publishTime", first="month", until="month")
            div.six.wide.field
                label 单集时长
                IntBox(:min="0", placeholder="单集平均时长(分钟)", v-model="data.episodeDuration")
        div.ui.fields
            div.six.wide.field.required
                label 总集数
                IntBox(:min="1", :not-null="true", placeholder="动画总共拥有的集数", v-model="data.totalEpisodes")
            div.six.wide.field.required
                label 已发布集数
                IntBox(:min="0", :not-null="true", placeholder="动画到目前为止已经发布的集数", v-model="data.publishedEpisodes")
        div.ui.fields
            div.six.wide.field
                label 放送计划
                PublishPlanPicker(:max-count="publishPlanMaxCount", @pick="onPickPublishPlan")
            div.six.wide.field
                label.hidden PLAN
                PublishPlanList(:value="data.publishPlan", @delete="onDeletePublishPlan")
    template(v-if="panelIndex === 2")
        div.ui.fields
            div.eight.wide.field
                div.ui.field
                    label 原作类型
                    ItemSelector(:items="originalWorkTypes", :show-none="false", v-model:selected="data.originalWorkType")
                div.ui.field.mt-2
                    label 原作者/原案
                    StaffEditor.mt-2(:value="data.staffs.AUTHOR")
                div.ui.field.mt-2
                    label 制作公司
                    StaffEditor.mt-2(:value="data.staffs.COMPANY")
                div.ui.field.mt-2
                    label STAFF
                    StaffEditor.mt-2(:value="data.staffs.STAFF")
            div.eight.wide.field
                StaffPicker(@append="onStaffAppend")
    template(v-if="panelIndex === 3")
        RelationEditor(:value="data.relations", :title="data.title", :id="data.id")
</template>

<script lang="ts">
import { defineComponent, PropType, watch, ref, Ref, computed } from 'vue'
import ItemSelector from '@/components/ItemSelector.vue'
import InputBox from '@/components/InputBox.vue'
import IntBox from '@/components/IntBox.vue'
import CalendarBox from '@/components/CalendarBox.vue'
import PublishPlanPicker from './PublishPlanPicker.vue'
import PublishPlanList from './PublishPlanList.vue'
import StaffPicker, { AppendEvent } from './StaffPicker.vue'
import TagEditor, { TagItem } from './TagEditor.vue'
import StaffEditor, { StaffItem } from './StaffEditor.vue'
import RelationEditor, { RelationItem } from './RelationEditor.vue'
import { publishTypes, originalWorkTypes, sexLimitLevels, violenceLimitLevels, sexLimitIntroductions, violenceLimitIntroductions } from '@/definitions/animation-definition'
import { watchEditorValidate, useImageUploader } from '@/functions/editor'
import { Calendar } from '@/functions/format'
import { emptyCover } from '@/plugins/cover'

export interface Instance {
    id: number | null

    title: string | undefined
    originTitle: string | null
    otherTitle: string | null
    keyword: string | null
    tags: TagItem[]
    sexLimitLevel: string | null
    violenceLimitLevel: string | null
    introduction: string | null

    publishType: string | null
    publishTime: Calendar | null
    episodeDuration: number | null
    totalEpisodes: number
    publishedEpisodes: number
    publishPlan: Date[]

    originalWorkType: string | null
    staffs: {[type: string]: StaffItem[]}

    relations: {[type: string]: RelationItem[]}

    cover: string | null
    coverFile: File | null
}

function defaultInstance(): Instance {
    return {
        id: null,
        title: undefined, originTitle: null, otherTitle: null, keyword: null, tags: [], sexLimitLevel: null, violenceLimitLevel: null, introduction: null,
        publishType: null, publishTime: null, episodeDuration: 24, totalEpisodes: 12, publishedEpisodes: 0, publishPlan: [],
        originalWorkType: null, staffs: {AUTHOR: [], COMPANY: [], STAFF: []},
        relations: {},
        cover: null, coverFile: null
    }
}

export default defineComponent({
    components: {ItemSelector, InputBox, IntBox, CalendarBox, TagEditor, PublishPlanPicker, PublishPlanList, StaffPicker, StaffEditor, RelationEditor},
    props: {
        panelIndex: Number,
        value: (null as any) as PropType<Instance | null>
    },
    emits:['update:value'],
    computed: {
        emptyCover() { return emptyCover },
        publishTypes() { return publishTypes },
        originalWorkTypes() { return originalWorkTypes },
        sexLimitLevels() { return sexLimitLevels },
        violenceLimitLevels() { return violenceLimitLevels },
        sexLimitIntroductions() { return sexLimitIntroductions },
        violenceLimitIntroductions() { return violenceLimitIntroductions }
    },
    setup(props, {emit}) {
        const data = ref(props.value || defaultInstance())

        watch(() => props.value, () => {
            if(props.value != undefined) {
                data.value = props.value || defaultInstance()
            }
        })

        watchEditorValidate(data, v => emit('update:value', v), v => {
            return v.title === undefined
        })

        const imageUploader = useImageUploader(data)

        const publishPlan = usePublishPlan(data)

        const staffEditor = useStaffEditor(data)

        return {data, ...imageUploader, ...publishPlan, ...staffEditor}
    }
})

function usePublishPlan(data: Ref<Instance>) {
    const publishPlanMaxCount = computed(() => {
        const v = data.value.totalEpisodes - data.value.publishedEpisodes - data.value.publishPlan.length
        return v > 0 ? v : 0
    })

    const onPickPublishPlan = (items: Date[]) => {
        data.value.publishPlan.splice(data.value.publishPlan.length, 0, ...items)
    }

    const onDeletePublishPlan = (index: number) => {
        data.value.publishPlan.splice(index, 1)
    }

    return {publishPlanMaxCount, onPickPublishPlan, onDeletePublishPlan}
}

function useStaffEditor(data: Ref<Instance>) {
    const onStaffAppend = (e: AppendEvent) => {
        const list = data.value.staffs[e.type] || (data.value.staffs[e.type] = [])
        list.splice(list.length, 0, e.item)
    }

    return {onStaffAppend}
}
</script>

<style scoped>
    .hidden {
        visibility: hidden;
    }
    .hidden-input {
        visibility: hidden; 
        height: 0; 
        padding: 0 !important; 
        border: 0 !important;
    }
</style>
