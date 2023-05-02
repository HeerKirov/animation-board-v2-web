import axios, { Method } from 'axios'

export interface RequestParam {
    headers?: any
    query?: any
    data?: any
}

export interface CommonResult {
    status: 'OK' | 'ERROR' | 'EXCEPTION'
    code: number
    data: any
}

export async function request(url: string, method: Method, requestParam?: RequestParam): Promise<CommonResult> {
    try {
        const res = await axios.request({
            url: url,
            method: method,
            headers: requestParam && requestParam.headers,
            params: requestParam && requestParam.query,
            data: requestParam && requestParam.data
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
    }catch(e: any) {
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
