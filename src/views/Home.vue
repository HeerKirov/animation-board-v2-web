<template lang='pug'>
div.ui.container.pt-4
    div.ui.grid(v-if="isLogin")
        div.three.wide.column
            Diary
            FindRecord
            FindComment
        div.ten.wide.column
            TimeTable
            Activity
        div.three.wide.column
            UserInfo
    NotLogin(v-else-if="isLogin === false")
    div.ui.inline.active.centered.loader(v-else)
</template>

<script lang="ts">
import { defineComponent, ref, toRef } from 'vue'
import UserInfo from '@/layouts/home/UserInfo.vue'
import TimeTable from '@/layouts/home/TimeTable.vue'
import Activity from '@/layouts/home/Activity.vue'
import Diary from '@/layouts/home/Diary.vue'
import FindRecord from '@/layouts/home/FindRecord.vue'
import FindComment from '@/layouts/home/FindComment.vue'
import NotLogin from '@/layouts/home/NotLogin.vue'
import { useAuth } from '@/functions/auth'

export default defineComponent({
    components:{UserInfo, TimeTable, Activity, Diary, FindRecord, FindComment, NotLogin},
    setup() {
        const { stats } = useAuth()

        const isLogin = toRef(stats, 'isLogin')

        return {isLogin}
    }
})
</script>
