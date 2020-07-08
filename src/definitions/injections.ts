import { InjectionKey, Ref } from 'vue'
import { SWR } from '@/functions/server'

export const swrInjectionKey: InjectionKey<SWR> = Symbol()

export const editInjectionKey: InjectionKey<Ref<boolean>> = Symbol()
