import { DefinitionItem } from './util'

export const publishTypes: DefinitionItem[] = [
    {name: 'TV_AND_WEB', title: 'TV&Web', color: 'teal'}, 
    {name: 'OVA_AND_OAD', title: 'OVA&OAD', color: 'olive'}, 
    {name: 'MOVIE', title: '剧场版动画', color: 'blue'}
]
export const originalWorkTypes: DefinitionItem[] = [
    {name: 'MANGA', title: '漫画', color: 'red'}, 
    {name: 'NOVEL', title: '小说', color: 'novel'}, 
    {name: 'GAME', title: '游戏', color: 'blue'}, 
    {name: 'ORIGINAL', title: '原创', color: 'green'}, 
    {name: 'OTHER', title: '其他', color: 'pink'}
]
export const sexLimitLevels: DefinitionItem[] = [
    {name: 'ALL', title: '全年龄', color: 'green'}, 
    {name: 'R12', color: 'blue'}, 
    {name: 'R15', color: 'yellow'}, 
    {name: 'R17', color: 'orange'}, 
    {name: 'R18', color: 'red'}
]
export const violenceLimitLevels: DefinitionItem[] = [
    {name: 'NO', title: '无暴力', color: 'green'}, 
    {name: 'A', color: 'blue'}, 
    {name: 'B', color: 'yellow'}, 
    {name: 'C', color: 'purple'}, 
    {name: 'D', color: 'violet'}
]
export const relations: DefinitionItem[] = [
    {name: 'PREV', title: '前作'},
    {name: 'NEXT', title: '续作'},
    {name: 'FANWAI', title: '番外'},
    {name: 'MAIN_ARTICLE', title: '正剧'},
    {name: 'RUMOR', title: '外传'},
    {name: 'TRUE_PASS', title: '正传'},
    {name: 'SERIES', title: '同系列'},
]

export const sexLimitIntroductions = {
    ALL: [
        "无任何性暗示、性倾向、色情内容",
        "恋爱、接吻、裸露行为若没有任何性暗示倾向，则不会视作限制内容",
        "可以较为放心地提供给家长和儿童观看"
    ],
    R12: [
        "有一定的软色情性质的性暗示或低俗内容",
        "性相关的讨论、轻微的色情挑逗、轻微的色情裸露、稍显低俗的内容",
        "不能放心地提供给家长和儿童观看"
    ],
    R15: [
        "存在明显色情意向的裸露、低俗内容、性暗示",
        "低俗的性讨论、色情挑逗、色情裸露、低俗的性内容",
        "不要提供给家长和儿童观看，会被打死"
    ],
    R17: [
        "具有强烈的色情意向或露骨的性展示",
        "性动作暗示、大面积色情裸露",
        "公开放送容易引起社会性死亡"
    ],
    R18: [
        "以性内容为卖点、明示的硬色情内容",
        "露点、性行为、对性内容的直接讨论",
        "公开讨论容易引起社会性死亡"
    ]
}

export const violenceLimitIntroductions = {
    NO: [
        "无任何暴力、冲突和不当行为",
        "不涉及任何打斗、冲突、暴力行为的日常类内容",
        "适合不想观看争斗的所有人"
    ],
    A: [
        "适合青少年、不具有不当行为的暴力或冲突",
        "普通且广泛的战斗要素、轻微且常见的日常暴力冲突",
        "适合想观看争斗的所有人"
    ],
    B: [
        "存在一定的暴力、不当行为、价值观扭曲",
        "暴力倾向、轻度凶杀、轻度猎奇和黑暗倾向",
        "不适合所有人，但普及面仍然广"
    ],
    C: [
        "存在较重的暴力、凶杀、其他不当行为",
        "较重的血腥内容、重度暴力倾向、凶杀和残杀、猎奇和惊悚恐吓内容"
    ],
    D: [
        "存在严重引起生理或心理不适，严重影响三观的内容",
        "重度的血腥、暴力和凶杀，强烈的猎奇内容，容易留下心理阴影的内容"
    ]
}