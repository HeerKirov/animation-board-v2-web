export default [
    {
        name: 'Home',
        path: '/',
        component: () => import('@/views/Home.vue')
    },
    {
        name: 'Login',
        path: '/login',
        component: () => import('@/views/Login.vue'),
        meta: {hideFooter: true, title: '登录'}
    },
    {
        name: 'UserInfo',
        path: '/user/info',
        component: () => import('@/views/NotFound.vue'),
        meta: {title: '个人中心'}
    }
]
