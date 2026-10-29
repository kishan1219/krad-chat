import { primaryDelete, primaryLoad, primarySave, primaryUpdate } from "../../redux/reducers/primaryRoute"
import { log } from "../helpers/common"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"
import { emitAlertStatus, SuccessToast } from "../Utils"

export const loadPrimaryRoute = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.primary_route,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(primaryLoad(e?.data))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}
export const addPrimaryRoute = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.add_primary_route,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(primarySave([e?.data]))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}
export const editPrimaryRoute = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "PUT",
        path: ApiEndpoints.edit_primary_route + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(primaryUpdate(e?.data))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}
export const deletePrimaryRoute = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "DELETE",
        path: ApiEndpoints.delete_primary_route + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        // success: (e) => {
        //     // dispatch(primaryDelete(e?.data))

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

// export const readPrimaryRoute = async ({id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { } }) => {
//     return http.request({
//         async,
//         method: "get",
//         path: ApiEndpoints.read_primary_route + id,
//         jsonData,
//         loading,
//         success: (e) => {
//             dispatch(primaryDelete(e?.data))
//             log(e)
//             success((e))
//         },
//         error: () => { /** ErrorToast("data-fetch-failed") **/ }
//     })
// }


export const readPrimaryRoute = ({ id, loading, success = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.read_primary_route + id,
        loading,
        success: (data) => { success(data?.data) },
        error: () => { /** ErrorToast("data-fetch-failed") **/ }
    })
}

export const checkPrimaryRouteConnection = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.check_primary_route + id,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (data) => { success(data?.payload) },
        error: (e) => {
            errors(e)
        }
    })
}
export const checkVoiceBalance = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.checkBalanceOfVoice + id,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        success: (data) => { success(data?.data) },
        error: (e) => {
            errors(e)
        }
    })
}

export const getVoiceSmscList = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.getVoiceSmsc,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        success: (data) => { success(data?.data) },
        error: (e) => {
            errors(e)
        }
    })
}

export const primaryRouteAction = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.primary_route_action,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(primaryUpdate(e?.data))
            // log(e)
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

