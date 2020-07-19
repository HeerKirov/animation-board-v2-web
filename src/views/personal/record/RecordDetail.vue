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
        div.ui.active.centered.inline.loader.mt-4(v-if="loading && !detail")
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
                        ProgressBoard(:id="idRef", :total-episodes="detail.totalEpisodes", :published-episodes="detail.publishedEpisodes", @detailChanged="manual")
                    div(v-else)
                        
                    
</template>

<script lang="ts">
import { defineComponent, computed, Ref, watch, ref, watchEffect } from 'vue'
import { useRoute, RouteLocationNormalizedLoaded, useRouter } from 'vue-router'
import LabelSwitch from '@/components/LabelSwitch.vue'
import ProgressBoard from '@/layouts/record/ProgressBoard.vue'
import GraphBoard from '@/layouts/record/GraphBoard.vue'
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
    components: {LabelSwitch, ProgressBoard, GraphBoard},
    computed: {
        barItems: () => [topBarItems.record, detailItem],
    },
    setup() {
        const route = useRoute()
        const idRef = computed(() => route.name === 'Record.Detail' && route.params['id'] ? route.params['id'] as string : null)

        const currentPanel: Ref<"progress" | "graph"> = ref("progress")

        const mainDetail = useMainDetail(idRef)

        return {idRef, currentPanel, ...mainDetail}
    }
})

function useMainDetail(idRef: Ref<string | null>) {
    const router = useRouter()
    const { message } = useMessageBox()

    const { loading, data, update, deleteInstance, manual } = useSWR(computed(() => idRef.value ? `/api/personal/records/${idRef.value}` : null), null, {byAuthorization: 'LOGIN'})
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

    return {loading, manual, detail, onDetailUpdate, onDelete}
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