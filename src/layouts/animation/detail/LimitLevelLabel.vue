<template lang="pug">
div.ui.fluid.right.label.text-center.px-0(:class="display.color", @mouseenter="mouseEnter", @mouseleave="mouseLeave")
    i.mr-0.mb-1(:class="display.icon")
    div {{display.title}}
div.float-panel.ui.message(v-if="showIntroduction")
    div.content
        ul.ui.list
            li(v-for="line in display.introduction") {{line}}
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref } from 'vue'
import { sexLimitLevels, violenceLimitLevels, sexLimitIntroductions, violenceLimitIntroductions } from '@/definitions/animation-definition'
import { toMap } from '@/definitions/util'

const sexLimitLevelMap = toMap(sexLimitLevels)
const violenceLimitLevelMap = toMap(violenceLimitLevels)

export default defineComponent({
    props: {
        type: {type: (null as any) as PropType<"sex" | "violence">, required: true},
        value: {type: String, required: true}
    },
    setup(props) {
        const map = props.type === 'sex' ? sexLimitLevelMap : violenceLimitLevelMap
        const introductions = props.type === 'sex' ? sexLimitIntroductions : violenceLimitIntroductions
        const icon = props.type === 'sex' ? 'venus mars icon' : 'hand rock outline icon'

        const display = computed(() => {
            return {
                title: map[props.value].title,
                color: map[props.value].color,
                icon,
                introduction: introductions[props.value]
            }
        })

        const showIntroduction = ref(false)

        const mouseEnter = () => { showIntroduction.value = true }
        const mouseLeave = () => { showIntroduction.value = false }

        return {display, showIntroduction, mouseEnter, mouseLeave}
    }
})
</script>

<style scoped>
    .float-panel {
        position: absolute;
        transform: translateX(-40%);
        min-width: 300px;
        z-index: 1;
    }
</style>