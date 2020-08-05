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
                div.fields(v-for='(item, index) in items', :key="item.flag")
                    div.five.wide.field.required
                        label 名称
                        InputBox(placeholder="标签的唯一识别名", v-model="item.name", :not-blank="true", :max-length="16")
                    div.eleven.wide.field
                        label 描述
                        InputBox(placeholder="标签的定义描述", v-model="item.introduction")
                    div.one.wide.field
                        label.hidden delete
                        button.ui.red.icon.button(@click="onRemoveItem(index)")
                            i.close.icon
                div.field
                    button.ui.green.basic.fluid.button(@click="onAddItem")
                        i.plus.icon
                        = '继续添加标签'
</template>

<script lang="ts">
import { computed, defineComponent, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import InputBox from '@/components/InputBox.vue'
import { secondaryBarItems, newItem } from '@/definitions/secondary-bar'
import { useServer } from '@/functions/server'

interface Instance {
    flag: number
    name: string | undefined
    introduction: string
}

function newInstance(flag: number) {
    return {
        flag,
        name: undefined,
        introduction: ''
    }
}

export default defineComponent({
    components: {InputBox},
    computed: {
        barItems: () => [secondaryBarItems.database.tag, newItem]
    },
    setup() {
        let instanceFlag = 0

        const router = useRouter()
        const { request } = useServer()

        const items: Instance[] = reactive([newInstance(instanceFlag)])

        const updateLoading = ref(false)
        const valueExists = computed(() => {
            if(items.length == 0) return false
            for(const item of items) {
                if(item.name === undefined) {
                    return false
                }
            }
            return true
        })

        const onAddItem = () => { items.push(newInstance(++instanceFlag)) }
        const onRemoveItem = (index: number) => { items.splice(index, 1) }

        const onSubmit = async () => {
            if(items.length > 0) {
                updateLoading.value = true
                while(items.length > 0) {
                    const item = items[0]
                    const r = await request('/api/database/tags', 'POST', remapData(item))
                    if(r.ok) {
                        items.splice(0, 1)
                    }else{
                        break
                    }
                }
                updateLoading.value = false
                if(items.length == 0) {
                    router.push({name: 'Tag.List'})
                }
            }
        }

        return {items, updateLoading, valueExists, onAddItem, onRemoveItem, onSubmit}
    }
})

function remapData(item: Instance) {
    return {
        name: item.name,
        introduction: item.introduction || ''
    }
}
</script>