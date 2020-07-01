<template lang="pug">
div.ui.secondary.pointing.menu
    router-link.item(v-for="item in barItems", :class="{active: item.name === 'detail'}", :to="item.link")
        i(:class="item.icon")
        = '{{item.title}}'
    a.right.item 
        i.edit.icon
        = '编辑'
div.ui.centered.grid
    div.ui.active.centered.inline.loader.mt-4(v-if="loading")
    div.ui.fourteen.wide.column(v-else)
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
                                //- TODO 添加有关分级信息的浮动性详细说明
                                div.column.pr-1.pl-2
                                    div.ui.fluid.right.label.text-center.px-0(v-if="obj.sexLimitLevel", :class="obj.sexLimitLevel.color")
                                        i.mr-0.mb-1.venus.mars.icon
                                        div {{obj.sexLimitLevel.title}}
                                div.column.pl-1.pr-2
                                    div.ui.fluid.right.label.text-center.px-0(v-if="obj.violenceLimitLevel", :class="obj.violenceLimitLevel.color")
                                        i.mr-0.mb-1.hand.rock.outline.icon
                                        div {{obj.violenceLimitLevel.title}}
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
import { defineComponent, inject, computed } from 'vue'
import DiaryPanel from './DiaryPanel.vue'
import CommentPanel from './CommentPanel.vue'
import { secondaryBarItems, detailItem } from '@/definitions/secondary-bar'
import { publishTypes, originalWorkTypes, sexLimitLevels, violenceLimitLevels, relations } from '@/definitions/animation-definition'
import { toMap } from '@/definitions/util'
import { swrInjectionKey } from '@/definitions/injections'
import config from '@/config'
import { useRoute } from 'vue-router'

const img = require('@/assets/empty_avatar.jpg')

const publishTypeMap = toMap(publishTypes)
const originalWorkTypeMap = toMap(originalWorkTypes)
const sexLimitLevelMap = toMap(sexLimitLevels)
const violenceLimitLevelMap = toMap(violenceLimitLevels)
const relationMap = toMap(relations)

export default defineComponent({
    components: {DiaryPanel, CommentPanel},
    computed: {
        img() { return img },
        barItems: () => [secondaryBarItems.database.animation, detailItem]
    },
    setup() {
        const { loading, data } = inject(swrInjectionKey)!
        const obj = computed(() => data.value ? mapItem(data.value) : {})

        return {obj, loading}
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
        cover: item['cover'] ? `${config.SERVER_URL}/api/database/cover/animation/${item['cover']}` : img,
        publishTime: item['publish_time'] && toPublishTime(item['publish_time']),
        episode: item['published_episodes'] >= item['total_episodes'] ? `已完结，共${item['total_episodes']}话` : `已发布${item['published_episodes']}话，共${item['total_episodes']}话`,
        episodeDuration: item['episode_duration'] ? (`${item['total_episodes'] > 1 ? `平均` : ''}${item['episode_duration']}分钟`) : null,
        publishType: publishTypeMap[item['publish_type']],
        originalWorkType: originalWorkTypeMap[item['original_work_type']],
        sexLimitLevel: sexLimitLevelMap[item['sex_limit_level']],
        violenceLimitLevel: violenceLimitLevelMap[item['violence_limit_level']],
        relations: item['relations_topology'].map(mapRelation),
        staffs,
    }
}

function mapRelation(r: any) {
    return {
        id: r['id'],
        title: r['title'],
        cover: r['cover'] ? `${config.SERVER_URL}/api/database/cover/animation/${r['cover']}` : img,
        relationType: relationMap[r['relation_type']]?.title
    }
}

function toSubTitle(t1: any, t2: any): string {
    if(t1 && t2) return `${t1} / ${t2}`
    else if(t1) return t1
    else if(t2) return t2
    else return ''
}

function toPublishTime(publishTime: string): string {
    const [year, month] = publishTime.split('-')
    return `${year}年${month}月`
}

function toHtmlStr(s: string | null): string | null {
    return s?.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>') ?? null
}
</script>

<style scoped>
    .sub-header {
        display: inline-block;
        vertical-align: top;
        margin-left: 10px;
        font-weight: 525;
        font-size: 12px;
    }
    .sub-title {
        font-weight: 525;
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
        padding-top: 0px !important;
    }
    .staff.item-header {
        padding: 2px 0px 8px 10px !important;
        text-align: right;
    }
    .staff.item-content {
        padding: 0px 1px 10px 2px !important;
    }
</style>