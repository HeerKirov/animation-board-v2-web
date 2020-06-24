import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: () => import('@/views/Home.vue')
        },
        {
            path: '/login',
            component: () => import('@/views/Login.vue'),
            meta: {hideFooter: true}
        },
        {
            path: '/database',
            redirect: '/database/animations/list'
        },
        {
            path: '/database/animations/list',
            component: () => import('@/views/database/animation/AnimationList.vue'),
            meta: {nav: ['database', 'animation']}
        },
        {
            path: '/database/animations/detail/:id',
            component: () => import('@/views/database/animation/AnimationDetail.vue'),
            meta: {nav: ['database', 'animation', '@detail']}
        },
        {
            path: '/database/tags/list',
            component: () => import('@/views/NotFound.vue'),
            meta: {nav: ['database', 'tag']}
        },
        {
            path: '/database/staffs/list',
            component: () => import('@/views/NotFound.vue'),
            meta: {nav: ['database', 'staff']}
        },
        {
            path: '/personal/records',
            redirect: '/personal/records/diary'
        },
        {
            path: '/personal/records/diary',
            component: () => import('@/views/NotFound.vue'),
            meta: {nav: ['record', 'diary']}
        },
        {
            path: '/personal/records/activity',
            component: () => import('@/views/NotFound.vue'),
            meta: {nav: ['record', 'activity']}
        },
        {
            path: '/personal/records/history',
            component: () => import('@/views/NotFound.vue'),
            meta: {nav: ['record', 'history']}
        },
        {
            path: '/personal/records/find',
            component: () => import('@/views/NotFound.vue'),
            meta: {nav: ['record', 'find']}
        },
        {
            path: '/personal/comments',
            redirect: '/personal/comments/activity'
        },
        {
            path: '/personal/comments/activity',
            component: () => import('@/views/NotFound.vue'),
            meta: {nav: ['comment', 'activity']}
        },
        {
            path: '/personal/comments/rank',
            component: () => import('@/views/NotFound.vue'),
            meta: {nav: ['comment', 'rank']}
        },
        {
            path: '/personal/comments/find',
            component: () => import('@/views/NotFound.vue'),
            meta: {nav: ['comment', 'find']}
        },
        {
            path: '/statistics',
            component: () => import('@/views/NotFound.vue'),
            meta: {nav: ['statistics']}
        },
        {
            path: '/:catchAll(.*)',
            component: () => import('@/views/NotFound.vue')
        }
    ]
})
