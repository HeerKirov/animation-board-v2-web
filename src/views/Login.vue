<template lang="pug">
div.ui.segment.login-modal
    div.is-weight.text-center.font-size-16.mb-1 - 登录 -
    div.ui.form
        div.field
            label 用户名
            input.ui.input(placeholder="请输入用户名")
        div.field
            label 密码
            input.ui.input(type="password", placeholder="请输入密码")
        div.field
            button.ui.green.button
                i.sign.in.alternate.icon
                = '登录'
            div.ui.basic.red.label.ml-1 alert
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    setup() {

    }
})
</script>

<style scoped>
    .login-modal {
        position: fixed;
        transform: translate(-50%, -50%);
        top: 45%;
        left: 50%;
        width: 325px;
        min-height: 250px;
    }
</style>