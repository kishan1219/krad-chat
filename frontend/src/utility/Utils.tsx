import moment from 'moment'
import toast from 'react-hot-toast'
import { DefaultRoute } from '../router/routes'
import { Events } from './Const'
import Emitter from './Emitter'
import { capitalize, isValid, isValidArray, log } from './helpers/common'
import httpConfig from './http/httpConfig'
import { receiveMessageSelected, sendMessageSelected } from '../views/Chat/store'
// import { toast } from "react-toastify"

type SetOptionsFn = (options: any[]) => void
type IconFn = (option: any) => any

// ** Checks if an object is empty (returns boolean)
export const isObjEmpty = obj => Object.keys(obj).length === 0

// ** Returns K format from a number
export const kFormatter = num => (num > 999 ? `${(num / 1000).toFixed(1)}k` : num)

// ** Converts HTML to string
export const htmlToString = html => html.replace(/<\/?[^>]+(>|$)/g, '')

// ** Checks if the passed date is today
const isToday = date => {
    const today = new Date()
    return (
        /* eslint-disable operator-linebreak */
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
        /* eslint-enable */
    )
}

/**
 ** Format and return date in Humanize format
 ** Intl docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/format
 ** Intl Constructor: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 * @param {String} value date to format
 * @param {Object} formatting Intl object to format with
 */
// export const formatDate = (value, formatting = { month: 'short', day: 'numeric', year: 'numeric' }) => {
//     if (!value) return value
//     return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value))
// }
export const formatDate = (value, format = "YYYY-MM-DD") => {
    const d = moment(value).format(format)
    if (d !== "Invalid date") {
        return d
    } else {
        return null
    }
}
export const formatDateTimeByFormat = (value, format) => {
    const d = moment(value).format(format)
    if (d !== "Invalid date time") {
        return d
    } else {
        return ""
    }
}

// ** Returns short month of passed date
export const formatDateToMonthShort = (value, toTimeForCurrentDay = true) => {
    const date = new Date(value)
    let formatting: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }

    if (toTimeForCurrentDay && isToday(date)) {
        formatting = { hour: 'numeric', minute: 'numeric' }
    }

    return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value))
}

let id = 0
export const getUniqId = (prefix) => {
    id++
    return `${prefix}-${id}`
}

/**
 ** Return if user is logged in
 ** This is completely up to you and how you want to store the token in your frontend application
 *  ? e.g. If you are using cookies to store the application please update this function
 */
export const isUserLoggedIn = () => localStorage.getItem('nrtData')
export const getUserData = () => JSON.parse(localStorage.getItem('nrtData'))

/**
 ** This function is used for demo purpose route navigation
 ** In real app you won't need this function because your app will navigate to same route for each users regardless of ability
 ** Please note role field is just for showing purpose it's not used by anything in frontend
 ** We are checking role just for ease
 * ? NOTE: If you have different pages to navigate based on user ability then this function can be useful. However, you need to update it.
 * @param {String} userRole Role of user
 */
export const getHomeRouteForLoggedInUser = user => {
    if (isValid(user)) {
        return '/chat'
    } else {
        return '/authentication'
    }
}

export const ErrorToast = (message, settings = {}, comp = null) => {
    toast.error(comp ?? message, settings)
}
// ** React Select Theme Colors
export const selectThemeColors = theme => ({
    ...theme,
    colors: {
        ...theme.colors,
        primary25: '#ff9b36', // for option hover bg-color
        primary: '#ff9b36', // for selected option bg-color
        neutral10: '#ff9b36', // for tags bg-color
        neutral20: '#ededed', // for input border-color
        neutral30: '#ededed' // for input hover border-color
    }
})

export const SuccessToast = (message, settings = {}, comp = null) => {
    toast.success(comp ?? message, settings)
}
export const MessageToast = (message) => {
    toast.success((e) => (<div
        dangerouslySetInnerHTML={{ __html: message }}
    />))
}

export const fromNow = (data) => {
    return moment(data).fromNow()
}

export const getSelectValues = (val = [], matchWith = null) => {
    if (matchWith) {
        return val?.map(a => a.value[matchWith])
    } else return val?.map(a => a.value)
}

export const matchValue = (value, selected, matchWith) => {
    if (typeof value === "object") {
        return String(value[matchWith]) === String(selected)
    } else {
        return String(value) === String(selected)
    }
}

export const makeSelectValues = (option = [], value = [], multi = false, matchWith = null, grouped = false, setOption = null) => {
    try {
        let re = []
        if (!multi) {
            re = isValidArray(option) ? option?.find(c => matchValue(c?.value, value, matchWith)) : []
            // log('matchWith', matchWith)
            // log(option, value)
        } else {
            if (value?.length > 0) {
                value?.forEach((v, i) => {
                    let x = []
                    if (grouped) {
                        option?.forEach((q) => {
                            if (isValid(q?.options?.find(a => matchValue(a?.value, v, matchWith)))) {
                                x = q?.options?.find(a => matchValue(a?.value, v, matchWith))
                            }
                        })
                    } else {
                        x = option?.find(a => matchValue(a?.value, v, matchWith))
                    }
                    // log("xzzz", x)
                    // log("option", option)
                    if (x) re.push(x)
                })
            }

        }

        return re
    } catch (error) {
        log("makeSelectValues", error)
        // log(option, value)
        // log(matchWith, multi)
    }

}

export const createConstSelectOptions = (object, hide: (value: any) => boolean = () => false) => {
    const data = []
    for (const [key, value] of Object.entries(object)) {
        if (!hide(value)) {
            data.push({
                label: key,
                value
            })
        }
    }
    return data
}

export const createSelectOptions = (array, label, value = null, icon: IconFn = () => null) => {
    const data = []
    array.forEach((option) => {
        data.push({
            label: option[label],
            value: value ? option[value] : option,
            icon: icon(option)
        })
    })
    return data
}
export const emitAlertStatus = (e, payload = null, eventID: string | symbol = Events.confirmAlert) => {
    Emitter.emit(eventID, { type: e, payload: isValid(payload) ? payload : null })
}

export const createAsyncSelectOptions = (res, page, label, value, setOptions: SetOptionsFn = () => undefined, icon: IconFn = () => null) => {
    const response = res?.data?.data
    let results: any = {}
    if (response?.data?.length > 0) {
        results = {
            ...response,
            data: createSelectOptions(response?.data, label, value, icon)
        }
        setOptions(results?.data)

        return {
            options: results?.data ?? [],
            hasMore: (parseInt(results?.last_page) !== parseInt(results?.current_page)),
            additional: {
                page: page + 1
            }
        }
    } else {
        return {
            options: [],
            hasMore: false
        }
    }
}
export const createAsyncSelectMultiOptions = (res, page, label, value, setOptions: SetOptionsFn = () => undefined, icon: IconFn = () => null) => {
    const response = res?.data?.data
    let results: any = {}
    if (response?.data?.length > 0) {
        results = {
            ...response,
            data: (createSelectOptions(response?.data?.map(a => ({
                ...a,
                xName: `${a?.template_name} | ${a?.dlt_template_id} | ${a?.name}`
            })), label, value))
        }
        setOptions(results?.data)

        return {
            options: results?.data ?? [],
            hasMore: (parseInt(results?.last_page) !== parseInt(results?.current_page)),
            additional: {
                page: page + 1
            }
        }
    } else {
        return {
            options: [],
            hasMore: false
        }
    }
}

export const createAsyncSelectConfigOptions = (res, page, label, value, setOptions: SetOptionsFn = () => undefined, icon: IconFn = () => null) => {
    const response = res?.data?.data
    let results: any = {}
    if (response?.data?.length > 0) {
        results = {
            ...response,
            data: (createSelectOptions(response?.data?.map(a => ({
                ...a,
                xName: `${a?.verified_name} | ${a?.display_phone_number}`
            })), label, value))
        }
        setOptions(results?.data)

        return {
            options: results?.data ?? [],
            hasMore: (parseInt(results?.last_page) !== parseInt(results?.current_page)),
            additional: {
                page: page + 1
            }
        }
    } else {
        return {
            options: [],
            hasMore: false
        }
    }
}
export const createAsyncSelectMultiMessageOptions = (res, page, label, value, setOptions: SetOptionsFn = () => undefined, icon: IconFn = () => null) => {
    const response = res?.data?.data
    let results: any = {}
    if (response?.data?.length > 0) {
        results = {
            ...response,
            data: (createSelectOptions(response?.data?.map(a => ({
                ...a,
                xName: `${a?.template_name} | ${a?.dlt_template_id} | ${a?.name} | ${a?.dlt_message}`
            })), label, value))
        }
        setOptions(results?.data)

        return {
            options: results?.data ?? [],
            hasMore: (parseInt(results?.last_page) !== parseInt(results?.current_page)),
            additional: {
                page: page + 1
            }
        }
    } else {
        return {
            options: [],
            hasMore: false
        }
    }
}

export const createAsyncSelectVoiceTemplateOptions = (res, page, label, value, setOptions: SetOptionsFn = () => undefined, icon: IconFn = () => null) => {
    const response = res?.data?.data
    let results: any = {}
    if (response?.data?.length > 0) {
        results = {
            ...response,
            data: (createSelectOptions(response?.data?.map(a => ({
                ...a,
                xName: `${a?.title} | ${a?.voiceId
                    } | ${a?.file_mime_type
                    }`
            })), label, value))
        }
        setOptions(results?.data)

        return {
            options: results?.data ?? [],
            hasMore: (parseInt(results?.last_page) !== parseInt(results?.current_page)),
            additional: {
                page: page + 1
            }
        }
    } else {
        return {
            options: [],
            hasMore: false
        }
    }
}
export const createAsyncSelectDltOptions = (res, page, label, value, setOptions: SetOptionsFn = () => undefined, icon: IconFn = () => null) => {
    const response = res?.data?.data
    let results: any = {}
    if (response?.data?.length > 0) {
        results = {
            ...response,
            data: (createSelectOptions(response?.data?.map(a => ({
                ...a,
                xName: `${a?.template_name} | ${a?.dlt_template_id} | ${a?.dlt_message}`
            })), label, value))
        }
        setOptions(results?.data)

        return {
            options: results?.data ?? [],
            hasMore: (parseInt(results?.last_page) !== parseInt(results?.current_page)),
            additional: {
                page: page + 1
            }
        }
    } else {
        return {
            options: [],
            hasMore: false
        }
    }
}
export const createAsyncSelectMultiUserOptions = (res, page, label, value, setOptions: SetOptionsFn = () => undefined, icon: IconFn = () => null) => {
    const response = res?.data?.data
    let results: any = {}
    if (response?.data?.length > 0) {
        results = {
            ...response,
            data: (createSelectOptions(response?.data?.map(a => ({
                ...a,
                xName: `${a?.name} | ${a?.username} `
            })), label, value))
        }
        setOptions(results?.data)

        return {
            options: results?.data ?? [],
            hasMore: (parseInt(results?.last_page) !== parseInt(results?.current_page)),
            additional: {
                page: page + 1
            }
        }
    } else {
        return {
            options: [],
            hasMore: false
        }
    }
}
export const createAsyncSelectMultiWaTempOptions = (res, page, label, value, setOptions: SetOptionsFn = () => undefined, icon: IconFn = () => null) => {
    const response = res?.data?.data
    let results: any = {}
    if (response?.data?.length > 0) {
        results = {
            ...response,
            data: (createSelectOptions(response?.data?.map(a => ({
                ...a,
                xName: `${a?.template_name} | ${a?.wa_template_id} | ${a?.message}`
            })), label, value))
        }
        setOptions(results?.data)

        return {
            options: results?.data ?? [],
            hasMore: (parseInt(results?.last_page) !== parseInt(results?.current_page)),
            additional: {
                page: page + 1
            }
        }
    } else {
        return {
            options: [],
            hasMore: false
        }
    }
}
export const createAsyncSelectMultiWaTempNameAndIdOptions = (res, page, label, value, setOptions: SetOptionsFn = () => undefined, icon: IconFn = () => null) => {
    const response = res?.data?.data
    let results: any = {}
    if (response?.data?.length > 0) {
        results = {
            ...response,
            data: (createSelectOptions(response?.data?.map(a => ({
                ...a,
                xName: `${a?.template_name} | ${a?.wa_template_id}`
            })), label, value))
        }
        setOptions(results?.data)

        return {
            options: results?.data ?? [],
            hasMore: (parseInt(results?.last_page) !== parseInt(results?.current_page)),
            additional: {
                page: page + 1
            }
        }
    } else {
        return {
            options: [],
            hasMore: false
        }
    }
}

export const humanFileSize = (bytes, si = false, dp = 1) => {
    const thresh = si ? 1000 : 1024
    if (Math.abs(bytes) < thresh) {
        return `${bytes} B`
    }
    const units = si ? ['Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb'] : ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    let u = -1
    const r = 10 ** dp
    do {
        bytes /= thresh
        ++u
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)
    return `${bytes.toFixed(dp)} ${units[u]}`
}

export const getFIleBinaries = (files = {}) => {
    const re = {}
    for (const [key, val] of Object.entries(files)) {
        re[`file[${key}]`] = val
    }
    return re
}
export const toggleArray = (value, array = [], state: (nextValue: any[]) => void = () => undefined) => {
    const index = array?.findIndex(e => e === value)
    const finalArray = array ?? []
    if (index === -1) {
        finalArray?.push(value)
    } else {
        finalArray?.splice(index, 1)
    }
    // log(finalArray)
    // if (finalArray?.length === 0) {
    //     state(null)
    // } else {
    state([...finalArray])
    // }
}

export const fastLoop = (array, change: (item: any, index: number) => void = () => undefined) => {
    const theArray = array ?? []
    const arrayLength = theArray.length
    let x = 0
    while (x < arrayLength) {
        const arr = theArray[x]
        change(arr, x)
        x++
    }
}

export const SpaceTrim = (str) => {
    return /^\s*$/.test(str)

}

export const decrypt = (text) => {
    // The local backend returns public settings directly; legacy shared-key decoding is retired.
    return text
}
export const changeConnectedUsersResponse = (data) => {
    const r = []
    if (isValid(data)) {
        const a = data
        const x = Object.entries(a)
        for (const [key, val] of x) {
            const user = key
            const ids = Object.entries(val)?.map(a => a[1])?.length > 0
            if (ids) {
                r.push(parseInt(user))
            }
        }
        // log("x", x)
    }
    // log("r", r)

    return r
}

export const truncateText = (text = "", char = 200) => {
    if (isValid(text)) {
        return String(text).substring(0, char) + (String(text)?.length > char ? "..." : "")
    } else {
        return null
    }
}


export const changeUserResponse = (chat, contacts, user, add = false) => {
    const u = []
    let um = 0
    fastLoop(chat, (d, i) => {
        um += d?.unread_messages_count
        if (d?.sender_id === user?.id) {
            u[i] = {
                id: d?.receiver?.id,
                fullName: d?.receiver?.name,
                role: d?.receiver?.user_type?.name,
                about: '',
                avatar: d?.receiver?.avatar,
                status: 'offline',
                chat: {
                    id: d?.receiver?.id,
                    unseenMsgs: !add ? d?.unread_messages_count : 0,
                    lastMessage: {
                        time: d?.updated_at,
                        message: d?.message
                    }
                }
            }
        } else {
            u[i] = {
                id: d?.sender?.id,
                fullName: d?.sender?.name,
                role: d?.sender?.user_type?.name,
                about: '',
                avatar: d?.sender?.avatar,
                status: 'offline',
                chat: {
                    id: d?.sender?.id,
                    unseenMsgs: !add ? d?.unread_messages_count : 0,
                    lastMessage: {
                        time: d?.updated_at,
                        message: d?.message
                    }
                }
            }
        }
    })
    const c = []

    fastLoop(contacts, (d, i) => {
        um += d?.unread_messages_count
        if (d?.unread_messages_count > 0) {
            u[i] = {
                id: d?.id,
                fullName: d?.name,
                role: d?.user_type?.name,
                about: '',
                avatar: d?.avatar,
                status: 'offline',
                chat: {
                    id: d?.id,
                    unseenMsgs: d?.unread_messages_count,
                    lastMessage: d?.message ?? null
                }
            }
        }
        c[i] = {
            id: d?.id,
            fullName: d?.name,
            role: d?.user_type?.name,
            about: '',
            avatar: d?.avatar,
            status: 'offline',
            chat: {
                id: d?.id,
                unseenMsgs: d?.unread_messages_count,
                lastMessage: d?.message ?? null
            }
        }

    })
    return {
        chatsContacts: u,
        contacts: c,
        unread_messages_count: um,
        profileUser: {

        }
    }
}

export const getChatResponse = (payload, chats) => {
    const messages = payload?.data?.data
    const user = payload?.user
    const update = payload?.update ?? false
    const m = update ? chats : []

    fastLoop(messages?.data, (d, i) => {
        if (update) {
            m.unshift({
                id: d?.id,
                time: new Date(d?.created_at),
                message: d?.message,
                senderId: d?.sender_id,
                ...d
            })
        } else {
            m[i] = {
                id: d?.id,
                time: new Date(d?.created_at),
                message: d?.message,
                senderId: d?.sender_id,
                ...d
            }
        }
    })

    return {
        chat: {
            id: user?.id,
            userId: user?.id,
            unseenMsgs: 0,
            chat: m,
            ...messages,
            data: null
        },
        contact: {
            ...user
        }
    }
}
export const IsJsonString = (str) => {
    try {
        JSON.parse(str)
    } catch (e) {
        return false
    }
    return true
}
export const JsonParseValidate = (data, ret = null) => {
    if (data && IsJsonString(data)) {
        const json = JSON.parse(data)
        if (typeof json === "object") {
            return json
        } else {
            return ret
        }
    } else {
        return ret
    }
}

// check if password contain at least one lowercase letter or one uppercase letter or one numeric digit or and one special character and is eight characters or longer, check if any three of the four conditions are met
export const checkPassword = (password) => {
    const lowerCaseLetters = /[a-z]/g
    const upperCaseLetters = /[A-Z]/g
    const numbers = /[0-9]/g
    const specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g
    const re = []
    const p = String(password)

    // const length = roleName === 'Admin' ? 15 : 8

    if (p.length >= 8) {
        // check if p contain at least one lowercase letter
        re.push(p.match(lowerCaseLetters))
        // check if p contain at least one uppercase letter
        re.push(p.match(upperCaseLetters))
        // check if p contain at least one numeric digit
        re.push(p.match(numbers))
        // check if p contain at least one special character
        re.push(p.match(specialCharacters))
    } else {
        return false
    }
    // check if any three of the four conditions are met
    return re.filter((e) => e).length >= 3
}

// const generatePassword = async () => {
//     // const length = roleName === 'Admin' ? 15 : 8

//     // const randomPassword = String(encrypt(new Date().getTime().toString())).replaceAll('=', '')
//     const randomPassword = generatePasswordAx(length)

//     if (checkPassword(randomPassword)) {
//         setPassword(randomPassword)
//         setValue('password', randomPassword)
//         setValue('confirm_password', randomPassword)
//     } else {
//         generatePassword()
//     }
//     navigator?.clipboard
//         ?.writeText(randomPassword)
//         .then((e) => {
//             toast('Password copied to your clipboard')
//         })
//         .catch((e) => {
//             toast.error('Password could not be copied to your clipboard')
//         })
// }

export const addDay = (d, day) => {
    const someDate = new Date(d)
    const numberOfDaysToAdd = day
    const result = someDate.setDate(someDate.getDate() + numberOfDaysToAdd)
    return result
}
export const minusDay = (d, day) => {
    const someDate = new Date(d)
    const numberOfDaysToAdd = day
    const result = someDate.setDate(someDate.getDate() - numberOfDaysToAdd)
    return result
}


export const findVariables = (str) => {
    if (typeof str !== "string") return null
    const re = str?.match(/{{(.*?)}}/g)
    return re
}

export const findName = (str) => {
    // find COPY_CODE in the string
    const re = str?.match(/COPY_CODE/g)
    return re
}

// https://newrise.in/{{1}} find variables 
// export const findVariablesIndex = (str) => {
//     const re = str?.match(/{{(.*?)}}/g)
//     const re1 = re?.map((e) => e?.replace("{{", "").replace("}}", ""))
//     return re1
// }

export const replaceVariables = (str, data) => {
    let re = str
    const variables = findVariables(str)
    if (isValidArray(variables)) {
        variables.forEach((e) => {
            const index = e?.replace("{{", "").replace("}}", "")
            re = re.replace(e, data[index])
        })
    }
    return re
}

// write a method to convert snake case to Plain text

export const convertSnakeToPlainText = (str) => {
    const re = str?.replace(/_/g, " ")
    return capitalize(re)
}

// convert snake case to normal case
// export const convertSnakeCaseToNormalText = (str) => {
//     const re = str?.replace(/_/g, " ")
//     return re
// }

// export const convertToCamelCase = (data) => {
// export const convertToCamelCase = (data) => {
//     const re = {}
//     for (const [key, value] of Object.entries(data)) {
//         re[key.replace(/_/g, " ")] = value
//     }
//     return re
// }
export const fetchMessage = (user, data, dispatch: (action: any) => void = () => undefined, chats = [], selected = null) => {
    log("fm", data)
    if (data?.command === "message") {
        if (data?.from === user?.id) {
            // message sent
            if (chats?.findIndex(a => a.id === data?.id) === -1) {
                dispatch(sendMessageSelected({
                    id: data?.id,
                    message: data?.message,
                    time: new Date(data?.created_at),
                    senderId: data?.from,
                    ...data
                }))
            }
        } else {
            // message received
            if (selected?.id) {
                if (chats?.findIndex(a => a.id === data?.id) === -1 && isValid(selected?.id) && selected?.id === data?.from) {
                    dispatch(receiveMessageSelected({
                        id: data?.id,
                        message: data?.message,
                        time: new Date(data?.created_at),
                        senderId: data?.from,
                        ...data
                    }))
                }
            }
        }
    }
}
