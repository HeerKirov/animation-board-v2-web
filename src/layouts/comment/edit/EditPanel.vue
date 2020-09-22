<template lang="pug">
div.ui.secondary.pointing.menu
    router-link.item(v-for="item in barItems", :class="{active: item.name === 'edit'}", :to="item.link")
        i(:class="item.icon")
        = '{{item.title}}'
    template(v-if="updateLoading")
        a.right.item.disabled
            i.notched.circle.loading.icon
            = '保存'
        a.item.disabled
            i.close.icon
            = '放弃更改'
    template(v-else)
        a.right.item(@click="onSubmit", :class="{disabled: !valueExists}")
            i.check.icon
            = '保存'
        a.item(@click="onCancel")
            i.close.icon
            = '放弃更改'
div.ui.grid
    div.ui.fourteen.wide.centered.column
        Editor(:value="editorValue", :title="title", @update:value="onEditorChanged")
        button.ui.tertiary.button.float-right(@click="onDelete")
            i.trash.icon
            = '删除评价记录'
</template>

<script lang="ts">
import { defineComponent, inject, ref, Ref } from 'vue'
import { useRouter } from 'vue-router'
import Editor, { Instance } from './Editor.vue'
import { topBarItems, editItem } from '@/definitions/secondary-bar'
import { editInjectionKey, swrInjectionKey } from '@/definitions/injections'
import { useEditorForm } from '@/functions/editor'

export default defineComponent({
    components: {Editor},
    computed: {
        barItems: () => [topBarItems.comment, editItem]
    },
    setup() {
        const router = useRouter()

        const swr = inject(swrInjectionKey)!
        const editMode = inject(editInjectionKey)!

        const title: Ref<string|null> = ref(null)
        const form = useEditorForm<Instance>(swr, editMode, i => mapItem(i, title), remapData, {
            method: "PATCH",
            afterDelete() { router.push({name: 'Comment.Activity'}) }
        })

        return {...form, title}
    }
})

function mapItem(item: any, title: Ref<string|null>): Instance {
    title.value = item['title']
    return {
        id: item['animation_id'],
        title: item['title'],
        score: item['score'],
        articleTitle: item['article_title'],
        article: item['article']
    }
}

function remapData(item: Instance, old: Instance) {
    const data: {[s: string]: any} = {}
    if(item.score !== old.score) data['score'] = item.score
    if(item.articleTitle !== old.articleTitle) data['article_title'] = item.articleTitle || ''
    if(item.article !== old.article) data['article'] = item.article || ''
    return data
}
</script>
