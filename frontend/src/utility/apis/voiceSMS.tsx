
import { viewVoiceCampaign, viewVoiceCampaignInfo, viewVoiceSmsCurrentStatus, voiceCampaignList, voiceSmsSave, voiceSmsSlice } from "../../redux/reducers/voiceSMS"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"
import { emitAlertStatus, SuccessToast } from "../Utils"
export const voiceSmsCampaignList = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.voice_campaign_list,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(voiceCampaignList(e?.data))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const getVoiceSms = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.get_voice_campaign + id,
        loading,
        success: (e) => { success(e?.data) },
        error: (e) => {
            errors(e)
        }
    })
}

export const getVoiceCampaignInfo = async ({ async = false, id, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.get_voice_campaign_info + id,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(voiceCampaignList(e?.data))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const voiceSmsCreate = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.voice_sms,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(voiceSmsSave([e?.data]))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const changeVoiceCampaignStatusToStop = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.change_voice_campaign_status_to_stop,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            // dispatch(primaryDelete(e?.data))
            emitAlertStatus("success", e)
            success((e))
        },
        error: (e) => {
            emitAlertStatus("failed", e)
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
export const resendThisVoiceSms = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.resend_this_voice_sms,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            // dispatch(primaryDelete(e?.data))
            emitAlertStatus("success", e)

            success((e))
        },
        error: (e) => {
            emitAlertStatus("failed", e)
            errors(e)
        }
    })
}

//manage campaign status
export const manageVoiceCampaignStatus = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.manage_voice_campaign,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            // dispatch(primaryDelete(e?.data))
            emitAlertStatus("success", e)

            success((e))
        },
        error: (e) => {
            emitAlertStatus("failed", e)
            errors(e)
        }
    })
}


export const getVoiceCampaignCurrentStatus = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.get_voice_campaign_current_status + id,
        loading,
        success: (e) => {
            emitAlertStatus("success", e)
            success(e?.data)
        },
        error: (e) => {
            emitAlertStatus("failed", e)
            errors(e)
        }
    })
}

//export voice Campaign bt id
export const exportCampaignById = async ({ async = false, jsonData, loadings, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.exportVoiceCampaignById,
        jsonData,
        loadings,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {

            emitAlertStatus("success", e)
            success((e))
        },
        error: (e) => { emitAlertStatus("failed", e); errors(e) }
    })
}

