<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'activity'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
</template>

<script lang="ts">
import { defineComponent, ref, Ref, reactive, watchEffect, toRef } from 'vue'
import SearchBox, { SearchEvent } from '@/components/SearchBox.vue'
import PageSelector, { ChangedEvent as PageChangedEvent } from '@/components/PageSelector.vue'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import { useRouterQueryUtil } from '@/functions/routers'
import { usePagination, useSort, useSelector } from '@/functions/parameters'
import { useAuth } from '@/functions/auth'
import { useSWR } from '@/functions/server'
import cover from '@/plugins/cover'

export default defineComponent({
    components: {SearchBox, PageSelector},
    computed: {
        barItems() { return secondaryBarItems.comment }
    },
    setup() {

    }
})
</script>

<style scoped>

</style>