import { blacklistLoad, blacklistSave } from "../../redux/reducers/blacklist"
import { log } from "../helpers/common"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"

export const loadBlacklist = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.load_blacklist,
        jsonData,
        loading,
        params: { page, per_page_record: perPage },
        showErrorToast: true,
        // showSuccessToast: true,
        success: (e) => {
            dispatch(blacklistLoad(e?.data))
            
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const addBlacklist = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.add_blacklist,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(blacklistSave([e?.data]))
            
            success((e))
        },
        error: (e) => { errors(e) }
    })
}


export const deleteBlacklist = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "DELETE",
        path: ApiEndpoints.delete_blacklist + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            // dispatch(primaryDelete(e?.data))
            
            success((e))
        },
        error: (e) => { errors(e) }
    })
}


export const blacklistAction = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.blacklist_action,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(blacklistLoad(e?.data))
            
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const blacklistImport = async ({ async = false, formData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.blacklist_import,
        formData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(blacklistLoad(e?.data))
            
            success((e))
        },
        error: (e) => { errors(e) }
    })
}


export const blacklistSampleFile = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.blacklist_sample_file,
        loading,
        success: (e) => { success(e?.data) },
        error: (e) => {
            errors(e)
        }
    })
}

