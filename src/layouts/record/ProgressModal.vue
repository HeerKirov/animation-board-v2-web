<template lang="pug">
teleport(to='#modal-target')
    template(v-if="visible")
        div.ui.dimmer.active(@click="onClose")
        div.ui.modal.tiny.active.center-box
            div.header 新建进度
            div.content
                div.ui.segment.placeholder(v-if="currentPanel === 'main'")
                    div.ui.vertical.divider 或
                    div.ui.very.relaxed.stackable.grid.two.column
                        div.middle.aligned.column
                            div.ui.center.aligned.icon.header
                                i.file.icon
                                div.sub.header.mb-3.font-size-16 从零开始的新进度
                                button.ui.fluid.green.button(@click="onCreateNew") 创建进度
                        div.middle.aligned.column
                            div.ui.center.aligned.icon.header
                                i.pencil.icon
                                div.sub.header.mb-3.font-size-16 有待补充的记录？
                                button.ui.fluid.button(@click="currentPanel = 'supplement'") 补齐记录
                div.ui.segment.placeholder(v-else-if="currentPanel === 'supplement'")
                    div.ui.form
                        div.ui.field
                            label 进度开始时间
                            CalendarBox(v-model="supplement.data.startTime")
                        div.ui.field
                            label 进度完成时间
                            CalendarBox(v-model="supplement.data.finishTime")
                        div.ui.field
                            label 已看集数
                            IntBox(:min="0", :max="publishedEpisodes", v-model="supplement.data.watchedEpisodes")
                        button.ui.green.fluid.button(@click="supplement.onSave", :class="{disabled: supplement.updateLoading}") 提交并保存
                            i.notched.circle.loading.icon(v-if="supplement.updateLoading")

</template>

<script lang="ts">
import { defineComponent, ref, watch, Ref, reactive, computed } from 'vue'
import CalendarBox from '@/components/CalendarBox.vue'
import IntBox from '@/components/IntBox.vue'
import { useServer } from '@/functions/server'
import { Calendar, calendarToDate, dateToUTCString } from '@/functions/format'

export default defineComponent({
    components: {CalendarBox, IntBox},
    props: {
        visible: Boolean,
        id: String,
        publishedEpisodes: Number
    },
    emits: ['update:visible', 'success'],
    setup(props, {emit}) {
        const { request } = useServer()
        const idRef = computed(() => props.id || null)

        const visible = ref(props.visible || false)
        watch(() => props.visible, () => { visible.value = props.visible || false })
        const onClose = () => { 
            visible.value = false
            emit('update:visible', false)
            currentPanel.value = "main"
            supplement.data.startTime = null
            supplement.data.finishTime = null
            supplement.data.watchedEpisodes = 0
        }
        const onSuccess = () => { 
            emit('success') 
            onClose()
        }

        const currentPanel: Ref<"main" | "supplement"> = ref("main")

        const supplement = useSupplement(idRef, onSuccess)

        const onCreateNew = async () => {
            const r = await request(`/api/personal/records/${idRef.value}/progress`, 'POST', {supplement: false})
            if(r.ok) { onSuccess() }
        }

        return {visible, onClose, currentPanel, supplement, onCreateNew}
    }
})

function useSupplement(idRef: Ref<string | null>, success: () => void) {
    const { request } = useServer()

    const data: {startTime: Calendar | null, finishTime: Calendar | null, watchedEpisodes: number} = reactive({startTime: null, finishTime: null, watchedEpisodes: 0})
    const updateLoading = ref(false)

    const onSave = async () => {
        updateLoading.value = true
        const r = await request(`/api/personal/records/${idRef.value}/progress`, 'POST', {
            supplement: true,
            start_time: data.startTime ? dateToUTCString(calendarToDate(data.startTime)) : null,
            finish_time: data.finishTime ? dateToUTCString(calendarToDate(data.finishTime)) : null,
            watched_episodes: data.watchedEpisodes
        })
        if(r.ok) { success() }
        updateLoading.value = false
    }

    return {data, onSave, updateLoading}
}
</script>

<style scoped>
    .center-box {
        max-width: 640px;
        position: fixed;
        left: 50%;
        top: 100px;
        transform: translateX(-50%)
    }
</style>