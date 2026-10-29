import { dlrActions, dlrDelete, dlrLoad, dlrSave, dlrUpdate } from "../../redux/reducers/dlr"
import { log } from "../helpers/common"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"
import { SuccessToast } from "../Utils"

export const webContent = ({ token, sub_part, mobile_num, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: `${ApiEndpoints.get_web_content + sub_part}/${token}/${mobile_num}`,
        loading,
        success: (e) => { success(e?.data) },
        error: (e) => { errors(e) }
    })
}

export const takeResponse = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.take_response,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        success: (e) => {
            // dispatch(dlrSave([e?.data]))
            // log(e)
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

