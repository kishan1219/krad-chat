import { campaignDetails, campaignLoad, reSendCampaign, startStopCampaign } from "../../redux/reducers/campaignList"
import Emitter from "../Emitter"
import { log } from "../helpers/common"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"
import { emitAlertStatus } from "../Utils"

export const loadCampaign = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.load_campaign,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(campaignLoad(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const repushCampaign = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.resend,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(reSendCampaign([e?.data]))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const startOrStopCampaign = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.start_stop,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            emitAlertStatus("success", e, `stop-campaign1-${jsonData?.send_sms_id}`)

            success((e))
        },
        error: (e) => {
            emitAlertStatus("failed", e, `stop-campaign1-${jsonData?.send_sms_id}`)
            errors(e)

        }
    })
}

export const changeCampaignStatusToComplete = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "get",
        path: ApiEndpoints.change_campaign_to_complete + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            emitAlertStatus("success", e, `Finish-Campaign21-${id}`)

            success((e))
        },
        error: (e) => {
            emitAlertStatus("failed", e, `Finish-Campaign21-${id}`)
            errors(e)
        }
    })
}

export const getCampaignInfo = async ({ showS = true, id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.campaign_info + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: showS,
        params: { page, per_page_record: perPage },
        // params: { page, perPage },
        success: (e) => {
            dispatch(campaignDetails(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const resendThisMessage = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.resendMessage,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        // params: { page, per_page_record: perPage },
        params: { page, perPage },
        success: (e) => {
            dispatch(campaignDetails(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const getAllDetailsOfCampaign = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.get_all_details_of_campaign + id,
        loading,
        success: (e) => { success(e?.data) },
        error: (e) => {
            errors(e)
        }
    })
}

export const getCampaignStatus = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.get_campaign_status + id,
        loading,
        // success: (e) => { success(e?.data) },
        // error: (e) => {
        //     errors(e)
        // }
        success: (e) => {
            emitAlertStatus("success", e, `check-status-${id}`)

            success((e))
        },
        error: (e) => {
            emitAlertStatus("failed", e, `check-status-${id}`)

        }
    })
}
export const getCampaignStatus1 = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.get_campaign_status + id,
        loading,
        // success: (e) => { success(e?.data) },
        // error: (e) => {
        //     errors(e)
        // }
        success: (e) => {
            // emitAlertStatus("success", e, `check-status-${id}`)

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}
export const restartCampaignStatus = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.restart_campaign_status + id,
        loading,
        success: (e) => {
            emitAlertStatus("success", e, `stop-campaigndsfdsfdsf-${id}`)

            success((e))
        },
        error: (e) => {
            emitAlertStatus("failed", e, `stop-campaigndsfdsfdsf-${id}`)
            errors(e)
        }
    })
}

export const dlrExplainCode = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.dlr_code_explanation + id,
        loading,
        success: (e) => {
            // emitAlertStatus("success", e)

            success((e))
        },
        error: (e) => {
            // emitAlertStatus("failed", e)

        }
    })
}
// export const getCampaignStatus = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
//     http.request({
//         method: "get",
//         path: ApiEndpoints.get_campaign_status + id,
//         loading,
//         success: (e) => { success(e?.data) },
//         error: (e) => {
//             errors(e)
//         }
//     })
// }

// export const getCampaignStatus = async ({ showS = true, id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
//     return http.request({
//         async,
//         method: "post",
//         path: ApiEndpoints.get_campaign_status + id,
//         jsonData,
//         loading,
//         showErrorToast: true,
//         showSuccessToast: showS,
//         params: { page, per_page_record: perPage },
//         // params: { page, perPage },
//         success: (e) => {
//             dispatch(campaignDetails(e?.data))
//             log(e)
//             success((e))
//         },
//         error: (e) => { errors(e) }
//     })
// }

