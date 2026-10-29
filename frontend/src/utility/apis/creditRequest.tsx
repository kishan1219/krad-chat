import { creditRequestLoad, creditRequestReply, creditRequestSave } from "../../redux/reducers/creditRequest"
import { log } from "../helpers/common"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"

export const loadCreditRequest = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.credit_request_list,
        jsonData,
        loading,
        params: { page, per_page_record: perPage },
        showErrorToast: true,
        // showSuccessToast: true,
        success: (e) => {
            dispatch(creditRequestLoad(e?.data))
            
            success((e))
        },
        error: (e) => { errors(e) }
    })
}


export const addCreditRequest = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.add_credit_request,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(creditRequestSave([e?.data]))
            
            success((e))
        },
        error: (e) => { errors(e) }
    })
}


export const replyCreditRequest = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.reply_credit_request,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(creditRequestReply([e?.data]))
            
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

