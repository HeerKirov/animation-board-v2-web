export const navigationItems: Array<NavigationItem> = [
    {
        name: '日记',
        icon: 'fa-book',
        color: 'info',
        link: '/personal/records',
        breadcrumbLink: '',
        meta: 'record',
        children: [
            {
                name: '书签',
                icon: 'fa-thumb-tack',
                link: '/diary',
                meta: 'diary'
            },
            {
                name: '动态',
                icon: 'fa-quote-left',
                link: '/activity',
                meta: 'activity'
            },
            {
                name: '足迹',
                icon: 'fa-book',
                link: '/history',
                meta: 'history'
            },
            {
                name: '发现',
                icon: 'fa-search',
                link: '/find',
                meta: 'find'
            }
        ]
    },
    {
        name: '评价',
        icon: 'fa-bookmark',
        color: 'warning',
        link: '/personal/comments',
        breadcrumbLink: '',
        meta: 'comment',
        children: [
            {
                name: '动态',
                icon: 'fa-quote-right',
                link: '/activity',
                meta: 'activity'
            },
            {
                name: '评分表',
                icon: 'fa-star',
                link: '/rank',
                meta: 'rank'
            },
            {
                name: '发现',
                icon: 'fa-eye',
                link: '/find',
                meta: 'find'
            },
        ]
    },
    {
        name: '数据库',
        icon: 'fa-database',
        color: 'primary',
        link: '/database',
        breadcrumbLink: '',
        meta: 'database',
        children: [
            {
                name: '动画',
                icon: 'fa-film',
                link: '/animations/list',
                meta: 'animation'
            },
            {
                name: '标签',
                icon: 'fa-tags',
                link: '/tags/list',
                meta: 'tag'
            },
            {
                name: 'STAFF',
                icon: 'fa-user',
                link: '/staffs/list',
                meta: 'staff'
            }
        ]
    },
    {
        name: '统计',
        icon: 'fa-bar-chart',
        color: 'danger',
        link: '/statistics',
        meta: 'statistics'
    }
]

interface NavigationItem {
    name: string
    icon: string
    color: string
    link: string
    breadcrumbLink?: string,
    meta: string
    notInNav?: boolean
    children?: Array<NavigationSubItem>
}

interface NavigationSubItem {
    name: string
    icon: string
    link: string
    meta: string
}