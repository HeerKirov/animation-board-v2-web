<template lang="pug">
div.is-inline-block
    div.is-inline-block.score.text-center.is-weight
        span.ui.orange.text {{value}}
    i.orange(v-for="c in stars", :class="c")
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect, toRef, Ref } from 'vue'

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

        return {stars}
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