export const topBarItems: TopBarItem[] = [
    {
        name: '日记',
        icon: 'fa-book',
        color: 'info',
        link: '/personal/records'
    },
    {
        name: '记录',
        icon: 'fa-bookmark',
        color: 'success',
        link: '/personal/comments'
    },
    {
        name: '数据库',
        icon: 'fa-database',
        color: 'primary',
        link: '/database'
    },
    {
        name: '统计',
        icon: 'fa-bar-chart',
        color: 'danger',
        link: '/statistics'
    }
]

function secondaryBarItems(): {[type: string]: SecondaryBarItem[]} {
    return {
        'record': [
            {name: 'diary', title: '书签', icon: 'fa-thumb-tack', link: '/personal/records/diary'},
            {name: 'activity', title: '动态', icon: 'fa-quote-left', link: '/personal/records/activity'},
            {name: 'history', title: '足迹', icon: 'fa-th-list', link: '/personal/records/history'},
            {name: 'find', title: '发现', icon: 'fa-search', link: '/personal/records/find'},
        ],
        'comment': [
            {name: 'activity', title: '动态', icon: 'fa-quote-right', link: '/personal/comments/activity'},
            {name: 'rank', title: '评分表', icon: 'fa-star', link: '/personal/comments/rank'},
            {name: 'find', title: '发现', icon: 'fa-eye', link: '/personal/comments/find'},
        ],
        'database': [
            {name: 'animation', title: '动画', icon: 'fa-film', link: '/database/animations/list'},
            {name: 'tag', title: '标签', icon: 'fa-tags', link: '/database/tags/list'},
            {name: 'staff', title: 'STAFF', icon: 'fa-user', link: '/database/staffs/list'}
        ],
        'statistics': []
    }
}

export function useSecondaryBarItems(type: 'record'|'comment'|'database'|'statistics', active?: string): SecondaryBarItem[] {
    let items = secondaryBarItems()[type]
    if(active) {
        for(let item of items) {
            if(item.name === active) {
                item.active = true
                break
            }
        }
    }
    return items
}

interface TopBarItem {
    name: string
    color: string
    icon: string
    link: string
}

interface SecondaryBarItem {
    name: string
    title: string
    icon: string
    link: string
    active?: boolean
}