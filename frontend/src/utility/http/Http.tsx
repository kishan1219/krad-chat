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
                // ** Get token from localStorage
                const accessToken = JSON.parse(this.getToken())
                // log("accessToken", accessToken)
                // ** If token is present add it to request's Authorization Header
                if (accessToken) {
                    // ** eslint-disable-next-line no-param-reassign
                    config.headers.Authorization = `${this.httpConfig.tokenType} ${accessToken}`
                }
                return config
            },
            error => Promise.reject(error)
        )

    }

    onAccessTokenFetched(accessToken) {
        this.subscribers = this.subscribers.filter(callback => callback(accessToken))
    }

    addSubscriber(callback) {
        this.subscribers.push(callback)
    }
    getToken() {
        return localStorage.getItem(this.httpConfig.storageTokenKeyName)
    }

    isUnauthenticated = (data) => {
        if (data?.code === 401 || data?.code === 302) {
            Emitter.emit(Events.Unauthenticated, true)
            localStorage.removeItem("nrtData")
            // localStorage.removeItem("access_token")
        } else if (data?.code === 422) {
            if (!localStorage.getItem("nrtData")) {
                Emitter.emit(Events.Unauthenticated, true)
            }
        } else if (data?.code === 400) {
            if (!localStorage.getItem("nrtData")) {
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
                    data = JSON.parse(data)
                    // Do whatever you want to transform the data
                    // log("transformResponse", data)
                    this.isUnauthenticated(data)
                    return data
                }
            ],
            ...extra
        }
        if (async) {
            return axios(settings)
        } else {
            // log("settings", settings)
            const http = axios(settings)
            http.then((res) => {
                this.returnSuccessResponse(res, showSuccessToast, showErrorToast, success, error, loading)
            }).catch((e) => {
                if (e?.request?.responseURL?.includes('unauthorized')) {
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
