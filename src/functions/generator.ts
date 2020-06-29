import { ref, computed } from 'vue'

export type Direction = -1|1

export function useSortParams(orders: {name: string, argument: string | string[]}[], defaultValue: string, defaultDirection: Direction) {
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

    return {sortDirection, sortValue, order}
}

function generateSortArgument(argument: string|string[], direction: Direction): string {
    if(typeof argument == "string") {
        return (direction == -1 ? "-" : "") + argument
    }else{
        return argument.map(a => (direction == -1 ? "-" : "") + a).join(",")
    }
}