// @ts-nocheck
// import { useTranslation } from 'react-i18next'
// import i18n from '../../configs/i18n'
// import i18next from 'i18next'

export const log = (...log) => {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        console.log(...log)
    } else {
        return false
    }
}

export const isValid = (val, extra = null) => {
    let r = true
    if (val === null) {
        r = false
    } else if (val === undefined) {
        r = false
    } else if (val === "") {
        r = false
    } else if (val === extra) {
        r = false
    } else if (val === "null") {
        r = false
    }
    return r
}

export const removeDuplicates = (data = []) => {
    // Create an array of objects

    const jsonObject = data.map(JSON.stringify)

    const uniqueSet = new Set(jsonObject)
    return Array.from(uniqueSet).map(JSON.parse)


}
export const isValidArray = (val = []) => {
    if (isValid(val)) {
        if (typeof val === "object") {
            return val?.length > 0
        }
    }
    return false
}

/**
 * Translate
 * @param {*} id
 * @param {*} values
 * @param {*} create
 * @returns
 */
// export const FM = (id, values) => {

//     if (values === null) values = {}
//     return i18n.t(id, { ...values })

// }

export const capitalize = (str, lower = false) => (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase())

export const getInitials = (name) => {
    name = capitalize(name)
    const rgx = new RegExp(/(\p{L}{1})\p{L}+/, 'gu')

    let initials = [...name.matchAll(rgx)] || []

    initials = (
        (initials.shift()?.[1] || '') + (initials.pop()?.[1] || '')
    ).toUpperCase()
    return initials
}

/**
 * Create Ability
 */
export const createAbility = (permissions = []) => {
    let abilities = [
        {
            subject: "profile",
            action: "profile-browse"
        },
        {
            subject: "profile",
            action: "profile-edit"
        }
    ]
    if (isValid(permissions)) {
        abilities = [
            ...abilities,
            ...permissions
        ]
    }
    // log(permissions, abilities)
    return abilities
}

// export const FM = (id, values) => {

//     if (values === null) values = {}
//     return i18n.t(id, { ...values })


// }

export const FM = (id, values) => {
    return id
}

export function renderTextWithFormatting(text) {
    if (!text) return ''
    // Replace bold text markers
    text = text.replace(/\*(.*?)\*/g, '<b>$1</b>')

    // Replace italic text markers
    text = text.replace(/_(.*?)_/g, '<i>$1</i>')

    // Replace strike-through text markers
    text = text.replace(/~(.*?)~/g, '<strike>$1</strike>')

    // Replace code/pre-formatted text markers
    text = text.replace(/```(.*?)```/g, '<code>$1</code>')

    return text
}

// write a function to count the number of words and also trim extra spaces between words
export function countWords(str) {
    if (!str) return ''
    str = str.replace(/\s+/g, ' ').trim()
    return str.split(' ').length
}

// write a function to count the number of characters and also trim extra spaces between letters
export function countCharacters(str) {
    if (!str) return ''

    str = str.replace(/\s+/g, ' ').trim()
    return str.length
}

// write a function to restrict the number of characters and also trim extra spaces between letters
export function restrictCharacters(str, limit) {
    if (!str) return ''
    str = str.replace(/\s+/g, ' ').trim()
    return str.slice(0, limit)
}

export function formatIndianNumber(number) {
    return number.toLocaleString('en-IN')
}

export function formatIndianNumberWithDecimals(number) {
    return number.toLocaleString('en-IN', { maximumFractionDigits: 20 })
}
