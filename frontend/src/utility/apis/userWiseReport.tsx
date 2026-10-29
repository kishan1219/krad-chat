import { userMonthlyReport, userReport, userReportSave, userReportUpdate } from "../../redux/reducers/userWiseReport"
import { log } from "../helpers/common"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"

export const userWiseMonthlyReport = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.user_wise_report,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(userReport(e?.data))
            // log(e)
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const createUserReport = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.create_user_report,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(userReportSave([e?.data]))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const updateUserReport = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "put",
        path: ApiEndpoints.update_user_report + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(userReportUpdate(e?.data))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const monthlyReport = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.monthly_report,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(userMonthlyReport(e?.data))
            // log(e)
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

