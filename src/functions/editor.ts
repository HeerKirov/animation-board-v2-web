import { Ref, ref, watch, computed } from 'vue'
import { SWR } from '@/functions/server'

export function watchEditorValidate<T>(data: Ref<T>, emit: (value: T | undefined) => void, ifAnyError: (value: T) => boolean) {
    let anyError = false
    let firstCommit = true

    watch(data, () => {
        if(ifAnyError(data.value)) {
            if(!anyError) {
                emit(undefined)
                anyError = true
                firstCommit = false
            }
        }else if(anyError) {
            emit(data.value)
            anyError = false
            firstCommit = false
        }else if(firstCommit) {
            emit(data.value)
            firstCommit = false
        }
    }, {deep: true})
}

export function useEditorForm<T>(swr: SWR, editMode: Ref<boolean>, map: (item: any) => any, remap: (item: any) => any) {
    const { data, update } = swr
    const editorValue = computed(() => data.value ? map(data.value) : null)
    const outValue: Ref<T | undefined> = ref()
    const valueExists = computed(() => !!outValue.value)

    const onEditorChanged = (v: T) => { outValue.value = v }

    const onCancel = () => { editMode.value = false }

    const onSubmit = async () => {
        if(outValue.value) {
            const r = await update(remap(outValue.value))
            if(r.ok) { editMode.value = false }
        }else{
            console.warn("Some error exist, cannot save.")
        }
    }

    return {editorValue, valueExists, onEditorChanged, onCancel, onSubmit}
}
