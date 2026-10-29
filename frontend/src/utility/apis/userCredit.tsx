import { creditLoad, creditSave } from "../../redux/reducers/userCredit"
import { log } from "../helpers/common"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"

export const userCreditLoad = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.user_credit_list,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        // params: { page, perPage },
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(creditLoad(e?.data))
            
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const addCreditLoad = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.add_user_credit,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            
            success((e))
            dispatch(creditSave([e?.data]))

        },
        error: (e) => { errors(e) }
    })
}

