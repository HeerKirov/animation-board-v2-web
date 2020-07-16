<template lang="pug">
div.is-inline-block
    div.is-inline-block.score.text-center.is-weight
        span.ui.text(:class="color") {{value}}
    i(v-for="c in stars", :class="[color, c]")
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect, toRef, Ref, computed } from 'vue'

const colors = ['grey', 'brown', 'brown', 'yellow', 'yellow', 'yellow', 'yellow', 'orange', 'orange', 'red']

export default defineComponent({
    props: {
        value: {
            type: Number,
            default: 0
        }
    },
    setup(props) {
        const value = toRef(props, 'value')
        const stars = useStars(value)
        const color = computed(() => props.value ? colors[props.value - 1] : '')

        return {stars, color}
    }
})

function useStars(value: Ref<number>) {
    const stars: Ref<any[]> = ref([])

    watchEffect(() => {
        const arr: any[] = []
        const max = Math.ceil(value.value / 2)
        const half = value.value % 2 == 1
        for(let i = 1; i <= max; ++i) {
            if(half && i === max) {
                arr.push('half star icon')
            }else{
                arr.push('star icon')
            }
        }
        stars.value = arr
    })

    return stars
}

</script>

<style scoped>
    .score {
        width: 19.93px !important
    }
</style>