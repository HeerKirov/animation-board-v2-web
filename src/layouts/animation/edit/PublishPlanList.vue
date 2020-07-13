<template lang="pug">
ul.ui.bulleted.list
    li.item(v-for="(item, index) in items") {{item}}
        a.right.floated.icon(@click="onDelete(index)")
            i.close.icon
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { dateToCalendar, calendarToString } from '@/functions/format'

export default defineComponent({
    props: {
        value: {type: (null as any) as PropType<Date[]>, required: true}
    },
    emit: ['delete'],
    setup(props, {emit}) {
        const items = computed(() => props.value.map(d => calendarToString(dateToCalendar(d))))

        const onDelete = (index: number) => { emit('delete', index) }

        return {items, onDelete}
    }
})
</script>