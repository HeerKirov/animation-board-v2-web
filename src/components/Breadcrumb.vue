<template lang="pug">
nav.breadcrumb.mt-4.ml-3.mr-3(aria-label='breadcrumbs')
    ul
        li(v-for='(item, i) in breadcrumb', :class="{'is-active': i >= breadcrumb.length - 1}")
            router-link(:to='item.link')
                i.fa.mr-1(:class="item.icon")
                = '{{item.name}}'
</template>

<script lang="ts">
import { defineComponent, watch, reactive, shallowReactive } from 'vue'
import { navigationItems } from '@/router/nav'
import { useRoute, RouteLocationNormalizedLoaded } from 'vue-router'

export default defineComponent({
    setup() {
        const route = useRoute()

        const breadcrumb = useBreadcrumb(route)

        return {breadcrumb}
    }
})

interface BreadcrumbItem {
    name: string
    icon: string
    link: string
    items?: {[meta: string]: BreadcrumbItem}
}

function useBreadcrumb(route: RouteLocationNormalizedLoaded) {
    const items: {[meta: string]: BreadcrumbItem} = {}
    for(let item of navigationItems) {
        const subItems: {[meta: string]: BreadcrumbItem} = {}
        for(let subItem of item.children || []) {
            subItems[subItem.meta] = {
                icon: subItem.icon,
                name: subItem.name,
                link: item.link + subItem.link
            }
        }
    
        items[item.meta] = {
            icon: item.icon,
            name: item.name,
            link: item.breadcrumbLink !== undefined ? item.breadcrumbLink : item.link,
            items: subItems
        }
    }

    const detailItem = {
        name: '详情',
        icon: 'detail',
        link: ''
    }
    const newItem = {
        name: '新建',
        icon: 'new',
        link: ''
    }

    const breadcrumb: BreadcrumbItem[] = shallowReactive([])

    watch(route, v => {
        breadcrumb.splice(0, breadcrumb.length)

        let nextItems = items
        for(let part of route.meta.nav || []) {
            if(part === '@detail') {
                breadcrumb.push(detailItem)
            }else if(part === '@new') {
                breadcrumb.push(newItem)
            }else{
                let next = nextItems[part]
                if(next) {
                    breadcrumb.push(next)
                    if(next.items) {
                        nextItems = next.items
                    }
                }
            }
        }

        console.log(breadcrumb)
    })

    return breadcrumb
}

</script>

<style scoped>

</style>