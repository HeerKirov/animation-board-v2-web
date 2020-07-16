export default [
    {
        name: 'Comment',
        path: '/personal/comments',
        redirect: {name: 'Comment.Activity'}
    },
    {
        name: 'Comment.Activity',
        path: '/personal/comments/activity',
        component: () => import('@/views/personal/comment/CommentActivity.vue'),
        meta: {nav: ['comment', 'activity'], title: ['评价', '动态']}
    },
    {
        name: 'Comment.Rank',
        path: '/personal/comments/rank',
        component: () => import('@/views/personal/comment/CommentRank.vue'),
        meta: {nav: ['comment', 'rank'], title: ['评价', '评分表']}
    },
    {
        name: 'Comment.Find',
        path: '/personal/comments/find',
        component: () => import('@/views/personal/comment/CommentFind.vue'),
        meta: {nav: ['comment', 'find'], title: ['评价', '发现']}
    },
    {
        name: 'Comment.New',
        path: '/personal/comments/new/:id',
        component: () => import('@/views/NotFound.vue'),
        meta: {nav: ['comment', '@new'], title: ['评价', '新建']}
    },
    {
        name: 'Comment.Detail',
        path: '/personal/comments/detail/:id',
        component: () => import('@/views/NotFound.vue'),
        meta: {nav: ['comment', '@detail'], title: '评价'}
    }
]
