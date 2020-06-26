import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
    history: createWebHistory(),
    routes: [
        {
            name: 'Home',
            path: '/',
            component: () => import('@/views/Home.vue')
        },
        {
            name: 'Login',
            path: '/login',
            component: () => import('@/views/Login.vue'),
            meta: {hideFooter: true}
        },
        {
            name: 'UserInfo',
            path: '/user/info',
            component: () => import('@/views/NotFound.vue')
        },
        {
            name: 'Database',
            path: '/database',
            redirect: {name: 'Animation.List'}
        },
        {
            name: 'Animation.List',
            path: '/database/animations/list',
            component: () => import('@/views/database/animation/AnimationList.vue'),
            meta: {nav: ['database', 'animation']}
        },
        {
            name: 'Animation.New',
            path: '/database/animations/new',
            component: () => import('@/views/database/animation/AnimationNew.vue'),
            meta: {nav: ['database', 'animation', '@new']}
        },
        {
            name: 'Animation.Detail',
            path: '/database/animations/detail/:id',
            component: () => import('@/views/database/animation/AnimationDetail.vue'),
            meta: {nav: ['database', 'animation', '@detail']}
        },
        {
            name: 'Tag.List',
            path: '/database/tags/list',
            component: () => import('@/views/database/tag/TagList.vue'),
            meta: {nav: ['database', 'tag']}
        },
        {
            name: 'Tag.New',
            path: '/database/tags/new',
            component: () => import('@/views/database/tag/TagNew.vue'),
            meta: {nav: ['database', 'tag', '@new']}
        },
        {
            name: 'Tag.Detail',
            path: '/database/tags/detail/:id',
            component: () => import('@/views/database/tag/TagDetail.vue'),
            meta: {nav: ['database', 'tag', '@detail']}
        },
        {
            name: 'Staff.List',
            path: '/database/staffs/list',
            component: () => import('@/views/database/staff/StaffList.vue'),
            meta: {nav: ['database', 'staff']}
        },
        {
            name: 'Staff.New',
            path: '/database/staffs/new',
            component: () => import('@/views/database/staff/StaffNew.vue'),
            meta: {nav: ['database', 'staff', '@new']}
        },
        {
            name: 'Staff.Detail',
            path: '/database/staffs/detail/:id',
            component: () => import('@/views/database/staff/StaffDetail.vue'),
            meta: {nav: ['database', 'staff', '@detail']}
        },
        {
            name: 'Record',
            path: '/personal/records',
            redirect: {name: 'Record.Diary'}
        },
        {
            name: 'Record.Diary',
            path: '/personal/records/diary',
            component: () => import('@/views/NotFound.vue'),
            meta: {nav: ['record', 'diary']}
        },
        {
            name: 'Record.Activity',
            path: '/personal/records/activity',
            component: () => import('@/views/NotFound.vue'),
            meta: {nav: ['record', 'activity']}
        },
        {
            name: 'Record.History',
            path: '/personal/records/history',
            component: () => import('@/views/NotFound.vue'),
            meta: {nav: ['record', 'history']}
        },
        {
            name: 'Record.Find',
            path: '/personal/records/find',
            component: () => import('@/views/NotFound.vue'),
            meta: {nav: ['record', 'find']}
        },
        {
            name: 'Comment',
            path: '/personal/comments',
            redirect: {name: 'Comment.Activity'}
        },
        {
            name: 'Comment.Activity',
            path: '/personal/comments/activity',
            component: () => import('@/views/NotFound.vue'),
            meta: {nav: ['comment', 'activity']}
        },
        {
            name: 'Comment.Rank',
            path: '/personal/comments/rank',
            component: () => import('@/views/NotFound.vue'),
            meta: {nav: ['comment', 'rank']}
        },
        {
            name: 'Comment.Find',
            path: '/personal/comments/find',
            component: () => import('@/views/NotFound.vue'),
            meta: {nav: ['comment', 'find']}
        },
        {
            name: 'Statistics',
            path: '/statistics',
            component: () => import('@/views/NotFound.vue'),
            meta: {nav: ['statistics']}
        },
        {
            name: 'NotFound',
            path: '/:catchAll(.*)',
            component: () => import('@/views/NotFound.vue')
        }
    ]
})
