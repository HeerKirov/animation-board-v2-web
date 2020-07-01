import { InjectionKey } from 'vue'
import { SWR } from '@/functions/server'

export const swrInjectionKey: InjectionKey<SWR> = Symbol()