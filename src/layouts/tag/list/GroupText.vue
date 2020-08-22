<template lang="pug">
div.mb-1
    template(v-if="!editMode")
        span.font-size-14.is-weight {{value}}
        a.ml-1(@click="edit")
            i.edit.icon
    template(v-else)
        input.ui.input(ref="inputRef", v-model="value", @keydown.enter="submit")
        a.ml-1(@click="submit")
            i.check.icon
</template>

<script lang="ts">
import { defineComponent, ref, watch, Ref, watchEffect } from 'vue'
import { useServer } from '@/functions/server'

export default defineComponent({
    props: {
        value: {type: String, required: true}
    },
    emits: ['update:value'],
    setup(props, {emit}) {
        const { request } = useServer()

        const inputRef: Ref<any> = ref(null)
        watchEffect(() => {
            if(inputRef.value) {
                inputRef.value.focus()
            }
        })

        const editMode = ref(false)
        const value = ref(props.value)
        watch(() => props.value, () => { value.value = props.value })

        const edit = () => {  editMode.value = true }

        const submit = async () => {
            if(value.value && value.value != props.value) {
                const r = await request(`/api/database/tags/groups/${props.value}`, 'PATCH', {group: value.value})
                if(r.ok) {
                    emit('update:value', value.value)
                    editMode.value = false
                }
            }else{
                editMode.value = false
            }
        }

        return {editMode, value, edit, submit, inputRef}
    }
})
</script>

<style scoped>

</style>