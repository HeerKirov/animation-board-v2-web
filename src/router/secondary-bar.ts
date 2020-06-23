interface SecondaryBarItem {
    name: string
    title: string
    icon: string
    link: string
}

export const secondaryBarItems: {[t: string]: {[r: string]: SecondaryBarItem}} = {
    record: {
        diary: {name: 'diary', title: '订阅', icon: 'thumbtack icon', link: '/personal/records/diary'},
        activity: {name: 'activity', title: '动态', icon: 'quote left icon', link: '/personal/records/activity'},
        history: {name: 'history', title: '足迹', icon: 'fa-th-list', link: '/personal/records/history'},
        find: {name: 'find', title: '发现', icon: 'search icon', link: '/personal/records/find'},
    },
    comment: {
        activity: {name: 'activity', title: '动态', icon: 'quote right icon', link: '/personal/comments/activity'},
        rank: {name: 'rank', title: '评分表', icon: 'star icon', link: '/personal/comments/rank'},
        find: {name: 'find', title: '发现', icon: 'eye icon', link: '/personal/comments/find'},
    },
    database: {
        animation: {name: 'animation', title: '动画', icon: 'film icon', link: '/database/animations/list'},
        tag: {name: 'tag', title: '标签', icon: 'tags icon', link: '/database/tags/list'},
        staff: {name: 'staff', title: 'STAFF', icon: 'users icon', link: '/database/staffs/list'}
    },
    statistics: {}
}

export const detailItem: SecondaryBarItem = {
    name: 'detail',
    title: '详情',
    icon: 'info icon',
    link: ''
}