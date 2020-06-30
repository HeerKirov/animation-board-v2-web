<template lang='pug'>
div
    button.ui.button(@click='onClick') click {{count}} times.
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent(function() {
    let count = ref(0)

    const onClick = () => {
        count.value += 1
    }

    return {count, onClick}
})
</script>
