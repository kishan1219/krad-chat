import { deleteSenderIdsRedux, senderIdLoad, senderIdsSave, senderIdsUpdate } from "../../redux/reducers/manageSender"
import { emitAlertStatus } from "../Utils"
import { log } from "../helpers/common"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"

export const loadSenderIds = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.load_senderIds,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(senderIdLoad(e?.data))
       
            success((e))
        },
        error: (e) => {  errors(e) }
    })
}

export const addSenderIds = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.add_senderIds,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(senderIdsSave([e?.data]))
           
            success((e))
        },
        error: (e) => {  errors(e) }
    })
}

export const editSenderIds = async ({id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "PUT",
        path: ApiEndpoints.edit_senderIds + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(senderIdsUpdate(e?.data))
          
            success((e))
        },
        error: (e) => {  errors(e) }
    })
}

export const deleteSenderIds  = async ({id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "DELETE",
        path: ApiEndpoints.delete_senderIds + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        // success: (e) => {
        //     dispatch(deleteSenderIdsRedux(e?.data))
         
        //     success((e))
        // },
        // error: (e) => {  errors(e) }
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

export const actionSenderIds = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.action_senderIds,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(senderIdLoad(e?.data))
      
            success((e))
        },
        error: (e) => {  errors(e) }
    })
}
export const assignSenderID = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.assign_senderIds,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(senderIdsSave(e?.data))
         
            success((e))
        },
        error: (e) => {  errors(e) }
    })
}

