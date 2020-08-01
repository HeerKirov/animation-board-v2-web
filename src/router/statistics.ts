export default [
    {
        name: 'Statistics',
        path: '/statistics',
        component: () => import('@/views/statistics/Statistics.vue'),
        meta: {nav: ['statistics'], title: '统计'}
    },
    {
        name: 'Statistics.Overview',
        path: '/statistics/overview',
        component: () => import('@/views/statistics/Overview.vue'),
        meta: {nav: ['statistics'], title: ['统计', '概览']}
    },
    {
        name: 'Statistics.Season',
        path: '/statistics/season',
        component: () => import('@/views/NotFound.vue'),
        meta: {nav: ['statistics'], title: ['统计', '季度']}
    },
    {
        name: 'Statistics.Timeline',
        path: '/statistics/timeline',
        component: () => import('@/views/statistics/Timeline.vue'),
        meta: {nav: ['statistics'], title: ['统计', '时间线']}
    },
    {
        name: 'Statistics.HistoryLine',
        path: '/statistics/historyline',
        component: () => import('@/views/statistics/HistoryLine.vue'),
        meta: {nav: ['statistics'], title: ['统计', '历史轴']}
    },
    {
        name: 'Statistics.Period',
        path: '/statistics/period',
        component: () => import('@/views/NotFound.vue'),
        meta: {nav: ['statistics'], title: ['统计', '周期']}
    }
]
