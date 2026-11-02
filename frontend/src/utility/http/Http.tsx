// @ts-nocheck
import axios from 'axios'
import { entryPoint, Events, WebAppVersion } from '../Const'
import Emitter from '../Emitter'
import { isValid, log } from '../helpers/common'
import { ErrorToast, formatDate, MessageToast, SuccessToast } from '../Utils'
import defaultHttpConfig from './httpConfig'

type HttpCallback = (...args: any[]) => void

interface HttpRequestOptions {
    async?: boolean
    noEntryMode?: boolean
    showErrorToast?: boolean
    showSuccessToast?: boolean
    method?: string
    path: string
    jsonData?: any
    formData?: Record<string, any> | null
    params?: Record<string, unknown>
    auth?: boolean
    success?: HttpCallback
    error?: HttpCallback
    loading?: HttpCallback
    [key: string]: any
}


export default class HttpService {

    // ** apiConfig <= Will be used by this service
    httpConfig = { ...defaultHttpConfig }

    subscribers = []

    isAlreadyFetchingAccessToken = false

    constructor(httpConfigOverride) {

        this.httpConfig = { ...this.httpConfig, ...httpConfigOverride }

        // ** Request Interceptor
        axios.interceptors.request.use(
            config => {
                const accessToken = this.getToken()
                if (accessToken) {
                    config.headers.Authorization = `${this.httpConfig.tokenType} ${accessToken}`
                }
                return config
            },
            error => Promise.reject(error)
        )

        // ** Response Interceptor
        axios.interceptors.response.use(
            response => response,
            async error => {
                const { config, response } = error
                const originalRequest = config

                if (response && response.status === 401 && !originalRequest?._retry) {
                    if (originalRequest.url?.includes('auth/refresh') || originalRequest.url?.includes('login')) {
                        this.isUnauthenticated({ code: 401 })
                        return Promise.reject(error)
                    }

                    if (this.isAlreadyFetchingAccessToken) {
                        return new Promise(resolve => {
                            this.addSubscriber(accessToken => {
                                if (accessToken) {
                                    originalRequest.headers.Authorization = `${this.httpConfig.tokenType} ${accessToken}`
                                }
                                resolve(axios(originalRequest))
                            })
                        })
                    }

                    originalRequest._retry = true
                    this.isAlreadyFetchingAccessToken = true

                    const refreshToken = this.getRefreshToken()
                    if (!refreshToken) {
                        this.isAlreadyFetchingAccessToken = false
                        this.isUnauthenticated({ code: 401 })
                        return Promise.reject(error)
                    }

                    try {
                        const refreshUrl = `${this.httpConfig.baseUrl}${this.httpConfig.refreshEndpoint}`
                        const res = await axios.post(refreshUrl, { refresh_token: refreshToken })
                        const newAccessToken = res.data?.data?.access_token || res.data?.access_token
                        const newRefreshToken = res.data?.data?.refresh_token || res.data?.refresh_token || refreshToken
                        if (newAccessToken) {
                            localStorage.setItem(this.httpConfig.storageTokenKeyName, JSON.stringify(newAccessToken))
                            localStorage.setItem(this.httpConfig.storageRefreshTokenKeyName, JSON.stringify(newRefreshToken))
                            localStorage.setItem('access_token', JSON.stringify(newAccessToken))
                            localStorage.setItem('refresh_token', JSON.stringify(newRefreshToken))

                            this.onAccessTokenFetched(newAccessToken)
                            this.isAlreadyFetchingAccessToken = false

                            originalRequest.headers.Authorization = `${this.httpConfig.tokenType} ${newAccessToken}`
                            return axios(originalRequest)
                        } else {
                            throw new Error('Refresh rejected')
                        }
                    } catch (refreshErr) {
                        this.isAlreadyFetchingAccessToken = false
                        this.subscribers = []
                        this.isUnauthenticated({ code: 401 })
                        return Promise.reject(refreshErr)
                    }
                }
                return Promise.reject(error)
            }
        )

    }

    onAccessTokenFetched(accessToken) {
        this.subscribers.forEach(callback => callback(accessToken))
        this.subscribers = []
    }

    addSubscriber(callback) {
        this.subscribers.push(callback)
    }
    getToken() {
        let raw = localStorage.getItem(this.httpConfig.storageTokenKeyName) || localStorage.getItem('access_token')
        if (!raw) return null
        try {
            return (raw.startsWith('"') || raw.startsWith('{')) ? JSON.parse(raw) : raw
        } catch {
            return raw
        }
    }

    getRefreshToken() {
        let raw = localStorage.getItem(this.httpConfig.storageRefreshTokenKeyName) || localStorage.getItem('refresh_token')
        if (!raw) return null
        try {
            return (raw.startsWith('"') || raw.startsWith('{')) ? JSON.parse(raw) : raw
        } catch {
            return raw
        }
    }

    isUnauthenticated = (data) => {
        if (data?.code === 401 || data?.code === 302) {
            Emitter.emit(Events.Unauthenticated, true)
            localStorage.removeItem("kradChatData")
            localStorage.removeItem("access_token")
            localStorage.removeItem("refresh_token")
            localStorage.removeItem(this.httpConfig.storageTokenKeyName)
            localStorage.removeItem(this.httpConfig.storageRefreshTokenKeyName)
        } else if (data?.code === 422) {
            if (!localStorage.getItem("kradChatData")) {
                Emitter.emit(Events.Unauthenticated, true)
            }
        } else if (data?.code === 400) {
            if (!localStorage.getItem("kradChatData")) {
                Emitter.emit(Events.Unauthenticated, true)
            }
        } else {
            Emitter.emit(Events.Unauthenticated, false)
        }
    }

    getFormData = (data) => {
        const formData = new FormData()
        if (data) {
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    formData.append(key, data[key])
                }
            }
        }
        return formData
    }
    request({ async = false, noEntryMode = true, showErrorToast = false, showSuccessToast = false, method = "post", path, jsonData = null, formData = null, params, auth = true, success = () => { }, error = () => { }, loading = () => { }, ...extra }: HttpRequestOptions) {
        let data = null
        if (formData) {
            if (!noEntryMode) {
                formData = { ...formData, entry_mode: isValid(formData?.entry_mode) ? formData?.entry_mode : entryPoint }
            }
            data = this.getFormData(formData)
        } else if (jsonData) {
            if (!noEntryMode) {
                jsonData = { ...jsonData, entry_mode: isValid(jsonData?.entry_mode) ? jsonData?.entry_mode : entryPoint }
            }
            data = jsonData
        }
        loading(true)
        const settings = {
            method,
            baseURL: this.httpConfig.baseUrl,
            url: path,
            params: { ...params }, // entry_mode: `web-${WebAppVersion.current}`
            data,
            transformRequest: [
                function (data, headers) {
                    // log("headers", headers)
                    // delete auth header
                    if (!auth) delete headers.Authorization
                    // change content type
                    if (jsonData) {
                        data = JSON.stringify(data)
                        headers["Content-Type"] = "application/json"
                        headers["Accept"] = "*/*"
                    }

                    return data
                }
            ],
            transformResponse: [
                (data) => {
                    if (typeof data === 'string') {
                        try {
                            const parsed = JSON.parse(data)
                            return parsed
                        } catch {
                            return data
                        }
                    }
                    return data
                }
            ],
            ...extra
        }
        if (async) {
            return axios(settings)
        } else {
            const http = axios(settings)
            http.then((res) => {
                this.returnSuccessResponse(res, showSuccessToast, showErrorToast, success, error, loading)
            }).catch((e) => {
                const status = e?.response?.status || e?.response?.data?.code
                const pathUrl = settings.url || path
                const errMsg = e?.response?.data?.message || e?.message || 'Network request failed'
                console.warn(`[KRAD API Error ${status || 'ERR'}] ${settings.method?.toUpperCase()} ${pathUrl}: ${errMsg}`, {
                    status,
                    error: e,
                    response: e?.response?.data,
                    correlationId: e?.response?.headers?.['x-correlation-id']
                })
                if (status === 401 && !pathUrl.includes('login') && !pathUrl.includes('auth/refresh')) {
                    this.isUnauthenticated({ code: 401 })
                }
                this.returnErrorResponse(e, showErrorToast, error, loading)
            })
        }
    }

    // rex(showSuccessToast, showErrorToast, success = () => { }, error = () => { }, loading = () => { }) {
    //     axios.interceptors.response.use(
    //         response => {
    //             return response
    //         },
    //         err => {
    //             // ** const { config, response: { status } } = error
    //             const { config, response } = err
    //             const originalRequest = config
    //             log("axios.interceptors.response", { response, config })
    //             // ** if (status === 401) {
    //             if (response && response.status === 401) {
    //                 if (!this.isAlreadyFetchingAccessToken) {
    //                     this.isAlreadyFetchingAccessToken = true
    //                     Emitter.on("AuthSuccess", (x) => {
    //                         log("xx", x)
    //                         const http = axios(originalRequest)
    //                         http.then((res) => {
    //                             this.isAlreadyFetchingAccessToken = false
    //                             this.returnSuccessResponse(res, showSuccessToast, showErrorToast, success, error, loading)
    //                         }).catch((e) => {
    //                             this.returnErrorResponse(e, showErrorToast, error, loading)
    //                         })
    //                     })
    //                 }
    //             }
    //             return Promise.reject(err)
    //         }
    //     )
    // }
    // retryOriginalRequest(originalRequest) {
    //     this.isAlreadyFetchingAccessToken = false
    //     const retryOriginalRequest = new Promise(resolve => {
    //         resolve(axios(originalRequest))
    //     })
    //     return retryOriginalRequest
    // }

    returnSuccessResponse = (res, showSuccessToast, showErrorToast, success = () => { }, error = () => { }, loading = () => { }) => {
        loading(false)
        const data = res.data
        log("response", data)
        if (!data.error) {
            success(data)
            if (showSuccessToast && res.data?.message) {
                // SuccessToast(res.data?.message)
                const message = `<p class="mb-0">${res.data?.message}</p><p class="mb-0 fw-bolder">🕑In: ${formatDate(res.data?.intime, "DD-MM-YYYY hh:mm:ss A ")}</p><p class="mb-0 fw-bolder">🕑Out: ${formatDate(res.data?.outtime, "DD-MM-YYYY hh:mm:ss A ")}</p>`
                MessageToast(message)
            }
        } else {
            error({
                error: true,
                data: res.data
            })
            if (showErrorToast && res.data?.message) {
                ErrorToast(res.data?.message)
            }
        }
    }

    returnErrorResponse = (e, showErrorToast, error = () => { }, loading = () => { }) => {
        loading(false)
        // log("response error cache", e)
        error({
            error: true,
            data: e?.response?.data,
            ...e
        })
        if (showErrorToast && e?.response?.data?.message) {
            ErrorToast(e?.response?.data?.message)
        }
    }
}
