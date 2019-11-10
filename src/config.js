const config = {
    systemName: '智慧物联系统',
    statusCode: {
        SUCCESS: '200',
        ERROR: '500',
        ERROR_PARAMS: '501',
        ERROR_UNIQUE: '502',
        NONENTITY: '400'
    }
}

export let statusCode = config.statusCode
export let systemName = config.systemName
export default config
