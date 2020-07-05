<template lang="pug">
div.ui.secondary.pointing.menu
    router-link.item(v-for="item in barItems", :class="{active: item.name === 'detail'}", :to="item.link")
        i(:class="item.icon")
        = '{{item.title}}'
    a.right.item(@click="onEdit")
        i.edit.icon
        = '编辑'
div.ui.grid
    div.ui.centered.row
        h2.ui.header
            img(:src="obj.cover")
            div.content {{obj.name}}
                div.sub.header {{obj.otherName}}
                div.ui.icon.label
                    i.kaaba.icon.mr-1(v-if="obj.isOrganization")
                    i.user.icon.mr-1(v-else)
                    = '{{obj.occupation || "无职业分类"}}'
    div.ui.row
        div.ui.twelve.wide.centered.column
            span.is-weight.mb-1 相关动画
            div(v-if="animations.length == 0") 没有相关的动画～
            template(v-else)
                div.ui.three.columns.grid
                    div.column.pb-0(v-for="item in animations")
                        a
                            img.relations.item-image(:src='item.cover')
                        div.relations.item-content
                            router-link.is-weight(:to="{name: 'Animation.Detail', params: {id: item.id}}") {{item.title}}
                            //- div.font-size-13 staff_type
                div.mt-4(v-if="obj.name")
                    router-link.ui.tertiary.button.right.floated(:to="{name: 'Animation.List', query: {staff: obj.name}}") 查看更多
                        i.right.double.angle.icon
</template>

<script lang="ts">
import { defineComponent, inject, computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { secondaryBarItems, detailItem } from '@/definitions/secondary-bar'
import { occupations } from '@/definitions/staff-definition'
import { toMap } from '@/definitions/util'
import { swrInjectionKey, editInjectionKey } from '@/definitions/injections'
import { useSWR } from '@/functions/server'
import config from '@/config'

const img = require('@/assets/empty_avatar.jpg')

const occupationMap = toMap(occupations)

export default defineComponent({
    computed: {
        img: () => img,
        barItems: () => [secondaryBarItems.database.staff, detailItem]
    },
    setup() {
        const route = useRoute()

        const { loading, data } = inject(swrInjectionKey)!
        const obj = computed(() => data.value ? mapItem(data.value) : {name: '', introduction: ''})

        const { data: animationData } = useSWR('/api/database/animations', reactive({staff: computed(() => route.params['id']), limit: 9}))
        const animations = computed(() => animationData.value?.['result'].map(mapAnimation) ?? [])

        const editMode = inject(editInjectionKey)!
        const onEdit = () => { editMode.value = true }

        return {loading, obj, animations, onEdit}
    }
})

function mapItem(item: any) {
    return {
        name: item['name'],
        otherName: toSubTitle(item['origin_name'], item['remark']),
        isOrganization: item['is_organization'],
        occupation: occupationMap[item['occupation']],
        cover: item['cover'] ? `${config.SERVER_URL}/api/database/cover/staff/${item['cover']}` : img
    }
}

function mapAnimation(item: any) {
    return {
        id: item['id'],
        title: item['title'],
        cover: item['cover'] ? `${config.SERVER_URL}/api/database/cover/animation/${item['cover']}` : img
    }
}

function toSubTitle(t1: any, t2: any): string {
    if(t1 && t2) return `${t1} / ${t2}`
    else if(t1) return t1
    else if(t2) return t2
    else return ''
}
</script>

<style scoped>
    .relations.item-image {
        width: 20%;
    }
    .relations.item-content {
        width: 80%;
        padding-left: 2px;
        vertical-align: top;
        display: inline-block;
    }
</style>