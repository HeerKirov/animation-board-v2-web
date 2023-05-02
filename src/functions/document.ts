import { App, Ref, watch, watchEffect, ref, computed, inject, InjectionKey, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

export function createDocumentManager() {
    const documentTitle = useDocumentTitle()

    return {
        install(app: App) {
            app.provide(titleInjectionKey, documentTitle)
        }
    }
}

const titleInjectionKey: InjectionKey<DocumentTitle> = Symbol()

interface DocumentTitle {
    titleFromRoute: Ref<string | string[] | null>
    titleFromPage: Ref<string | string[] | null>
}

function useDocumentTitle() {
    const titleFromRoute: Ref<string | string[] | null> = ref(null)
    const titleFromPage: Ref<string | string[] | null> = ref(null)

    const joinTitle = (value: string | string[] | null) => {
        if(value) {
            if(typeof value === 'string') {
                return `${value} - `
            }else{
                let s = ""
                for(let i of value) s = `${i} - ${s}`
                return s
            }
        }else{
            return ""
        }
    }

    const computedTitleFromRoute = computed(() => joinTitle(titleFromRoute.value))
    const computedTitleFromPage = computed(() => joinTitle(titleFromPage.value))

    watchEffect(() => { document.title = `${computedTitleFromPage.value}${computedTitleFromRoute.value}Animation Board` })

    return {titleFromRoute, titleFromPage}
}

export function watchRouterTitle() {
    const route = useRoute()
    const { titleFromRoute, titleFromPage } = inject(titleInjectionKey)!

    watch(() => route.meta, (value) => {
        titleFromPage.value = null
        titleFromRoute.value = value['title'] as string
    })
}

export function watchPageTitle(callback: () => string | string[] | null) {
    const { titleFromPage } = inject(titleInjectionKey)!

    watchEffect(() => { titleFromPage.value = callback() })
}

export function usePageTitle() {
    const { titleFromPage } = inject(titleInjectionKey)!
    return titleFromPage
}

export function useMousePosition() {
    const x = ref(0)
    const y = ref(0)

    const update = (e: MouseEvent) => {
        x.value = e.pageX
        y.value = e.pageY
    }

    onMounted(() => { window.addEventListener('mousemove', update) })
    onUnmounted(() => { window.removeEventListener('mousemove', update) })

    return {x, y}
}
