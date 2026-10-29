import { invalidDelete, invalidLoad, invalidSave } from "../../redux/reducers/invalid"
import { log } from "../helpers/common"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"
import { emitAlertStatus } from "../Utils"

export const loadInvalidSeries = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.invalid_list,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(invalidLoad(e?.data))
          
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const addInvalidSeries = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.add_invalid_series,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(invalidSave([e?.data]))
            
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const deleteInvalidSeries = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "DELETE",
        path: ApiEndpoints.delete_invalid_series + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        // success: (e) => {
        //     dispatch(invalidDelete(e?.data))
        //     log(e)
        //     success((e))
        // },
        // error: (e) => { errors(e) }
        success: (e) => {
            // dispatch(primaryDelete(e?.data))
            emitAlertStatus("success", e, `delete-${id}`)
            
            success((e))
        },
        error: (e) => {
            emitAlertStatus("failed", e, `delete-${id}`)

            errors(e)
        }
    })
}

