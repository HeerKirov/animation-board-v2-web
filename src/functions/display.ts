import { fmt } from './format'

export function toSubTitle(t1: any, t2: any): string {
    if(t1 && t2) return `${t1} / ${t2}`
    else if(t1) return t1
    else if(t2) return t2
    else return ''
}

export function toPublishTime(publishTime: string): string {
    const [year, month] = publishTime.split('-')
    return `${year}年${month}月`
}

export function toHtmlStr(s: string | null): string | null {
    return s?.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>') ?? null
}

export function toCNStringDate(date: Date): string {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

export function toFriendlyTime(date: Date, now?: Date): string {
    const n = now ?? new Date()
    if(date.getFullYear() !== n.getFullYear()) {
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    }
    const minuteMinus = Math.floor((n.getTime() - date.getTime()) / 60000)
    if(minuteMinus === 0) {
        return '刚才'
    }else if(minuteMinus <= 10) {
        return `${minuteMinus}分钟前`
    }
    const dayMinus = Math.floor(n.getTime() / 86400000) - Math.floor(date.getTime() / 86400000)
    if(dayMinus === 0) {
        return `${fmt(date.getHours())}:${fmt(date.getMinutes())}`
    }else if(dayMinus === 1) {
        return `昨天${fmt(date.getHours())}:${fmt(date.getMinutes())}`
    }
    return `${date.getMonth() + 1}月${date.getDate()}日`
}
