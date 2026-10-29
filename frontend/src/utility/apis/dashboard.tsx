import { dashboardLoad } from "../../redux/reducers/dashboard"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"

export const loadDashboard = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.dashboard_list,
        jsonData,
        loading,
        params: { page, perPage },
        success: (e) => {
            dispatch(dashboardLoad(e?.data))
            success((e))
        },
        error: () => { /** ErrorToast("data-fetch-failed") **/ }
    })
}


export const serverCommands = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {

    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.server_commands,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            // dispatch(blacklistSave([e?.data]))
            // log(e)
            success((e?.data))
        },
        error: (e) => { errors(e) }
    })
}

