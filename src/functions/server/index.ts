import { Method } from 'axios'
import { InjectionKey, inject, reactive, App, watch, toRaw, Ref, ref } from 'vue'
import { request as request0, RequestParam } from '@/functions/request'
import { AuthResult } from '@/functions/auth'

//== create server ==

const configurationInjectionKey: InjectionKey<ServerConfiguration> = Symbol()

export type ErrorHandler = (code: number, data: any, parentHandler?: ErrorHandler) => void

export interface ServerConfiguration {
    serverUrl: string
    auth?: AuthResult | (() => AuthResult)
    errorHandler?: ErrorHandler
}

export function createServer(configuration: ServerConfiguration) {
    return {
        install(app: App) {
            app.provide(configurationInjectionKey, configuration)
        }
    }
}

//== request ==

export interface RequestOptions {
    errorHandler?: ErrorHandler
    baseUrl?: string
}

export interface Response {
    ok: boolean
    data: any
}

export async function request(url: string, method: Method, data?: any, options?: RequestOptions): Promise<Response> {
    const configuration = inject(configurationInjectionKey)!
    const headers = getStaticHeaders(configuration.auth)

    const param: RequestParam = {headers, [method === 'GET' ? 'query' : 'data']: data || undefined}

    const r = await request0((options?.baseUrl || configuration.serverUrl) + url, method, param)

    if(r.status === 'OK') {
        return {ok: true, data: r.data}
    }else{
        if(options?.errorHandler != null) {
            options.errorHandler(r.code, r.data, configuration.errorHandler)
        }else if(configuration.errorHandler != null) {
            configuration.errorHandler(r.code, r.data)
        }
        return {ok: false, data: undefined}
    }
}

function getStaticHeaders(auth?: AuthResult | (() => AuthResult)) {
    if(auth == null) {
        return undefined
    }
    const { token } = typeof auth === 'function' ? auth() : auth
    const headers: any = {}
    if(token.value != null) {
        headers['Authorization'] = `Bearer ${token.value}`
    }
    return headers
}

//== SWR ==

type SWRUpdate = (data?: any, options?: SWROptions) => Promise<Response>

export interface SWROptions extends RequestOptions {
    method?: Method
}

export interface SWR {
    loading: Ref<boolean>
    data: Ref<any>
    updateLoading: Ref<boolean>
    update: SWRUpdate
}

export function useSWR(url: string, data?: any, options?: SWROptions): SWR {
    const configuration = inject(configurationInjectionKey)!
    const headers = useHeaders(configuration.auth)

    const baseUrl = options?.baseUrl || configuration.serverUrl
    const method = options?.method || 'GET'

    const fetcher: RequestParam = reactive({[method == 'GET' ? 'query' : 'data']: data || undefined, headers})

    const throwError
        = options?.errorHandler != null ? ((code: number, data: any) => options.errorHandler?.(code, data, configuration.errorHandler))
        : configuration.errorHandler != null ? configuration.errorHandler 
        : undefined

    const loadingRef = ref(true)
    const dataRef = ref(null)
    const updateLoadingRef = ref(false)

    watch(() => [url, fetcher], async (_v, _o, onInvalidate) => {
        let validate = true
        onInvalidate(() => {validate = false})

        loadingRef.value = true
        const r = await request0(baseUrl + toRaw(url), method, toRaw(fetcher))
        if(!validate) return
        loadingRef.value = false
        if(r.status === 'OK') {
            dataRef.value = r.data
        }else{
            dataRef.value = null
            throwError?.(r.code, r.data)
        }
    }, {deep: true, immediate: true})
    
    const update = useUpdateFunction(dataRef, updateLoadingRef, headers, baseUrl, url, throwError)

    return {loading: loadingRef, data: dataRef, updateLoading: updateLoadingRef, update}
}

function useUpdateFunction(dataRef: Ref<any>, updateLoadingRef: Ref<boolean>, headers: any, baseUrl: string, url: string, throwError?: ErrorHandler): SWRUpdate {
    return async (data, options) => {
        const method = options?.method || 'PUT'
        updateLoadingRef.value = true
        const r = await request0((options?.baseUrl || baseUrl) + toRaw(url), method, {headers, [method == 'GET' ? 'query' : 'data']: data || undefined})
        updateLoadingRef.value = false
        if(r.status === 'OK') {
            dataRef.value = r.data
            return {ok: true, data: r.data}
        }else{
            if(options?.errorHandler != null) {
                options.errorHandler(r.code, r.data, throwError)
            }else if(throwError != null) {
                throwError(r.code, r.data)
            }
            return {ok: false, data: undefined}
        }
    }
}

function useHeaders(auth?: AuthResult | (() => AuthResult)) {
    if(auth == null) {
        return undefined
    }
    const { token } = typeof auth === 'function' ? auth() : auth

    const headers: any = reactive({})
    watch(token, v => {
        if(v != null) {
            headers['Authorization'] = `Bearer ${v}`
        }else{
            delete headers['Authorization']
        }
    }, {immediate: true})

    return headers
}