import { apisDelete, apisLoad, apisSave, apisUpdate } from "../../redux/reducers/apis"
import { whatsappConfigUpdate } from "../../redux/reducers/whatsappConfig"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"

export const loadAllApi = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.api_list,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(apisLoad(e?.data))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const addApi = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.add_api,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(apisSave([e?.data]))
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const editApi = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "PUT",
        path: ApiEndpoints.edit_api + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {

            dispatch(apisUpdate(e?.data))
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const deleteApi = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "DELETE",
        path: ApiEndpoints.delete_Api + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(apisDelete(e?.data))
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}


export const readApi = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.read_Api + id,
        loading,
        success: (data) => { success(data?.data) },
        error: (e) => {
            errors(e)
        }
    })
}

