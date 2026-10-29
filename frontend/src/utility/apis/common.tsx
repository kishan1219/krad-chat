import { fileUploadSave } from "../../redux/reducers/uploadFile"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"

export const uploadFiles = async ({ controller = new AbortController(), progress = (...args: any[]) => { }, async = false, formData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, error = (...args: any[]) => { } }) => {

    return http.request({
        async,
        method: "POST",
        path: ApiEndpoints.uploadFiles,
        formData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        success: (data) => { success(data) },
        error: () => { error(true) },
        onUploadProgress: progressEvent => {
            progress((progressEvent.loaded / progressEvent.total) * 100)
        },
        signal: controller.signal
    })
}

export const waUploadFiles = async ({ controller = new AbortController(), progress = (...args: any[]) => { }, async = false, formData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, error = (...args: any[]) => { } }) => {

    return http.request({
        async,
        method: "POST",
        path: ApiEndpoints.wa_uploadFiles,
        formData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        success: (data) => { success(data) },
        error: () => { error(true) },
        onUploadProgress: progressEvent => {
            progress((progressEvent.loaded / progressEvent.total) * 100)
        },
        signal: controller.signal
    })
}

