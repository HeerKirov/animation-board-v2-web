import { Method } from 'axios'
import { InjectionKey, inject, reactive, App, watchEffect, watch, computed } from 'vue'
import { useSWR as useSWR0, Fetcher } from '@/functions/swr'
import { AuthResult } from '../auth'

export function createServer(configuration: ServerConfiguration) {
    return {
        install(app: App) {
            app.provide(configurationInjectionKey, configuration)
        }
    }
}

//TODO 需要一个异步返回的、非响应式的server封装请求函数

export function useSWR(url: string, method: Method, data?: any, errorHandler?: ErrorHandler) {
    const configuration = inject(configurationInjectionKey)!
    const serverUrl = configuration.serverUrl
    const globalErrorHandler = configuration.errorHandler
    const { headers, swrSwitch } = useAuth(configuration.auth)

    const fetcher: Fetcher = reactive({[method === 'GET' ? 'query' : 'data']: data || undefined, headers, reactive: swrSwitch?.value})

    if(swrSwitch) watch(swrSwitch, v => fetcher.reactive = v)

    const handler = (code: number, data: any) => {
        if(errorHandler != null) {
            errorHandler(code, data, globalErrorHandler)
        }else if(globalErrorHandler != null) {
            globalErrorHandler(code, data)
        }
    }

    return useSWR0(serverUrl + url, method, fetcher, handler)
}

function useAuth(auth?: AuthResult | (() => AuthResult)) {
    if(auth == null) {
        return {headers: undefined}
    }
    const { token, stats } = typeof auth === 'function' ? auth() : auth
    const headers: any = reactive({})
    watch(token, v => {
        if(v != null) {
            headers['Authorization'] = `Bearer ${v}`
        }else{
            delete headers['Authorization']
        }
    })
    const swrSwitch = computed(() => stats.isLogin != null)
    return {headers, swrSwitch}
}

export interface ServerConfiguration {
    serverUrl: string
    auth?: AuthResult | (() => AuthResult)
    errorHandler?: ErrorHandler
}

const configurationInjectionKey: InjectionKey<ServerConfiguration> = Symbol()

export type ErrorHandler = (code: number, data: any, parentHandler?: ErrorHandler) => void
