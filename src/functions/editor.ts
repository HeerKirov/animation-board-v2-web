import { Ref, ref, watch, computed } from 'vue'
import { SWR, Response, useServer, ErrorHandler } from '@/functions/server'
import { useMessageBox } from '@/functions/message-box'
import { useNotification } from '@/functions/notification'
import { Method } from 'axios'

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

export function useImageUploader<T extends {cover: string | null, coverFile: File | null}>(data: Ref<T>) {
    const uploader: Ref<any> = ref(null)

    const onClickUpload = () => { uploader.value.click() }

    const onUpload = () => {
        let file = uploader.value.files[0]
        if(file != undefined) {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onloadend = e => {
                data.value.cover = e.target?.result?.toString() ?? null
            }
            data.value.coverFile = file
        }
    }

    return {uploader, onClickUpload, onUpload}
}

interface CreatorFormOption<T> {
    beforeSubmit?: (editorValue: T) => Promise<boolean>
    afterSubmit?: (editorValue: T, submitResult: Response) => Promise<boolean>
    success?: (submitResult: Response) => void
}

export function useCreatorForm<T>(url: string, remap: (item: T) => any, options?: CreatorFormOption<T>) {
    const { request } = useServer()

    const outValue: Ref<T | undefined> = ref()
    const valueExists = computed(() => !!outValue.value)
    const updateLoading = ref(false)

    const onEditorChanged = (v: T) => { outValue.value = v }

    const onSubmit = async () => {
        if(outValue.value) {
            updateLoading.value = true
            if(options?.beforeSubmit) {
                const r0 = await options?.beforeSubmit(outValue.value)
                if(!r0) {
                    updateLoading.value = false
                    return
                }
            }

            const r = await request(url, 'POST', remap(outValue.value))

            if(options?.afterSubmit) {
                const r2 = await options?.afterSubmit(outValue.value, r)
                if(!r2) {
                    updateLoading.value = false
                    return
                }
            }
            if(r.ok && options?.success) { options.success(r) }
            updateLoading.value = false
        }else{
            console.warn("Some error exist, cannot save.")
        }
    }

    return {updateLoading, valueExists, onEditorChanged, onSubmit}
}

interface EditorFormOption<T> {
    method?: Method
    beforeSubmit?: (editorValue: T) => Promise<boolean>
    afterSubmit?: (editorValue: T, submitResult: Response) => Promise<boolean>
    handleSubmit?: ErrorHandler
    afterDelete?: () => void
}

export function useEditorForm<T>(swr: SWR, editMode: Ref<boolean>, map: (item: any) => T, remap: (item: T, origin: T) => any, options?: EditorFormOption<T>) {
    const { message } = useMessageBox()

    const { data, update, deleteInstance } = swr
    const editorValue = computed(() => data.value ? map(data.value) : null)
    const outValue: Ref<T | undefined> = ref()
    const valueExists = computed(() => !!outValue.value)
    const updateLoading = ref(false)

    const onEditorChanged = (v: T | undefined) => { outValue.value = v }

    const onCancel = () => { editMode.value = false }

    const onSubmit = async () => {
        if(outValue.value) {
            updateLoading.value = true
            if(options?.beforeSubmit) {
                const r0 = await options?.beforeSubmit(outValue.value)
                if(!r0) {
                    updateLoading.value = false
                    return
                }
            }

            const r = await update(remap(outValue.value, editorValue.value!), {errorHandler: options?.handleSubmit, method: options?.method})
            
            if(options?.afterSubmit) {
                const r2 = await options?.afterSubmit(outValue.value, r)
                if(r2) { editMode.value = false }
            }else if(r.ok) { editMode.value = false }

            updateLoading.value = false
        }else{
            console.warn("Some error exist, cannot save.")
        }
    }

    const onDelete = async () => {
        const action = await message({
            header: '删除确认',
            content: '确定要删除此条目吗？该操作不可撤销。',
            type: 'WARNING',
            actions: ['TRUE', 'FALSE']
        })
        if(action === 'TRUE') {
            const r = await deleteInstance()
            if(r.ok) { options?.afterDelete?.() }
        }
    }

    return {updateLoading, editorValue, valueExists, onEditorChanged, onCancel, onSubmit, onDelete}
}

export function useEditorUploadImage<T>(getFile: (editorValue: T, data: any) => File | null, getURL: (editorValue: T, data: any) => string | null) {
    const { request } = useServer()
    const { notify } = useNotification()

    const upload = async (file: File, url: string) => {
        const formData = new FormData()
        formData.append('file', file)
        const r2 = await request(url, 'POST', formData, {
            errorHandler(code, data, parent) {
                if(code >= 400) {
                    try {
                        const message = data['message']
                        notify('图片上传失败', 'error', message)
                    }catch(e) {
                        parent?.(code, data)
                    }
                }
            }
        })
        return r2.ok
    }

    const beforeSubmit = async (editorValue: any) => {
        const file = getFile(editorValue, undefined)
        const url = getURL(editorValue, undefined)

        if(file == null || url == null) return true

        return await upload(file, url)
    }

    const afterSubmit = async (editorValue: any, submitResult: Response) => {
        if(!submitResult.ok) return false

        const file = getFile(editorValue, submitResult.data)
        const url = getURL(editorValue, submitResult.data)

        if(file == null || url == null) return true

        return await upload(file, url)
    }

    return {beforeSubmit, afterSubmit}
}
