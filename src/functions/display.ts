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
