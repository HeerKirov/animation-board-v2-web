<template lang="pug">
div.ui.segment.login-modal
    div.is-weight.text-center.font-size-16.mb-1 - 登录 -
    div.ui.form
        div.field
            label 用户名
            input.ui.input(placeholder="请输入用户名", v-model="form.username", @keydown.enter="focusPassword")
        div.field
            label 密码
            input.ui.input(ref="passwordBox", type="password", placeholder="请输入密码", v-model="form.password", @keydown.enter="onLogin")
        div.field
            button.ui.green.button(@click="onLogin")
                i.sign.in.alternate.icon
                = '登录'
            div.ui.basic.red.label.ml-1(v-if="error") {{error}}
</template>

<script lang="ts">
import { defineComponent, reactive, Ref, ref } from 'vue'
import { useAuth, LoginError, LoginException } from '@/functions/auth'
import { useRouter } from 'vue-router'

export default defineComponent({
    setup() {
        const router = useRouter()
        const { login } = useAuth()

        const form = reactive({username: '', password: ''})
        const error: Ref<string | null> = ref(null)

        const onLogin = async () => {
            error.value = null
            const validateResult = validate(form)
            if(validateResult != null) {
                error.value = validateResult
                return
            }

            try {
                await login(form.username, form.password)
            }catch(e) {
                const message = (e as LoginError).message as LoginException
                if(message === 'Password wrong') {
                    error.value = '密码错误。'
                }else if(message === 'User not exist') {
                    error.value = '用户不存在。'
                }else{
                    error.value = '此用户已被禁用。'
                }
                return
            }
            router.push({name: 'Home'})
        }

        const passwordBox: Ref<any> = ref(null)
        const focusPassword = () => passwordBox.value.focus()

        return {form, error, onLogin, focusPassword, passwordBox}
    }
})

function validate(form: {username: string, password: string}): string | null {
    if(!form.username) return '用户名不能为空。'
    else if(!form.password) return '密码不能为空。'
    return null
}
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