import { notificationTempLoad, notificationTempSave, notificationTempUpdate } from "../../redux/reducers/notificationTemp"
import { log } from "../helpers/common"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"
import { emitAlertStatus } from "../Utils"

export const loadNotificationTemp = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.load_temp,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(notificationTempLoad(e?.data))
            
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}


export const addNotificationTemp = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.add_temp,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(notificationTempSave([e?.data]))
            
            success((e))
        },
        error: (e) => { /** ErrorToast("data-fetch-failed") **/ errors(e) }
    })
}

export const editNotificationTemp = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "PUT",
        path: ApiEndpoints.edit_temp + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(notificationTempUpdate(e?.data))
            
            success((e))
        },
        error: (e) => { /** ErrorToast("data-fetch-failed") **/ errors(e) }
    })
}

export const deleteNotificationTemp = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { }  }) => {
    return http.request({
        async,
        method: "delete",
        path: ApiEndpoints.delete_temp + id,
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

export const readNotificationTemplate = ({ id, loading, success = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.read_notification + id,
        loading,
        success: (data) => { success(data?.data) },
        error: () => { /** ErrorToast("data-fetch-failed") **/ }
    })
}

