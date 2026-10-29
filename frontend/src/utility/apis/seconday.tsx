import { primaryDelete, primaryLoad, primarySave, primaryUpdate } from "../../redux/reducers/primaryRoute"
import { secondaryDelete, secondaryLoad, secondarySave, secondaryUpdate } from "../../redux/reducers/secondaryRoute"
import { log } from "../helpers/common"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"
import { emitAlertStatus, SuccessToast } from "../Utils"

export const loadSecondaryRoute = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.secondary_route,
        jsonData,
        loading,
        params: { page, per_page_record: perPage },
        showErrorToast: true,
        // showSuccessToast: true,
        success: (e) => {
            dispatch(secondaryLoad(e?.data))
      
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const addSecondaryRoute = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.add_secondary_route,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(secondarySave([e?.data]))
        
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const editSecondaryRoute = async ({id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "PUT",
        path: ApiEndpoints.edit_secondary_route + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(secondaryUpdate(e?.data))
         
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}


export const deleteSecondaryRoute = async ({id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "DELETE",
        path: ApiEndpoints.delete_secondary_route + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        // success: (e) => {
        //     // dispatch(secondaryDelete(e?.data))
         
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

export const secondaryRouteAction = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.secondary_route_action,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(secondaryLoad(e?.data))
           
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

