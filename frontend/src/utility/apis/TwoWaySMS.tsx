import { smsLoad, smsSave, smsTwoWaySave } from "../../redux/reducers/sms"
import { twoWayDelete, twoWayLoad, twoWaySave, twoWayUpdate } from "../../redux/reducers/TwoWay"
import { log } from "../helpers/common"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"
import { emitAlertStatus } from "../Utils"

export const loadTwoSms = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.load_two_sms,
        jsonData,
        loading,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(twoWayLoad(e?.data))
            
            success((e))
        },
        error: () => { /** ErrorToast("data-fetch-failed") **/ }
    })
}

export const addTwoWaySMS = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.add_way_sms,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(twoWaySave([e?.data]))
            
            success((e))
        },
        error: (e) => { /** ErrorToast("data-fetch-failed") **/ errors(e) }
    })
}

export const editTwoWay = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "PUT",
        path: ApiEndpoints.edit_two_way + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(twoWayUpdate(e?.data))
        
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const deleteTwoWay = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "DELETE",
        path: ApiEndpoints.delete_two_way + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        // success: (e) => {
        //     dispatch(twoWayDelete(e?.data))
            
        //     success((e))
        // },
        // error: (e) => { errors(e) }
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

export const readTwoWay = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.read_two_way + id,
        loading,
        success: (e) => { success(e?.data) },
        error: (e) => { errors(e) }
    })
}

