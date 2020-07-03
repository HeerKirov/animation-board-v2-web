import { createRouter, createWebHistory } from 'vue-router'
import database from './database'
import record from './record'
import comment from './comment'
import statistics from './statistics'
import general from './general'

export default createRouter({
    history: createWebHistory(),
    routes: [
        ...general,
        ...database,
        ...record,
        ...comment,
        ...statistics,
        {
            name: 'NotFound',
            path: '/:catchAll(.*)',
            component: () => import('@/views/NotFound.vue'),
            meta: {title: '404 Not Found'}
        }
    ]
})
