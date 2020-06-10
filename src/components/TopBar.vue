<template lang="pug">
NavBar.is-dark
    template(v-slot:brand)
        router-link.navbar-item(to="/") Animation Board
    div.navbar-start
        template(v-for="item in navBar")
            router-link.navbar-item(:to="item.link")
                i.fa.pl-1.mr-1(:class="item.iconClass")
                span.pr-1(:class="item.spanClass") {{item.name}}
            template(v-if="item.show")
                router-link.navbar-item.is-size-7(v-for="subItem in item.children", :to="subItem.link")
                    i.fa.mr-1(:class="subItem.iconClass")
                    span(:class="subItem.spanClass") {{subItem.name}}
    div.navbar-end
        template(v-if="false")
            div.navbar-item.buttons
                router-link.button.is-primary(to="/login") 登录
                button.button.is-light 注册
        template(v-else)
            a.navbar-item
                i.fa.fa-envelope.ml-1.mr-1
                span.mr-1 1
            router-link.navbar-item(to="/user/info")
                img.mr-2(:src='emptyAvatar')
                span Heer Kirov
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch, toRef, isReactive, isRef } from 'vue'
import { useRoute, RouteLocationNormalizedLoaded } from "vue-router"
import { navigationItems } from '@/router/nav'
import NavBar from "@/elements/NavBar.vue"

const emptyAvatar = require('@/assets/empty_avatar.jpg')

export default defineComponent({
    components: {NavBar},
    setup() {
        const route = useRoute()

        const navBar = useNavBar(route)

        return {
            navBar, 
            emptyAvatar
        }
    }
})

function useNavBar(route: RouteLocationNormalizedLoaded): any[] {
    const navNameSet = new Set<string>()
    for(let item of navigationItems) {
        navNameSet.add(item.meta)
        for(let subItem of item.children || []) {
            navNameSet.add(subItem.meta)
        }
    }

    const activeItems: {[nav: string]: boolean} = reactive({})
    const clear = () => {
        for(let part of navNameSet) {
            activeItems[part] = false
        }
    }

    watch(route, v => {
        clear()
        for(let part of v.meta.nav || []) {
            activeItems[part] = true
        }
    })

    return navigationItems.map(item => {
        const color = `has-text-${item.color}`
        const triggerItem = toRef(activeItems, item.meta)
        return {
            name: item.name,
            link: item.link,
            iconClass: [item.icon, color],
            spanClass: {[color]: triggerItem},
            show: triggerItem,
            children: (item.notInNav || !item.children ? [] : item.children).map(subItem => {
                return {
                    name: subItem.name,
                    link: item.link + subItem.link,
                    iconClass: [subItem.icon, color],
                    spanClass: {[color]: toRef(activeItems, subItem.meta)}
                }
            })
        }
    })
}
</script>

<style scoped>

</style>
