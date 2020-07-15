import { Method } from 'axios'
import { InjectionKey, inject, reactive, App, watch, toRaw, Ref, ref, unref, computed } from 'vue'
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

export function useServer() {
    const configuration = inject(configurationInjectionKey)!
    const { headers } = useAuthorizations(configuration.auth, undefined)

    async function request(url: string, method: Method, data?: any, options?: RequestOptions): Promise<Response> {

        const param: RequestParam = {headers, [method === 'GET' ? 'query' : 'data']: data || undefined}

        const r = await request0((options?.baseUrl || configuration.serverUrl) + url, method, param)

        if(r.status === 'OK') {
            return {ok: true, data: r.data}
        }else{
            if(options?.errorHandler != null) {
                options.errorHandler(r.code, r.data, configuration.errorHandler)
            }else if(configuration.errorHandler != null) {
                configuration.errorHandler(r.code, r.data)
            }else{
                throwErrorToConsole(r.code, r.data)
            }
            return {ok: false, data: undefined}
        }
    }

    return {request}
}

function useAuthorizations(auth: AuthResult | (() => AuthResult) | undefined, byAuthorization: "LOGIN" | "COMPLETED" | undefined) {
    if(auth == null) {
        return {headers: undefined, passAuthorization: ref(true)}
    }
    const { token, stats } = typeof auth === 'function' ? auth() : auth

    const headers: any = reactive({})
    watch(token, v => {
        if(v != null) {
            headers['Authorization'] = `Bearer ${v}`
        }else{
            delete headers['Authorization']
        }
    }, {immediate: true})

    const passAuthorization = ref(false)
    if(byAuthorization === "LOGIN") {
        watch(() => stats.isLogin, () => { passAuthorization.value = stats.isLogin == true }, {immediate: true})
    }else if(byAuthorization === "COMPLETED") {
        const stop = watch(() => stats.isLogin, () => {
            if(stats.isLogin != undefined) {
                passAuthorization.value = true
                stop?.()
            }
        }, {immediate: true})
    }else{
        passAuthorization.value = true
    }

    return {headers, passAuthorization}
}

function throwErrorToConsole(code: number, data: any) {
    console.error(`Request Error[${code}]`, data)
}

//== SWR ==

type SWRUpdate = (data?: any, options?: SWROptions) => Promise<Response>

type SWRDelete = (options?: SWROptions) => Promise<Response>

export interface SWROptions extends RequestOptions {
    method?: Method
    byAuthorization?: "LOGIN" | "COMPLETED"
}

export interface SWR {
    loading: Ref<boolean>
    data: Ref<any>
    updateLoading: Ref<boolean>
    update: SWRUpdate
    deleteInstance: SWRDelete
}

export function useSWR(url: Ref<string | null> | string, data?: any, options?: SWROptions): SWR {
    const configuration = inject(configurationInjectionKey)!
    const { headers, passAuthorization } = useAuthorizations(configuration.auth, options?.byAuthorization || "COMPLETED")

    const baseUrl = options?.baseUrl || configuration.serverUrl
    const method = options?.method || 'GET'

    const throwError
        = options?.errorHandler != null ? ((code: number, data: any) => options.errorHandler?.(code, data, configuration.errorHandler))
        : configuration.errorHandler ?? throwErrorToConsole

    const loadingRef = ref(false)
    const dataRef = ref(null)
    const updateLoadingRef = ref(false)
    const update = useUpdateFunction(dataRef, updateLoadingRef, headers, baseUrl, url, throwError)
    const deleteInstance = useDeleteFunction(updateLoadingRef, headers, baseUrl, url, throwError)

    const fetcher: RequestParam = reactive({[method == 'GET' ? 'query' : 'data']: data || undefined, headers})

    watch(() => [url, fetcher, passAuthorization], async (_v, _o, onInvalidate) => {
        if(!passAuthorization.value) {
            return
        }

        const unrefUrl = unref(url)
        if(!unrefUrl) {
            return
        }

        let validate = true
        onInvalidate(() => {validate = false})

        loadingRef.value = true
        const r = await request0(baseUrl + unrefUrl, method, toRaw(fetcher))
        if(!validate) {
            return
        }

        loadingRef.value = false
        if(r.status === 'OK') {
            dataRef.value = r.data
        }else{
            dataRef.value = null
            throwError?.(r.code, r.data)
        }
    }, {deep: true, immediate: true})

    return {loading: loadingRef, data: dataRef, updateLoading: updateLoadingRef, update, deleteInstance}
}

function useUpdateFunction(dataRef: Ref<any>, updateLoadingRef: Ref<boolean>, headers: any, baseUrl: string, url: Ref<string | null> | string | null, throwError?: ErrorHandler): SWRUpdate {
    return async (data, options) => {
        const method = options?.method || 'PUT'
        updateLoadingRef.value = true
        const r = await request0((options?.baseUrl || baseUrl) + unref(url), method, {headers, [method == 'GET' ? 'query' : 'data']: data || undefined})
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

function useDeleteFunction(updateLoadingRef: Ref<boolean>, headers: any, baseUrl: string, url: Ref<string | null> | string | null, throwError?: ErrorHandler): SWRDelete {
    return async (options) => {
        const method = options?.method || 'DELETE'
        updateLoadingRef.value = true
        const r = await request0((options?.baseUrl || baseUrl) + unref(url), method, {headers})
        updateLoadingRef.value = false
        if(r.status === 'OK') {
            return {ok: true, data: undefined}
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

//== Continuous ==

export interface ContinuousOptions<QD, T> extends RequestOptions {
    queryData?: Ref<QD>
    query(count: number, total: number | null, queryData?: QD): any | undefined
    findTotal(result: any): number
    findData(result: any): T[]
}

export interface Continuous {
    requestForFirst(): void
    requestForNext(): void
    total: Ref<number | null>
    result: Ref<any[]>
    hasNext: Ref<boolean>
    hasRequested: Ref<boolean>
    clear(): void
}

export function useContinuous<QD, T>(url: string, options: ContinuousOptions<QD, T>): Continuous {
    const { request } = useServer()

    const total: Ref<number | null> = ref(null)
    const result: Ref<T[]> = ref([])
    const hasNext = computed(() => total.value != null && result.value.length < total.value)

    const hasRequested = ref(false)

    let queryData: QD | undefined = undefined
    const requestForFirst = async () => {
        queryData = options.queryData?.value
        const r = await request(url, 'GET', options.query(0, total.value, queryData), {errorHandler: options.errorHandler})
        if(r.ok) {
            result.value = options.findData(r.data)
            total.value = options.findTotal(r.data)
        }else{
            result.value = []
            total.value = null
        }
        hasRequested.value = true
    }

    const requestForNext = async () => {
        if(hasNext.value) {
            const r = await request(url, 'GET', options.query(result.value.length, total.value, queryData), {errorHandler: options.errorHandler})
            if(r.ok) {
                total.value = options.findTotal(r.data)
                result.value.splice(result.value.length, 0, ...options.findData(r.data))
            }
        }
    }

    const clear = () => {
        total.value = null
        result.value = []
    }

    return {requestForFirst, requestForNext, total, result, hasNext, hasRequested, clear}
}