import { dlrLoad, dlrSave, dlrUpdate } from "../../redux/reducers/dlr"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"
import { emitAlertStatus } from "../Utils"

export const loadDlr = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.dlr_list,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(dlrLoad(e?.data))
            
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const addDlr = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.add_dlr,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(dlrSave([e?.data]))
            
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const editDlr = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "PUT",
        path: ApiEndpoints.edit_dlr + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(dlrUpdate(e?.data))
            
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const deleteDlr = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "DELETE",
        path: ApiEndpoints.delete_dlr + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        // success: (e) => {
        //     dispatch(dlrDelete(e?.data))
            
        //     success((e))
        // },
        // error: (e) => {
        //     errors(e)
        // }
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

// export const readdlrRoute = async ({id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { } }) => {
//     return http.request({
//         async,
//         method: "get",
//         path: ApiEndpoints.read_dlr_route + id,
//         jsonData,
//         loading,
//         success: (e) => {
//             dispatch(dlrDelete(e?.data))
//             
//             success((e))
//         },
//         error: () => { /** ErrorToast("data-fetch-failed") **/ }
//     })
// }


export const readDlr = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.read_dlr + id,
        loading,
        success: (data) => { success(data?.data) },
        error: (e) => {
            errors(e)
        }
    })
}
export const dlrSampleFile = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.dlr_sample_file,
        loading,
        success: (e) => { success(e?.data) },
        error: (e) => {
            errors(e)
        }
    })
}

export const dlrImport = async ({ async = false, formData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.dlr_import,
        formData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(dlrLoad(e?.data))
          
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const dlrAction = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.dlr_action,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(dlrLoad(e?.data))
            
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

