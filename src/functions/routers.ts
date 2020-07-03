import { useRouter, useRoute } from 'vue-router'
import { watch } from 'vue'

interface RouterQueryConfiguration {
    resetField?: {
        field: string, 
        value: any,
        excludes?: string[]
    }
}

export function useRouterQueryUtil(config?: RouterQueryConfiguration) {
    const resetField = config?.resetField && generateResetField(config?.resetField)

    const router = useRouter()
    const route = useRoute()

    const updateQuery = (key: string, value: any) => {
        if(resetField && !resetField.excludes.has(key)) {
            router.push({
                name: route.name!,
                query: {
                    ...route.query,
                    [resetField.field]: resetField.value,
                    [key]: value
                }
            })
        }else{
            router.push({
                name: route.name!,
                query: {
                    ...route.query,
                    [key]: value
                }
            })
        }
    }

    const watchQuery = (parameters: {[param: string]: (value: string | null) => void}) => {
        watch(() => route.query, (query, old) => {
            if(query != null) {
                for(let param in parameters) {
                    if(old == null || query[param] != old[param]) {
                        const baseValue = query[param]
                        const value 
                            = baseValue == null ? null 
                            : typeof baseValue === 'string' ? baseValue 
                            : baseValue.length > 0 ? baseValue[0] 
                            : null
                        parameters[param](value)
                    }
                }
            }
        }, {immediate: true})
    }

    return {router, route, updateQuery, watchQuery}
}

function generateResetField(resetField: {field: string, value: any, excludes?: string[]}) {
    const excludes = new Set(resetField.excludes)
    excludes.add(resetField.field)

    return {
        field: resetField.field,
        value: resetField.value,
        excludes
    }
}