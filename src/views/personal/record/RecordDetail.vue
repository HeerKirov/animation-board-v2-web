<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'detail'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
        template(v-if="detail")
            router-link.right.item(:to="{name: 'Animation.Detail', params: {id: detail.id}}")
                i.database.icon
                = '数据库页面'
            router-link.item(:to="{name: 'Comment.Detail', params: {id: detail.id}}")
                i.bookmark.icon
                = '评价'
    div.ui.centered.grid
        div.ui.active.centered.inline.loader.mt-4(v-if="loading")
        div.ui.fourteen.wide.column(v-else-if="detail")
            div.ui.stackable.grid
                div.three.wide.column
                    div.ui.card
                        img.cover-image(:src="detail.cover")
                        div.content
                            div.text-center(v-if="detail.publishedEpisodes < detail.totalEpisodes")
                                span.ui.teal.label {{detail.publishedEpisodes}}
                                = '/'
                                span.ui.grey.label {{detail.totalEpisodes}}
                            div.text-center(v-else)
                                = '全'
                                span.ui.grey.label {{detail.totalEpisodes}}
                                = '话'
                        div.extra.content.px-1.pb-1(v-if="detail.publishPlan.length > 0")
                            div.mb-1 后续发布
                            div.publish-plan-gap(v-for="(plan, index) in detail.publishPlan")
                                div.ui.teal.fluid.label
                                    span {{index + detail.publishedEpisodes + 1}}
                                    div.detail {{plan}}
                    a.ui.red.fluid.mini.button(@click="onDelete")
                        i.trash.icon
                        = '删除记录'
                div.thirteen.wide.column
                    div
                        h1.text.ui.header.is-inline-block.mr-2 {{detail.title}}
                        span.ui.tag.label.text-top(:class="detail.status.color") {{detail.status.title}}
                    div
                        LabelSwitch(:modelValue="detail.inDiary", @update:modelValue="onDetailUpdate('in_diary', $event)", on-title="订阅中", off-title="未订阅", on-color="blue", on-icon="thumbtack icon", off-color="")
                        LabelSwitch(:modelValue="detail.seenOriginal", @update:modelValue="onDetailUpdate('seen_original', $event)", on-title="看过原作", off-title="未看过原作", on-color="brown", on-icon="book open icon", off-color="")
                    div.ui.secondary.pointing.two.item.menu
                        a.item(:class="{active: currentPanel === 'progress'}", @click="currentPanel = 'progress'")
                            i.list.ol.icon
                            = '进度'
                        a.item(:class="{active: currentPanel === 'graph'}", @click="currentPanel = 'graph'")
                            i.chart.bar.icon
                            = '离散图'
                    div(v-if="currentPanel === 'progress'")
                        div.ui.grid(v-if="progressFirst")
                            div.ui.row.pb-0
                                div.ui.twelve.wide.column.pr-1half
                                    span.ui.label {{progressFirst.ordinal > 1 ? `${progressFirst.ordinal}周目` : "首次订阅"}}
                                    a.ui.tertiary.mini.button.right.floated
                                        //- i.notched.circle.loading.icon.ml-1.mr-0(v-if="item.updateLoading")
                                        i.plane.icon
                                        = 'NEXT 第{{progressFirst.watchedEpisodes + 1}}话'
                                div.ui.four.wide.column
                                    a.ui.tertiary.mini.button.right.floated
                                            = '删除这一条进度'
                                            i.close.icon.mr-0.ml-1
                            div.ui.row
                                div.ui.twelve.wide.column
                                    span {{Math.floor(progressFirst.watchedEpisodes / detail.totalEpisodes * 100)}}%
                                    span.float-right.bottom-gap 已看完
                                        a.ui.label.mini {{progressFirst.watchedEpisodes}}
                                        = '话'
                                    div.progress-bar
                                        div.content(:style="{width: `${Math.floor(progressFirst.watchedEpisodes / detail.totalEpisodes * 100)}%`}")
                                div.ui.four.wide.column.px-2
                                    div 
                                        i.calendar.plus.outline.icon
                                        = '订阅时间 {{progressFirst.startTime}}'
                                    div.mt-1
                                        i.calendar.check.icon
                                        = '完成时间 {{progressFirst.finishTime}}'
                        div.ui.divider.mb-0
                        table.ui.very.basic.table.mt-0(v-if="progress.length > 0")
                            tbody
                                tr(v-for="item in progress")
                                    td
                                        div.ui.label {{item.ordinal}}
                                        = '周目'
                                    td
                                        i {{item.watchedEpisodes}}
                                        = '话 已完成'
                                    td.right.aligned.collapsing {{item.startTime ?? '(未知时间)'}}
                                    td.collapsing →
                                    td.collapsing {{item.finishTime}}
                                    td.collapsing: a.ui.tertiary.mini.icon.button: i.close.icon
                        a.ui.tertiary.mini.button.right.floated(v-if="progressFirst && progressFirst.watchedEpisodes >= detail.totalEpisodes")
                            = '新建进度'
                            i.plus.icon.mr-0.ml-1
                    
</template>

<script lang="ts">
import { defineComponent, computed, Ref, watch, ref, watchEffect } from 'vue'
import { useRoute, RouteLocationNormalizedLoaded, useRouter } from 'vue-router'
import LabelSwitch from '@/components/LabelSwitch.vue'
import { detailItem, topBarItems } from '@/definitions/secondary-bar'
import { useSWR } from '@/functions/server'
import { useMessageBox } from '@/functions/message-box'
import { watchPageTitle } from '@/functions/document'
import { toWeekdayTableTime, toCNStringDate } from '@/functions/display'
import { dateToCalendar, calendarToString, CalendarUntilPart } from '@/functions/format'
import cover from '@/plugins/cover'

interface Progress {
    ordinal: number
    watchedEpisodes: number
    startTime: string | null
    finishTime: string | null
}

const statusMap: {[name: string]: {title: string, color: string}} = {
    NO_PROGRESS: {title: '无进度', color: ''},
    WATCHING: {title: '进行中', color: 'green'},
    REWATCHING: {title: '重看中', color: 'olive'},
    COMPLETED: {title: '已看完', color: 'grey'}
}

export default defineComponent({
    components: {LabelSwitch},
    computed: {
        barItems: () => [topBarItems.record, detailItem],
    },
    setup() {
        const route = useRoute()
        const idRef = computed(() => route.name === 'Record.Detail' && route.params['id'] ? route.params['id'] as string : null)

        const currentPanel: Ref<"progress" | "graph"> = ref("progress")

        const mainDetail = useMainDetail(idRef)

        const progress = useProgress(idRef, currentPanel)

        return {currentPanel, ...mainDetail, ...progress}
    }
})

function useMainDetail(idRef: Ref<string | null>) {
    const router = useRouter()
    const { message } = useMessageBox()

    const { loading, data, update, deleteInstance } = useSWR(computed(() => idRef.value ? `/api/personal/records/${idRef.value}` : null), null, {byAuthorization: 'LOGIN'})
    watchPageTitle(() => data.value?.["title"])

    const detail = computed(() => data.value ? mapDetail(data.value) : null)

    const onDetailUpdate = async (key: string, value: any) => {
        await update({[key]: value}, {method: 'PATCH'})
    }

    const onDelete = async () => {
        const action = await message({
            header: '删除确认',
            content: '确定要删除此条记录吗？与此动画相关的所有观看记录都会被清空。该操作不可撤销。',
            type: 'WARNING',
            actions: ['TRUE', 'FALSE']
        })
        if(action === 'TRUE') {
            const r = await deleteInstance()
            if(r.ok) { 
                router.push({name: 'Record.Find'})
            }
        }
    }

    return {loading, detail, onDetailUpdate, onDelete}
}

function useProgress(idRef: Ref<string | null>, currentPanel: Ref<"progress" | "graph">) {
    const init = ref(false)
    const stopInit = watch(currentPanel, () => { 
        if(currentPanel.value === 'progress') {
            init.value = true
            stopInit?.()
        } 
    }, {immediate: true})

    const { data } = useSWR(computed(() => init.value && idRef.value ? `/api/personal/records/${idRef.value}/progress` : null), null, {byAuthorization: 'LOGIN'})

    const progress: Ref<Progress[]> = ref([])
    const progressFirst: Ref<Progress | null> = ref(null)

    watch(data, () => { 
        const list = data.value ? (data.value as any[]).map(mapProgress).reverse() : []
        if(list.length === 0) {
            progress.value = []
            progressFirst.value = null
        }else if(list.length === 1) {
            progress.value = []
            progressFirst.value = list[0]
        }else{
            progress.value = list.slice(1)
            progressFirst.value = list[0]
        }
    }, {immediate: true})

    return {progress, progressFirst}
}

function mapDetail(data: any) {
    return {
        id: data['animation_id'],
        title: data['title'],
        cover: cover.animationOrEmpty(data['cover']),
        seenOriginal: data['seen_original'],
        inDiary: data['in_diary'],
        totalEpisodes: data['total_episodes'],
        publishedEpisodes: data['published_episodes'] as number, 
        watchedEpisodes: data['watched_episodes'] as number | null,
        status: statusMap[data['status']],
        progressCount: data['progress_count'],
        publishPlan: mapPublishPlan(data['publish_plan'] as string[])
    }
}

function mapPublishPlan(data: string[]) {
    const num = 3
    const origin = data.length > num ? data.slice(0, num) : data
    return origin.map(d => calendarToString(dateToCalendar(new Date(d), CalendarUntilPart.Minute)))
}

function mapProgress(item: any): Progress {
    return {
        ordinal: item['ordinal'],
        watchedEpisodes: item['watched_episodes'],
        startTime: item['start_time'] ? toCNStringDate(new Date(item['start_time'])) : null,
        finishTime: item['finish_time'] ? toCNStringDate(new Date(item['finish_time'])) : null
    }
}
</script>

<style scoped>
    .cover-image {
        width: 100%;
    }
    .publish-plan-gap {
        margin-bottom: 3px;
    }
    .progress-bar {
        height: 15px; 
        width: 100%; 
        background-color: lightgray; 
        border-radius: 3px;
        overflow: hidden;
    }
    .progress-bar .content {
        height: 100%;
        background-color: #21BA45;
    }
    .pr-1half {
        padding-right: 7px !important;
    }
    .bottom-gap {
        margin-bottom: 3px;
    }
</style>