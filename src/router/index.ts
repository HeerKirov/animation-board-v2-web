import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: () => import('../views/Home.vue')
        },
        {
            path: '/database',
            redirect: '/database/animations/list'
        },
        {
            path: '/database/animations/list',
            component: () => import('../views/database/animation/AnimationList.vue'),
            meta: {isDatabase: true, isAnimation: true, nav: ['database', 'animation']}
        },
        {
            path: '/database/tags/list',
            component: () => import('../views/NotFound.vue'),
            meta: {isDatabase: true, isTag: true, nav: ['database', 'tag']}
        },
        {
            path: '/database/staffs/list',
            component: () => import('../views/NotFound.vue'),
            meta: {isDatabase: true, isStaff: true, nav: ['database', 'staff']}
        },
        {
            path: '/personal/records',
            redirect: '/personal/records/diary'
        },
        {
            path: '/personal/records/diary',
            component: () => import('../views/NotFound.vue'),
            meta: {isRecord: true, isDiary: true, nav: ['record', 'diary']}
        },
        {
            path: '/personal/records/activity',
            component: () => import('../views/NotFound.vue'),
            meta: {isRecord: true, isActivity: true, nav: ['record', 'activity']}
        },
        {
            path: '/personal/records/history',
            component: () => import('../views/NotFound.vue'),
            meta: {isRecord: true, isHistory: true, nav: ['record', 'history']}
        },
        {
            path: '/personal/records/find',
            component: () => import('../views/NotFound.vue'),
            meta: {isRecord: true, isFind: true, nav: ['record', 'find']}
        },
        {
            path: '/personal/comments',
            redirect: '/personal/comments/activity'
        },
        {
            path: '/personal/comments/activity',
            component: () => import('../views/NotFound.vue'),
            meta: {isComment: true, isActivity: true, nav: ['comment', 'activity']}
        },
        {
            path: '/personal/comments/rank',
            component: () => import('../views/NotFound.vue'),
            meta: {isComment: true, isRank: true, nav: ['comment', 'rank']}
        },
        {
            path: '/personal/comments/find',
            component: () => import('../views/NotFound.vue'),
            meta: {isComment: true, isFind: true, nav: ['comment', 'find']}
        },
        {
            path: '/statistics',
            component: () => import('../views/NotFound.vue'),
            meta: {isStatistics: true, nav: ['statistics']}
        },
        {
            path: '/:catchAll(.*)',
            component: () => import('../views/NotFound.vue')
        }
    ]
})
