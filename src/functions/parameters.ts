import { ref, computed, Ref, unref } from 'vue'

export type Direction = -1|1

export function usePagination(total: Ref<number | null>, limit: number) {
    const pageMax = computed(() => Math.ceil((total.value || 0) / unref(limit)))
    const page = ref(1)
    const offset = computed(() => (page.value - 1) * unref(limit))

    const pageToQuery = (page: number) => page > 1 ? page : undefined
    const pageFromQuery = (value: string | null) => {
        if(value) {
            try {
                page.value = parseInt(value)
            }catch(e) {
                page.value = 1
            }
        }else{
            page.value = 1
        }
    }

    return {offset, page, pageMax, pageToQuery, pageFromQuery}
}

export function useSelector(selects: Set<string>, defaultSelect: string | null = null) {
    const selected = ref(defaultSelect)

    const toQuery = (value: string | null) => value?.toLowerCase() ?? undefined
    const fromQuery = (value: string | null) => {
        if(value) {
            const v = value.toUpperCase()
            if(selects.has(v)) {
                selected.value = v
            }else{
                selected.value = defaultSelect
            }
        }else{
            selected.value = defaultSelect
        }
    }

    return {selected, toQuery, fromQuery}
}

export function useSort(orders: {name: string, argument: string | string[]}[], defaultValue: string, defaultDirection: Direction) {
    const ascArguments: {[name: string]: string} = {}
    const descArguments: {[name: string]: string} = {}
    for(let { name, argument } of orders) {
        ascArguments[name] = generateSortArgument(argument, 1)
        descArguments[name] = generateSortArgument(argument, -1)
    }

    const sortDirection = ref(defaultDirection)
    const sortValue = ref(defaultValue)
    const order = computed(() => {
        const sortArguments = sortDirection.value > 0 ? ascArguments : descArguments
        let arg = sortArguments[sortValue.value]
        if(arg == undefined) {
            sortValue.value = defaultValue
            arg = sortArguments[defaultValue]
        }
        return arg
    })

    const sortToQuery = (value: string, direction: Direction) => (direction < 0 ? '-' : '') + value.toLowerCase()
    const sortFromQuery = (value: string | null) => {
        if(!value) {
            sortDirection.value = defaultDirection
            sortValue.value = defaultValue
        }else{
            if(value.startsWith('-')) {
                sortDirection.value = -1
                sortValue.value = value.substring(1).toUpperCase()
            }else{
                sortDirection.value = 1
                sortValue.value = value.toUpperCase()
            }
        }
    }

    return {sortDirection, sortValue, order, sortToQuery, sortFromQuery}
}

function generateSortArgument(argument: string|string[], direction: Direction): string {
    if(typeof argument == "string") {
        return (direction == -1 ? "-" : "") + argument
    }else{
        return argument.map(a => (direction == -1 ? "-" : "") + a).join(",")
    }
}