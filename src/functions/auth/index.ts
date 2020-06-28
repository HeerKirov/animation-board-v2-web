import { request } from '@/functions/swr'
import { reactive, Ref, ref, provide, inject, InjectionKey, computed, watch, App } from 'vue'

export interface AuthStats {
    isLogin: boolean | null
    isStaff: boolean
    username: string
}

export interface AuthResult {
    stats: AuthStats, 
    token: Ref<string | null>, 
    login: (username: string, password: string) => void, 
    logout: () => void
}

export interface Configuration {
    serverUrl: string, 
    basicServiceUrl: string, 
    storagePrefix: string, 
    tokenEffective: number
}

interface TokenStats {
    updateTime: Date | null
    expireTime: Date | null
}

const authInjectionKey: InjectionKey<AuthResult> = Symbol()

export function useAuth(): AuthResult {
    return inject(authInjectionKey)!
}

export function createAuth(configuration: Configuration) {
    const token: Ref<string | null> = ref(null)
    const tokenStats: TokenStats = {updateTime: null, expireTime: null}
    const stats: AuthStats = useStats(configuration, token)

    const login = async (username: string, password: string) => await doLogin(configuration, token, tokenStats, username, password)
    const logout = () => doLogout(configuration, token, tokenStats)

    initializeByLocalStorage(configuration, token, tokenStats).catch(e => console.error(e))
    //TODO 添加一个update token的机制

    return {
        install(app: App) {
            app.provide(authInjectionKey, {stats, token, login, logout})
        }
    }
}

function useStats(configuration: Configuration, tokenRef: Ref<string | null>) {
    const stats: AuthStats = reactive({isLogin: null, isStaff: false, username: ''})

    watch(tokenRef, async () => {
        if(tokenRef.value == null) {
            stats.isLogin = false
            stats.isStaff = false
            stats.username = ''
        }else{
            const r = await request(`${configuration.serverUrl}/api/user/status`, 'GET', {headers: toHeaders(tokenRef)})
            if(r.status === 'OK') {
                stats.isLogin = r.data['is_login']
                stats.isStaff = r.data['is_staff']
                stats.username = r.data['username']
            }else{
                console.error(`Getting stats failed. Error message is [${r.data}].`)
            }
        }
    }, {immediate: true})

    return stats
}
async function initializeByLocalStorage(configuration: Configuration, tokenRef: Ref<string | null>, tokenStats: TokenStats) {
    const token = localStorage[`${configuration.storagePrefix}/token`]
    if(token != null) {
        const r = await request(`${configuration.basicServiceUrl}/api/token/${token}/`, 'GET')
        if(r.status === 'OK') {
            tokenRef.value = token
            tokenStats.updateTime = r.data['update_time'] && new Date(r.data['update_time'])
            tokenStats.expireTime = r.data['expire_time'] && new Date(r.data['expire_time'])
        }else{
            console.log(`Validation of storaged token failed. Give up this token. Error message is [${r.data}].`)
            localStorage.removeItem(`${configuration.storagePrefix}/token`)
        }
    }
}
async function doLogin(configuration: Configuration, tokenRef: Ref<string | null>, tokenStats: TokenStats, username: string, password: string) {
    const data = {username, password, effective: configuration.tokenEffective}
    const r = await request(`${configuration.basicServiceUrl}/api/token/`, 'POST', {data})
    if(r.status === 'OK') {
        localStorage[`${configuration.storagePrefix}/token`] = r.data['key']
        tokenRef.value = r.data['key']
        tokenStats.updateTime = r.data['update_time'] && new Date(r.data['update_time'])
        tokenStats.expireTime = r.data['expire_time'] && new Date(r.data['expire_time'])
    }else{
        throw new LoginError(r.data)
    }
}
function doLogout(configuration: Configuration, tokenRef: Ref<string | null>, tokenStats: TokenStats) {
    localStorage.removeItem(`${configuration.storagePrefix}/token`)
    tokenRef.value = null
    tokenStats.updateTime = null
    tokenStats.expireTime = null
    //TODO 添加delete token的机制
}

export type LoginException = 'Password wrong' | 'User not exist' | 'User not enabled'

export class LoginError extends Error {
    constructor(message: LoginException) {
        super(message)
    }
}

function toHeaders(token: Ref<string | null>): any {
    return token.value == null ? {} : {
        'Authorization': `Bearer ${token.value}`
    }
}