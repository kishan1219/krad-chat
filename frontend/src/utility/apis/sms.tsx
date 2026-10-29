import { smsLoad, smsSave, smsTwoWaySave } from "../../redux/reducers/sms"
import { log } from "../helpers/common"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"

export const loadSms = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.load_sms,
        jsonData,
        loading,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(smsLoad(e?.data))
         
            success((e))
        },
        error: () => { /** ErrorToast("data-fetch-failed") **/ }
    })
}

export const addSMS = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { }  }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.add_sms,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(smsSave([e?.data]))
          
            success((e))
        },
        error: (e) => { /** ErrorToast("data-fetch-failed") **/ errors(e) }
    })
}
// export const addTwoWaySMS = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { }  }) => {
//     return http.request({
//         async,
//         method: "post",
//         path: ApiEndpoints.add_way_sms,
//         jsonData,
//         loading,
//         showErrorToast: true,
//         showSuccessToast: true,
//         success: (e) => {
//             dispatch(smsTwoWaySave([e?.data]))
//             log(e)
//             success((e))
//         },
//         error: (e) => { /** ErrorToast("data-fetch-failed") **/ errors(e) }
//     })
// }

export const normalSmsSample = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.normal_sms_sample,
        loading,
        success: (data) => { success(data?.data) },
        error: (e) => {
            errors(e)
        }
    })
}

export const customSmsSample = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.custom_sms_sample,
        loading,
        success: (data) => { success(data?.data) },
        error: (e) => {
            errors(e)
        }
    })
}

