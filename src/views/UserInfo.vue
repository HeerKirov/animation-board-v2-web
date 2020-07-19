<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        a.item(@click="currentPanel = 'info'", :class="{active: currentPanel === 'info'}")
            i.info.icon
            = '信息'
        a.item(@click="currentPanel = 'setting'", :class="{active: currentPanel === 'setting'}")
            i.screwdriver.icon
            = '偏好设置'
    div.ui.centered.grid(v-if="currentPanel === 'info'")
        div.two.wide.column
            div.ui.card
                div.image
                    img(:src="info.data.cover")
        div.six.wide.column
            label @{{info.data.username}}
            h1.mt-0 {{info.data.name}}
            div(v-if="info.isStaff")
                i.user.icon
                = '管理员'
            button.ui.tertiary.mini.button.right.floated(@click="info.onLogout")
                i.sign.out.alternate.icon
                = '退出登录'
    div.ui.centered.grid(v-else)
        div.eight.wide.column
            div.ui.form
                div.ui.field
                    label 夜晚型时间表
                    ItemSelector(:items="switchItems", :show-none="false", :selected="setting.data.nightTimeTable.toString()", @update:selected="v => { setting.data.nightTimeTable = v === 'true'}")
                    p.font-size-11.mt-1.tips: i 开启后，凌晨2:00之前的动画在时间表和日记表上算作前一天。
                div.ui.field.mt-4
                    label 推送动画更新消息
                    ItemSelector(:items="switchItems", :show-none="false", :selected="setting.data.animationUpdateNotice.toString()", @update:selected="v => { setting.data.animationUpdateNotice = v === 'true'}")
                    p.font-size-11.mt-1.tips: i 开启后，订阅中的动画有更新时推送消息。
                div.ui.field.mt-4
                    label 自动更新统计项目
                    ItemSelector(:items="switchItems", :show-none="false", :selected="setting.data.autoUpdateStatistics.toString()", @update:selected="v => { setting.data.autoUpdateStatistics = v === 'true'}")
                    p.font-size-11.mt-1.tips: i 开启后，将按照系统预设模式自动更新统计项目。
                div.ui.field.mt-4
                    label 统计时区
                    select.timezone-selector(v-model="setting.data.timezone")
                        option(v-for="i in setting.timezoneList", :value="i") {{i}}
                    p.font-size-11.mt-1.tips: i 统计项目按照这个时区进行天数划分。
                button.ui.green.small.button.disabled(v-if="setting.updateLoading")
                    i.notched.circle.loading.icon
                    = '保存'
                button.ui.green.small.button.px-4.mt-2(@click="setting.onSave", v-else)
                    i.check.icon
                    = '保存'
                p.font-size-11.mt-1.tips(v-if="setting.saveSuccess"): i 保存成功。

</template>

<script lang="ts">
import { defineComponent, computed, toRef, toRefs, ref, Ref, watch } from 'vue'
import ItemSelector from '@/components/ItemSelector.vue'
import { useAuth } from '@/functions/auth'
import { useSWR } from '@/functions/server'
import cover from '@/plugins/cover'
import config from '@/config'
import { useNotification } from '@/functions/notification'
import { useRouter } from 'vue-router'

const switchItems = [{name: 'false', title: '关闭'}, {name: 'true', title: '开启'}]

export default defineComponent({
    components: {ItemSelector},
    computed: {
        switchItems() { return switchItems }
    },
    setup() {
        const currentPanel = ref("info")

        const info = useUserInfo()

        const setting = useSetting()

        return {currentPanel, info, setting}
    }
})

function useUserInfo() {
    const router = useRouter()
    const { stats, logout } = useAuth()

    const { data } = useSWR('/api/user/', null, {baseUrl: config.BASIC_SERVICE_URL, byAuthorization: "LOGIN"})

    const userInfo = computed(() => data.value ? mapUserInfo(data.value) : {})

    const onLogout = () => {
        logout()
        router.push({name: 'Home'})
    }

    return {isStaff: toRef(stats, 'isStaff'), data: userInfo, onLogout}
}

function useSetting() {
    const { data, update, updateLoading } = useSWR('/api/user/setting', null, {byAuthorization: "LOGIN"})
    const { data: timezoneList } = useSWR('/api/util/timezones', {usual: true})
    const setting: Ref<any> = ref({})
    watch(data, () => { setting.value = mapSetting(data.value) })

    const saveSuccess = ref(false)
    const onSave = async () => {
        const r = await update(remapSetting(setting.value))
        if(r.ok) { saveSuccess.value = true }
    }

    return {data: setting, timezoneList, onSave, saveSuccess, updateLoading}
}

function mapUserInfo(data: any) {
    return {
        username: data['username'],
        name: data['name'],
        cover: cover.userOrEmpty(data['cover'])
    }
}

function mapSetting(data: any) {
    return {
        animationUpdateNotice: data['animation_update_notice'],
        nightTimeTable: data['night_time_table'],
        autoUpdateStatistics: data['auto_update_statistics'],
        timezone: data['timezone']
    }
}

function remapSetting(data: any) {
    return {
        animation_update_notice: data.animationUpdateNotice,
        night_time_table: data.nightTimeTable,
        auto_update_statistics: data.autoUpdateStatistics,
        timezone: data.timezone
    }
}
</script>

<style scoped>
    .timezone-selector {
        max-width: 250px;
    }
    .tips {
        color: #CCCCCC;
    }
</style>