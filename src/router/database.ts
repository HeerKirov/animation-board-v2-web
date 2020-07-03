export default [
    {
        name: 'Database',
        path: '/database',
        redirect: {name: 'Animation.List'},
        meta: {title: '动画数据库'}
    },
    {
        name: 'Animation.List',
        path: '/database/animations/list',
        component: () => import('@/views/database/animation/AnimationList.vue'),
        meta: {nav: ['database', 'animation'], title: '动画数据库'}
    },
    {
        name: 'Animation.New',
        path: '/database/animations/new',
        component: () => import('@/views/database/animation/AnimationNew.vue'),
        meta: {nav: ['database', 'animation', '@new'], title: ['动画数据库', '新建']}
    },
    {
        name: 'Animation.Detail',
        path: '/database/animations/detail/:id',
        component: () => import('@/views/database/animation/AnimationDetail.vue'),
        meta: {nav: ['database', 'animation', '@detail'], title: '动画数据库'}
    },
    {
        name: 'Tag.List',
        path: '/database/tags/list',
        component: () => import('@/views/database/tag/TagList.vue'),
        meta: {nav: ['database', 'tag'], title: '标签数据库'}
    },
    {
        name: 'Tag.New',
        path: '/database/tags/new',
        component: () => import('@/views/database/tag/TagNew.vue'),
        meta: {nav: ['database', 'tag', '@new'], title: ['标签数据库', '新建']}
    },
    {
        name: 'Tag.Detail',
        path: '/database/tags/detail/:id',
        component: () => import('@/views/database/tag/TagDetail.vue'),
        meta: {nav: ['database', 'tag', '@detail'], title: '标签数据库'}
    },
    {
        name: 'Staff.List',
        path: '/database/staffs/list',
        component: () => import('@/views/database/staff/StaffList.vue'),
        meta: {nav: ['database', 'staff'], title: 'STAFF数据库'}
    },
    {
        name: 'Staff.New',
        path: '/database/staffs/new',
        component: () => import('@/views/database/staff/StaffNew.vue'),
        meta: {nav: ['database', 'staff', '@new'], title: ['STAFF数据库', '新建']}
    },
    {
        name: 'Staff.Detail',
        path: '/database/staffs/detail/:id',
        component: () => import('@/views/database/staff/StaffDetail.vue'),
        meta: {nav: ['database', 'staff', '@detail'], title: ['STAFF数据库']}
    }
]
