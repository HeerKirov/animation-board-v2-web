<template lang="pug">
div.navbar.is-white(aria-label='main navigation', role="navigation")
  div.navbar-brand
    slot(name="brand")
    a.navbar-burger.burger(aria-label='menu', aria-expanded='false', data-target="topbar-menu", role="button", @click="onActive")
      span(aria-hidden='true')
      span(aria-hidden='true')
      span(aria-hidden='true')
  div#topbar-menu.navbar-menu(:class="{'is-active': active}")
    slot
</template>

<script lang="ts">
import { defineComponent, ref } from "vue"

export default defineComponent({
    setup() {
        const active = ref(false)

        const onActive = () => {
            active.value = !active.value
        }

        return {active, onActive}
    }
})
</script>

<style scoped>

</style>
