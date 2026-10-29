import { whatsappThreadCaseLoad, whatsappThreadLoad, whatsappThreadMessageSend } from "../../redux/reducers/whatsappThread"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"

export const waThreadMessage = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.wa_thread_message,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage, ...(jsonData || {}) },
        success: (e) => {
            const contacts = (e?.data?.data || []).map(item => ({ ...item, business_phone_number_id: item.phone_number_id, phone_number_id: item.phone, profile_name: item.name || item.phone }))
            e = { ...e, data: contacts }
            dispatch(whatsappThreadLoad(contacts))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}
export const waThreadMessageCaseWise = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.wa_thread_message_case_wise,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            const newest = e?.data?.data?.[0]
            if (newest) void http.request({ method: 'post', path: `inbox/conversations/${newest.conversation_id}/read`, jsonData: { through_message_id: newest.id } })
            e = { ...e, data: { ...e.data, data: (e?.data?.data || []).map(item => ({ ...item, received_date: item.created_at, is_vendor_reply: item.direction === 'out' ? 1 : 0, message_type: 'text', profile_name: item.direction === 'out' ? 'Business' : 'Customer', media_id: null, media_url: null })) } }
            dispatch(whatsappThreadCaseLoad(e?.data))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}
export const waDownloadFile = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.wa_download_file,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,

        success: (e) => {
            console.log("lofgsfn dfdjhslikfhdskjf", e)

            success((e))
            // log(e, "success ak e")
            // dispatch(whatsappFileDownloaded([e?.data]))

        },
        error: (e) => {
            errors(e)
        }
    })
}

export const waSendMessage = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.wa_send_message,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {

            success((e))
            dispatch(whatsappThreadMessageSend([e?.data]))

        },
        error: (e) => { errors(e) }
    })
}

