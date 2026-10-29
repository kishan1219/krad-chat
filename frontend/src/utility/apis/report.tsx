import { deliveryReportRedux, messageReportRedux, reportExportById, reportExportByMobile, reportExportBySender, reportMobileRedux, scheduleReportRedux, serverRedux, timeRedux, twoWayReportClick, twoWayReportResponse } from "../../redux/reducers/report"
import { log } from "../helpers/common"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"

export const exportByID = async ({ async = false, jsonData, loadings, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.export_by_id,
        jsonData,
        loadings,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(reportExportById(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const exportBySender = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.export_by_sender,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(reportExportBySender(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const exportByMobile = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.export_by_mobile,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(reportExportByMobile(e?.data))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}
export const deliveryReport = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.delivery_report,
        jsonData,
        loading,
        params: { page, per_page_record: perPage },
        showErrorToast: true,
        // showSuccessToast: true,
        success: (e) => {
            dispatch(deliveryReportRedux(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}
export const scheduleReport = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.schedule_report,
        params: { page, per_page_record: perPage },
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        success: (e) => {
            dispatch(scheduleReportRedux(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}
export const messageReport = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.message_report,
        jsonData,
        loading,
        params: { page, per_page_record: perPage },
        showErrorToast: true,
        // showSuccessToast: true,
        success: (e) => {
            dispatch(messageReportRedux(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const reportByNumber = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.report_by_mobile_number,
        jsonData,
        loading,
        params: { page, per_page_record: perPage },
        showErrorToast: true,
        // showSuccessToast: true,
        success: (e) => {
            dispatch(reportMobileRedux(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}
export const getServerDetails = async ({ async = false, jsonData, loadings, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "get",
        path: ApiEndpoints.get_server_details,
        jsonData,
        loadings,
        showErrorToast: true,
        // showSuccessToast: true,
        // params: { page, perPage },
        success: (e) => {
            dispatch(serverRedux(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const reportByTime = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.report_by_time,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(timeRedux(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}
export const exportReportByUserId = ({ user_id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.export_by_user_id,
        params: { user_id },
        showErrorToast: true,
        loading,
        success: (e) => { success(e?.data) },
        error: (e) => {
            errors(e)
        }
    })
}

export const checkExportStatus = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.check_export_status + id,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        // success: (e) => { success(e?.data) },
        // error: (e) => {
        //     errors(e)
        // }
        success: (e) => { success(e?.data) },
        error: (e) => {
            errors(e)
        }
    })
}
export const downloadExportOfSMS = ({ file_name, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.download_export_of_sms + file_name,
        loading,
        showErrorToast: true,
        showSuccessToast: false, // Toast might fail if response is blob and logic tries to read message
        responseType: 'blob',
        transformResponse: [(data) => data], // Prevent JSON parsing
        success: (e) => { success(e) }, // Pass the whole response or data. Http.js passes res.data to success callback if !data.error
        error: (e) => {
            errors(e)
        }
    })
}

export const detailedReportApi = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.detailed_report,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        // params: { page, per_page_record: perPage },
        success: (e) => {
            // dispatch(timeRedux(e))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const exportByDetailedReport = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.export_by_detailed_report,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(reportExportBySender(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}
export const exportByDetailedSmsReport = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.export_by_sms_detailed_report,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(reportExportBySender(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const twoWayClickLog = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.two_way_click_log,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(twoWayReportClick(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}
export const twoWayResponseLog = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.two_way_response,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(twoWayReportResponse(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const reportLogExportByCampaign = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.report_log_export_by_camapign,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            // dispatch(reportExportBySender(e?.data))
            // log(e)
            success((e?.data))
        },
        error: (e) => { errors(e) }
    })
}

export const reportLogExportByCampaignResponse = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.report_log_export_by_camapign_response,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            // dispatch(reportExportBySender(e?.data))
            // log(e)
            success((e?.data))
        },
        error: (e) => { errors(e) }
    })
}

export const templateSummaryReport = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.template_summary_report,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            // dispatch(reportExportBySender(e?.data))
            // log(e)
            success((e?.data))
        },
        error: (e) => { errors(e) }
    })
}

