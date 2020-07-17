<template lang="pug">
div.ui.form
    div.ui.fields
        div.ui.eight.wide.field
            span.ui.large.text 《{{data.title}}》
        div.ui.seven.wide.field
            div.float-right(v-if="data.score")
                Starlight(:value="data.score", :large="true")
                div.text-right.mt-1: span.ui.large.text {{scoreDescriptions[data.score].header}}
                div.text-right: span.ui.grey.text {{scoreDescriptions[data.score].content}}
        div.ui.one.wide.field
            DigitalRoulette(:min="1", :max="10", v-model="data.score", :up-button="true")
    div.ui.field
        label 评论
        InputBox(v-model="data.articleTitle", placeholder="标题")
    div.ui.field
        label
        textarea.ui.input(v-model="data.article", placeholder="正文")
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue'
import InputBox from '@/components/InputBox.vue'
import Starlight from '@/components/Starlight.vue'
import DigitalRoulette from '@/components/DigitalRoulette.vue'
import { watchEditorValidate } from '@/functions/editor'
import { scoreDescriptions } from '@/definitions/comment-definition'

export interface Instance {
    id: number | null
    title: string | null
    score: number | null
    articleTitle: string | null
    article: string | null
}

export function defaultInstance(): Instance {
    return {
        id: null,
        title: null,
        score: null,
        articleTitle: null,
        article: null
    }
}

export default defineComponent({
    components: {InputBox, Starlight, DigitalRoulette},
    props:{
        value: (null as any) as PropType<Instance | null>
    },
    emits:['update:value'],
    computed: {
        scoreDescriptions() { return scoreDescriptions }
    },
    setup(props, {emit}) {
        const data = ref(props.value || defaultInstance())

        watch(() => props.value, () => {
            if(props.value != undefined) {
                data.value = props.value || defaultInstance()
            }
        })

        watchEditorValidate(data, v => emit('update:value', v), _ => false)

        return {data}
    }
})
</script>

<style scoped>
    .hidden {
        visibility: hidden;
    }
</style>
