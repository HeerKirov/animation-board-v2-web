<template lang="pug">
div.ui.secondary.pointing.menu
    router-link.item(v-for="item in barItems", :class="{active: item.name === 'detail'}", :to="item.link")
        i(:class="item.icon")
        = '{{item.title}}'
    a.right.item(v-if="isStaff", @click="onEdit")
        i.edit.icon
        = '编辑'
div.ui.grid
    div.ui.active.centered.inline.loader.mt-4(v-if="loading")
    template(v-else-if="obj")
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
                div(v-if="animations.length === 0") 没有相关的动画～
                template(v-else)
                    div.ui.three.columns.grid
                        div.column.pb-0(v-for="item in animations")
                            a
                                img.relations.item-image(:src='item.cover')
                            div.relations.item-content
                                router-link.is-weight(:to="{name: 'Animation.Detail', params: {id: item.id}}") {{item.title}}
                    div.mt-4(v-if="obj.name")
                        router-link.ui.tertiary.button.right.floated(:to="{name: 'Animation.List', query: {staff: obj.name}}") 查看更多
                            i.right.double.angle.icon
</template>

<script lang="ts">
import { defineComponent, inject, computed, reactive, toRef } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/functions/auth'
import { useSWR } from '@/functions/server'
import { toSubTitle } from '@/functions/display'
import { secondaryBarItems, detailItem } from '@/definitions/secondary-bar'
import { occupations } from '@/definitions/staff-definition'
import { toMap } from '@/definitions/util'
import { swrInjectionKey, editInjectionKey } from '@/definitions/injections'
import cover from '@/plugins/cover'

const occupationMap = toMap(occupations)

export default defineComponent({
    computed: {
        barItems: () => [secondaryBarItems.database.staff, detailItem]
    },
    setup() {
        const route = useRoute()

        const { stats } = useAuth()

        const { loading, data } = inject(swrInjectionKey)!
        const obj = computed(() => data.value ? mapItem(data.value) : null)

        const { data: animationData } = useSWR('/api/database/animations', reactive({staff: computed(() => route.params['id']), limit: 9}))
        const animations = computed(() => animationData.value?.['result'].map(mapAnimation) ?? [])

        const editMode = inject(editInjectionKey)!
        const onEdit = () => { editMode.value = true }

        return {loading, obj, animations, onEdit, isStaff: toRef(stats, 'isStaff')}
    }
})

function mapItem(item: any) {
    return {
        name: item['name'],
        otherName: toSubTitle(item['origin_name'], item['remark']),
        isOrganization: item['is_organization'],
        occupation: occupationMap[item['occupation']]?.title,
        cover: cover.staffOrEmpty(item['cover'])
    }
}

function mapAnimation(item: any) {
    return {
        id: item['id'],
        title: item['title'],
        cover: cover.animationOrEmpty(item['cover'])
    }
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
