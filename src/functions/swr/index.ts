import axios, { Method } from 'axios'
import { toRaw, watch, reactive } from 'vue'

export interface Fetcher {
    headers?: any
    query?: any
    data?: any
}

export interface CommonResult {
    status: 'OK' | 'ERROR' | 'EXCEPTION'
    code: number
    data: any
}

export async function request(url: string, method: Method, config?: Fetcher): Promise<CommonResult> {
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
    loading: boolean
    code: number | null
    data: any | null
    error: any | null
}

export function useSWR(url: string, method: Method, fetcher?: Fetcher): SWResult {
    const result: SWResult = reactive({loading: true, data: null, error: null, code: null})

    watch(() => [url, fetcher], async () => {
        result.loading = true
        const r = await request(toRaw(url), method, toRaw(fetcher))
        result.loading = false
        result.code = r.code
        if(r.status === 'OK') {
            result.data = r.data
            result.error = null
        }else{
            result.data = null
            result.error = r.data
        }
    }, {deep: true, immediate: true})

    return result
}