<template lang="pug">
div.ui.segment
    div.ui.field
        label 起始时间点
        CalendarBox(placeholder="动画发布的时间")
    div.ui.fields
        div.ui.field
            label 间隔时间(天)
            input.ui.input(type="number", min="1")
        div.ui.field
            label 项数
            input.ui.input(type="number", min="1")    
    button.ui.green.fluid.button.mt-2 添加
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CalendarBox from '@/components/CalendarBox.vue'

export default defineComponent({
    components: {CalendarBox},
    setup() {

    }
})
</script>