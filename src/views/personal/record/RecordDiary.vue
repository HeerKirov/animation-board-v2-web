<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'diary'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
    div.ui.grid
        div.twelve.wide.column
        div.four.wide.column
</template>

<script lang="ts">
import { defineComponent, ref, Ref, reactive, watchEffect } from 'vue'
import SearchBox, { SearchEvent } from '@/components/SearchBox.vue'
import PageSelector, { ChangedEvent as PageChangedEvent } from '@/components/PageSelector.vue'
import ItemSelector, { ChangedEvent as ItemChangedEvent } from '@/components/ItemSelector.vue'
import { secondaryBarItems } from '@/definitions/secondary-bar'
import { toNameSet } from '@/definitions/util'
import { useRouterQueryUtil } from '@/functions/routers'
import { usePagination, useSelector } from '@/functions/parameters'
import { toFriendlyTime } from '@/functions/display'
import { useSWR } from '@/functions/server'
import cover from '@/plugins/cover'

export default defineComponent({
    components: {SearchBox, PageSelector, ItemSelector},
    computed: {
        barItems() { return secondaryBarItems.record }
    },
    setup() {

    }
})
</script>

<style scoped>

</style>
