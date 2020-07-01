export interface DefinitionItem {
    name: string
    title?: string
    color?: string
}

export function withoutColor(definition: DefinitionItem[]): DefinitionItem[] {
    return definition.map(item => {
        return {
            name: item.name,
            title: item.title || item.name
        }
    })
}

export function toMap(definition: DefinitionItem[]): {[name: string]: DefinitionItem} {
    const obj: {[name: string]: DefinitionItem} = {}
    for(let item of definition) {
        obj[item.name] = {
            name: item.name,
            title: item.title || item.name,
            color: item.color
        }
    }
    return obj
}

export function toNameSet(definition: DefinitionItem[]): Set<string> {
    const set: Set<string> = new Set()
    for(let item of definition) {
        set.add(item.name)
    }
    return set
}