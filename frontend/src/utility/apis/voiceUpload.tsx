
import { uploadVoiceDelete, uploadVoiceLoad, uploadVoiceSave, uploadVoiceUpdate, uploadVoiceView, allVoiceStatus } from "../../redux/reducers/voiceUpload"
import { log } from "../helpers/common"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"
import { emitAlertStatus, SuccessToast } from "../Utils"
export const loadUploadVoice = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.voice_file_list,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(uploadVoiceLoad(e?.data))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const loadAllVoiceFile = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.load_all_voice_file,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(allVoiceStatus(e?.data))
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}
export const uploadVoiceCreate = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.voice_upload,
        // jsonData,
        loading,
        formData: { ...jsonData },
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            log(e)
            emitAlertStatus("success", e)
            dispatch(uploadVoiceSave([e?.data]))
            success((e))
        },
        error: (e) => {
            emitAlertStatus("error", e)
            errors(e)
        }
    })
}
// export const editUser = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
//     return http.request({
//         async,
//         method: "PUT",
//         path: ApiEndpoints.edit_user + id,
//         jsonData,
//         loading,
//         showErrorToast: true,
//         showSuccessToast: true,
//         success: (e) => {
//             dispatch(userUpdate(e?.data))

//             success((e))
//         },
//         error: (e) => {
//             errors(e)
//         }
//     })
// }
export const deleteUploadVoice = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "DELETE",
        path: ApiEndpoints.delete_uploaded_voice + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            // dispatch(primaryDelete(e?.data))
            // dispatch(uploadVoiceDelete(e?.data))
            emitAlertStatus("success", e)
            success((e))
        },
        error: (e) => {
            emitAlertStatus("failed", e)
            errors(e)
        }
    })
}
export const viewUploadVoice = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.get_uploaded_voice + id,
        loading,
        success: (e) => { success(e?.data) },
        error: (e) => {
            errors(e)
        }
    })
}

//Admin Voice Process
export const adminVoiceProcess = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.voice_file_process,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

//bulk voice file action 

export const bulkVoiceFileAction = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.bulk_voice_file_action,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

//check_voice_file_status

export const checkVoiceFileStatus = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.check_voice_file_status + id,
        loading,
        showSuccessToast: true,
        success: (e) => { emitAlertStatus("success", e); success(e) },
        error: (e) => {
            emitAlertStatus("failed", e)
            errors(e)
        }
    })
}

//sync voice Template t0 vendor

export const syncVoiceTemplateToVendor = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.sync_voice_template_to_vendor,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
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

