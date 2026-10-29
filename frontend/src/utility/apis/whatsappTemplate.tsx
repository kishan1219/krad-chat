import { whatsappTemplateDelete, whatsappTemplateFetch, whatsappTemplateLoad, whatsappTemplateSave, whatsappTemplateUpdate } from "../../redux/reducers/whatsappTemplate"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"

export const loadWhatsappTemplate = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.WhatsappTemplate_list,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(whatsappTemplateLoad(e?.data))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}
export const exportWaConversation = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.wa_conversation_export,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(whatsappTemplateLoad(e?.data))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const addWhatsappTemplate = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.add_WhatsappTemplate,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(whatsappTemplateSave([e?.data]))
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const editWhatsappTemplate = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "PUT",
        path: ApiEndpoints.edit_WhatsappTemplate + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(whatsappTemplateUpdate(e?.data))
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const deleteWhatsappTemplate = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "DELETE",
        path: ApiEndpoints.delete_WhatsappTemplate + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(whatsappTemplateDelete(e?.data))
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const readWhatsappTemplate = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.read_WhatsappTemplate + id,
        loading,
        success: (data) => { success(data?.data) },
        error: (e) => {
            errors(e)
        }
    })
}
export const getWhatsappTemplateLanguage = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.get_whatsapp_language,
        loading,
        success: (data) => { success(data?.data) },
        error: (e) => {
            errors(e)
        }
    })
}
export const downloadSampleFileWa = ({ id, type, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: `${ApiEndpoints.wa_sample_file + id  }/${  type}`,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (data) => { success(data?.data) },
        error: (e) => {
            errors(e)
        }
    })
}

export const whatsappTemplatePull = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.wa_pull_template,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {

            dispatch(whatsappTemplateFetch([e?.data]))
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}
export const whatsappGeneratePull = async ({ async = false, jsonData, loading, page, perPage, whats_app_template_id, user_id, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "get",
        path: `${ApiEndpoints.wa_generate_payload}${whats_app_template_id}/${user_id}`,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {

            // dispatch(whatsappTemplateFetch([e?.data]))
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}
export const whatsappTemplatePullAll = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.wa_pull_template_all,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {

            dispatch(whatsappTemplateFetch([e?.data]))
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

