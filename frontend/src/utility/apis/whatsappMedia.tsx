import { whatsappMediaLoad } from "../../redux/reducers/whatsappMedia"
import { emitAlertStatus } from "../Utils"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"

export const loadWhatsappMedia = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.WhatsappMedia_list,
        jsonData,
        loading,
        showErrorToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(whatsappMediaLoad(e?.data))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

// export const addWhatsappMedia = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
//     return http.request({
//         async,
//         method: "post",
//         path: ApiEndpoints.add_WhatsappMedia,
//         jsonData,
//         loading,
//         showErrorToast: true,
//         showSuccessToast: true,
//         success: (e) => {
//             dispatch(whatsappMediaSave([e?.data]))
//             success((e))
//         },
//         error: (e) => {
//             errors(e)
//         }
//     })
// }

export const addWhatsappMedia = async ({ controller = new AbortController(), progress = (...args: any[]) => { }, async = false, formData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, error = (...args: any[]) => { } }) => {

    return http.request({
        async,
        method: "POST",
        path: ApiEndpoints.add_WhatsappMedia,
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

export const uploadTemplateMedia = async ({ controller = new AbortController(), progress = (...args: any[]) => { }, async = false, formData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, error = (...args: any[]) => { } }) => {

    return http.request({
        async,
        method: "POST",
        path: ApiEndpoints.upload_template_media,
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
// export const updateWhatsappMedia = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
//     return http.request({
//         async,
//         method: "post",
//         path: ApiEndpoints.update_WhatsappMedia,
//         jsonData,
//         loading,
//         showErrorToast: true,
//         showSuccessToast: true,
//         success: (e) => {
//             dispatch(whatsappMediaSave([e?.data]))
//             success((e))
//         },
//         error: (e) => {
//             errors(e)
//         }
//     })
// }

export const deleteWhatsappMedia = async ({id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "delete",
        path: ApiEndpoints.delete_WhatsappMedia + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            emitAlertStatus("success", e)

            success((e))
        },
        error: (e) => {
            emitAlertStatus("failed", e)
            errors(e)

        }
    })
}

export const readWhatsappMedia = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.read_WhatsappMedia + id,
        loading,
        success: (data) => { success(data?.data) },
        error: (e) => {
            errors(e)
        }
    })
}

