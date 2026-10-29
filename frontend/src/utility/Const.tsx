/* eslint-disable no-undef */
export const WebAppVersion = Object.freeze({
    current: "0.0.1"
})

export const entryPoint = `web-${WebAppVersion.current}`


export const Events = Object.freeze({
    Unauthenticated: "Unauthenticated",
    reactSelect: "reactSelect",
    RedirectMessage: "goToMessage",
    RedirectNotification: "goToNotification",
    created: "created",
    updated: "updated",
    deleted: "deleted",
    approved: "approved",
    assigned: "assigned",
    stampIn: "stampIn",
    stampOut: "stampOut",
    leaveRequest: "leaveRequest",
    leaveApproved: "leaveApproved",
    bankIdVerification: "bankIdVerification",
    emergency: "emergency",
    completed: "completed",
    request: "request",
    confirmAlert: "confirmAlert"
})

export const CMD = Object.freeze({
    getContacts: "getusers",
    connectedUsers: "connectedusers",
    getChats: "getuserwithmessage",
    getMessages: "getmessages",
    message: "message",
    readMessages: "readmessages",
    wa_chatbot_update: "wa_chatbot_update"
})

export const IconSizes = Object.freeze({
    InputAddon: 16,
    HelpIcon: 12,
    MenuVertical: 22,
    CardListIcon: 15
})

export const validityPeriodOptions = Object.freeze({
    "30 seconds": 30,
    "1 minute": 60,
    "2 minutes": 120,
    "3 minutes": 180,
    "5 minutes": 300,
    "10 minutes": 600,
    "15 minutes": 900
})

export const callingStatusConst = Object.freeze({
    Enabled: 'ENABLED',
    Disabled: 'DISABLED'
})
export const iconVisibilIty = Object.freeze({
    Default: 'DEFAULT',
    'Disabled All': "DISABLE_ALL"

})

export const Months = Object.freeze({
    January: "January",
    February: "February",
    March: "March",
    April: "April",
    May: "May",
    June: "June",
    July: "July",
    August: "August",
    September: "September",
    October: "October",
    November: "November",
    December: "December"
})


export const getUserMonthlyReportMessageType = Object.freeze({
    Exempted: "Exempted",
    "Non Exempted": "Non Exempted"
})

export const getYearList = () => {
    const year = new Date().getFullYear()
    const array = Array.from(new Array(2), (val, index) => year - index)

    const re = []
    array.forEach((a) => {
        re.push({ label: a, value: a })
    })

    return re
}


export const Patterns = Object.freeze({
    AlphaOnly: /^[a-zA-Z ]*$/,
    AlphaOnlyNoSpace: /^[a-zA-Z]*$/,
    AlphaNumericOnlyNoSpace: /^[a-zA-Z0-9]*$/,
    AlphaNumericOnly: /^[a-zA-Z0-9 ]*$/,
    NumberOnly: /^\d+(\.\d{1,2})?$/,
    NumberOnlyNoDot: /^[0-9]*$/,
    EmailOnly: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    Password: /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{6,16}$/
})

export const PrimaryAction = Object.freeze({
    status: 1
})
export const Applicable = Object.freeze({
    "Refund Applicable": "refund_applicable",
    "Retry Applicable": "retry_applicable"
})

export const ParameterFormat = Object.freeze({
    Positional: "POSITIONAL",
    Named: "NAMED"
})

export const Granularity = Object.freeze({
    Month: "MONTH",
    Day: "DAY",
    'Half Hour': "HALF_HOUR"
})
export const ConversationGranularity = Object.freeze({
    Monthly: "MONTHLY",
    Daily: "DAILY",
    'Half Hour': "HALF_HOUR"
})

export const Metrics = Object.freeze({
    Cost: "cost",
    Clicked: "clicked",
    Delivered: "delivered",
    Read: "read",
    Sent: "sent"
})

export const AuthorityType = Object.freeze({
    "On Delivered": 1,
    "On Submission": 2
})
export const UserType = Object.freeze({
    Admin: "0",
    Reseller: "1",
    Client: "2",
    Employee: "3"
})
export const createUserType = Object.freeze({
    // Admin: "0",
    Reseller: 1,
    Client: 2,
    Employee: 3
})
export const forResellerUserType = Object.freeze({
    // Admin: "0",
    // Reseller: "1",
    Client: "2"
    // Employee: "3"
})
export const priority = Object.freeze({
    Normal: "0",
    Medium: "1",
    Fast: "2",
    Instant: "3"
})
export const accountType = Object.freeze({
    Prepaid: 1,
    Postpaid: 2
})

export const activeStatus = Object.freeze({
    Active: 1
})

export const status = Object.freeze({
    Active: "1",
    InActive: "0"
})
// export const activeStatuss = Object.freeze({
//     Active: "1",
//     InActive: "0"
// })

// transaction, 2:promotional, 3:two_waysms, 4:voice_sms

// credit_type: 1:credit, 2:debit
export const actionFor = Object.freeze({
    Transaction: "1",
    Promotional: "2",
    " Two Way Sms": "3",
    Voice: "4",
    Whatsapp: "5"
})


export const creditType = Object.freeze({
    Credit: "1",
    Debit: "2"
})
export const smsType = Object.freeze({
    "Normal SMS": "1",
    "Custom SMS": "2"
})

export const routeType = Object.freeze({
    Transaction: "1",
    Promotional: "2",
    " Two Way Sms": "3",
    Voice: "4"
})

export const smsPriority = Object.freeze({
    High: "1",
    Normal: "0"
})

export const isUnique = Object.freeze({
    Yes: "1",
    No: "0"
})

export const isType = Object.freeze({
    Completed: 1,
    "Date Wise": 2
})

export const rescheduleType = Object.freeze({
    ALL: "ALL",
    Pending: "Pending",
    Failed: "FAILED",
    Accepted: "Accepted",
    Delivered: "DELIVRD"
})

export const onlyCampaign = Object.freeze({
    Yes: "yes",
    No: "no"
})


export const userPriorityForAdmin = Object.freeze({
    Normal: 0,
    Medium: 1,
    High: 2,
    "Instant(OTP)": 3
})

export const ratioType = Object.freeze({
    "Resubmit Pending SMS by Queue ID": "resubmit_pending_sms",
    "Queue Accept To Delivered": "queue_accept_to_deliverd",
    "History Accept To Delivered": "history_accept_to_deliverd",
    "Queue Pending To Delivered": "queue_pending_to_deliverd",
    "History Pending To Delivered": "history_pending_to_deliverd",
    "Queue Accept To Failed": "queue_accept_to_failed",
    "History Accept To Failed": "history_accept_to_failed",
    "Queue Pending To Failed": "queue_pending_to_failed",
    "History Pending To Failed": "history_pending_to_failed",
    "Resend All Campaign Auto Deliver": "resend_all_campaign_auto_deliver",
    "Update Auto Status": "update_auto_status",
    "Resend Campaign Not Yet Deliver Number OR Not Submitted Yet": "resend_campaign_not_yet_deliver_number",
    "Apply Ratio": "apply_ratio",
    "History update accepted to actual status final ack": "history_update_accepted_to_actual_status_final_ack",
    "Queue update accepted to actual status final ack": "queue_update_accepted_to_actual_status_final_ack"
})

export const voiceRatioType = Object.freeze({
    "Queue process to answered": "queue_process_to_answered",
    "History process to answered": "history_process_to_answered",
    "Queue process to failed": "queue_process_to_failed",
    "History process to failed": "history_process_to_failed",
    "Resend all campaign auto deliver": "resend_all_campaign_auto_deliver",
    "Update auto status": "update_auto_status",
    "Apply ratio": "apply_ratio"
})

export const zeroOne = Object.freeze({
    Yes: 1,
    No: 0
})
export const messageType = Object.freeze({
    English: 1,
    Unicode: 2
})
export const trueFalse = Object.freeze({
    Yes: 1,
    No: 0
})

export const trueOrFalse = Object.freeze({
    Yes: true,
    No: false
})

export const senderIdMessageType = Object.freeze({
    Transactional: 1,
    Promotional: 2
})

export const trueFalseFilter = Object.freeze({
    Yes: 1,
    No: "no"
})
export const activeInactiveFilter = Object.freeze({
    Active: 1,
    InActive: "no"
})
export const scheduleCampaignFilter = Object.freeze({
    "Normal Campaign": "no",
    "Schedule Campaign": 1
})
export const statusCode = Object.freeze({
    success: "success",
    info: "info",
    warning: 'warning',
    danger: "danger",
    error: "error"

})

export const docType = Object.freeze({
    // Image: "1",
    // Audio: "2",
    // Video: "3",
    YouTube: "4",
    Iframe: "5"
})

export const integrateResponse = Object.freeze({
    No: 0,
    "Yes Interest Button": 1,
    "Yes Contact/Feedback Form": 2,
    "Yes Rating Form": 3
})

export const transceiverMode = Object.freeze({
    "TRX Only": 1,
    "TXRX Only": 0
})
// export const transceiverMode = Object.freeze({
//     "TXRX Only": 0,
//     "TRX Only": 1
// })

export const gatewayType = Object.freeze({
    Transactional: 1,
    Promotional: 2,
    Voice: 4
})

export const templateType = Object.freeze({
    Authentication: "Authentication",
    Utility: "Utility",
    Marketing: "Marketing"
})
export const textType = Object.freeze({
    None: "None",
    Text: "Text",
    Media: "Media"
})

export const urlType = Object.freeze({
    Static: "static",
    Dynamic: "dynamic"
})
export const categoryType = Object.freeze({
    Marketing: "Marketing",
    Utility: "Utility",
    Authentication: "Authentication"
})

export const marketingTypes = Object.freeze({
    Custom: "custom",
    "Product Message": "product_message"
})
export const ProductMessageTypes = Object.freeze({
    "Catalog Message": "catalog_message",
    "Multi Product Message": "multi_product_message"
})

export const buttonActions = Object.freeze({
    "Marketing opt-opt": "marketing_opt_opt",
    Custom: "QUICK_REPLY",
    "Visit Website": "URL",
    "Call Phone Number": "PHONE_NUMBER",

    "Copy offer code": "copy_offer_code"
})
export const callToAction = Object.freeze({
    "Visit Website": "visit_website",
    "Call phone number": "call_phone_number",
    "Copy offer code": "copy_offer_code"
})

export const whatsappFileType = Object.freeze({
    Image: "image",
    Video: "video",
    Document: "document",
    Audio: "audio"
})
export const uploadFrom = Object.freeze({
    "File Url": "file_url",
    Local: "local"
})

export const QrType = Object.freeze({
    Svg: "SVG",
    Png: "PNG"
})
export const ConversationCategories = Object.freeze({
    Authentication: "AUTHENTICATION",
    Marketing: "MARKETING",
    Service: "SERVICE",
    Utility: "UTILITY"
})

export const ConversationDirections = Object.freeze({
    Unknown: "UNKNOWN",
    'Business Initiated': "BUSINESS_INITIATED",
    'User Initiated': "USER_INITIATED"
})
export const Dimensions = Object.freeze({
    'Conversation Category': "CONVERSATION_CATEGORY",
    'Conversation Direction': "CONVERSATION_DIRECTION",
    'Conversation Type': "CONVERSATION_TYPE",
    Country: "COUNTRY",
    Phone: "PHONE"

})
export const ConversationTypes = Object.freeze({
    'Free Entry Point': "FREE_ENTRY_POINT",
    'Free Tier': "FREE_TIER",
    Regular: "REGULAR",
    Unknown: "UNKNOWN"
})


export const whatsAppLanguages = Object.freeze({
    Afrikaans: "af",
    Albanian: "sq",
    Arabic: "ar",
    Azerbaijani: "az",
    Bengali: "bn",
    Bulgarian: "bg",
    Catalan: "ca",
    "Chinese (CHN)": "zh_CN",
    "Chinese (HKG)": "zh_HK",
    "Chinese (TAI)": "zh_TW",
    Croatian: "hr",
    Czech: "cs",
    Danish: "da",
    Dutch: "nl",
    English: "en",
    "English (UK)": "en_GB",
    "English (US)": "en_US",
    Estonian: "et",
    Filipino: "fil",
    Finnish: "fi",
    French: "fr",
    Georgian: "ka",
    German: "de",
    Greek: "el",
    Gujarati: "gu",
    Hausa: "ha",
    Hebrew: "he",
    Hindi: "hi",
    Hungarian: "hu",
    Indonesian: "id",
    Irish: "ga",
    Italian: "it",
    Japanese: "ja",
    Kannada: "kn",
    Kazakh: "kk",
    Kinyarwanda: "rw_RW",
    Korean: "ko",
    "Kyrgyz (Kyrgyzstan)": "ky_KG",
    Lao: "lo",
    Latvian: "lv",
    Lithuanian: "lt",
    Macedonian: "mk",
    Malay: "ms",
    Malayalam: "ml",
    Marathi: "mr",
    Norwegian: "nb",
    Persian: "fa",
    Polish: "pl",
    "Portuguese (BR)": "pt_BR",
    "Portuguese (POR)": "pt_PT",
    Punjabi: "pa",
    Romanian: "ro",
    Russian: "ru",
    Serbian: "sr",
    Slovak: "sk",
    Slovenian: "sl",
    Spanish: "es",
    "Spanish (ARG)": "es_AR",
    "Spanish (SPA)": "es_ES",
    "Spanish (MEX)": "es_MX",
    Swahili: "sw",
    Swedish: "sv",
    Tamil: "ta",
    Telugu: "te",
    Thai: "th",
    Turkish: "tr",
    Ukrainian: "uk",
    Urdu: "ur",
    Uzbek: "uz",
    Vietnamese: "vi",
    Zulu: "zu"

})
