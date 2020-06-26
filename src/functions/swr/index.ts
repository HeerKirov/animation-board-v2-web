import axios, { Method } from 'axios'
import { toRaw, watch, reactive, Ref, ref } from 'vue'

export interface CommonResult {
    status: 'LOADING'|'OK'|'ERROR'|'EXCEPTION'
    code: number
    data: any
}

export async function request(url: string, method: Method, config?: {headers?: any, query?: any, data?: any}): Promise<CommonResult> {
    try {
        const res = await axios.request({
            url: url,
            method: method,
            headers: config && config.headers,
            params: config && config.query,
            data: config && config.data
        })
        if(res.status < 300) {
            return {
                status: 'OK',
                code: res.status,
                data: res.data
            }
        }else{
            return {
                status: 'ERROR',
                code: res.status,
                data: res.data
            }
        }
    }catch(e) {
        if(e.response) {
            return {
                status: 'ERROR',
                code: e.response.status,
                data: e.response.data
            }
        }else{
            return {
                status: 'EXCEPTION',
                code: 0,
                data: e
            }
        }
    }
}

export interface SWResult {
    loading: Ref<boolean>
    data: Ref<any|null>
    error: Ref<any|null>
}

export function useSWR<T, E>(url: string, method: Method, fetcher?: {headers?: any, query?: any, data?: any}): SWResult {
    const result: SWResult = {loading: ref(true), data: ref(null), error: ref(null)}

    watch(() => [url, fetcher], () => {
        result.loading.value = true
        request(url, method, toRaw(fetcher)).then(r => {
            result.loading.value = false
            if(r.status === 'OK') {
                result.data.value = r.data
                result.error.value = null
            }else{
                result.data.value = null
                result.error.value = r.data
            }
        })
    }, {deep: true, immediate: true})

    return result
}