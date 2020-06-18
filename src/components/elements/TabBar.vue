<template lang="pug">
nav.tabs
    ul: li(v-for='item in items')
        //- TODO 在safari浏览器上的显示有bug
        router-link(:to='item.link', :class="item.active ? activeColor : ''")
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
    props: {
        items: (null as any) as PropType<TabItem[]>,
        color: String
    },
    setup(props) {
        return {
            items: props.items || [],
            activeColor: props.color ? `has-text-${props.color}` : ''
        }
    }
})
</script>