<template lang="pug">
input.hidden-input(type="file", accept="image/png,image/jpeg", ref="input", @change="onInputUpload")
div.ui.active.dimmer.fixed-dimmer(v-show="visible")
div.ui.active.small.modal.center-box(v-show="visible")
    div.content
        div.cropper-div
            img.cropper-img(ref="cropperImage")
    div.actions
        a.ui.green.button(@click="ok") 
            i.check.icon
            = '确定'
        a.ui.button(@click="cancel") 
            i.close.icon
            = '取消'
</template>

<script lang="ts">
import { defineComponent, ref, Ref, onMounted } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.min.css'

export interface OpenImagePicker {
    (): Promise<Blob | null>
}

export default defineComponent({
    setup() {
        let callback: ((value: Blob | PromiseLike<Blob | null> | null) => void) | null = null

        const open: OpenImagePicker = async () => {
            openInputUpload()
            return new Promise((resolve, _) => { callback = resolve })
        }

        const onUploaded = (f?: File) => {
            if(f) {
                const reader = new FileReader()
                reader.readAsDataURL(f)
                reader.onloadend = e => {
                    visible.value = true
                    cropper.load(e.target?.result?.toString() ?? null)
                }
            }
        }

        const ok = async () => {
            visible.value = false
            callback?.(await cropper.croppedData())
            callback = null
        }

        const cancel = () => { 
            visible.value = false
            callback?.(null)
            callback = null
        }

        const visible = ref(false)

        const cropper = useCropper()

        const { input, openInputUpload, onInputUpload } = useInput(onUploaded)

        return {
            visible, ok, cancel,
            input, open, onInputUpload,
            ...cropper
        }
    }
})

export function useImagePicker() {
    const imagePicker: Ref<any> = ref(null)

    const openImagePicker: OpenImagePicker = () => imagePicker.value.open()

    return {imagePicker, openImagePicker}
}

function useCropper() {
    const cropperImage: Ref<HTMLImageElement | null> = ref(null)

    const src: Ref<string | null> = ref(null)

    let cropper: Cropper | null = null
    onMounted(() => {
        cropper = new Cropper(cropperImage.value!, {
            aspectRatio: 1,
            viewMode: 1,
            autoCropArea: 1
        })
    })

    const load = (blob: string | null) => {
        cropper?.replace(blob ?? "")
    }

    const croppedData = async (): Promise<Blob | null> => new Promise((resolve, reject) => {
        cropper?.getCroppedCanvas().toBlob(blob => resolve(blob), 'image/jpeg')
    })

    return {cropperImage, src, load, croppedData}
}

function useInput(uploaded: (f: File) => void) {
    const input: Ref<any> = ref(null)

    const openInputUpload = () => {
        input.value.value = ''
        input.value.click()
    }

    const onInputUpload = () => uploaded(input.value.files[0])

    return {input, openInputUpload, onInputUpload}
}
</script>

<style scoped>
    .hidden-input {
        visibility: hidden; 
        height: 0; 
        padding: 0 !important; 
        border: 0 !important;
    }
    .fixed-dimmer {
        position: fixed;
    }
    .center-box {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%)
    }
    .cropper-div {
        width: 600px;
        height: 480px;
        margin: 20px;
        border: dashed #cacaca 1px;
        text-align: center;
    }
    .cropper-img {
        display: block;
        max-width: 100%;
    }
</style>