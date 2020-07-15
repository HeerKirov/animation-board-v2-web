export async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export const sets = {
    equals<T>(setA: Set<T>, setB: Set<T>): boolean {
        if(setA.size !== setB.size) return false
        for(const a of setA) {
            if(!setB.has(a)) {
                return false
            }
        }
        return true
    }
}

export const objects = {
    mapEntry<V, R>(map: {[k: string]: V}, mapFunction: (v: V, k: string) => R): {[k: string]: R} {
        const ret: {[k: string]: R} = {}
        for(const k in map) {
            ret[k] = mapFunction(map[k], k)
        }
        return ret
    }
}