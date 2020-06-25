<template lang="pug">
div.ui.segment
    div.ui.field
        label 起始时间点
        //- 需要替换为datetime picker
        input.ui.input
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

export default defineComponent({
    setup() {

    }
})
</script>