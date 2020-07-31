<template lang="pug">
template(v-if="visible")
    div.ui.dimmer.active(@click="onClose")
    div.ui.modal.tiny.active.center-box(v-if="currentPanel === 'main'")
        div.header 加入日记
        div.content
            div.ui.segment.placeholder
                div.text-center.is-weight.mb-4 以何种方式将此动画加入日记？
                div.ui.very.relaxed.stackable.grid.three.column
                    div.middle.aligned.column
                        div.ui.center.aligned.icon.header.mb-0
                            i.thumbtack.icon
                            div.sub.header.mb-3.font-size-16 从头开始观看
                        button.ui.fluid.green.button(@click="subscribe.onCreate", :class="{disabled: subscribe.updateLoading}")
                            i.notched.circle.loading.icon(v-if="subscribe.updateLoading")
                            = '订阅'
                    div.middle.aligned.column
                        div.ui.center.aligned.icon.header.mb-0
                            i.pencil.alternate.icon
                            div.sub.header.mb-3.font-size-16 早就看过了？
                        button.ui.fluid.button(@click="currentPanel = 'supplement'") 补齐记录
                    div.middle.aligned.column
                        div.ui.center.aligned.icon.header.mb-0
                            i.flag.icon
                            div.sub.header.mb-3.font-size-16 只是随便看看
                        button.ui.fluid.button.px-1(@click="record.onCreate", :class="{disabled: record.updateLoading}")
                            i.notched.circle.loading.icon(v-if="record.updateLoading")
                            = '仅列入日记'
    div.ui.modal.active.center-box(v-else-if="currentPanel === 'supplement'")
        div.header 补齐记录
        div.content
            div.ui.segment.placeholder.min-height-0
                div.ui.form
                    div.fields(v-for="(item, index) in supplement.data")
                        div.two.wide.field
                        div.four.wide.field
                            label 进度开始时间
                            CalendarBox(v-model="item.startTime")
                        div.four.wide.field
                            label 进度完成时间
                            CalendarBox(v-model="item.finishTime")
                        div.three.wide.field
                            label 已看集数
                            IntBox(:min="0", :max="publishedEpisodes", v-model="item.watchedEpisodes")
                        div.one.wide.field
                            label.hidden DELETE
                            button.ui.red.icon.button(@click="supplement.onDeleteItem(index)"): i.close.icon
        div.actions
            a.ui.button(@click="supplement.onAppendItem") 追加一条进度
            a.ui.green.button(@click="supplement.onSave", :class="{disabled: supplement.updateLoading}") 提交并保存
                i.notched.circle.loading.icon(v-if="supplement.updateLoading")

</template>

<script lang="ts">
import { defineComponent, ref, watch, Ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import CalendarBox from '@/components/CalendarBox.vue'
import IntBox from '@/components/IntBox.vue'
import { useServer } from '@/functions/server'
import { useNotification } from '@/functions/notification'
import { Calendar, calendarToDate, dateToUTCString } from '@/functions/format'

function defaultProgress() {
    return {startTime: null, finishTime: null, watchedEpisodes: 0}
}

export default defineComponent({
    components: {CalendarBox, IntBox},
    props: {
        visible: Boolean,
        id: String,
        publishedEpisodes: Number,
        totalEpisodes: Number
    },
    emits: ['update:visible'],
    setup(props, {emit}) {
        const router = useRouter()
        const { request } = useServer()
        const idRef = computed(() => props.id || null)

        const currentPanel: Ref<"main" | "supplement"> = ref("main")
        const visible = ref(props.visible || false)
        watch(() => props.visible, () => { visible.value = props.visible || false })
        const onClose = () => { 
            visible.value = false
            emit('update:visible', false)
            currentPanel.value = "main"
            supplement.data.splice(0, supplement.data.length)
        }
        const onSuccess = () => { router.push({name: 'Record.Detail', params: {id: idRef.value!}}) }

        const subscribe = useSubscribe(idRef, onSuccess)
        const supplement = useSupplement(idRef, onSuccess)
        const record = useRecord(idRef, onSuccess)
        
        const recordLoading = ref(false)

        return {
            visible, onClose, currentPanel, recordLoading, 
            subscribe: reactive(subscribe), 
            supplement: reactive(supplement), 
            record: reactive(record)
        }
    }
})

function useSubscribe(idRef: Ref<string | null>, success: () => void) {
    const { request } = useServer()

    const updateLoading = ref(false)
    const onCreate = async () => {
        updateLoading.value = true
        const r = await request(`/api/personal/records`, 'POST', {animation_id: parseInt(idRef.value!), create_type: 'SUBSCRIBE'})
        if(r.ok) { success() }
        updateLoading.value = false
    }
    return {updateLoading, onCreate}
}

function useRecord(idRef: Ref<string | null>, success: () => void) {
    const { request } = useServer()

    const updateLoading = ref(false)
    const onCreate = async () => {
        updateLoading.value = true
        const r = await request(`/api/personal/records`, 'POST', {animation_id: parseInt(idRef.value!), create_type: 'RECORD'})
        if(r.ok) { success() }
        updateLoading.value = false
    }
    return {updateLoading, onCreate}
}

function useSupplement(idRef: Ref<string | null>, success: () => void) {
    const { notify } = useNotification()
    const { request } = useServer()

    const data: {startTime: Calendar | null, finishTime: Calendar | null, watchedEpisodes: number}[] = reactive([defaultProgress()])

    const onDeleteItem = (index: number) => {
        data.splice(index, 1)
    }
    const onAppendItem = () => {
        data.push(defaultProgress())
    }

    const updateLoading = ref(false)
    const onSave = async () => {
        if(!validate()) { return }
        updateLoading.value = true
        const r = await request(`/api/personal/records`, 'POST', {
            animation_id: parseInt(idRef.value!),
            create_type: 'SUPPLEMENT',
            progress: data.map(item => {
                return {
                    start_time: item.startTime ? dateToUTCString(calendarToDate(item.startTime)) : null,
                    finish_time: item.finishTime ? dateToUTCString(calendarToDate(item.finishTime)) : null,
                    watched_episodes: item.watchedEpisodes
                }
            })
        })
        if(r.ok) { success() }
        updateLoading.value = false
    }

    const validate = () => {
        if(data.length === 0) {
            notify('缺少内容', 'error', '至少应该有一条进度。')
            return false
        }
        for(const item of data) {
            if(item.startTime != null && item.finishTime != null && calendarToDate(item.startTime).getTime() > calendarToDate(item.finishTime).getTime()) {
                notify('格式错误', 'error', '进度开始时间不能晚于结束时间。')
                return false
            }
        }
        return true
    }

    return {data, onSave, updateLoading, onAppendItem, onDeleteItem}
}
</script>

<style scoped>
    .hidden {
        visibility: hidden;
    }
    .center-box {
        position: fixed;
        left: 50%;
        top: 100px;
        transform: translateX(-50%)
    }
</style>