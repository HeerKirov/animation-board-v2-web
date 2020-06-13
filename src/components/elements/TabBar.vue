<template lang="pug">
nav.tabs.is-boxed
    ul: li(v-for='item in items', :class='{"is-active": item.active}')
        router-link(:to='item.link')
            i(v-if='item.icon').fa.mr-1(:class='item.icon')
            = '{{item.title}}'
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

interface TabItem {
    title: string
    icon?: string
    link: string
    active?: boolean
}

export default defineComponent({
    props: {items: (null as any) as PropType<TabItem[]>},
    setup(props) {
        return {items: props.items || []}
    }
})
</script>