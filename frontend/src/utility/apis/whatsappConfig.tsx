import { addCustomTemplateSave, waAppSubscribe, waPhoneNumberRegisterRedux, waPhoneNumberVerify, waTokenDebug, whatsappConfigDelete, whatsappConfigLoad, whatsappConfigSave, whatsappConfigUpdate } from "../../redux/reducers/whatsappConfig"
import { whatsappMessageSendSave } from "../../redux/reducers/whatsappMessageSend"
import { whatsappCampaignReportLoad, whatsappReportLoad } from "../../redux/reducers/whatsappReport"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"

export const loadWhatsappConfig = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.WhatsappConfig_list,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(whatsappConfigLoad(e?.data))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const addWhatsappConfig = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.add_WhatsappConfig,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(whatsappConfigSave([e?.data]))
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}
export const waCalling = async ({ wa_configuration_id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.wa_calling + wa_configuration_id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(whatsappConfigSave([e?.data]))
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const addCustomTemplate = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.addCustomTemplate,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(addCustomTemplateSave([e?.data]))
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const editWhatsappConfig = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "PUT",
        path: ApiEndpoints.edit_WhatsappConfig + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(whatsappConfigUpdate(e?.data))
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const waEcommerceSetting = async ({ wa_configuration_id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.wa_ecommerce_setting + wa_configuration_id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(whatsappConfigUpdate(e?.data))
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}


export const deleteWhatsappConfig = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "DELETE",
        path: ApiEndpoints.delete_WhatsappConfig + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(whatsappConfigDelete(e?.data))
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const readWhatsappConfig = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.read_WhatsappConfig + id,
        loading,
        success: (data) => { success(data?.data) },
        error: (e) => {
            errors(e)
        }
    })
}
export const whatsAppFileUpload = async ({ controller = new AbortController(), progress = (...args: any[]) => { }, async = false, formData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, error = (...args: any[]) => { } }) => {

    return http.request({
        async,
        method: "POST",
        path: ApiEndpoints.fileUploadForWhatsapp,
        formData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        success: (data) => { success(data) },
        error: () => { error(true) },
        onUploadProgress: progressEvent => {
            progress((progressEvent.loaded / progressEvent.total) * 100)
        },
        signal: controller.signal
    })
}

// export const sendWhatsappMessage = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
//     return http.request({
//         async,
//         method: "post",
//         path: ApiEndpoints.send_whatsapp_message,
//         jsonData,
//         loading,
//         showErrorToast: true,
//         showSuccessToast: true,
//         success: (data) => { success(data) },
//         error: (e) => {
//             errors(e)
//         }
//     })
// }

export const sendWhatsappMessage = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.send_whatsapp_message,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(whatsappMessageSendSave([e?.data]))
            success((e))
        },
        error: (e) => { /** ErrorToast("data-fetch-failed") **/ errors(e) }
    })
}

export const loadWhatsappReport = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.load_whatsapp_report,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(whatsappReportLoad(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}
export const exportWhatsappReport = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.export_wa_report,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        // params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(whatsappReportLoad(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const exportWhatsappSummaryReportDownload = async ({ async = false, jsonData, loadings, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.export_wa_report_download,
        jsonData,
        loadings,
        showErrorToast: true,
        showSuccessToast: true,
        // params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(whatsappReportLoad(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const whatsappSummaryReport = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.whatsapp_summary_report,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        // params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(whatsappReportLoad(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const getWhatsappReport = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.get_whatsapp_report + id,
        loading,
        success: (e) => { success(e?.data) },
        error: (e) => {
            errors(e)
        }
    })
}

export const getWhatsappCampaignStatus1 = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.get_Wa_campaign_status + id,
        loading,
        // success: (e) => { success(e?.data) },
        // error: (e) => {
        //     errors(e)
        // }
        success: (e) => {
            // emitAlertStatus("success", e, `check-status-${id}`)

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const whatsAppCampaignInfo = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.whatsapp_campaign_info + id,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(whatsappCampaignReportLoad(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const waAccountQualityCheck = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.wa_account_quality_check + id,
        loading,
        success: (e) => { success(e?.data) },
        showErrorToast: true,
        showSuccessToast: true,
        error: (e) => { errors(e) }
    })
}

// export const waPhoneNumberRequest = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
//     http.request({
//         method: "get",
//         path: ApiEndpoints.wa_phone_number_request + id,
//         loading,
//         success: (e) => { success(e?.data) },
//         showErrorToast: true,
//         showSuccessToast: true,
//         error: (e) => { errors(e) }

//     })
// }
export const waPhoneNumberRequest = ({ id, otp_method, language, jsonData, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        // jsonData,
        method: "get",
        path: ApiEndpoints.wa_phone_number_request + id,
        params: { otp_method, language },
        loading,
        success: (e) => { success(e?.data) },
        showErrorToast: true,
        showSuccessToast: true,
        error: (e) => { errors(e) }

    })
}

export const waPhoneNumberVerified = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.wa_phone_number_verified + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            // dispatch(waPhoneNumberVerify(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}
export const waPhoneNumberRegister = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.wa_phone_number_register + id,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(waPhoneNumberRegisterRedux(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}
export const waSubscribeApps = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.wa_subscribe_apps + id,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(waAppSubscribe(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}
export const WAdebugToken = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.wa_debug_token + id,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(waTokenDebug(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const whatsappAnalytics = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.whatsapp_analytics,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(whatsappReportLoad(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}
export const whatsappTemplateAnalytics = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.whatsapp_template_analytics,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(whatsappReportLoad(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const whatsappConversationAnalytics = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.whatsapp_conversation_analytics,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(whatsappReportLoad(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}


export const getAllTimeZone = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.get_all_timezones,
        loading,
        success: (e) => { success(e) },
        error: (e) => {
            errors(e)
        }
    })
}
export const getWhatsappCallSetting = ({ wa_configuration_id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {

    http.request({
        wa_configuration_id,
        method: "get",
        path: ApiEndpoints.get_whatsapp_call_setting + wa_configuration_id,
        loading,
        success: (e) => {
            success(e?.data)
        },
        error: (e) => {
            errors(e)
        }
    })

}

export const whatsappChatbotsSelfWebhook = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.whatsapp_chatbots_self_webhook,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            // dispatch(whatsappReportLoad(e?.data))
            success((e))
        },
        error: (e) => { errors(e) }
    })
}


export const waMarketingLiteApiStatus = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.wa_marketing_lite_api_status + id,
        loading,
        success: (e) => { success(e?.data) },
        showErrorToast: true,
        // showSuccessToast: true,
        error: (e) => { errors(e) }
    })
}

export const onboardPartnersToMmLite = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "post",
        path: ApiEndpoints.onboard_partners_to_mm_lite + id,
        loading,
        success: (e) => { success(e?.data) },
        showErrorToast: true,
        showSuccessToast: true,
        error: (e) => { errors(e) }
    })
}

