export default {
    'CASE': {
        'NUMBER': process.env.VUE_APP_CASE_NUMBER,
        'URL': process.env.VUE_APP_CASE_URL
    },
    'STORAGE_PREFIX': process.env.VUE_APP_STORAGE_PREFIX,
    'TOKEN_EFFECTIVE': parseInt(process.env.VUE_APP_TOKEN_EFFECTIVE),
    'TOKEN_UPDATE_INTERVAL': parseInt(process.env.VUE_APP_TOKEN_UPDATE_INTERVAL),
    'SERVER_URL': process.env.VUE_APP_SERVER_URL,
    'BASIC_SERVICE_URL': process.env.VUE_APP_BASIC_SERVICE_URL
}
