<template lang="pug">
div.ui.form
    template(v-if="panelIndex === 0")
        div.ui.fields
            div.twelve.wide.field
                div.field.required
                    label 标题
                    input.ui.input(placeholder="动画的主标题")
                div.fields
                    div.eight.wide.field
                        label 原语言标题
                        input.ui.input(placeholder="原语言书写的标题")
                    div.eight.wide.field
                        label 其他标题
                        input.ui.input(placeholder="其他常用到的标题")
                div.field
                    label 关键字
                    input.ui.input(placeholder="描绘动画独有特征的简单词组，使用空格分隔")
            div.four.wide.field
                div.ui.card
                    a.image
                        img(:src="img")
        div.ui.field
            label 标签
            TagEditor(v-model:value="data.tags")
        div.ui.fields
            div.eight.wide.field
                label 分级
                    i.venus.mars.icon.ml-1
                div.ui.segment
                    ItemSelector(:items="sexLimitLevels", :show-none="false", v-model:selected="data.sexLimitLevel")
                    ul.ui.bulleted.list.font-size-11(v-if="data.sexLimitLevel")
                        li.item(v-for="line in sexLimitIntroductions[data.sexLimitLevel]") {{line}}
            div.eight.wide.field
                label 分级
                    i.hand.rock.outline.icon.ml-1
                div.ui.segment
                    ItemSelector(:items="violenceLimitLevels", :show-none="false", v-model:selected="data.violenceLimitLevel")
                    ul.ui.bulleted.list.font-size-11(v-if="data.violenceLimitLevel")
                        li.item(v-for="line in violenceLimitIntroductions[data.violenceLimitLevel]") {{line}}
        div.ui.field
            label 简介
            textarea.ui.input(placeholder="用不长的一段文字简要介绍此动画")
    template(v-if="panelIndex === 1")
        div.field
            label 放送类型
            ItemSelector(:items="publishTypes", :show-none="false")
        div.ui.fields
            div.six.wide.field
                label 放送时间
                //- 需要替换为year & month picker
                input.ui.input(placeholder="动画发布的时间")
            div.six.wide.field
                label 单集时长
                input.ui.input(type="number", min="0", placeholder="单集平均时长(分钟)")
        div.ui.fields
            div.six.wide.field.required
                label 总集数
                input.ui.input(type="number", min="1", placeholder="动画总共拥有的集数")
            div.six.wide.field.required
                label 已发布集数
                input.ui.input(type="number", min="0", placeholder="动画到目前为止已经发布的集数")
        div.ui.fields
            div.six.wide.field
                label 放送计划
                PublishPlanList
            div.six.wide.field
                PublishPlanPicker
    template(v-if="panelIndex === 2")
        div.ui.fields
            div.eight.wide.field
                div.ui.field
                    label 原作类型
                    ItemSelector(:items="originalWorkTypes", :show-none="false")
                div.ui.field.mt-2
                    label 原作者/原案
                    StaffEditor(v-model:value="data.staffs.AUTHOR")
                div.ui.field.mt-2
                    label 制作公司
                    StaffEditor(v-model:value="data.staffs.COMPANY")
                div.ui.field.mt-2
                    label STAFF
                    StaffEditor(v-model:value="data.staffs.STAFF")
            div.eight.wide.field
                StaffPicker
    template(v-if="panelIndex === 3")
        RelationEditor
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'
import ItemSelector from '@/components/ItemSelector.vue'
import TagEditor from './TagEditor.vue'
import PublishPlanPicker from './PublishPlanPicker.vue'
import PublishPlanList from './PublishPlanList.vue'
import StaffPicker from './StaffPicker.vue'
import StaffEditor from './StaffEditor.vue'
import RelationEditor from './RelationEditor.vue'
import { publishTypes, originalWorkTypes, sexLimitLevels, violenceLimitLevels, sexLimitIntroductions, violenceLimitIntroductions } from '@/definitions/animation-definition'

const img = require('@/assets/empty_avatar.jpg')

export default defineComponent({
    components: {ItemSelector, TagEditor, PublishPlanPicker, PublishPlanList, StaffPicker, StaffEditor, RelationEditor},
    props: {
        panelIndex: Number
    },
    computed: {
        img: () => img,
        publishTypes: () => publishTypes,
        originalWorkTypes: () => originalWorkTypes,
        sexLimitLevels: () => sexLimitLevels,
        violenceLimitLevels: () => violenceLimitLevels,
        sexLimitIntroductions: () => sexLimitIntroductions,
        violenceLimitIntroductions: () => violenceLimitIntroductions
    },
    setup(props) {
        const data = reactive({
            sexLimitLevel: null,
            violenceLimitLevel: null,
            tags: [{name: '轻百合'}, {name: '科幻'}, {name: '超能力'}, {name: '战斗'}, {name: '日常'}],
            staffs: {
                AUTHOR: [{name: '冬川基'}, {name: '镰池和马'}],
                COMPANY: [{name: 'J.C.STAFF'}],
                STAFF: []
            }
        })

        return {data}
    }
})
</script>