import { appSettingSave, documentDelete, editProfiles, getDocuments, settingForAdmin, settingForClient, userDocumentUpload } from "../../redux/reducers/appSettingsRedux"
import { log } from "../helpers/common"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"
import { SuccessToast } from "../Utils"

export const profileChangePassword = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.profile_change_password,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        params: { page, perPage },
        // success: (e) => {
        //     dispatch(dlrLoad(e?.data))
        //     log(e)
        //     success((e))
        // },
        success: (e) => { success(e?.data) },
        error: (e) => { errors(e) }
    })
}
export const appSettingUpdate = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.app_setting_update,
        jsonData,
        loading,
        params: { page, perPage },
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            // dispatch(appSettingSave(e?.data))
            // log(e)
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const appSettingForAdmin = ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.app_setting_admin,
        loading,
        // success: (e) => { success(e) },
        showErrorToast: true,
        // showSuccessToast: true,
        success: (e) => {
            dispatch(settingForAdmin(e?.data))
            // log("fsddggdf", e)
            success((e))

        },
        error: (e) => { errors(e) }
    })
}

export const appSettingForClient = ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.app_setting_client,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        // success: (e) => { success(e) },
        success: (e) => {
            dispatch(settingForClient(e?.data))
            // log(e)
            success((e))
        },
        error: (e) => { errors(e) }
    })
}
export const editProfile = ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "POST",
        jsonData,
        async,
        path: ApiEndpoints.edit_profile,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        // success: (e) => { success(e) },
        success: (e) => {
            // dispatch(editProfiles(e?.data))
            // log(e)
            success((e))
        },
        error: (e) => { errors(e) }
    })
}
export const updateSelfPassword = ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "POST",
        jsonData,
        async,
        path: ApiEndpoints.update_self_password,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        // success: (e) => { success(e) },
        success: (e) => {
            editProfiles(e?.data)
            // log(e)
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const documentUpload = ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "POST",
        jsonData,
        async,
        path: ApiEndpoints.upload_document,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        // success: (e) => { success(e) },
        success: (e) => {
            dispatch(userDocumentUpload([e?.data]))
            // log(e)
            success(e)
        },
        error: (e) => { errors(e) }
    })
}


export const getUserDocument = ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "post",
        async,
        jsonData,
        path: ApiEndpoints.get_user_document,
        params: { page, per_page_record: perPage },
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(getDocuments(e?.data))
            // log("fsddggdf", e)
            success((e))

        },
        error: (e) => { errors(e) }
    })
}

export const deleteDocument = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "DELETE",
        path: ApiEndpoints.delete_document + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(documentDelete(e?.data))
            // log(e)
            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const getApiDoc = ({ params = undefined, async = false, formData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.get_api_docs,
        loading,
        formData,
        params,
        // success: (e) => { success(e) },
        showErrorToast: true,
        // showSuccessToast: true,
        success: (e) => {
            dispatch(settingForAdmin(e?.data))
            // log("fsddggdf", e)
            success((e))

        },
        error: (e) => { errors(e) }
    })
}

