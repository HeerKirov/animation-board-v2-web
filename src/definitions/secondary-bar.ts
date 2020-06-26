interface SecondaryBarItem {
    name: string
    title: string
    icon: string
    link: string|{name: string}
}

export const secondaryBarItems: {[t: string]: {[r: string]: SecondaryBarItem}} = {
    record: {
        diary: {name: 'diary', title: '订阅', icon: 'thumbtack icon', link: {name: 'Record.Diary'}},
        activity: {name: 'activity', title: '动态', icon: 'quote left icon', link: {name: 'Record.Activity'}},
        history: {name: 'history', title: '足迹', icon: 'fa-th-list', link: {name: 'Record.History'}},
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

export const detailItem: SecondaryBarItem = {
    name: 'detail',
    title: '详情',
    icon: 'info icon',
    link: ''
}

export const editItem: SecondaryBarItem = {
    name: 'edit',
    title: '编辑',
    icon: 'edit icon',
    link: ''
}

export const newItem: SecondaryBarItem = {
    name: 'new',
    title: '新建',
    icon: 'plus icon',
    link: ''
}