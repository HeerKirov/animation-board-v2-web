<template lang="pug">
div.ui.secondary.pointing.menu
    router-link.item(v-for="item in barItems", :class="{active: item.name === 'detail'}", :to="item.link")
        i(:class="item.icon")
        = '{{item.title}}'
    a.right.item(v-if="isStaff", @click="onEdit")
        i.edit.icon
        = '编辑'
div.ui.centered.grid
    div.ui.active.centered.inline.loader.mt-4(v-if="loading")
    div.ui.fourteen.wide.column(v-else-if="obj")
        div.ui.grid
            div.four.wide.column
                img.cover-image(:src="obj.cover")
            div.twelve.wide.column
                div.ui.grid
                    div.row
                        div.thirteen.wide.column
                            h1.text.ui.header.is-inline-block {{obj.title}}
                            label.sub-header.mb-2 {{obj.subTitle}}
                            div
                                template(v-if="obj.keywords")
                                    div.ui.tag.label.mb-1(v-for="keyword in obj.keywords") {{keyword}}
                                template(v-if="obj.tags")
                                    router-link.ui.label.mb-1(v-for="tag in obj.tags", :to="{name: 'Tag.Detail', params: {id: tag.id}}") {{tag.name}}
                        div.three.wide.column
                            div.ui.two.columns.grid
                                div.column.pr-1.pl-2
                                    LimitLevelLabel(v-if="obj.sexLimitLevel", type="sex", :value="obj.sexLimitLevel")
                                div.column.pl-1.pr-2
                                    LimitLevelLabel(v-if="obj.violenceLimitLevel", type="violence", :value="obj.violenceLimitLevel")
                    div.row
                        div.column
                            div(v-html="obj.introduction")
        div.ui.grid
            div.four.wide.column
                div.ui.large.fluid.label.text-center(:class="obj.publishType?.color ?? 'teal'")
                    span {{obj.publishType?.title ?? '未知类型'}}
                    div.detail.ml-1(v-if="obj.episodeDuration") {{obj.episodeDuration}}
            div.twelve.wide.column.pl-0
                span.ui.left.pointing.basic.label.large {{obj.publishTime}}
                span.ml-3.is-weight {{obj.episode}}
        div.ui.stackable.grid
            div.four.wide.column
                div.ui.stackable.grid.staff.list
                    div.seven.wide.column.staff.item-header
                        div.ui.tag.label(v-if="obj.originalWorkType", :class="obj.originalWorkType.color") {{obj.originalWorkType.title}}
                        div.ui.label(v-else-if="obj.staffs.AUTHOR") 原作者
                    div.nine.wide.column.staff.item-content
                        router-link.ui.tertiary.mini.button(v-for="i in (obj.staffs.AUTHOR || [])", :to="{name: 'Staff.Detail', params: {id: i.id}}") {{i.name}}
                    template(v-if="obj.staffs.COMPANY")
                        div.seven.wide.column.staff.item-header
                            div.ui.label 制作公司
                        div.nine.wide.column.staff.item-content
                            router-link.ui.tertiary.mini.button(v-for="i in (obj.staffs.COMPANY)", :to="{name: 'Staff.Detail', params: {id: i.id}}") {{i.name}}
                    template(v-if="obj.staffs.STAFF")
                        div.seven.wide.column.staff.item-header
                            div.ui.label STAFF
                        div.nine.wide.column.staff.item-content
                            router-link.ui.tertiary.mini.button(v-for="i in (obj.staffs.STAFF || [])", :to="{name: 'Staff.Detail', params: {id: i.id}}") {{i.name}}
            div.six.wide.column
                DiaryPanel
            div.six.wide.column
                CommentPanel
        template(v-if="obj.relations && obj.relations.length > 0")
            div.ui.divider
            div.sub-title.mb-2 相关动画
            div.ui.four.columns.grid
                div.column.pb-0(v-for="r in obj.relations")
                    router-link(:to="{name: 'Animation.Detail', params: {id: r.id}}")
                        img.relations.item-image(:src="r.cover")
                    div.relations.item-content
                        router-link.is-weight(:to="{name: 'Animation.Detail', params: {id: r.id}}") {{r.title}}
                        div.font-size-13 {{r.relationType}}
</template>

<script lang="ts">
import {defineComponent, inject, computed, toRef} from 'vue'
import DiaryPanel from './DiaryPanel.vue'
import CommentPanel from './CommentPanel.vue'
import LimitLevelLabel from './LimitLevelLabel.vue'
import { useAuth } from '@/functions/auth'
import { toSubTitle, toPublishTime, toHtmlStr } from '@/functions/display'
import { secondaryBarItems, detailItem } from '@/definitions/secondary-bar'
import { publishTypes, originalWorkTypes, relations } from '@/definitions/animation-definition'
import { swrInjectionKey, editInjectionKey } from '@/definitions/injections'
import { toMap } from '@/definitions/util'
import cover from '@/plugins/cover'

const publishTypeMap = toMap(publishTypes)
const originalWorkTypeMap = toMap(originalWorkTypes)
const relationMap = toMap(relations)

export default defineComponent({
    components: {DiaryPanel, CommentPanel, LimitLevelLabel},
    computed: {
        barItems: () => [secondaryBarItems.database.animation, detailItem]
    },
    setup() {
        const { stats } = useAuth()

        const { loading, data } = inject(swrInjectionKey)!
        const obj = computed(() => data.value ? mapItem(data.value) : null)

        const editMode = inject(editInjectionKey)!
        const onEdit = () => { editMode.value = true }

        return {obj, loading, onEdit, isStaff: toRef(stats, 'isStaff')}
    }
})

function mapItem(item: any) {
    const staffs: {[type: string]: any[] | null} = {'AUTHOR': null, 'COMPANY': null, 'STAFF': null}
    for(let staff of item['staffs']) {
        let arr = staffs[staff['staff_type']]
        if(arr == null) {
            staffs[staff['staff_type']] = arr = []
        }
        arr.push({id: staff['id'], name: staff['name']})
    }

    return {
        title: item['title'],
        subTitle: toSubTitle(item['origin_title'], item['other_title']),
        keywords: item['keyword'] ? (item['keyword'] as string).split(' ').map(v => v.trim()).filter(v => !!v) : null,
        introduction: toHtmlStr(item['introduction']),
        tags: item['tags'],
        cover: cover.animationOrEmpty(item['cover']),
        publishTime: item['publish_time'] && toPublishTime(item['publish_time']),
        episode: item['published_episodes'] >= item['total_episodes'] ? `已完结，共${item['total_episodes']}话` : `已发布${item['published_episodes']}话，共${item['total_episodes']}话`,
        episodeDuration: item['episode_duration'] ? (`${item['total_episodes'] > 1 ? `每集` : ''}${item['episode_duration']}分钟`) : null,
        publishType: publishTypeMap[item['publish_type']],
        originalWorkType: originalWorkTypeMap[item['original_work_type']],
        sexLimitLevel: item['sex_limit_level'],
        violenceLimitLevel: item['violence_limit_level'],
        relations: item['relations_topology'].map(mapRelation),
        staffs,
    }
}

function mapRelation(r: any) {
    return {
        id: r['id'],
        title: r['title'],
        cover: cover.animationOrEmpty(r['cover']),
        relationType: relationMap[r['relation_type']]?.title
    }
}
</script>

<style scoped>
    .sub-header {
        display: inline-block;
        vertical-align: top;
        margin-left: 10px;
        font-weight: 500;
        font-size: 12px;
    }
    .sub-title {
        font-weight: 500;
        font-size: 12px;
    }
    .cover-image {
        width: 100%;
    }
    .relations.item-image {
        width: 25%;
    }
    .relations.item-content {
        width: 75%;
        padding-left: 2px;
        vertical-align: top;
        display: inline-block;
    }
    .staff.list {
        padding-top: 0 !important;
    }
    .staff.item-header {
        padding: 2px 0 8px 10px !important;
        text-align: right;
    }
    .staff.item-content {
        padding: 0 1px 10px 2px !important;
    }
</style>
