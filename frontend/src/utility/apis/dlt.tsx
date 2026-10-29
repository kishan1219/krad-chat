import { dltDelete, dltImportRedux, dltLoad, dltSave, dltUpdate, priorityDlt } from "../../redux/reducers/dlt"
import { priority } from "../Const"
import { emitAlertStatus } from "../Utils"
import { log } from "../helpers/common"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"

export const loadDlt = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.dlt_list,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(dltLoad(e?.data))      
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const addDlt = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.add_dlt,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(dltSave([e?.data]))
            
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const editDlt = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "PUT",
        path: ApiEndpoints.edit_dlt + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(dltUpdate(e?.data))
            
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const deleteDlt = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "DELETE",
        path: ApiEndpoints.delete_dlt + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        // success: (e) => {
        //     dispatch(dltDelete(e?.data))
            
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

export const dltSampleFile = ({ id, loading, success = (...args: any[]) => { }, dispatch = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.dlt_sample_file,
        loading,
        success: (e) => { success(e?.data) },
        error: (e) => {
            errors(e)
        }
    })
}

export const readDlt = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.read_dlt + id,
        loading,
        success: (data) => { success(data?.payload) },
        error: (e) => { errors(e) }
    })
}

export const dltImport = async ({ async = false, formData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.dlt_import,
        formData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            // dispatch(dltImportRedux([...e?.data?.data]))
            dispatch(dltLoad(e?.data))
            
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const dltAction = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.dlt_action,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(dltSave(e?.data))
            
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const assignDltToUser = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.assign_dlt,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(dltLoad(e?.data))
            
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const dltTemplatePriority = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.dlt_priority,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(priorityDlt(e?.data))
            
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

