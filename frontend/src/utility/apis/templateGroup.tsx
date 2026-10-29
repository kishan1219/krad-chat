import { groupDelete, groupLoad, groupSave, groupUpdate } from "../../redux/reducers/templateGroup"
import { emitAlertStatus } from "../Utils"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"

export const loadGroup = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.load_list,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(groupLoad(e?.data))

            success(e)
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const addGroup = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.add_group,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(groupSave([e?.data]))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const editGroup = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "PUT",
        path: ApiEndpoints.edit_group + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(groupUpdate(e?.data))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })

}

export const deleteGroup = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "DELETE",
        path: ApiEndpoints.delete_group + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            emitAlertStatus("success", e)

            success((e))
        },
        error: (e) => {
            emitAlertStatus("failed", e)
            errors(e)

        }
    })
}

export const assignTemplateGroupToUser = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.assign_template_group_to_user,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(groupLoad(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}

// get template group by id
export const getTemplateGroupById = ({ id, loading, success = (...args: any[]) => { }, dispatch = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
     
        method: "get",
        path: ApiEndpoints.get_template_group_by_id + id,
      
        loading,
        // showErrorToast: true,
        // showSuccessToast: true,
        success: (e) => {
            // dispatch(groupLoad(e?.data))

            success((e?.data))
        },
        error: (e) => { errors(e) }
    })
}

