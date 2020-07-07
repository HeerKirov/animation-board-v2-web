import { App, InjectionKey, reactive, inject } from 'vue'
import { generalStatusText, errorCodeText } from '@/definitions/errors'

const notificationInjectionKey: InjectionKey<NotificationService> = Symbol()

type Type = "success" | "error" | "warning" | "info" | "plain"

interface Notification {
    header: string
    type: Type
    content: string[]
}

interface NotificationService {
    notifications: Notification[]
    notify(header: string, type: Type, content: string | string[]): void
    errorHandler(code: number, data: any): void
}

export function createNotification() {
    const service: NotificationService = {
        notifications: reactive([]),
        notify(header: string, type: Type, content: string | string[]): void {
            service.notifications.push({header, type, content: typeof content === 'object' ? content : [content]})
        },
        errorHandler(code: number, data: any): void {
            if(code > 0) {
                const d = typeof data === 'object' ? data : data != null ? JSON.parse(data) : null
                const errorCode = d?.['code']
                const header = errorCode && errorCodeText[errorCode] || generalStatusText[code] || code.toString()
                const content = d?.['message']

                service.notify(header, 'error', content)
            }else{
                service.notify('网络连接发生错误', 'error', data?.toString())
            }
        }
    }

    return {
        ...service,
        install(app: App) {
            app.provide(notificationInjectionKey, service)
        }
    }
}

export function useNotification() {
    return inject(notificationInjectionKey)!
}
