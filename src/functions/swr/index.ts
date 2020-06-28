import axios, { Method } from 'axios'
import { toRaw, watch, reactive } from 'vue'

export interface Request {
    headers?: any
    query?: any
    data?: any
}

export interface CommonResult {
    status: 'OK' | 'ERROR' | 'EXCEPTION'
    code: number
    data: any
}

export async function request(url: string, method: Method, config?: Request): Promise<CommonResult> {
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

export interface Fetcher extends Request {
    reactive?: boolean
}

export interface SWResult {
    loading: boolean
    data: any | null
}

export function useSWR(url: string, method: Method, fetcher?: Fetcher, errorHandler?: ErrorHandler): SWResult {
    const result: SWResult = reactive({loading: true, data: null})

    watch(() => [url, fetcher], async (_v, _o, onInvalidate) => {
        if(fetcher?.reactive !== false) {
            let validate = true
            onInvalidate(() => {validate = false})

            result.loading = true
            const r = await request(toRaw(url), method, toRaw(fetcher))
            if(validate) {
                result.loading = false
                if(r.status === 'OK') {
                    result.data = r.data
                }else{
                    result.data = null
                    if(errorHandler != null) {
                        errorHandler(r.code, r.data)
                    }
                }
            }
        }
    }, {deep: true, immediate: true})

    return result
}

export type ErrorHandler = (code: number, data: any) => void