import { contactGroupLoad, contactGroupUpdate } from "../../redux/reducers/contactGroup"
import { log } from "../helpers/common"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"

export const loadContactGroup = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { }  }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.load_contact_group,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(contactGroupLoad(e?.data))
            
            success((e))
        },
        error: (e) => { errors(e) }
    })
}


export const deleteContactGroup = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { }  }) => {
    return http.request({
        async,
        method: "DELETE",
        path: ApiEndpoints.delete_contact_group + id,
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


export const readContactGroup = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { }  }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.read_contact_group + id,
        loading,
        success: (e) => { success(e?.data) },
        error: (e) => { errors(e) }
    })
}


export const editContactGroup = async ({id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { }  }) => {
    return http.request({
        async,
        method: "PUT",
        path: ApiEndpoints.edit_contact_group + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(contactGroupUpdate(e?.data))
            
            success((e))
        },
        error: (e) => { errors(e) }
    })
}


export const groupSampleFile = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.contact_group_sample_file,
        loading,
        success: (e) => { success(e?.data) },
        error: (e) => {
            errors(e)
        }
    })
}

