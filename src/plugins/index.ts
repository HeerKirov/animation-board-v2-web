import { createAuth, useAuth } from '@/functions/auth'
import { createServer } from '@/functions/server'
import config from '@/config'

export const auth = createAuth({
    basicServiceUrl: config.BASIC_SERVICE_URL,
    serverUrl: config.SERVER_URL,
    storagePrefix: config.STORAGE_PREFIX,
    tokenEffective: config.TOKEN_EFFECTIVE
})

export const server = createServer({
    serverUrl: config.SERVER_URL,
    auth: useAuth,
    //TODO 完成全局通知模块之后在这里注入
})
