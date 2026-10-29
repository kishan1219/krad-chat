import { loginLogLoad, userLoad, userSave, userUpdate, userWiseCreditRedux } from "../../redux/reducers/userManagement"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"
import { emitAlertStatus } from "../Utils"

export const loadUser = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.load_user,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(userLoad(e?.data))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}
export const loginLogView = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.login_log_view,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(loginLogLoad(e?.data))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}
export const loadUserChild = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.load_user_child,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(userLoad(e?.data))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const addUser = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.add_user,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(userSave([e?.data]))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const editUser = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "PUT",
        path: ApiEndpoints.edit_user + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(userUpdate(e?.data))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const deleteUser = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "DELETE",
        path: ApiEndpoints.delete_user + id,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            // dispatch(primaryDelete(e?.data))
            emitAlertStatus("success", e)

            success((e))
        },
        error: (e) => {
            emitAlertStatus("failed", e)
            errors(e)
        }
    })
}

export const readUser = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.read_user + id,
        loading,
        success: (e) => { success(e?.data) },
        error: (e) => {
            errors(e)
        }
    })
}

export const getWebhookInfo = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.get_webhook_info + id,
        loading,
        success: (e) => { success(e?.data) },
        error: (e) => {
            errors(e)
        }
    })
}

export const userAction = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.user_action,
        jsonData,
        showErrorToast: true,
        showSuccessToast: true,
        loading,
        success: (e) => {
            dispatch(userSave(e?.data))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const resetPasswordByUser = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.reset_password_by_user,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(userSave(e?.data))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const userChangeApi = ({ id, loading, jsonData, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "post",
        jsonData,
        path: ApiEndpoints.user_change_api,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => { success(e?.data) },
        error: (e) => {
            errors(e)
        }
    })
}

export const enableApiSecurity = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.enable_api_security,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            // dispatch(userEnableApiSecurity([e?.data]))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const setUserRatio = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.set_user_ratio,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(userUpdate([e?.data]))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const setWebhookUrl = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.set_webhook_url,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        success: (e) => {
            dispatch(userUpdate([e?.data]))

            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}
// export const getWebhookEvents = async ({ async = false, jsonData, loading,  success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
//     return http.request({
//         async,
//         method: "get",
//         path: ApiEndpoints.get_webhook_events,
//         jsonData,
//         loading,
//         showErrorToast: true,
//         showSuccessToast: true,
//         success: (e) => {
//             // dispatch(userUpdate([e?.data]))
//             success((e))
//         },
//         error: (e) => {
//             errors(e)
//         }
//     })
// }

// export const getWebhookEvents = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
//     return http.request({
//         async,
//         method: "get",
//         path: ApiEndpoints.get_webhook_events,
//         jsonData,
//         loading,
//         showErrorToast: true,
//         showSuccessToast: true,
//         // params: { page, per_page_record: perPage, ...jsonData },
//         success: (e) => {


//             success((e))
//         },

//         error: (e) => { errors(e) }


//     })
// }


export const getWebhookEvents = ({ id, loading, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.get_webhook_events,
        loading,
        success: (e) => { success(e) },
        error: (e) => {
            errors(e)
        }
    })
}

export const childLogin = async ({ async = false, navigate = (...args: any[]) => { }, redirect = true, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.child_login,
        jsonData,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        error: (e) => {
            errors(e)
        },
        success: (data) => {
            success(data)
        }
    })
}

export const userWiseCredit = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.user_wise_credit,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(userWiseCreditRedux(e?.data))

            success((e))
        },
        error: (e) => { errors(e) }
    })
}

export const loadBusinessCategory = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "get",
        path: ApiEndpoints.wa_business_category,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,,
        success: (e) => {
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

export const waFlowSignup = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.wa_flow_signup,
        jsonData,
        loading,
        showErrorToast: true,
        // showSuccessToast: true,,
        success: (e) => {
            success((e))
        },
        error: (e) => {
            errors(e)
        }
    })
}

