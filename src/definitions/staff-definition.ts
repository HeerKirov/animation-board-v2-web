export const isOrganizations: DefinitionItem[] = [
    {"name": "true", "title": "组织"},
    {"name": "false", "title": "个人"}
]
export const occupations: DefinitionItem[] = [
    {"name": "ANIMATION_COMPANY", "title": "动画公司"},
    {"name": "GAME_COMPANY", "title": "游戏公司"},
    {"name": "NOVEL_AUTHOR", "title": "小说作家"},
    {"name": "MANGA_AUTHOR", "title": "漫画作家"},
    {"name": "ANIMATION_STAFF", "title": "动画制作人员"},
    {"name": "OTHER", "title": "其他"}
]

export interface DefinitionItem {
    name: string
    title?: string
}