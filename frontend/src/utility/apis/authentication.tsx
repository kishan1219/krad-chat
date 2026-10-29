import { useSelector } from "react-redux"
import { handleLogin, handleLogout, handleOtp, handleRemoveOtp } from "../../redux/authentication"
// import { createAbility } from "../helpers/common"
import ApiEndpoints from "../http/ApiEndpoints"
import http from "../http/useHttp"
import { SuccessToast } from "../Utils"
import { log } from "../helpers/common"
// const config = useJwt.jwtConfig

const extraPermissions = [
    {
        action: 'dashboard-view',
        subject: 'all'
    },
    {
        action: 'private-view',
        subject: 'all'
    },
    {
        action: 'setting-view',
        subject: 'all'
    }
]
// const loginUser = useSelector(state => state.auth.userData)

export const login = ({
    formData,
    loading = (...args: any[]) => { },
    success = (...args: any[]) => { },
    // eslint-disable-next-line no-unused-vars

    errorMessage = "login-failed",
    successMessage = "Login Successful",
    successMessage2 = "Email & Password Verified Successfully",
    dispatch = (...args: any[]) => { },
    ability,
    redirect = true,
    navigate = (...args: any[]) => { },
    error = (...args: any[]) => { }
}) => {
    http.request({
        jsonData: formData,
        method: "post",
        path: ApiEndpoints.login,
        loading,
        showErrorToast: true,
        error: (e) => {
            error(e)
            // console.log(e)
            // ErrorToast(errorMessage)
        },
        success: (data) => {

            // const otp = data?.data?.ask_for_otp === true ?? dispatch(handleOtp(otp))

            if (data?.data?.ask_for_otp === true) {
                dispatch(handleOtp(data?.data))
                SuccessToast(successMessage2)
                // if (m?.ask_for_otp === true) {
                navigate('/two-factor-authentication')
                success(data)
                // }
            } else {
                const p = data?.data?.permissions?.map(a => ({
                    action: a.name,
                    subject: "all"
                })) ?? []

                // user type === 0 or 3 to dikhana hai or is_visible_dlt_template_group === 1 to dikhana hai
                // if (data?.data?.userType === 0 || data?.data?.userType === 3 || data?.data?.is_visible_dlt_template_group === 1) {
                //     log("is_visible_dlt_template_group", data?.data?.is_visible_dlt_template_group)
                //     p.push({
                //         action: "is-visible-dlt-template-group",
                //         subject: 'all'
                //     })
                // }
                const m = {
                    ...data.data,
                    ability: p?.concat(extraPermissions)
                }

                dispatch(handleLogin(m))

                SuccessToast(successMessage)
                // if (data?.data?.permissions) ability.update([
                //     {
                //         action: 'manage',
                //         subject: 'all'
                //     }
                // ])
                if (data?.data?.permissions) ability.update(m?.ability)
                // if (m?.ask_for_otp === true) {
                //     navigate('/two-factor-authentication')
                // }
                // if (redirect && loginUser?.userType === 3) navigate('/chat')
                if (m?.userType === 3) {
                    navigate('/chat')
                } else {
                    navigate('/chat')
                }
                // if (redirect) navigate('/chat')

                success(data)
            }
        }
    })
}

////////////////////forgot password ////////////////////
export const forgotPassword = ({
    formData,
    loading = (...args: any[]) => { },
    // successMessage = "link send successfully",
    error = (...args: any[]) => { },
    success = (...args: any[]) => { }
}) => {
    http.request({
        jsonData: formData,
        method: "post",
        path: ApiEndpoints.forgotPassword,
        loading,
        showErrorToast: true,
        showSuccessToast: true,
        error: (e) => {
            error(e)
        },
        success: (e) => {
            // SuccessToast(successMessage)
            success(e)
        }
    })
}

export const signUp = ({
    formData,
    loading = (...args: any[]) => { },
    successMessage = "You are registered Successfully",
    error = (...args: any[]) => { },
    success = (...args: any[]) => { }
}) => {
    http.request({
        jsonData: formData,
        method: "post",
        path: ApiEndpoints.signup,
        loading,
        showErrorToast: true,
        showSuccessToast: false,
        error: (e) => {
            error(e)
        },
        success: (e) => {
            SuccessToast(successMessage)
            success(e)
        }
    })
}


// export const forgotPassword = async ({ async = false, jsonData, loading, page, perPage, dispatch = (...args: any[]) => { }, success = (...args: any[]) => { } }) => {
//     return http.request({
//         async,
//         method: "post",
//         path: ApiEndpoints.forgotPassword,
//         jsonData,
//         loading,
//         // params: { page, per_page_record: perPage },
//         success: (e) => {
//             // dispatch(blacklistLoad(e?.data))
//             // log(e)
//             success((e))
//         },
//         error: () => { /** ErrorToast("data-fetch-failed") **/ }
//     })
// }

/////////////////////////Reset Password ////////////////////////////
export const resetPassword = ({
    formData,
    loading = (...args: any[]) => { },
    successMessage = "password-changed",
    error = (...args: any[]) => { },
    success = (...args: any[]) => { }

}) => {
    http.request({
        jsonData: formData,
        method: "post",
        path: ApiEndpoints.resetPassword,
        loading,
        showErrorToast: true,
        error: (e) => {
            error(e)
            // console.log(e)
            // ErrorToast(errorMessage)
        },
        success: (e) => {
            SuccessToast(successMessage)
            success(e)
        }
    })
}


export const logout = ({
    loading = (...args: any[]) => { },
    dispatch = (...args: any[]) => { },
    error = (...args: any[]) => { },
    history
}: {
    loading?: (...args: any[]) => void
    dispatch?: (...args: any[]) => any
    error?: (...args: any[]) => void
    history?: any
} = {}) => {

    http?.request({
        method: "post",
        path: ApiEndpoints.logout,
        loading,
        error: (e) => {
            error(e)
            // ErrorToast(errorMessage)
        },
        success: () => {
            // dispatch(logoutUser())
            // ** Remove user, accessToken & refreshToken from localStorage
            localStorage.removeItem('nrtData')
            localStorage.removeItem('otpData')
            localStorage.removeItem('access_token')
            // dispatch(handleRemoveOtp())
            // localStorage.removeItem('access_token')
            // localStorage.removeItem(config.storageTokenKeyName)
            // localStorage.removeItem(config.storageRefreshTokenKeyName)
            // SuccessToast(successMessage)
            // dispatch(handleLogout())
            //TODO: remove to after use and mark it idle-user
            window.location.href = "/authentication"

        }
    })
}

export const verifyOtp = ({
    jsonData,
    loading = (...args: any[]) => { },
    success = (...args: any[]) => { },
    // eslint-disable-next-line no-unused-vars

    errorMessage = "login-failed",
    successMessage = "OTP verified successfully",
    dispatch = (...args: any[]) => { },
    ability,
    redirect = true,
    navigate = (...args: any[]) => { },
    error = (...args: any[]) => { }
}) => {
    http.request({
        jsonData,
        method: "post",
        path: ApiEndpoints.verify_otp,
        loading,
        showErrorToast: true,
        error: (e) => {
            error(e)
            // console.log(e)
            // ErrorToast(errorMessage)
        },
        success: (data) => {
            const p = data?.data?.permissions?.map(a => ({
                action: a.name,
                subject: "all"
            })) ?? []
            const m = {
                ...data.data,
                ability: p?.concat(extraPermissions)
            }

            dispatch(handleLogin(m))
            dispatch(handleRemoveOtp())
            SuccessToast(successMessage)
            // if (data?.data?.permissions) ability.update([
            //     {
            //         action: 'manage',
            //         subject: 'all'
            //     }
            // ])
            if (data?.data?.permissions) ability.update(m?.ability)
            // if (redirect && loginUser?.userType === 3) navigate('/chat')
            if (m?.userType === 3) {
                navigate('/chat')
            } else {
                navigate('/chat')
            }
            // if (redirect) navigate('/chat')

            success(data)
        }
    })
}

export const resendOtp = ({
    jsonData,
    loading = (...args: any[]) => { },
    successMessage = "You will receive your OTP shortly",
    error = (...args: any[]) => { },
    success = (...args: any[]) => { },
    dispatch = (...args: any[]) => { }
}) => {
    http.request({
        jsonData,
        method: "post",
        path: ApiEndpoints.resend_otp,
        loading,
        showErrorToast: true,
        showSuccessToast: false,
        error: (e) => {
            error(e)
        },
        success: (e) => {
            SuccessToast(successMessage)
            success(e)
            dispatch(handleRemoveOtp())
        }
    })
}

