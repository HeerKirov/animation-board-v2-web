<template lang="pug">
template(v-if="editMode === 'primary'")
    div.ui.divider.mt-0.mb-1
    div.ui.input.icon.transparent
        input(:placeholder="placeholder || ''")
    div.ui.divider.mt-1
template(v-else-if="editMode === 'secondary'")
    ItemSelector(:items="secondaryItems")
div.ui.label(v-else-if="value") 
    span.pointer.mr-1(@click="onClick(1)") {{value}}
    span.pointer.detail.ml-0(v-if="secondaryValue", @click="onClick(2)") {{secondaryValue}}
    i.close.icon(@click="onClick(3)")
button.ui.tertiary.mini.button(v-else) 未指定
    
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import ItemSelector, { Item } from '@/components/ItemSelector.vue'

export default defineComponent({
    components: {ItemSelector},
    props: {
        value: String,
        placeholder: String,
        secondaryValue: String,
        secondaryItems: (null as any) as PropType<Item[]>
    },
    emits: ['update:value', 'update:secondaryValue'],
    setup(props, {emit}) {
        const editMode = ref("")

        const onClick = (i: any) => {
            console.log(i)
        }

        return {editMode, onClick}
    }
})
</script>

<style scoped>
    .pointer {
        cursor: pointer;
    }
</style>