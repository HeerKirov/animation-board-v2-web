export const generalStatusText: {[code: number]: string} = {
    400: '表单内容错误',
    401: '未登录',
    403: '没有访问权限',
    404: '资源未找到',
    405: '不允许的请求方法',
    500: '服务器发生异常'
}

export const errorCodeText: {[code: string]: string} = {
    //public 400
    'EMPTY_REQUEST_BODY': '请求内容意外地为空',
    'INVALID_REQUEST_BODY': '请求内容意外地无法解析',
    'INVALID_CONTENT_TYPE': '请求内容类型意外地不正确',
    'TYPE_ERROR': '参数的类型有误',
    'PARAM_ERROR': '参数格式或内容不符合要求',
    'PARAM_REQUIRED': '参数缺失',
    //public 401
    'UNAUTHORIZED': '没有提供认证信息，或提供了错误的认证信息',
    'AUTHENTICATION_FAILED': '认证失败，认证信息无效',
    //public 403
    'FORBIDDEN': '没有访问权限',
    //public 404
    'NOT_FOUND': '资源未找到',
    //public 500
    'INTERNAL_SERVER_ERROR': '服务器发生异常',
    //private 400
    'NOT_EXISTS': '请求中指定使用的某种资源不存在',
    'ALREADY_EXISTS': '相同名称的资源已经存在',
    'INVALID_OPERATION': '无效的操作'
}
