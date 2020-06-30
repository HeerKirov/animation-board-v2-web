import { useRouter, useRoute } from 'vue-router'
import { watch } from 'vue'

export function useRouterQueryUtil() {
    const router = useRouter()
    const route = useRoute()
    const updateQuery = (key: string, value: any) => {
        router.push({
            name: route.name!,
            query: {
                ...route.query,
                [key]: value
            }
        })
    }

    const watchQuery = (parameters: {[param: string]: (value: string | null) => void}) => {
        watch(() => route.query, (query, old) => {
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
        }, {immediate: true})
    }

    return {router, route, updateQuery, watchQuery}
}