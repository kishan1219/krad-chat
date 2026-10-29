import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"
import { emitAlertStatus } from "../Utils"

export const adminWhatsappRateCard = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.whatsapp_rate_card,
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
// export const WAdebugToken = async ({ whats_app_configuration_id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
//     return http.request({
//         whats_app_configuration_id,
//         async,
//         method: "post",
//         path: ApiEndpoints.whatsapp_rate_card + whats_app_configuration_id,
//         jsonData,
//         loading,
//         showErrorToast: true,
//         // showSuccessToast: true,
//         params: { page, per_page_record: perPage },
//         success: (e) => {
//             success((e))
//         },
//         error: (e) => {
//             errors(e)
//         }
//     })
// }

