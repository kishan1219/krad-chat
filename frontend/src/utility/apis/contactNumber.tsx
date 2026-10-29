import { contactNumberLoad, contactNumberSave } from "../../redux/reducers/contactNumber"
import { log } from "../helpers/common"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"

export const loadContactNumber = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.load_contact_number,
        jsonData,
        loading,
        params: { page, per_page_record: perPage },
        showErrorToast: true,
        // showSuccessToast: true,
        success: (e) => {
            dispatch(contactNumberLoad(e?.data))
            
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const addContactNumber = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.add_contact_number,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(contactNumberSave([e?.data]))
            
            success((e))
        },
        error: (e) => { errors(e) }
    })
}


export const deleteContactNumber = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "DELETE",
        path: ApiEndpoints.delete_contact_number + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            // dispatch(primaryDelete(e?.data))
            
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const contactNumberImport = async ({ async = false, formData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.contact_number_import,
        formData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(contactNumberSave(e?.data))
            
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

