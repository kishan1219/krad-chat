import { notificationDelete, notificationLoad, readAllNotificationRedux, readNotificationRedux } from "../../redux/reducers/notification"
import { log } from "../helpers/common"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"
import { emitAlertStatus } from "../Utils"

export const loadNotification = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "post",
        path: ApiEndpoints.load_notification,
        jsonData,
        loading,
        params: { page, per_page_record: perPage },
        success: (e) => {
            dispatch(notificationLoad(e?.data))
            
            success((e))
        },
        error: (e) => {  errors(e) }
    })
}   

export const getNotification = ({ id, loading, success = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.get_notification + id,
        loading,
        success: (data) => { success(data?.payload) },
        error: () => { /** ErrorToast("data-fetch-failed") **/ }
    })
}
export const readNotification  = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.read_notification + id,
        loading,
        success: (e) => {
            // dispatch(readNotificationRedux(e?.data))
            
            success((e?.data))
        },
        error: () => { /** ErrorToast("data-fetch-failed") **/ }
    })
}
export const readAllNotification = ({  loading, success = (...args: any[]) => { }, dispatch = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.read_all_notification,
        loading,
        success: (e) => {
            dispatch(readAllNotificationRedux(e?.data))
            
            success((e))
        },
        error: () => { /** ErrorToast("data-fetch-failed") **/ }
    })
}
export const getUserDeletedNotification = ({ id, loading, success = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.user_deleted_notification,
        loading,
        success: (data) => { success(data?.payload) },
        error: () => { /** ErrorToast("data-fetch-failed") **/ }
    })
}

export const unreadNotification = ({  loading, success = (...args: any[]) => { } }) => {
    http.request({
        method: "get",
        path: ApiEndpoints.unread_notification,
        loading,
        success: (e) => { success(e) },
        error: () => { /** ErrorToast("data-fetch-failed") **/ }
    })
}

export const deleteNotification = async ({ id, async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, errors = (...args: any[]) => { } }) => {
    return http.request({
        async,
        method: "DELETE",
        path: ApiEndpoints.delete_notification + id,
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

// export const loadNotifications = async ({ async = false, jsonData, params, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { } }) => {
//     return http.request({
//         async,
//         method: "post",
//         path: ApiEndpoints.notification_list,
//         jsonData,
//         loading,
//         params: { page, perPage, ...params },
//         success: (data) => { dispatch(notificationLoad(data?.payload)); success(data) },
//         error: () => { /** ErrorToast("data-fetch-failed") **/ }
//     })
// }
// export const loadUnreadCount = async ({ async = false, jsonData, params, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { } }) => {
//     return http.request({
//         async,
//         method: "get",
//         path: ApiEndpoints.unread_count,
//         jsonData,
//         loading,
//         params: { page, perPage, ...params },
//         success: (data) => { dispatch(setUnreadNotification(data?.payload)); success(data) },
//         error: () => { /** ErrorToast("data-fetch-failed") **/ }
//     })
// }
// export const loadLatestNotifications = async ({ async = false, jsonData, params, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { } }) => {
//     return http.request({
//         async,
//         method: "post",
//         path: ApiEndpoints.notification_list,
//         jsonData,
//         loading,
//         params: { page, perPage, ...params },
//         success: (data) => { dispatch(latestNotificationLoad(data?.payload)); success(data) },
//         error: () => { /** ErrorToast("data-fetch-failed") **/ }
//     })
// }
// export const addNotificationCls = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, error = (...args: any[]) => { } }) => {
//     return http.request({
//         async,
//         method: "post",
//         path: ApiEndpoints.create_notification,
//         jsonData,
//         loading,
//         showErrorToast: true,
//         showSuccessToast: true,
//         params: { page, perPage },
//         success: (data) => { dispatch(notificationSave([{ ...data.payload }])); success(data) },
//         error: () => { /** ErrorToast("data-fetch-failed") **/; error(true) }
//     })
// }


// export const deleteNotificationCls = ({ id, loading, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { }, error = (...args: any[]) => { } }) => {
//     http.request({
//         method: "delete",
//         path: ApiEndpoints.deleteNotificationCls + id,
//         jsonData: { id },
//         loading,
//         // SuccessToast: true,
//         showErrorToast: true,
//         success: () => { dispatch(notificationDelete(id)); success(true) },
//         error: (e) => { error(true) }
//     })
// }

// export const readNotification = ({ id, loading, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { } }) => {
//     http.request({
//         method: "get",
//         path: `${ApiEndpoints.notification_show}/${id}/read`,
//         loading,
//         success: (data) => {
//             dispatch(notificationUpdate(data?.payload))
//             dispatch(notificationUpdateLatest(data?.payload))
//             success(data?.payload)
//         },
//         error: () => { /** ErrorToast("data-fetch-failed") **/ }
//     })
// }

// export const readNotificationAll = ({ loading, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { } }) => {
//     http.request({
//         method: "get",
//         path: `${ApiEndpoints.user_notification_read_all}`,
//         loading,
//         success: (data) => {
//             dispatch(setUnreadNotification(0))
//             success(data?.payload)
//         },
//         error: () => { /** ErrorToast("data-fetch-failed") **/ }
//     })
// }

// // export const notificationList = ({ id, loading, success = (...args: any[]) => { } }) => {
// //     http.request({
// //         method: "get",
// //         path: ApiEndpoints.notification_list,
// //         loading,
// //         success: (data) => { success(data?.payload) },
// //         error: () => { /** ErrorToast("data-fetch-failed") **/ }
// //     })
// // }

// export const notificationShow = ({ id, loading, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { } }) => {
//     http.request({
//         method: "get",
//         path: ApiEndpoints.notification_show + id,
//         loading,
//         success: (data) => { success(data?.payload) },
//         error: () => { /** ErrorToast("data-fetch-failed") **/ }
//     })
// }

// export const notificationUserDelete = ({ id, loading, success = (...args: any[]) => { } }) => {
//     http.request({
//         method: "get",
//         path: ApiEndpoints.user_notification_delete,
//         loading,
//         success: (data) => { success(data?.payload) },
//         error: () => { /** ErrorToast("data-fetch-failed") **/ }
//     })
// }

