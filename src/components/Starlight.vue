<template lang="pug">
div.is-inline-block
    div.is-inline-block.text-center.is-weight(:class="large ? 'large-score' : 'score'")
        span.ui.text(:class="{[color]: true, large}") {{value}}
    i(v-for="c in stars", :class="{large, [color]: true, [c]: true}")
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect, toRef, Ref, computed } from 'vue'

const colors = ['grey', 'brown', 'brown', 'yellow', 'yellow', 'yellow', 'yellow', 'orange', 'orange', 'red']

export default defineComponent({
    props: {
        value: {type: Number, default: 0},
        large: {type: Boolean, default: false}
    },
    setup(props) {
        const value = toRef(props, 'value')
        const stars = useStars(value)
        const color = computed(() => props.value ? colors[props.value - 1] : '')

        return {stars, color}
    }
})

function useStars(value: Ref<number>) {
    const stars: Ref<string[]> = ref([])

    watchEffect(() => {
        const arr: string[] = []
        const max = Math.ceil(value.value / 2)
        const half = value.value % 2 == 1
        for(let i = 1; i < max; ++i) {
            arr.push('star icon')
        }
        if(max > 0) {
            arr.push(half ? 'half star icon' : 'star icon')
        }
        stars.value = arr
    })

    return stars
}

</script>

<style scoped>
    .score {
        width: 20px !important;
    }
    .large-score {
        width: 25px !important;
    }
</style>
