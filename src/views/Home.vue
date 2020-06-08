<template lang='pug'>
button(@click='onClick') click {{count}} times.
</template>

<script>
import { defineComponent, ref } from 'vue';

export default defineComponent(function() {
  let count = ref(0)

  const onClick = () => {
    count.value += 1
  }

  return {count, onClick}
})
</script>
