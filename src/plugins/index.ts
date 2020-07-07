import { createAuth, useAuth } from '@/functions/auth'
import { createServer } from '@/functions/server'
import { createDocumentManager } from '@/functions/document'
import { createNotification } from '@/functions/notification'
import config from '@/config'

export const document = createDocumentManager()

export const notification = createNotification()

export const auth = createAuth({
    basicServiceUrl: config.BASIC_SERVICE_URL,
    serverUrl: config.SERVER_URL,
    storagePrefix: config.STORAGE_PREFIX,
    tokenEffective: config.TOKEN_EFFECTIVE,
    tokenUpdateInterval: config.TOKEN_UPDATE_INTERVAL,
})

export const server = createServer({
    serverUrl: config.SERVER_URL,
    auth: useAuth,
    errorHandler: notification.errorHandler
})
