import { log } from "../helpers/common"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"

export const getCountry = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "get",
        path: ApiEndpoints.get_country,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        params: { page, per_page_record: perPage, ...jsonData },
        success: (e) => {

            
            success((e))
        },

        error: (e) => { errors(e) }


    })
}
export const publicAppSettings = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "get",
        path: ApiEndpoints.public_app_setting,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        // params: { page, per_page_record: perPage, ...jsonData },
        success: (e) => {

            success((e))
        },

        error: (e) => { errors(e) }


    })
}

