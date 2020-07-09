import { Ref, ref, watch, computed } from 'vue'
import { SWR, Response } from '@/functions/server'

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

interface EditorFormOption<T> {
    beforeSubmit?: (editorValue: T, data: Ref<any>) => Promise<boolean>
    afterSubmit?: (editorValue: T, data: Ref<any>, submitResult: Response) => Promise<boolean>
}

export function useEditorForm<T>(swr: SWR, editMode: Ref<boolean>, map: (item: any) => any, remap: (item: any) => any, options?: EditorFormOption<T>) {
    const { data, update } = swr
    const editorValue = computed(() => data.value ? map(data.value) : null)
    const outValue: Ref<T | undefined> = ref()
    const valueExists = computed(() => !!outValue.value)

    const onEditorChanged = (v: T) => { outValue.value = v }

    const onCancel = () => { editMode.value = false }

    const onSubmit = async () => {
        if(outValue.value) {
            if(options?.beforeSubmit) {
                const r0 = await options?.beforeSubmit(outValue.value, data)
                if(!r0) return
            }

            const r = await update(remap(outValue.value))
            
            if(options?.afterSubmit) {
                const r2 = await options?.afterSubmit(outValue.value, data, r)
                if(r2) { editMode.value = false }
            }else if(r.ok) { editMode.value = false }
        }else{
            console.warn("Some error exist, cannot save.")
        }
    }

    return {editorValue, valueExists, onEditorChanged, onCancel, onSubmit}
}
