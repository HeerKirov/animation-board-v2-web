export default [
    {
        name: 'Statistics',
        path: '/statistics',
        component: () => import('@/views/staticstics/Staticstics.vue'),
        meta: {nav: ['statistics'], title: '统计'}
    }
]
