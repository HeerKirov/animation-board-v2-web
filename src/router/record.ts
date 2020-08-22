export default [
    {
        name: 'Record',
        path: '/personal/records',
        redirect: {name: 'Record.Diary'}
    },
    {
        name: 'Record.Diary',
        path: '/personal/records/diary',
        component: () => import('@/views/personal/record/RecordDiary.vue'),
        meta: {nav: ['record', 'diary'], title: ['日记', '订阅']}
    },
    {
        name: 'Record.Activity',
        path: '/personal/records/activity',
        component: () => import('@/views/personal/record/RecordActivity.vue'),
        meta: {nav: ['record', 'activity'], title: ['日记', '动态']}
    },
    {
        name: 'Record.Scale',
        path: '/personal/records/scale',
        component: () => import('@/views/personal/record/RecordScale.vue'),
        meta: {nav: ['record', 'scale'], title: ['日记', '数轴']}
    },
    {
        name: 'Record.History',
        path: '/personal/records/history',
        component: () => import('@/views/personal/record/RecordHistory.vue'),
        meta: {nav: ['record', 'history'], title: ['日记', '足迹']}
    },
    {
        name: 'Record.Find',
        path: '/personal/records/find',
        component: () => import('@/views/personal/record/RecordFind.vue'),
        meta: {nav: ['record', 'find'], title: ['日记', '发现']}
    },
    {
        name: 'Record.Detail',
        path: '/personal/records/detail/:id',
        component: () => import('@/views/personal/record/RecordDetail.vue'),
        meta: {nav: ['record', '@detail'], title: '日记'}
    }
]
