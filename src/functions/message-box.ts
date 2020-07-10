import { App, InjectionKey, Ref, ref, shallowRef, watch, inject } from 'vue'

const messageBoxInjectionKey: InjectionKey<ModalService> = Symbol()

type MessageBoxFunction = (options: MessageBoxOption) => Promise<MessageBoxAction | null>

export type MessageBoxAction = "TRUE" | "FALSE" | "OK" | "CANCEL"

interface MessageBoxOption {
    header?: string
    content: string
    type?: "INFO" | "WARNING" | "REQUEST"
    actions?: MessageBoxAction[]
}

interface ModalService {
    messageBoxData: Ref<MessageBoxOption | null>
    messageBoxResult: Ref<MessageBoxAction | null | undefined>
    message: MessageBoxFunction
}

export function createMessageBox() {
    const service: ModalService = {
        messageBoxData: shallowRef(null),
        messageBoxResult: ref(undefined),
        message(options) {
            const promise = new Promise<MessageBoxAction | null>((resolve) => {
                const stop = watch(service.messageBoxResult, () => {
                    if(service.messageBoxResult.value !== undefined) {
                        resolve(service.messageBoxResult.value)
                        stop?.()
                    }
                })
            })
            if(service.messageBoxData.value != null) {
                service.messageBoxResult.value = null
            }
            service.messageBoxData.value = options
            service.messageBoxResult.value = undefined
            return promise
        }
    }

    return {
        install(app: App) {
            app.provide(messageBoxInjectionKey, service)
        }
    }
}

export function useMessageBox() {
    return inject(messageBoxInjectionKey)!
}
