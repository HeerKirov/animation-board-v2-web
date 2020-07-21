<template lang="pug">
div.ui.segment
    div.ui.inline.active.centered.loader(v-if="!hasRequested")
    div.ui.feed.ml-2(v-else-if="result.length > 0")
        div.event(v-for="item in result")
            div.label
                img(:src="item.cover")
            div.content
                div.summary
                    router-link.user(:to="{name: 'Record.Detail', params: {id: item.id}}") {{item.title}}
                    = ' {{item.activeEvent}}'
                    div.date {{item.activeTime}}
                    div.meta.extra.mt-0.float-right(v-if="item.progress") {{item.progress}}%
    div.text-center(v-else): i.font-size-13 没有动态～
    div.text-right: a.ui.tertiary.button(v-if="hasNext", @click="requestForNext") 查看更多...
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapItem } from '@/views/personal/record/RecordActivity.vue'
import { useContinuous } from '@/functions/server'

const limit = 10

export default defineComponent({
    setup() {
        const { result, hasNext, hasRequested, requestForFirst, requestForNext } = useContinuous('/api/personal/records/activity', {
            query(count, total) { return {limit, offset: count} },
            findTotal(result) { return result['total'] },
            findData(result) { return (result['result'] as any[]).map(mapItem) }
        })

        requestForFirst()

        return {result, hasNext, hasRequested, requestForNext}
    }
})
</script>