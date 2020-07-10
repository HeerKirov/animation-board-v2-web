<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'new'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
        a.right.item.disabled(v-if="updateLoading")
            i.notched.circle.loading.icon
            = '提交'
        a.right.item(@click="onSubmit", :class="{disabled: !valueExists}", v-else)
            i.check.icon
            = '提交'
    div.ui.grid
        div.ui.ten.wide.centered.column
            div.ui.form
                div.fields
                    div.five.wide.field.required
                        label 名称
                        InputBox(placeholder="标签的唯一识别名")
                    div.eleven.wide.field
                        label 描述
                        InputBox(placeholder="标签的定义描述")
                    div.one.wide.field
                        label.hidden delete
                        button.ui.red.icon.button
                            i.close.icon
                div.field
                    button.ui.green.basic.fluid.button
                        i.plus.icon
                        = '继续添加标签'
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import InputBox from '@/components/InputBox.vue'
import { secondaryBarItems, newItem } from '@/definitions/secondary-bar'
import { useServer } from '@/functions/server'

export default defineComponent({
    components: {InputBox},
    computed: {
        barItems: () => [secondaryBarItems.database.tag, newItem]
    },
    setup() {
        const router = useRouter()

        const { request } = useServer()

        const valueExists = computed(() => true)
        const updateLoading = ref(false)

        const onSubmit = () => {

        }

        return {updateLoading, valueExists, onSubmit}
    }
})
</script>

<style scoped>
    .hidden {
        visibility: hidden;
    }
</style>
