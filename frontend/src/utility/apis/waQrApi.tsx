import { whatsappQrLoad, whatsappQrSave, whatsappQRSync } from "../../redux/reducers/whatsappQrRedux"
import { emitAlertStatus } from "../Utils"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"


export const loadWhatsappQr = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.WhatsappQR_list,
        jsonData,
        loading,
        showErrorToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(whatsappQrLoad(e?.data))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const addWhatsappQr = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.add_WhatsappQr,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(whatsappQrSave([e?.data]))
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}
export const whatsappQSync = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.sync_WhatsappQr,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(whatsappQRSync([e?.data]))
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const deleteWhatsQr = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "delete",
        path: ApiEndpoints.delete_WhatsQr + id,
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

