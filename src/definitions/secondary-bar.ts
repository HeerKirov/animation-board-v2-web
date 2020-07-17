interface BarItem {
    name: string
    title: string
    icon: string
    link: string|{name: string}
}

export const secondaryBarItems: {[t: string]: {[r: string]: BarItem}} = {
    record: {
        diary: {name: 'diary', title: '订阅', icon: 'thumbtack icon', link: {name: 'Record.Diary'}},
        activity: {name: 'activity', title: '动态', icon: 'quote left icon', link: {name: 'Record.Activity'}},
        history: {name: 'history', title: '足迹', icon: 'shoe prints icon', link: {name: 'Record.History'}},
        find: {name: 'find', title: '发现', icon: 'search icon', link: {name: 'Record.Find'}},
    },
    comment: {
        activity: {name: 'activity', title: '动态', icon: 'quote right icon', link: {name: 'Comment.Activity'}},
        rank: {name: 'rank', title: '评分表', icon: 'star icon', link: {name: 'Comment.Rank'}},
        find: {name: 'find', title: '发现', icon: 'eye icon', link: {name: 'Comment.Find'}},
    },
    database: {
        animation: {name: 'animation', title: '动画', icon: 'film icon', link: {name: 'Animation.List'}},
        tag: {name: 'tag', title: '标签', icon: 'tags icon', link: {name: 'Tag.List'}},
        staff: {name: 'staff', title: 'STAFF', icon: 'users icon', link: {name: 'Staff.List'}}
    },
    statistics: {}
}

export const topBarItems: {[r: string]: BarItem} = {
    record: {name: 'record', title: '日记', icon: 'book icon', link: {name: 'Record'}},
    comment: {name: 'comment', title: '评价', icon: 'bookmark icon', link: {name: 'Comment'}},
    statistics: {name: 'statistics', title: '统计', icon: 'chart bar icon', link: {name: 'Statistics'}},
    database: {name: 'database', title: '数据库', icon: 'database icon', link: {name: 'Database'}}
}

export const detailItem: BarItem = {
    name: 'detail',
    title: '详情',
    icon: 'info icon',
    link: ''
}

export const editItem: BarItem = {
    name: 'edit',
    title: '编辑',
    icon: 'edit icon',
    link: ''
}

export const newItem: BarItem = {
    name: 'new',
    title: '新建',
    icon: 'plus icon',
    link: ''
}
