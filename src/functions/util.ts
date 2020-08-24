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

export const arrays = {
    range(min: number, max: number): number[] {
        return Array(max - min).fill(0).map((_, i) => min + i)
    }
}

export const cast = {
    parseInt(s: string | null | undefined): number | undefined {
        if(s == null) {
            return undefined
        }
        try {
            return parseInt(s)
        }catch(e) {
            return undefined
        }
    }
}

export const dates = {
    onlyDay(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate())
    },
    onlyMonth(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth())
    },
    onlyYear(date: Date): Date {
        return new Date(date.getFullYear())
    },
    nextDay(date: Date, day: number = 1): Date {
        date.setDate(date.getDate() + day)
        return date
    },
    nextMonth(date: Date, month: number = 1): Date {
        date.setDate(1)
        date.setMonth(date.getMonth() + month)
        return date
    },
    nextYear(date: Date, year: number = 1): Date {
        date.setFullYear(date.getFullYear() + year, 0, 1)
        return date
    }
}
