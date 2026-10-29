import { campaignManage, getRoute, priorityUser, routeAssign, userOverview } from '../../redux/reducers/adminOps'
import { log } from "../helpers/common"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"

export const assignRoute = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.assign_route,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(routeAssign([e?.data]))
            // log(e)
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const getUserRoute = ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        async,
        path: ApiEndpoints.get_user_route,
        params: { page, per_page_record: perPage },
        loading,
        // success: (e) => { success(e) },
        success: (e) => {
            dispatch(getRoute(e?.data))
            // log("fsddggdf", e)
            success((e))

        },
        error: (e) => { errors(e) }
    })
}
export const getKennelStatus = ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        async,
        path: ApiEndpoints.get_kennel_status,
        // params: { page, per_page_record : perPage },
        loading,
        // success: (e) => { success(e) },
        success: (data) => { success(data?.data) },
        error: (e) => { errors(e) }
    })
}


export const userPriority = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.user_priority,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(priorityUser([e?.data]))
            // log(e)
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const manageCampaign = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.manage_campaign,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(campaignManage([e?.data]))
            // log(e)
            success((e))
        },
        error: (e) => { errors(e) }
    })
}
export const getOverview = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.get_overview,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(userOverview([e?.data]))
            // log(e)
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const pushServerInfo = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.push_server,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            // dispatch(notificationTempSave([e?.data]))
            // log(e)
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const dailyReport = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.daily_report,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            // dispatch(notificationTempSave([e?.data]))
            // log(e)
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const consumptionReportView = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.consumption_report_view,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        // params: { page, per_page_record: perPage },
        success: (e) => {
            // dispatch(notificationTempSave([e?.data]))
            // log(e)
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

