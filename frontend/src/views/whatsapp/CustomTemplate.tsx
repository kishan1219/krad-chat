// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, FileText, Image, MapPin, PlayCircle, Plus, Trash2, Video, X } from 'react-feather'
import { useFieldArray, useForm } from 'react-hook-form'
import CreatableSelect from 'react-select/creatable'
import {
    Alert,
    Badge,
    Button, Card, CardBody, CardHeader, Col,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Form, Input,
    InputGroup, InputGroupText,
    Label,
    Row,
    UncontrolledButtonDropdown
} from 'reactstrap'
import { ParameterFormat, ProductMessageTypes, buttonActions, callToAction, categoryType, marketingTypes, textType, urlType, validityPeriodOptions } from '../../utility/Const'
import Show from '../../utility/Show'
import { ErrorToast, createAsyncSelectConfigOptions, createAsyncSelectMultiUserOptions, createConstSelectOptions } from '../../utility/Utils'
import FormGroupCustom from '../components/formGroupCustom'
import BsTooltip from '../components/tooltip'
import SlideDown from '@components/slide-down'
// import Image from '@mui/icons-material/Image'
import TipsAndUpdates from '@mui/icons-material/TipsAndUpdates'
import Hide from '../../utility/Hide'
import { countCharacters, isValidArray, log, renderTextWithFormatting } from '../../utility/helpers/common'
// ** styles
import ContentCopy from '@mui/icons-material/ContentCopy'
import { useNavigate } from 'react-router-dom'
import '../../assets/scss/style.scss'
import { loadUserChild } from '../../utility/apis/userManagement'
import { addCustomTemplate, loadWhatsappConfig } from '../../utility/apis/whatsappConfig'
import { uploadTemplateMedia } from '../../utility/apis/whatsappMedia'
import { getWhatsappTemplateLanguage } from '../../utility/apis/whatsappTemplate'
import useUser from '../../utility/hooks/useUser'
import LoadingButton from '../components/buttons/LoadingButton'
import Header from '../components/header'
import { Cancel, DoNotDisturbAlt } from '@mui/icons-material'

//TODO : add comma seperated values for message variables

const CustomTemplate = () => {

    const form = useForm()
    // const location = useLocation()
    // const { data } = location.state
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError, getValues } = form
    const [headerType, setHeaderType] = useState(0)
    const [marketingType, setMarketingType] = useState(0)
    // const [templateText, setTemplateText] = useState(null)
    // const [messageText, setMessageText] = useState(null)
    const [namedMessageText, setNamedMessageText] = useState(null)
    // const [namedHeaderText, setNamedHeaderText] = useState(null)
    // const [nameText, setNameText] = useState(null)
    const [urlText, setUrlText] = useState(null)
    const [headerText, setHeaderText] = useState(null)
    const [bodyText, setBodyText] = useState(null)
    const [footerText, setFooterText] = useState(null)
    const [buttonText, setButtonText] = useState(null)
    const [typeOfCategory, setTypeOfCategory] = useState(0) // [0: marketing, 1: utility, 2: authentication

    // log('data is', isValid(data))
    // count the length of the message and strict the length to 60
    const [content, setContent] = useState('')
    const [prev, setPrev] = useState('')
    const [length, setLength] = useState(0)
    const [maxLength, setMaxLength] = useState(60)
    const [open, setOpen] = useState('1')
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [renderHeaderText, setRenderHeaderText] = useState('')
    const [renderNamedHeaderText, setRenderNamedHeaderText] = useState('')
    const [renderBodyText, setRenderBodyText] = useState('')
    const [renderNamedBodyText, setRenderNamedBodyText] = useState('')
    const [uploaded, setUploaded] = useState(null)
    const [templateVariables, setTemplateVariables] = useState({})
    const [messageVariables, setMessageVariables] = useState({})
    const [messageNamedVariables, setMessageNamedVariables] = useState({})
    // const [headerNamedVariables, setHeaderNamedVariables] = useState({})
    const [urlVariables, setUrlVariables] = useState({})
    const [totalHeaderCount, setTotalHeaderCount] = useState(60)
    const [totalBodyCount, setTotalBodyCount] = useState(1024)
    const [totalFooterCount, setTotalFooterCount] = useState(60)
    // const [callAction, setCallAction] = useState(null)
    const [quickReply, setQuickReply] = useState(0)
    const [controller, setController] = useState(new AbortController())
    const [avatar, setAvatar] = useState('')
    const [loadLanguage, setLoadLanguage] = useState(null)
    const user = useUser()
    const [loadUser, setLoadUser] = useState(null)
    const [loadConfig, setLoadConfig] = useState(null)
    const [tags, setTags] = useState([])
    const [tagOptions, setTagOptions] = useState([])
    const [tagInputValue, setTagInputValue] = useState('')

    const [codeDeliveryOption, setCodeDeliveryOption] = useState('zero_tap')
    const [zeroTapCheckboxChecked, setZeroTapCheckboxChecked] = useState(false)
    const [zeroTapCheckboxError, setZeroTapCheckboxError] = useState(false)
    const [appSetupFields, setAppSetupFields] = useState([{ packageName: '', signatureHash: '' }])
    const [appSetupErrors, setAppSetupErrors] = useState([])

    const [addSecurityRecommendationChecked, setAddSecurityRecommendationChecked] = useState(false)
    const [addExpiryTimeChecked, setAddExpiryTimeChecked] = useState(false)
    const [setCustomValidityPeriod, setSetCustomValidityPeriod] = useState(false)
    const [validityPeriod, setValidityPeriod] = useState('10 minutes')
    const [expiresInMinutes, setExpiresInMinutes] = useState('') // Initial value from image
    const [expiresInMinutesError, setExpiresInMinutesError] = useState('')

    // count the numbers of times button is clicked
    const [buttonCount, setButtonCount] = useState(0)


    const buttonClick = () => {
        setButtonCount(buttonCount + 1)
    }

    const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
        control: form.control, // control props comes from useForm (optional: if you are using FormContext)
        name: "header_variable" // unique name for your Field Array
    })
    const { fields: namedHeader, append: namedHeaderAppend } = useFieldArray({
        control: form.control, // control props comes from useForm (optional: if you are using FormContext)
        name: "header_named_variable" // unique name for your Field Array
    })
    const { fields: bodyVal, append: bodyAppend, prepend: bodyValss, remove: bodyRemove, swap: bodyValssss, move: bodyVale, insert: bodyValw } = useFieldArray({
        control: form.control, // control props comes from useForm (optional: if you are using FormContext)
        name: "message_variable" // unique name for your Field Array
    })
    const { fields: nameMessage, append: namedMessageAppend, prepend: namedMessageValss, remove: namedMessageRemove, swap: namedMessageValssss, move: namedMessageVale, insert: namedMessageValw } = useFieldArray({
        control: form.control, // control props comes from useForm (optional: if you are using FormContext)
        name: "named_message_variable" // unique name for your Field Array
    })

    const { fields: marketing, append: marketingAppend, prepend: marketingPrepend, remove: marketingRemove, swap: marketingSwap, move: marketingMove, insert: marketingInsert } = useFieldArray({
        control: form.control, // control props comes from useForm (optional: if you are using FormContext)
        name: "market" // unique name for your Field Array
    })
    const { fields: custom, append: customAppend, prepend: customPrepend, remove: customRemove, swap: customSwap, move: customMove, insert: customInsert } = useFieldArray({
        control: form.control, // control props comes from useForm (optional: if you are using FormContext)
        name: "template_buttons" // unique name for your Field Array,
    })

    const { fields: footer, append: footerAppend, prepend: footerPrepend, remove: footerRemove, swap: footerSwap, move: footerMove, insert: footerInsert } = useFieldArray({
        control: form.control, // control props comes from useForm (optional: if you are using FormContext)
        name: "button_variables" // unique name for your Field Array,
    })

    const whatsappTemplateLanguage = () => {
        getWhatsappTemplateLanguage({
            loading: setLoading,
            success: (d) => {
                const drop = []
                const object = d
                // log('object', object)
                for (const key in object) {
                    if (Object.hasOwnProperty.call(object, key)) {
                        const element = object[key]
                        drop.push({ value: element, label: key })
                    }
                }
                setLoadLanguage(drop)
            }

        })
    }

    useEffect(() => {
        whatsappTemplateLanguage()
    }, [])

    const getHeaderType = (headerType) => {
        if (watch('template_type' === 'Media') && headerType === 0) {
            return 'IMAGE'
        } else if (watch('template_type' === 'Media') && headerType === 1) {
            return 'VIDEO'
        } else if (watch('template_type' === 'Media') && headerType === 2) {
            return 'DOCUMENT'
        } else if (watch('template_type' === 'Media') && headerType === 3) {
            return 'LOCATION'

        } else if (watch('template_type' === 'Media') && headerType === 4) {
            return 'VIDEO'
        }

    }
    const FileHeaderType = (headerType) => {
        if (watch('template_type' === 'Media') && headerType === 0) {
            return 'image'
        } else if (watch('template_type' === 'Media') && headerType === 1) {
            return 'video'
        } else if (watch('template_type' === 'Media') && headerType === 2) {
            return 'document'
        } else if (watch('template_type' === 'Media') && headerType === 3) {
            return 'location'

        } else if (watch('template_type' === 'Media') && headerType === 4) {
            return 'audio'
        }

    }

    useEffect(() => {
        if (fields.length === 1) {
            append({ value: '' })
        }
    }, [])
    useEffect(() => {
        if (namedHeader.length === 1) {
            namedHeaderAppend({ value: '' })
        }
    }, [])

    useEffect(() => {
        if (bodyVal.length === 1) {
            bodyAppend({ value: '' })
        }
    }, [])
    useEffect(() => {
        if (nameMessage.length === 1) {
            namedMessageAppend({ param_name: "", example: "" })
        }
    }, [])

    // useEffect(() => {
    //     if (footer.length === 1) {
    //         footerAppend({ value: '' })
    //     }
    // }, [])

    useEffect(() => {
        if (marketing.length === 1) {
            marketingAppend({ value: '' })
        }
    }, [])

    useEffect(() => {
        if (custom.length === 1) {
            customAppend({ value: '' })
        }
    }, [])


    const csvRef = useRef()

    // const onSubmit = (data, file) => {
    //     // addCustomTemplate({
    //     //     jsonData: {
    //     //         ...data,
    //     //         template_name: String(data.template_name).toLowerCase().replaceAll(' ', '_'),
    //     //         header_handle: file,
    //     //         user_id: user?.userType === 2 ? user?.id : data?.user_id,
    //     //         button_action: quickReply === 1 ? 1 : quickReply === 2 ? 0 : null,
    //     //         // header_text: watch('template_type') === 'Text' ?   renderHeaderText : null,
    //     //         header_variable: data?.header_variable?.map((item) => item.value).join(','),
    //     //         message_variable: data?.message_variable?.map((item) => item.value).join(','),
    //     //         media_type: watch('template_type') === 'Media' ? getHeaderType(headerType) : data?.media_type
    //     //         // media_type: headerType === 0 ? 'IMAGE' : headerType === 1 ? 'VIDEO' : headerType === 2 ? 'DOCUMENT' : headerType === 3 ? 'location' : null
    //     //     },
    //     //     loading: setLoading,
    //     //     success: () => {
    //     //         navigate(-1)
    //     //         // setResetIt(new Date())
    //     //         // reset()
    //     //     },
    //     //     errors: (e) => {
    //     //         const d = e?.data?.data
    //     //         for (const key in d) {
    //     //             if (Object.hasOwnProperty.call(d, key)) {
    //     //                 if (isValidArray(d[key])) {
    //     //                     const message = d[key]?.map(a => `${a} \n`)
    //     //                     setError(key, { message, type: "validate" })
    //     //                 }
    //     //             }
    //     //         }

    //     //     }
    //     // })

    //     console.log(data, "submit data")
    // }

    const otpType = () => {

    }

    const onSubmit = (data, file) => {
        const finalTemplateButtons = []
        const additionalAuthFields = {}
        let finalButtonAction = quickReply === 1 ? 1 : quickReply === 2 ? 0 : null

        if (watch('category') === 'Authentication') {
            const otpButton = {
                type: "otp",
                otp_type: codeDeliveryOption,

                text: codeDeliveryOption === 'copy_code' ? 'Copy Code' : codeDeliveryOption === 'zero_tap' ? 'One Tap' : 'One Tap'
                // autofill_text:  "Autofill"
            }

            if (codeDeliveryOption === 'zero_tap') {
                otpButton.zero_tap_terms_accepted = String(zeroTapCheckboxChecked)
                otpButton.supported_apps = appSetupFields.map(app => ({
                    package_name: app.packageName,
                    signature_hash: app.signatureHash
                }))
            }

            if (codeDeliveryOption === 'one_tap') {
                otpButton.supported_apps = appSetupFields.map(app => ({
                    package_name: app.packageName,
                    signature_hash: app.signatureHash
                }))
            }

            finalTemplateButtons.push(otpButton)

            if (codeDeliveryOption === 'copy_code') {
                if (addSecurityRecommendationChecked) {
                    additionalAuthFields.add_security_recommendation = true
                }
                if (addExpiryTimeChecked && expiresInMinutes && !expiresInMinutesError) {
                    additionalAuthFields.code_expiration_minutes = parseInt(expiresInMinutes, 10)
                }
            }

            if (setCustomValidityPeriod && validityPeriod) {
                const [value, unit] = validityPeriod.split(' ')
                let seconds = 0
                if (unit === 'minutes') {
                    seconds = parseInt(value, 10) * 60
                } else if (unit === 'hour') {
                    seconds = parseInt(value, 10) * 3600
                }
                additionalAuthFields.message_send_ttl_seconds = seconds
            }
            finalButtonAction = null // No button_action for authentication templates
        } else {
            // If not authentication, use existing buttons
            if (data?.template_buttons) {
                finalTemplateButtons.push(...data.template_buttons)
            }
        }

        addCustomTemplate({
            jsonData: {
                ...data,
                tags: tags.join(','),
                template_name: String(data.template_name).toLowerCase().replaceAll(' ', '_'),
                header_handle: file,
                user_id: user?.userType === 1 || user?.userType === 2 ? user?.id : watch('user_id'),
                button_action: finalButtonAction,
                template_buttons: finalTemplateButtons, // Use the constructed template_buttons
                ...additionalAuthFields, // Add authentication specific fields
                header_variable: watch('parameter_format') === 'POSITIONAL' ? data?.header_variable?.map((item) => item.value).join(',') : data?.header_named_variable?.map(item => ({
                    param_name: item.param_name,
                    example: item.example
                })),
                message_variable: watch('parameter_format') === 'POSITIONAL' ? data?.message_variable?.map((item) => item.value).join(',') : data?.named_message_variable?.map(item => ({
                    param_name: item.param_name,
                    example: item.example
                })),
                media_type: watch('template_type') === 'Media' ? getHeaderType(headerType) : data?.media_type,
                template_type: watch('category') === 'Authentication' ? 'None' : data?.template_type
                // message: watch("category") === 'Authentication' ? "{{1}} is your verification code. For your security, do not share this code." : data?.message
                // media_type: headerType === 0 ? 'IMAGE' : headerType === 1 ? 'VIDEO' : headerType === 2 ? 'DOCUMENT' : headerType === 3 ? 'location' : null
            },
            loading: setLoading,
            success: () => {
                navigate(-1)
            },
            errors: (e) => {
                const d = e?.data?.data
                for (const key in d) {
                    if (Object.hasOwnProperty.call(d, key)) {
                        if (isValidArray(d[key])) {
                            const message = d[key]?.map(a => `${a} \n`)
                            setError(key, { message, type: "validate" })
                        }
                    }
                }

            }
        })
    }


    const handleUpload = (e) => {
        uploadTemplateMedia({
            success: (d) => {
                setUploaded(d?.data)
                onSubmit(e, d?.data?.h)
            },
            loading: setLoading,
            controller,
            formData: {
                is_multiple: 0,
                file: csvRef.current?.files[0],
                user_id: user?.userType === 1 || user?.userType === 2 ? user?.id : watch('user_id'),
                file_type: FileHeaderType(headerType),
                file_caption: watch('file_caption'),
                configuration_id: watch('configuration_id')
            }
        })
        console.log(e)
    }

    const onChange = e => {
        const reader = new FileReader(), files = e.target.files
        if (isValidArray(files)) {
            reader.onload = function () {
                setAvatar(reader.result)
            }
            reader.readAsDataURL(files[0])
        }
    }

    const uploadAndSave = (e) => {
        log('called me', e)


        if (isValidArray(csvRef.current?.files)) {
            log('called me 1', csvRef.current?.files)
            handleUpload(e)
        } else {
            onSubmit(e)
            log('called me 2', csvRef.current?.files)

            // log(e)
        }

    }

    const editTemplateText = useMemo(() => {
        return () => {
            // get current index from fields
            const currentIndex = fields.length - 1

            if (currentIndex > -1) {
                // get template text
                let text = getValues('header_text') ?? ''

                // append current index to text
                const textToAdd = ` {{${(currentIndex + 1)}}}`

                // check if textToAdd is already in the text
                if (text.indexOf(textToAdd) > -1) {
                    // remove textToAdd from text
                    // text = text.replace(textToAdd, '')
                } else {
                    // append current index to text
                    text += textToAdd
                }
                // set text
                // setTemplateText(text)
                // setMessageText(text)
                // setValue('message_variable', text)
                setValue('header_text', text)
            }

        }
    }, [fields])

    // convert template_name into lowercase letters and underscores
    const convertToLowerCase = (e) => {
        const value = e.target.value
        const lowerCase = value.toLowerCase()
        const replaceSpace = lowerCase.replace(/\s+/g, '_')
        setValue('template_name', replaceSpace)
    }

    const editMessageText = useMemo(() => {
        return () => {

            const currentIndex = bodyVal.length - 1

            if (currentIndex > -1) {

                let text = getValues('message') ?? ''

                // append current index to text
                const textToAdd = ` {{${(currentIndex + 1)}}}`

                // check if textToAdd is already in the text
                if (text.indexOf(textToAdd) > -1) {
                    // remove textToAdd from text
                    // text = text.replace(textToAdd, '')
                } else {
                    // append current index to text
                    text += textToAdd
                }
                // set text
                // setMessageText(text)
                // setMessageText(text)
                // setValue('message_variable', text)
                setValue('message', text)
            }

        }
    }, [bodyVal])


    const editFooterText = useMemo(() => {
        return () => {
            // get current index from fields

            const currentIndex = footer.length - 1

            if (currentIndex > -1) {
                // get message text
                let text = urlText ?? ''

                // append current index to text
                const textToAdd = `?={{${(currentIndex + 1)}}}`
                const name = footer[currentIndex]?.fName
                // check if textToAdd is already in the text
                if (text.indexOf(textToAdd) > -1) {
                    // remove textToAdd from text
                    // text = text.replace(textToAdd, '')
                } else {
                    // append current index to text
                    text += textToAdd
                }
                // set text
                // setHeaderText(text)
                // setMessageText(text)
                // setValue('message_variable', text)
                setValue(name, text)
            }

        }
    }, [urlText, footer])

    // const editBodyText = useMemo(() => {
    //     return () => {
    //         // get current index from fields
    //         const currentIndex = fields.length - 1

    //         if (currentIndex > -1) {
    //             // get template text
    //             let text = templateText ?? ''

    //             // append current index to text
    //             const textToAdd = ` {{${(currentIndex + 1)}}}`

    //             // check if textToAdd is already in the text
    //             if (text.indexOf(textToAdd) > -1) {
    //                 // remove textToAdd from text
    //                 // text = text.replace(textToAdd, '')
    //             } else {
    //                 // append current index to text
    //                 text += textToAdd
    //             }
    //             // set text

    //             setMessageText(text)
    //             setValue('message_variable', text)

    //         }

    //     }
    // }, [templateText, fields])


    const addVariable = () => {
        // log('addVariable')
        // append
        if (fields.length <= 0) {
            append({ value: "" })
        } else {
            ErrorToast('You can add only 1 variables')
        }

    }
    const addHeaderVariable = () => {
        const headerText = getValues('header_text') ?? ''
        const hasVariable = /{{(.*?)}}/.test(headerText)
        if (hasVariable) {
            ErrorToast('You can add only 1 variable')
        } else {
            setValue('header_text', `${headerText} {{}} `)
        }
    }

    const addBody = () => {
        // log('addVariable')
        // append
        bodyAppend({ value: "" })

    }
    const addNameBody = () => {
        // log('addVariable')
        // append
        const message = getValues('message') ?? ''
        setValue('message', `${message} {{}} `)
    }

    const addFooter = (name) => {
        if (footer.length <= 0) {
            footerAppend({ value: "", fName: name })
        } else {
            ErrorToast('You can add only 1 variables')
        }
    }

    const addMarket = () => {
        marketingAppend({ value: "" })

    }

    const addCustom = () => {
        // append
        customAppend({
            button_type: buttonActions.Custom,
            button_text: ""
        })

    }

    const addWebsite = () => {
        customAppend({
            button_type: buttonActions['Visit Website'],
            button_text: "",
            button_val_name: "url",
            button_value: ""
        })

    }

    const addPhone = () => {
        // log('addVariable')
        // append
        customAppend({
            button_type: buttonActions['Call Phone Number'],
            button_text: "",
            button_val_name: "phone_number",
            button_value: ""
        })

    }

    const removeButton = (index) => {
        customRemove(index)
    }

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' && tagInputValue) {
            e.preventDefault()
            const newTag = tagInputValue.trim()
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag])
                setTagOptions([...tagOptions, { value: newTag, label: newTag }])
            }
            setTagInputValue('')
        }
    }

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove))
    }
    // const addOffer = () => {
    //     // log('addVariable')
    //     // append
    //     offerAppend({ value: "" })

    // }

    useEffect(() => {
        editTemplateText()
    }, [fields])

    useEffect(() => {
        editMessageText()
    }, [bodyVal])


    useEffect(() => {
        editFooterText()
    }, [footer])

    useEffect(() => {
        if (codeDeliveryOption === 'zero_tap' && !zeroTapCheckboxChecked) {
            setZeroTapCheckboxError(true)
        } else {
            setZeroTapCheckboxError(false)
        }
    }, [codeDeliveryOption, zeroTapCheckboxChecked])

    useEffect(() => {
        if (addExpiryTimeChecked) {
            const value = parseInt(expiresInMinutes, 10)
            if (isNaN(value) || value < 1 || value > 90) {
                setExpiresInMinutesError('Enter a value between 1 and 90.')
            } else {
                setExpiresInMinutesError('')
            }
        } else {
            setExpiresInMinutesError('')
        }
    }, [expiresInMinutes, addExpiryTimeChecked])


    useEffect(() => {
        // log('templateVariables', templateVariables)
        let textToRender = String(watch('header_text') ?? '')

        const variables = textToRender.match(/{{\d+}}/g)

        if (isValidArray(variables)) {
            variables.forEach((variable) => {
                const index = variable.replace(/{{|}}/g, '')
                const value = templateVariables[`var_${(index - 1)}`] ?? ''
                textToRender = textToRender.replace(variable, value)
            })
        }

        setRenderHeaderText(textToRender)

    }, [watch('header_text'), templateVariables])

    useEffect(() => {
        // log('messageVariables', messageVariables)
        let textToRender = String(watch('message') ?? '')

        const variables = textToRender.match(/{{\d+}}/g)

        if (isValidArray(variables)) {
            variables.forEach((variable) => {
                const index = variable.replace(/{{|}}/g, '')


                const value = messageVariables[`var_${(index - 1)}`] ?? ''
                textToRender = textToRender.replace(variable, value)

                // check if index is 
            })
        }

        setRenderBodyText(textToRender)

    }, [watch('message'), messageVariables])

    useEffect(() => {
        let textToRender = String(watch('message') ?? '')
        const variables = textToRender.match(/{{(.*?)}}/g)
        const watchedNamedMessageVariables = watch('named_message_variable')
        if (isValidArray(variables) && isValidArray(watchedNamedMessageVariables)) {
            variables.forEach(variable => {
                const paramName = variable.replace(/{{|}}/g, '')
                const bodyVar = watchedNamedMessageVariables.find(v => v.param_name === paramName)
                const value = bodyVar?.example ?? ''
                textToRender = textToRender.replaceAll(variable, value)
            })
        }
        setRenderNamedBodyText(textToRender)
    }, [watch('message'), JSON.stringify(watch('named_message_variable'))])

    useEffect(() => {
        let textToRender = String(watch('header_text') ?? '')
        const variables = textToRender.match(/{{(.*?)}}/g)
        const watchedHeaderNamedVariables = watch('header_named_variable')
        if (isValidArray(variables) && isValidArray(watchedHeaderNamedVariables)) {
            variables.forEach(variable => {
                const paramName = variable.replace(/{{|}}/g, '')
                const headerVar = watchedHeaderNamedVariables.find(v => v.param_name === paramName)
                const value = headerVar?.example ?? ''
                textToRender = textToRender.replaceAll(variable, value)
            })
        }
        setRenderNamedHeaderText(textToRender)
    }, [watch('header_text'), JSON.stringify(watch('header_named_variable'))])

    useEffect(() => {
        const headerText = watch('header_text') ?? ''
        const variables = headerText.match(/{{(.*?)}}/g)
        if (isValidArray(variables)) {
            const currentNamedHeaders = getValues('header_named_variable') || []
            const newNamedHeader = variables.map(v => {
                const paramName = v.replace(/{{|}}/g, '')
                const existing = currentNamedHeaders.find(h => h.param_name === paramName)
                return existing ?? { param_name: paramName, example: '' }
            })
            setValue('header_named_variable', newNamedHeader)
        } else {
            setValue('header_named_variable', [])
        }
    }, [watch('header_text')])

    useEffect(() => {
        const message = watch('message') ?? ''
        const variables = message.match(/{{(.*?)}}/g)
        if (isValidArray(variables)) {
            const currentNamedMessages = getValues('named_message_variable') || []
            const newNameMessage = variables.map(v => {
                const paramName = v.replace(/{{|}}/g, '')
                const existing = currentNamedMessages.find(h => h.param_name === paramName)
                return existing ?? { param_name: paramName, example: '' }
            })
            setValue('named_message_variable', newNameMessage)
        } else {
            setValue('named_message_variable', [])
        }
    }, [watch('message')])

    useEffect(() => {
        // log('messageVariables', messageVariables)
        let textToRender = String(urlText ?? '')

        const variables = textToRender.match(/{{\d+}}/g)

        if (isValidArray(variables)) {
            variables.forEach((variable) => {
                const index = variable.replace(/{{|}}/g, '')

                const value = urlVariables[`var_${(index - 1)}`] ?? ''
                textToRender = textToRender.replace(variable, value)
            })
        }

        setRenderBodyText(textToRender)

    }, [urlText, urlVariables])


    const setTemplateVariable = (index, value) => {
        // variable as key and value as value
        setTemplateVariables({ ...templateVariables, [`var_${index}`]: value })
    }

    const setMessageVariable = (index, value) => {
        // variable as key and value as value
        setMessageVariables({ ...messageVariables, [`var_${index}`]: value })
    }

    const setNamedMessageVariable = (param_name, example) => {
        // variable as key and value as value
        setMessageNamedVariables({ ...messageNamedVariables, [param_name]: example })
    }
    // const setNamedHeaderVariable = (param_name, example) => {
    //     // variable as key and value as value
    //     setHeaderNamedVariables({ ...headerNamedVariables, [param_name]: example })
    // }

    const buttonDisableFeature = (market) => {

        // if (isValidArray(market.length) < 0) {
        setQuickReply(0)
        // }

    }

    const listUser = async (search, loadedOptions, { page }) => {
        // if (user_id)
        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            // dispatch,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setLoadUser)

    }

    const listWhatsappConfig = async (search, loadedOptions, { page }) => {

        const res = await loadWhatsappConfig({
            async: true,
            page,
            perPage: 25,
            // dispatch,
            jsonData: { user_id: user?.userType === 1 || user?.userType === 2 ? user?.id : watch('user_id') }
        })
        return createAsyncSelectConfigOptions(res, page, "xName", "id", setLoadConfig)

    }

    // useEffect(() => {
    //     if (watch('parameter_format')) {
    //         setValue('header_text', '')
    //         setValue('message', '')
    //         setTemplateText('')
    //         setMessageText('')
    //         setNameText('')
    //         setNamedHeaderText('')
    //         remove()
    //         namedMessageRemove()
    //         bodyRemove()
    //         namedHeaderAppend()
    //     }
    // }, [watch('parameter_format')])


    return (
        <>
            <div>
                <Header title={'Whatsapp Custom Template'} icon={<ArrowLeft size={18} style={{ cursor: 'pointer' }} onClick={() => { navigate(-1) }} />} />
                <Form onSubmit={handleSubmit(uploadAndSave)}>

                    <div className=''>
                        <Row>
                            <Col md="12">
                                <Card className='p-2'>
                                    {/* <h3 className=''>Select User & Configuration</h3> */}

                                    <Row className='mt-1'>
                                        <Hide IF={user?.userType === 2 || user?.userType === 1}>
                                            <Col className='d-grid  mb-lg-0' md={3}>
                                                <FormGroupCustom
                                                    // key={`qfsdfsdfs${edit?.user_id}-kmlkm`}
                                                    async
                                                    type={"select"}
                                                    control={control}
                                                    name="user_id"
                                                    isClearable
                                                    defaultOptions
                                                    // onChangeValue={(e) => { setGetSender(e?.id) }}
                                                    // value={edit?.user_id}
                                                    loadOptions={listUser}
                                                    className='mb-1'
                                                    label="User"
                                                    errors={errors}
                                                    options={loadUser}
                                                    rules={{ required: true }}

                                                />
                                            </Col>
                                        </Hide>
                                        <Show IF={user?.userType === 2 || user?.userType === 1}>
                                            <Col className='d-grid  mb-lg-0' md={3}>
                                                <FormGroupCustom
                                                    control={control}
                                                    type={"text"}
                                                    name="user_ids"
                                                    value={user?.name}
                                                    className='mb-1'
                                                    disabled
                                                    label="User"
                                                />
                                            </Col>
                                        </Show>

                                        <Col className='d-grid mb-1 mb-lg-0' md={3}>
                                            <FormGroupCustom
                                                key={`qfopfsdfs${watch('user_id')}-kmlkm`}
                                                async
                                                type={"select"}
                                                control={control}
                                                name="configuration_id"
                                                isClearable
                                                defaultOptions
                                                // onChangeValue={(e) => { setGetSender(e?.id) }}
                                                // value={edit?.user_id}
                                                loadOptions={listWhatsappConfig}
                                                className='mb-1'
                                                label="Configuration"
                                                errors={errors}
                                                options={loadConfig}
                                                rules={{ required: true }}
                                            />
                                        </Col>
                                        <Col className='d-grid mb-1 mb-lg-0' md={watch('marketing_type') === 'product_message' ? '3' : '3'}>
                                            <FormGroupCustom

                                                control={control}
                                                type={"select"}
                                                errors={errors}
                                                name={"category"}
                                                isClearable
                                                message={"Choose category that best describe your message template."}
                                                className='mb-1'
                                                options={createConstSelectOptions(categoryType)}
                                                label="Category"
                                                // noLabel
                                                rules={{ required: false }}
                                            />

                                        </Col>
                                        <Show IF={watch('category') === 'Marketing'}>
                                            <Col className='d-grid mb-1 mb-lg-0' md={watch('marketing_type') === 'product_message' ? '3' : '3'}>
                                                <FormGroupCustom

                                                    control={control}
                                                    type={"select"}
                                                    errors={errors}
                                                    name={"marketing_type"}
                                                    isClearable
                                                    className='mb-1'
                                                    options={createConstSelectOptions(marketingTypes)}
                                                    label="Marketing Type"
                                                    // noLabel
                                                    rules={{ required: false }}
                                                />

                                            </Col>
                                        </Show>
                                        <Show IF={watch('marketing_type') === 'product_message'}>
                                            <Col className='d-grid mb-1 mb-lg-0' md='4'>
                                                <FormGroupCustom

                                                    control={control}
                                                    type={"select"}
                                                    errors={errors}
                                                    name={"template_format"}
                                                    isClearable
                                                    className='mb-1'
                                                    options={createConstSelectOptions(ProductMessageTypes)}
                                                    label="Template Format"
                                                    // noLabel
                                                    rules={{ required: false }}
                                                />

                                            </Col>
                                        </Show>
                                        <Show IF={watch('category') === 'Authentication'}>
                                            <Col className='d-grid mb-1 mb-lg-0' md={watch('marketing_type') === 'product_message' ? '3' : '3'}>
                                                <FormGroupCustom

                                                    control={control}
                                                    type={"text"}
                                                    errors={errors}
                                                    name={"otp"}
                                                    // isClearable
                                                    disabled
                                                    value={"One-time password"}
                                                    className='mb-1'
                                                    // options={createConstSelectOptions(categoryType)}
                                                    label="Send codes to verify transaction and login."
                                                    // noLabel
                                                    rules={{ required: false }}
                                                />

                                            </Col>
                                        </Show>
                                        <Hide IF={watch("category") === "Authentication"}>
                                        <Col className='d-grid mb-1 mb-lg-0' md={3}> 
                                            <FormGroupCustom

                                                control={control}
                                                type={"select"}
                                                errors={errors}
                                                name={"parameter_format"}
                                                // defaultValue={ParameterFormat[0]}   
                                                isClearable
                                                className='mb-1'
                                                options={createConstSelectOptions(ParameterFormat)}
                                                label="Parameter format"
                                                // noLabel
                                                rules={{ required: true }}
                                            />
                                            {/* <FormGroupCustom
                                                control={control}
                                                type={"text"}
                                                name="parameter_format"
                                                value={'POSITIONAL'}
                                                className='mb-1'
                                                disabled
                                                label="Parameter format"
                                            /> */}

                                        </Col>
                                        </Hide>
                                    </Row>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                    {/* <div>
                        <Row>
                            <Col md={12}>
                                <Card className='p-2'>
                                    <h3>Category</h3>

                                    <Row className='mt-2'>
                                        <Col className='d-grid mb-1 mb-lg-0' md={watch('marketing_type') === 'product_message' ? '4' : '6'}>
                                            <FormGroupCustom

                                                control={control}
                                                type={"select"}
                                                errors={errors}
                                                name={"category"}
                                                isClearable

                                                className='mb-1'
                                                options={createConstSelectOptions(categoryType)}
                                                label="Choose category that best describe your message template."
                                                rules={{ required: false }}
                                            />

                                        </Col>
                                        <Show IF={watch('category') === 'Marketing'}>
                                            <Col className='d-grid mb-1 mb-lg-0' md={watch('marketing_type') === 'product_message' ? '4' : '6'}>
                                                <FormGroupCustom

                                                    control={control}
                                                    type={"select"}
                                                    errors={errors}
                                                    name={"marketing_type"}
                                                    isClearable
                                                    className='mb-1'
                                                    options={createConstSelectOptions(marketingTypes)}
                                                    label="Marketing Type"
                                                    rules={{ required: false }}
                                                />

                                            </Col>
                                        </Show>
                                        <Show IF={watch('marketing_type') === 'product_message'}>
                                            <Col className='d-grid mb-1 mb-lg-0' md='4'>
                                                <FormGroupCustom

                                                    control={control}
                                                    type={"select"}
                                                    errors={errors}
                                                    name={"template_format"}
                                                    isClearable
                                                    className='mb-1'
                                                    options={createConstSelectOptions(ProductMessageTypes)}
                                                    label="Template Format"
                                                    rules={{ required: false }}
                                                />

                                            </Col>
                                        </Show>
                                        <Show IF={watch('category') === 'Authentication'}>
                                            <Col className='d-grid mb-1 mb-lg-0' md={watch('marketing_type') === 'product_message' ? '4' : '6'}>
                                                <FormGroupCustom

                                                    control={control}
                                                    type={"text"}
                                                    errors={errors}
                                                    name={"otp"}
                                                    // isClearable
                                                    disabled
                                                    value={"One-time password"}
                                                    className='mb-1'
                                                  
                                                    label="Send codes to verify transaction and login."
                                                   
                                                    rules={{ required: false }}
                                                />

                                            </Col>
                                        </Show>
                                    </Row>
                                </Card>
                            </Col>
                        </Row>
                    </div> */}


                    <div className=''>
                        <Card className='p-2'>
                            {/* <h3 className='mb-1'>Name</h3> */}
                            <Row className='fw-bolder'>
                                <Col md="6">
                                    <FormGroupCustom
                                                    
                                        control={control}
                                        type={"text"}
                                        errors={errors}
                                        name={"template_name"}
                                        isClearable
                                        placeholder="Name your message template"
                                        message={"Name your message template"}
                                        className='mb-1'
                                        onKeyUp={e => {
                                            // create camel case
                                            e.target.value = String(e.target.value).toLowerCase().replaceAll(' ', '_')
                                        }}
                                        // options={createConstSelectOptions(textType)}
                                        label="Name"
                                        rules={{ required: false }}

                                    // onChangeValue={(e) => { convertToLowerCase(e) }}
                                    />


                                </Col>
                                <Col md="6">
                                    {/* <FormGroupCustom
                                        // isMulti
                                        control={control}
                                        value={"en"}
                                        type={"select"}
                                        errors={errors}
                                        name={"template_language"}
                                        isClearable

                                        className='mb-1'
                                        options={createConstSelectOptions(whatsAppLanguages)}
                                        label="Choose Language of your message template. You can add or remove language later."

                                        rules={{ required: false }}
                                    /> */}

                                    <FormGroupCustom
                                        // key={resetIt}
                                        // key={resetIt}
                                        defaultOptions
                                        control={control}
                                        type={"select"}
                                        errors={errors}
                                        name={"template_language"}
                                        isClearable
                                        value={'en'}
                                        placeholder="Select Language"
                                        message={"Choose Language of your message template. You can add or remove language later."}
                                        className='mb-1'
                                        loadOptions={whatsappTemplateLanguage}
                                        options={loadLanguage}
                                        label="Language"
                                        rules={{ required: true }}
                                    />
                                </Col>
                            </Row>


                        </Card>
                    </div>
                    {/* <div className=''>
                        <Card className='p-2'>
                            <h3 className='mb-1'>Language</h3>
                            <Row className=''>
                                <Col md="12">
                                   
                                    <FormGroupCustom
                                        // key={resetIt}
                                        // key={resetIt}
                                        defaultOptions
                                        control={control}
                                        type={"select"}
                                        errors={errors}
                                        name={"template_language"}
                                        isClearable
                                        value={'en'}
                                        placeholder="Select Language"
                                        className='mb-1'
                                        loadOptions={whatsappTemplateLanguage}
                                        options={loadLanguage}
                                        label="Choose Language of your message template. You can add or remove language later."
                                        rules={{ required: true }}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </div> */}

                    {/* Code Delivery Setup */}
                    <Show IF={watch('category') === 'Authentication'}>
                        <div>
                            <Row>
                                <Col md="12">
                                    <Card className='p-2'>
                                        <h3 className='mb-1'>Code delivery setup</h3>
                                        <p>Choose how customers send the code from WhatsApp to your app. Edits to this section won't require review or count towards edit limits. Learn how to send <a href="#" className='text-primary'>authentication message templates</a>.</p>

                                        <div className='mt-2'>
                                            <div className='d-flex align-items-center mb-1'>
                                                <Input type='radio' id='zeroTapAutoFill' name='otp_type' className='me-1' checked={codeDeliveryOption === 'zero_tap'} onChange={() => {
                                                    setCodeDeliveryOption('zero_tap')
                                                    setAppSetupFields([{ packageName: '', signatureHash: '' }])
                                                    setAddSecurityRecommendationChecked(false)
                                                    setAddExpiryTimeChecked(false)
                                                    setExpiresInMinutes('')
                                                    setSetCustomValidityPeriod(false)
                                                    setValidityPeriod('10 minutes')
                                                }} />
                                                <Label for='zeroTapAutoFill' className='mb-0 fw-bolder'>Zero-tap auto-fill <TipsAndUpdates size={14} className='ms-50' /></Label>
                                            </div>
                                            <p className='ms-3'>This is recommended as the easiest option for your customers. Zero-tap will automatically send code without requiring your customer to tap a button. An auto-fill or copy code message will be sent if zero-tap and auto-fill aren't possible.</p>

                                            {codeDeliveryOption === 'zero_tap' && (
                                                <div className='border p-2 ms-3 rounded'>
                                                    <div className='d-flex align-items-start mb-1'>
                                                        <Input style={{width: '30px'}} type='checkbox' id='zero_tap_terms_accepted' name='zero_tap_terms_accepted' className='me-1 mt-25' checked={zeroTapCheckboxChecked} onChange={(e) => setZeroTapCheckboxChecked(e.target.checked)} />
                                                        <Label for='zeroTapCheckbox' className='mb-0'>
                                                            By selecting zero-tap, I understand that Test WhatsApp Business Account's use of zero-tap authentication is subject to the <a href="#" className='text-primary'>WhatsApp Business Terms of Service</a>. It's Test WhatsApp Business Account's responsibility to ensure that its customers expect that the code will be automatically filled in on their behalf when they choose to receive the zero-tap code through WhatsApp.
                                                        </Label>
                                                    </div>
                                                    <p className='ms-2'><a href="#" className='text-primary'>Learn more and review best practices.</a></p>
                                                    {!zeroTapCheckboxChecked && zeroTapCheckboxError && (
                                                        <Alert color='danger' className='d-flex align-items-center mt-1'>
                                                            <TipsAndUpdates size={18} className='me-1' />
                                                            <div className='alert-body'>
                                                                This box must be ticked to submit this template.
                                                            </div>
                                                        </Alert>
                                                    )}
                                                </div>
                                            )}

                                        </div>

                                        <div className='mt-2'>
                                            <div className='d-flex align-items-center mb-1'>
                                                <Input type='radio' id='oneTapAutoFill' name='otp_type' className='me-1' checked={codeDeliveryOption === 'one_tap'} onChange={() => {
                                                    setCodeDeliveryOption('one_tap')
                                                    setZeroTapCheckboxChecked(false)
                                                    setAddSecurityRecommendationChecked(false)
                                                    setAddExpiryTimeChecked(false)
                                                    setExpiresInMinutes('')
                                                    setSetCustomValidityPeriod(false)
                                                    setValidityPeriod('10 minutes')
                                                }} />
                                                <Label for='oneTapAutoFill' className='mb-0 fw-bolder'>One-tap auto-fill <TipsAndUpdates size={14} className='ms-50' /></Label>
                                            </div>
                                            <p className='ms-3'>The code sends to your app when customers tap the button. A copy code message will be sent if auto-fill isn't possible.</p>
                                        </div>

                                        <div className='mt-2'>
                                            <div className='d-flex align-items-center mb-1'>
                                                <Input type='radio' id='copy_code' name='otp_type' className='me-1' checked={codeDeliveryOption === 'copy_code'} onChange={() => {
                                                    setCodeDeliveryOption('copy_code')
                                                    setZeroTapCheckboxChecked(false)
                                                    setAppSetupFields([{ packageName: '', signatureHash: '' }])
                                                }} />
                                                <Label for='copy_code' className='mb-0 fw-bolder'>Copy code <TipsAndUpdates size={14} className='ms-50' /></Label>
                                            </div>
                                            <p className='ms-3'>Basic authentication with quick setup. Your customers copy and paste the code into your app.</p>
                                        </div>

                                        {/* <div className='mt-2'>
                                        <div className='d-flex align-items-center mb-1'>
                                            <Input type='radio' id='couponCode' name='otp_type' className='me-1' checked={codeDeliveryOption === 'couponCode'} onChange={() => setCodeDeliveryOption('couponCode')} />
                                            <Label for='couponCode' className='mb-0 fw-bolder'>Coupon Code <TipsAndUpdates size={14} className='ms-50' /></Label>
                                        </div>
                                        <p className='ms-3'>Allow customers to copy a coupon code to use in your app or website.</p>
                                    </div> */}
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    </Show>
                    <Show IF={watch('category') === 'Authentication'}>
                    {(codeDeliveryOption === 'one_tap' || codeDeliveryOption === 'zero_tap')  && (
                        <div className='mt-1'>
                            <Row>
                                <Col md="12">
                                    <Card className='p-2'>
                                        <h3 className='mb-1'>App setup</h3>
                                        <p>You can add up to 5 apps.</p>

                                        {appSetupFields.map((field, index) => (
                                            <div key={index} className='mb-2'>
                                                <Row className='align-items-end'>
                                                    <Col md="5">
                                                        <Label for={`packageName-${index}`} className='form-label'>Package name</Label>
                                                        <InputGroup>
                                                            <Input
                                                                id={`packageName-${index}`}
                                                                placeholder="Enter text (com.example.myapplication)"
                                                                value={field.packageName}
                                                                name='package_name'
                                                                onChange={(e) => {
                                                                    const newFields = [...appSetupFields]
                                                                    newFields[index].packageName = e.target.value
                                                                    setAppSetupFields(newFields)
                                                                }}
                                                                maxLength={224}
                                                                className={appSetupErrors[index]?.packageName ? 'is-invalid' : ''}
                                                            />
                                                            <InputGroupText>{field.packageName.length}/224</InputGroupText>
                                                        </InputGroup>
                                                        {appSetupErrors[index]?.packageName && <div className='invalid-feedback d-block'>{appSetupErrors[index].packageName}</div>}
                                                    </Col>
                                                    <Col md="5">
                                                        <Label for={`signatureHash-${index}`} className='form-label'>App signature hash</Label>
                                                        <InputGroup>
                                                            <Input
                                                                id={`signatureHash-${index}`}
                                                                placeholder="Enter text"
                                                                value={field.signatureHash}
                                                                name='signature_hash'
                                                                onChange={(e) => {
                                                                    const newFields = [...appSetupFields]
                                                                    newFields[index].signatureHash = e.target.value
                                                                    setAppSetupFields(newFields)
                                                                }}
                                                                maxLength={11}
                                                                className={appSetupErrors[index]?.signatureHash ? 'is-invalid' : ''}
                                                            />
                                                            <InputGroupText>{field.signatureHash.length}/11</InputGroupText>
                                                        </InputGroup>
                                                        {appSetupErrors[index]?.signatureHash && <div className='invalid-feedback d-block'>{appSetupErrors[index].signatureHash}</div>}
                                                    </Col>
                                                    <Col md="2">
                                                        {appSetupFields.length > 1 && (
                                                            <Button color='danger' outline onClick={() => {
                                                                const newFields = [...appSetupFields]
                                                                newFields.splice(index, 1)
                                                                setAppSetupFields(newFields)
                                                            }}>
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        )}
                                                    </Col>
                                                    <Col md="12">
                                                        <Alert color='danger' className='d-flex align-items-center mt-1 p-1'>

                                                            <div className='alert-body'>
                                                                <ul>

                                                                    <>
                                                                        <li>Your signature hash must be 11 characters long.</li>
                                                                        <li>Add text in all required fields to publish your message template.</li>
                                                                    </>

                                                                </ul>
                                                            </div>
                                                        </Alert>
                                                    </Col>
                                                </Row>
                                            </div>
                                        ))}

                                        {/* {appSetupErrors.some(err => err.signatureHash || err.packageName) && (
                                            <Alert color='danger' className='d-flex align-items-center mt-1'>
                                                <TipsAndUpdates size={18} className='me-1' />
                                                <div className='alert-body'>
                                                    <ul>
                                                        {appSetupErrors.map((err, i) => (
                                                            <>
                                                                {err.signatureHash && <li key={`sig-err-${i}`}>Your signature hash must be 11 characters long.</li>}
                                                                {err.packageName && <li key={`pkg-err-${i}`}>Add text in all required fields to publish your message template.</li>}
                                                            </>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </Alert>
                                        )} */}

                                        <Button color='primary' className="col-md-3" outline onClick={() => {
                                            if (appSetupFields.length < 5) {
                                                setAppSetupFields([...appSetupFields, { packageName: '', signatureHash: '' }])
                                            }
                                        }} disabled={appSetupFields.length >= 5}>
                                            Add another app
                                        </Button>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    )}

                    {/* {codeDeliveryOption === 'copy_code' && (<>
                        <div className='mt-1'>
                            <Row>
                                <Col md="12">
                                    <Card className='p-2'>
                                        <h3 className='mb-1'>Content</h3>

                                        <p>Content of authentication templates can't be edited. You can add additional content form the options below. </p>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    </>)} */}
</Show>
                    {(codeDeliveryOption === 'copy_code') && (
                        <>
                            <div className='mt-1'>
                                <Row>
                                    <Col md="12">
                                        <Card className='p-2'>
                                            <h3 className='mb-1'>Content</h3>
                                            <p>Content for authentication message templates can't be edited. You can add additional content from the options below.</p>

                                            <div className='d-flex align-items-center mb-1'>
                                                <Input type='checkbox' id='addSecurityRecommendation' className='me-1' name='add_security_recommendation' checked={addSecurityRecommendationChecked} onChange={(e) => setAddSecurityRecommendationChecked(e.target.checked)} />
                                                <Label for='addSecurityRecommendation' className='mb-0'>Add security recommendation</Label>
                                            </div>

                                            <div className='d-flex align-items-center mb-1'>
                                                <Input type='checkbox' id='addExpiryTime' className='me-1' checked={addExpiryTimeChecked} onChange={(e) => setAddExpiryTimeChecked(e.target.checked)} />
                                                <Label for='addExpiryTime' className='mb-0'>Add expiry time for the code</Label>
                                            </div>
                                            <p className='ms-3'>After the code has expired, the auto-fill button will be disabled.</p>

                                            {addExpiryTimeChecked && (
                                                <div className='border p-2 ms-3 rounded mt-1 col-md-3'>
                                                    <h5 className='mb-1'>Expires in</h5>
                                                    <InputGroup className='input-group-merge'>
                                                        <Input
                                                            type='number'
                                                            value={expiresInMinutes}
                                                            onChange={(e) => setExpiresInMinutes(e.target.value)}
                                                            min={1}
                                                            max={90}
                                                            name='code_expiration_minutes'
                                                            className={expiresInMinutesError ? 'is-invalid' : ''}
                                                        />
                                                        <InputGroupText>minutes</InputGroupText>
                                                    </InputGroup>
                                                    {expiresInMinutesError && (
                                                        <div className='invalid-feedback d-block'>
                                                            <TipsAndUpdates size={18} className='me-1' />
                                                            {expiresInMinutesError}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </Card>
                                    </Col>
                                </Row>
                            </div>

                            <div className='mt-1'>
                                <Row>
                                    <Col md="12">
                                        <Card className='p-2'>
                                            <h3 className='mb-1'>Message validity period <TipsAndUpdates size={14} className='ms-50' /></h3>
                                            <p>It's recommended to set a custom validity period that your authentication message must be delivered by before it expires. If a message is not delivered within this time frame, you will not be charged and your customer will not see the message.</p>

                                            <div className='d-flex justify-content-between align-items-center mb-1'>
                                                <Label for='setCustomValidityPeriod' className='mb-0 fw-bolder'>Set custom validity period for your message</Label>
                                                <Input type='switch' id='setCustomValidityPeriod' checked={setCustomValidityPeriod} onChange={(e) => setSetCustomValidityPeriod(e.target.checked)} />
                                            </div>
                                            <p className='ms-3 '>If you don't set a custom validity period, the standard 10 minutes WhatsApp message validity period will be applied.</p>

                                            {setCustomValidityPeriod && (
                                                <Col md="6">
                                                    <FormGroupCustom
                                                        control={control}
                                                        type={"select"}
                                                        errors={errors}
                                                        name={"message_send_ttl_seconds"}
                                                        isClearable
                                                        value={validityPeriod}
                                                        onChangeValue={(e) => setValidityPeriod(e.value)}
                                                        // options={[{ value: '10 minutes', label: '10 minutes' }, { value: '30 minutes', label: '30 minutes' }, { value: '1 hour', label: '1 hour' }]}
                                                        options={createConstSelectOptions(validityPeriodOptions)}
                                                        label="Validity period"
                                                        rules={{ required: false }}
                                                    />
                                                </Col>
                                            )}
                                        </Card>
                                    </Col>
                                </Row>
                            </div>
                        </>
                    )}

                    <Show IF={watch('category') === 'Authentication'}>
                    <Card className={'mb-2'}>
                        <div className='d-flex justify-content-center'>
                        <LoadingButton color='primary' type='submit' className='mt-2 mb-2 col-md-2' loading={loading} > Save</LoadingButton >
                            </div>
                    </Card>
                    </Show>

                    <Hide IF={watch('category') === 'Authentication'}>
                        <div>

                            <Row>
                                <Col md="9">
                                    <Card>
                                        <CardHeader className='border-bottom'>
                                            <h3>Edit Template</h3>
                                        </CardHeader>
                                        <CardBody>

                                            <div>

                                                <h5 className='mt-1 fw-bolder'>Header  <span className='text-danger'>*</span></h5>

                                                <p> Add a title or choose which of media you'll use for this header.</p>

                                                <Row>
                                                    <Hide IF={watch('marketing_type') === 'product_message'}>
                                                        <Col md="2">
                                                            <FormGroupCustom
                                                                defaultOptions
                                                                control={control}
                                                                type={"select"}
                                                                errors={errors}
                                                                name={"template_type"}
                                                                isClearable
                                                                placeholder="Select Type"
                                                                className='mb-1'
                                                                options={createConstSelectOptions(textType)}
                                                                onChangeValue={(selectedOption) => {
                                                                    // setValue('template_type', selectedOption?.value)
                                                                    setValue('header_text', '')
                                                                    setValue('media_type', null)
                                                                    setValue('')
                                                                    remove() // Clears all header_variable fields
                                                                    // append({ value: '' }) // Re-add one empty field as per existing logic
                                                                    // setTemplateVariables({}) // Clear templateVariables state
                                                                }}
                                                                noLabel
                                                                rules={{ required: true }}
                                                            />
                                                        </Col>
                                                    </Hide>
                                                    <Show IF={watch('parameter_format') === 'POSITIONAL'}>
                                                        <Show IF={watch('template_type') === 'Text' || watch('marketing_type') === 'product_message'}>
                                                            <Col md={watch('marketing_type') === 'product_message' ? '12' : '10'}>
                                                                <FormGroupCustom
                                                                    key={`templateText-${fields.length}`}
                                                                    value={watch('header_text')}
                                                                    control={control}
                                                                    type={"text"}
                                                                    errors={errors}
                                                                    name={"header_text"}
                                                                    isClearable
                                                                    placeholder="Enter Header"
                                                                    className='mb-1'
                                                                    // options={createConstSelectOptions(textType)}
                                                                    label="Header"
                                                                    noLabel
                                                                    rules={{ required: false, maxLength: 60 }}
                                                                    // onChangeValue={(e) => { setTemplateText(e) }}
                                                                    onChangeValue={(e) => {

                                                                        // if (e.length > 1024) {
                                                                        //     e = e.slice(0, 1024)
                                                                        // }
                                                                        setValue('header_text', e)

                                                                    }}
                                                                    onKeyUp={(e) => {
                                                                        if (e.target.value.length > 60) {
                                                                            e.target.value = e.target.value.slice(0, 60)
                                                                        }
                                                                        // restrictCharacters(e, 60)
                                                                    }}

                                                                    append={<InputGroupText role={"button"} className='newStyle' >
                                                                        <p className='extraParagraph'>{countCharacters(renderHeaderText)}/{totalHeaderCount} </p>
                                                                    </InputGroupText>
                                                                    }

                                                                />
                                                                {/* <p>{countCharacters(renderHeaderText)}  </p> */}
                                                                {/* <input
                                                            type="text"
                                                            key={`templateText-${fields.length}`}
                                                            className="form-control"
                                                            placeholder="Enter Header"
                                                            value={templateText}
                                                        // onKeyUp={(e) => { setTemplateText(e); log(e) }}

                                                        /> */}
                                                            </Col>
                                                            <div className='d-flex justify-content-end'>

                                                                <Badge pill color='primary' onClick={addVariable} style={{ cursor: 'pointer' }}  >+ Add variable</Badge>
                                                            </div>
                                                            <Col md="12" className='mt-2 border'  >

                                                                <p className='fw-bolder mt-1'>
                                                                    Samples for Header content
                                                                </p>

                                                                <p className='fw-bold mt-1'>
                                                                    To help us review your content, provide examples of the variables or media in the header. Do not include any customer information. Cloud API hosted by Meta reviews template and variable parameters to protect the security and integrity of our services
                                                                </p>

                                                                {/* <p className='fw-bolder mt-2'>
                                                    Body
                                                </p> */}

                                                                {fields.map((field, i) => {
                                                                    const Tag = i === 0 ? 'div' : SlideDown
                                                                    return (
                                                                        <Tag key={field?.id}>
                                                                            <Row className=''>
                                                                                <Col md={1} className=''>
                                                                                    <p>{`{{${(i + 1)}}}`} </p>
                                                                                </Col>
                                                                                <Col md={11} className=''>
                                                                                    <InputGroup>
                                                                                        <FormGroupCustom
                                                                                            key={`header_variable-${i}.id`}
                                                                                            type={"hidden"}
                                                                                            noLabel
                                                                                            noGroup
                                                                                            control={control}
                                                                                            value={field?.id}
                                                                                            name={`header_variable.${i}.id`}

                                                                                        />
                                                                                        <FormGroupCustom
                                                                                            key={`header_variable-${i}.value`}
                                                                                            type={"text"}
                                                                                            noLabel
                                                                                            control={control}
                                                                                            // value={templateVariables[`var_${i}`] ?? ''}
                                                                                            value={field?.value}
                                                                                            placeholder={`Enter content of {{${i + 1}}}`}
                                                                                            name={`header_variable.${i}.value`}
                                                                                            // value={`edit?.variable[${i}]`}
                                                                                            className={`animation-item-name-${i}`}
                                                                                            // label="Group Name"
                                                                                            errors={errors}
                                                                                            rules={{ required: false }}
                                                                                            onChangeValue={(e) => { setTemplateVariable(i, e) }}
                                                                                        // append={<InputGroupText role={"button"} onClick={e => {
                                                                                        //     remove(i)
                                                                                        //     delete templateVariables[`var_${i}`]
                                                                                        //     setTemplateVariables({ ...templateVariables })
                                                                                        // }
                                                                                        // }>
                                                                                        //     <Trash2 className='text-danger' size={16} />
                                                                                        // </InputGroupText>
                                                                                        // }
                                                                                        />
                                                                                    </InputGroup>
                                                                                </Col>
                                                                                <Col sm={12}>
                                                                                    <br />
                                                                                </Col>
                                                                            </Row>
                                                                        </Tag>
                                                                    )
                                                                })}

                                                            </Col>
                                                        </Show>
                                                    </Show>
                                                    <Show IF={watch('parameter_format') === 'NAMED'}>
                                                        <Show IF={watch('template_type') === 'Text' || watch('marketing_type') === 'product_message'}>
                                                            <Col md={watch('marketing_type') === 'product_message' ? '12' : '10'}>
                                                                <FormGroupCustom
                                                                    key={`templateText-${namedHeader.length}`}
                                                                    value={watch('header_text')}
                                                                    control={control}
                                                                    type={"text"}
                                                                    errors={errors}
                                                                    name={"header_text"}
                                                                    isClearable
                                                                    placeholder="Enter Header"
                                                                    className='mb-1'
                                                                    // options={createConstSelectOptions(textType)}
                                                                    label="Header"
                                                                    noLabel
                                                                    rules={{ required: false, maxLength: 60 }}
                                                                    // onChangeValue={(e) => { setTemplateText(e) }}
                                                                    onChangeValue={(e) => {

                                                                        // if (e.length > 1024) {
                                                                        //     e = e.slice(0, 1024)
                                                                        // }
                                                                        setValue('header_text', e)

                                                                    }}
                                                                    onKeyUp={(e) => {
                                                                        if (e.target.value.length > 60) {
                                                                            e.target.value = e.target.value.slice(0, 60)
                                                                        }
                                                                        // restrictCharacters(e, 60)
                                                                    }}

                                                                    append={<InputGroupText role={"button"} className='newStyle' >
                                                                        <p className='extraParagraph'>{countCharacters(renderNamedHeaderText)}/{totalHeaderCount} </p>
                                                                    </InputGroupText>
                                                                    }

                                                                />
                                                                {/* <p>{countCharacters(renderHeaderText)}  </p> */}
                                                                {/* <input
                                                            type="text"
                                                            key={`templateText-${fields.length}`}
                                                            className="form-control"
                                                            placeholder="Enter Header"
                                                            value={templateText}
                                                        // onKeyUp={(e) => { setTemplateText(e); log(e) }}

                                                        /> */}
                                                            </Col>
                                                            <div className='d-flex justify-content-end'>

                                                                <Badge pill color='primary' onClick={addHeaderVariable} style={{ cursor: 'pointer' }}  >+ Add variable</Badge>
                                                            </div>
                                                            <Col md="12" className='mt-2 border'  >

                                                                <p className='fw-bolder mt-1'>
                                                                    Samples for Header content
                                                                </p>

                                                                <p className='fw-bold mt-1'>
                                                                    To help us review your content, provide examples of the variables or media in the header. Do not include any customer information. Cloud API hosted by Meta reviews template and variable parameters to protect the security and integrity of our services
                                                                </p>

                                                                {/* <p className='fw-bolder mt-2'>
                                                    Body
                                                </p> */}

                                                                {/* {fields.map((field, i) => {
                                                                const Tag = i === 0 ? 'div' : SlideDown
                                                                return (
                                                                    <Tag key={field?.id}>
                                                                        <Row className=''>
                                                                            <Col md={1} className=''>
                                                                                <p>{`{{${(i + 1)}}}`} </p>
                                                                            </Col>
                                                                            <Col md={11} className=''>
                                                                                <InputGroup>
                                                                                    <FormGroupCustom
                                                                                        key={`header_variable-${i}.id`}
                                                                                        type={"hidden"}
                                                                                        noLabel
                                                                                        noGroup
                                                                                        control={control}
                                                                                        value={field?.id}
                                                                                        name={`header_variable.${i}.id`}

                                                                                    />
                                                                                    <FormGroupCustom
                                                                                        key={`header_variable-${i}.value`}
                                                                                        type={"text"}
                                                                                        noLabel
                                                                                        control={control}
                                                                                        // value={templateVariables[`var_${i}`] ?? ''}
                                                                                        value={field?.value}
                                                                                        placeholder={`Enter content of {{${i + 1}}}`}
                                                                                        name={`header_variable.${i}.value`}
                                                                                        // value={`edit?.variable[${i}]`}
                                                                                        className={`animation-item-name-${i}`}
                                                                                        // label="Group Name"
                                                                                        errors={errors}
                                                                                        rules={{ required: false }}
                                                                                        onChangeValue={(e) => { setTemplateVariable(i, e) }}
                                                                                    // append={<InputGroupText role={"button"} onClick={e => {
                                                                                    //     remove(i)
                                                                                    //     delete templateVariables[`var_${i}`]
                                                                                    //     setTemplateVariables({ ...templateVariables })
                                                                                    // }
                                                                                    // }>
                                                                                    //     <Trash2 className='text-danger' size={16} />
                                                                                    // </InputGroupText>
                                                                                    // }
                                                                                    />
                                                                                </InputGroup>
                                                                            </Col>
                                                                            <Col sm={12}>
                                                                                <br />
                                                                            </Col>
                                                                        </Row>
                                                                    </Tag>
                                                                )
                                                            })} */}

                                                                {namedHeader.map((body, b) => {
                                                                    const Tag = b === 0 ? 'div' : SlideDown
                                                                    return (
                                                                        <Tag key={body?.id}>
                                                                            <Row>
                                                                                <Col md={6}>
                                                                                    <FormGroupCustom
                                                                                        key={`header_named_variable-${b}.param_name`}
                                                                                        type={"text"}
                                                                                        noLabel
                                                                                        control={control}
                                                                                        placeholder={`Enter variable name`}
                                                                                        value={watch(`header_named_variable.${b}.param_name`) ?? ''}
                                                                                        name={`header_named_variable.${b}.param_name`}
                                                                                        errors={errors}
                                                                                        rules={{ required: false }}
                                                                                        disabled
                                                                                    />
                                                                                </Col>
                                                                                <Col md={6}>
                                                                                    <InputGroup>
                                                                                        <FormGroupCustom
                                                                                            key={`header_named_variable-${b}.id`}
                                                                                            type={"hidden"}
                                                                                            noLabel
                                                                                            noGroup
                                                                                            control={control}
                                                                                            value={body?.id}
                                                                                            name={`header_named_variable.${b}.id`}
                                                                                        />
                                                                                        <FormGroupCustom
                                                                                            type={"text"}
                                                                                            key={`header_named_variable-${b}.example`}
                                                                                            noLabel
                                                                                            control={control}
                                                                                            placeholder={`Enter example value`}
                                                                                            value={watch(`header_named_variable.${b}.example`) ?? ''}
                                                                                            name={`header_named_variable.${b}.example`}
                                                                                            className={`animation-item-name-${b}`}
                                                                                            errors={errors}
                                                                                            rules={{ required: false }}
                                                                                            onChangeValue={(e) => { setValue(`header_named_variable.${b}.example`, e) }}
                                                                                        />
                                                                                    </InputGroup>
                                                                                </Col>
                                                                            </Row>
                                                                            <Col sm={12}>
                                                                                <br />
                                                                            </Col>
                                                                        </Tag>
                                                                    )
                                                                })}


                                                            </Col>
                                                        </Show>
                                                    </Show>
                                                    <Show IF={watch('template_type') === 'Media'}>
                                                        <div className=''>
                                                            <Row>
                                                                <Col md="2" className='m-1'>
                                                                    <Button.Ripple color='flat-primary' outline={headerType !== 0} onClick={() => {
                                                                        setHeaderType(0)
                                                                    }} active={headerType === 0} >
                                                                        <Image size={'sm'} style={{ cursor: 'pointer' }} />
                                                                        <span className='align-middle ms-25 fw-bold'>Image</span>
                                                                    </Button.Ripple>
                                                                </Col>

                                                                <Col md="2" className=' m-1'>
                                                                    <Button.Ripple color='flat-primary' outline={headerType !== 1} onClick={() => {
                                                                        setHeaderType(1)
                                                                    }} active={headerType === 1}  >
                                                                        <Video size={'sm'} style={{ cursor: 'pointer' }} />
                                                                        <span className='align-middle ms-25 fw-bold'>Video</span>
                                                                    </Button.Ripple>
                                                                </Col>

                                                                <Col md="2" className='m-1'>

                                                                    <Button.Ripple color='flat-primary' outline={headerType !== 2} onClick={() => {
                                                                        setHeaderType(2)
                                                                    }} active={headerType === 2}  >
                                                                        <FileText size={'sm'} style={{ cursor: 'pointer' }} />
                                                                        <span className='align-middle ms-25 fw-bold'>Document</span>
                                                                    </Button.Ripple>
                                                                </Col>
                                                                <Col md="2" className='m-1'>
                                                                    <Button.Ripple color='flat-primary' outline={headerType !== 3} onClick={() => {
                                                                        setHeaderType(3)
                                                                    }} active={headerType === 3}  >
                                                                        <MapPin size={'sm'} style={{ cursor: 'pointer' }} />
                                                                        <span className='align-middle ms-25 fw-bold'>Location</span>
                                                                    </Button.Ripple>
                                                                </Col>
                                                                <Col md="2" className='m-1'>
                                                                    <Button.Ripple color='flat-primary' outline={headerType !== 4} onClick={() => {
                                                                        setHeaderType(4)
                                                                    }} active={headerType === 4}  >
                                                                        <PlayCircle size={'sm'} style={{ cursor: 'pointer' }} />
                                                                        <span className='align-middle ms-25 fw-bold'>Audio</span>
                                                                    </Button.Ripple>
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                    </Show>
                                                    <Row>
                                                        <Show IF={watch('template_type') === 'Media' && headerType === 0}>
                                                            <Col md="4">
                                                                <Label for="header_handle">Upload Image</Label>
                                                                <Input innerRef={csvRef} la type='file' name={'header_handle'} onChange={onChange} accept="image/jpeg, image/png, image/jpg" />

                                                            </Col>
                                                            <Col md="4">
                                                                <FormGroupCustom
                                                                    type={"text"}
                                                                    control={control}
                                                                    name="file_type"
                                                                    isClearable
                                                                    value={'image'}
                                                                    className="mb-1 pe-none"
                                                                    label={"File Type"}
                                                                    errors={errors}
                                                                    // options={createConstSelectOptions(whatsappFileType)}
                                                                    rules={{ required: false }}
                                                                />
                                                            </Col>
                                                            <Col md="4" xs="12" >
                                                                <FormGroupCustom
                                                                    type={"text"}
                                                                    control={control}
                                                                    name="file_caption"
                                                                    className='mb-1 '
                                                                    label={"File Caption"}
                                                                    errors={errors}
                                                                />
                                                            </Col>
                                                        </Show>
                                                        <Show IF={watch('template_type') === 'Media' && headerType === 1}>
                                                            <Col md="4">
                                                                <Label for="header_handle">Upload Video</Label>

                                                                <Input innerRef={csvRef} type='file' name={'header_handle'} onChange={onChange} accept="video/mp4, video/3gp" />

                                                            </Col>
                                                            <Col md="4">
                                                                <FormGroupCustom
                                                                    type={"text"}
                                                                    control={control}
                                                                    name="file_type"
                                                                    isClearable
                                                                    value={'video'}
                                                                    className="mb-1 pe-none"
                                                                    label={"File Type"}
                                                                    errors={errors}
                                                                    // options={createConstSelectOptions(whatsappFileType)}
                                                                    rules={{ required: false }}
                                                                />
                                                            </Col>
                                                            <Col md="4" xs="12" >
                                                                <FormGroupCustom
                                                                    type={"text"}
                                                                    control={control}
                                                                    name="file_caption"
                                                                    className='mb-1 '
                                                                    label={"File Caption"}
                                                                    errors={errors}
                                                                />
                                                            </Col>
                                                        </Show>
                                                        <Show IF={watch('template_type') === 'Media' && headerType === 2}>

                                                            <Col md="4">
                                                                <Label for="header_handle">Upload Document</Label>

                                                                <Input innerRef={csvRef} type='file' name={'header_handle'} onChange={onChange} accept="text/plain, application/pdf, application/vnd.ms-powerpoint, application/msword, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.presentationml.presentation, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />

                                                            </Col>
                                                            <Col md="4">
                                                                <FormGroupCustom
                                                                    type={"text"}
                                                                    control={control}
                                                                    name="file_type"
                                                                    isClearable
                                                                    value={'document'}
                                                                    className="mb-1 pe-none"
                                                                    label={"File Type"}
                                                                    errors={errors}
                                                                    // options={createConstSelectOptions(whatsappFileType)}
                                                                    rules={{ required: false }}
                                                                />
                                                            </Col>
                                                            <Col md="4" xs="12" >
                                                                <FormGroupCustom
                                                                    type={"text"}
                                                                    control={control}
                                                                    name="file_caption"
                                                                    className='mb-1 '
                                                                    label={"File Caption"}
                                                                    errors={errors}
                                                                />
                                                            </Col>
                                                        </Show>
                                                        <Show IF={watch('template_type') === 'Media' && headerType === 4}>

                                                            <Col md="4">
                                                                <Label for="header_handle">Upload Audio</Label>

                                                                <Input innerRef={csvRef} type='file' name={'header_handle'} onChange={onChange} accept=".audio/aac, audio/mp4, audio/mpeg, audio/amr, audio/ogg" />

                                                            </Col>
                                                            <Col md="4">
                                                                <FormGroupCustom
                                                                    type={"text"}
                                                                    control={control}
                                                                    name="file_type"
                                                                    isClearable
                                                                    value={'audio'}
                                                                    className="mb-1 pe-none"
                                                                    label={"File Type"}
                                                                    errors={errors}
                                                                    // options={createConstSelectOptions(whatsappFileType)}
                                                                    rules={{ required: false }}
                                                                />
                                                            </Col>
                                                            <Col md="4" xs="12" >
                                                                <FormGroupCustom
                                                                    type={"text"}
                                                                    control={control}
                                                                    name="file_caption"
                                                                    className='mb-1 '
                                                                    label={"File Caption"}
                                                                    errors={errors}
                                                                />
                                                            </Col>
                                                        </Show>
                                                    </Row>


                                                </Row>

                                            </div>

                                            <Show IF={watch("parameter_format") === 'POSITIONAL'}>

                                                <div className='mt-2'>
                                                    <h5 className='mt-1 fw-bolder'>Body <span className='text-danger'>*</span></h5>
                                                    <p> Enter the text for your message in the language you've selected.</p>

                                                    <Row>
                                                        <Col md="12">
                                                            <FormGroupCustom
                                                                // defaultOptions
                                                                key={`messageText-${bodyVal.length}`}
                                                                value={watch('message')}
                                                                control={control}
                                                                type={"textarea"}
                                                                errors={errors}
                                                                name={"message"}
                                                                style={{ minHeight: 100 }}
                                                                isClearable
                                                                placeholder="Enter Your content here"
                                                                className='mb-1'
                                                                // options={createConstSelectOptions(textType)}
                                                                // label="Priority"
                                                                noLabel
                                                                rules={{ required: true, maxLength: 1024 }}
                                                                onChangeValue={(e) => {

                                                                    if (e.length > 1024) {
                                                                        e = e.slice(0, 1024)
                                                                    }
                                                                    setValue('message', e)
                                                                }}
                                                                onKeyUp={(e) => {
                                                                    if (e.target.value.length > 1024) {
                                                                        e.target.value = e.target.value.slice(0, 1024)
                                                                    }
                                                                }}
                                                                append={<InputGroupText role={"button"}>
                                                                    <p>{countCharacters(renderBodyText)}/{totalBodyCount} </p>
                                                                </InputGroupText>
                                                                }

                                                            />

                                                        </Col>
                                                        <div>

                                                        </div>
                                                        {/* <Col md="12" className='' style={{ backgroundColor: '#f5dc98' }}>

                                                    <p className='fw-bold mt-1'>
                                                        <WarningAmber color='warning' />      This template contains too many variable parameters relative to the message length. You need to decrease the number of variable parameters or increase the message length.
                                                    </p>

                                                    <p style={{ cursor: "pointer" }}>Learn more about formatting in Message Template Guidelines. </p>

                                                </Col> */}

                                                        {/* <Col md="12"> */}
                                                        {/* <div className='d-flex justify-content-between'>
                                            <p>Character : 0/1024</p>
                                        </div>
                                        <div >
                                            <p>Character : 0/1024</p>
                                        </div> */}
                                                        {/* </Col> */}

                                                        {/* <Col md="2">
                                                    <p>Character : 0/1024</p>
                                                </Col> */}
                                                        <div className='d-flex justify-content-end'>
                                                            <Badge pill color='primary' onClick={addBody} style={{ cursor: 'pointer' }}  >+ Add variable</Badge>
                                                        </div>

                                                        {/* <Col md="2" className='d-flex justify-content-end'>
                                                    <p onClick={addBody}>+ Add Variable </p>
                                                </Col> */}

                                                        <Col md="12" className='mt-2 border' >

                                                            <p className='fw-bolder mt-1'>
                                                                Samples for body content
                                                            </p>

                                                            <p className='fw-bold mt-1'>
                                                                To help us review your message template, please add an example of each variable in your body text. Do not use real customer information. Cloud API hosted by Meta reviews template and variable parameters to protect the security and integrity of our services
                                                            </p>


                                                            {bodyVal.map((body, b) => {
                                                                const Tag = b === 0 ? 'div' : SlideDown
                                                                return (
                                                                    <Tag key={body?.id}>
                                                                        <Row className=''>
                                                                            <Col md={1} className=''>
                                                                                <p>{`{{${(b + 1)}}}`} </p>
                                                                            </Col>
                                                                            <Col md={11} className=''>
                                                                                <InputGroup>
                                                                                    <FormGroupCustom
                                                                                        key={`message_variable-${b}.id`}
                                                                                        type={"hidden"}
                                                                                        noLabel
                                                                                        noGroup
                                                                                        control={control}
                                                                                        value={body?.id}
                                                                                        name={`message_variable.${b}.id`}

                                                                                    />
                                                                                    <FormGroupCustom
                                                                                        type={"text"}
                                                                                        key={`message_variable-${b}.value`}
                                                                                        noLabel
                                                                                        control={control}
                                                                                        placeholder={`Enter content of {{${b + 1}}}`}
                                                                                        value={watch(`message_variable.${b}.value`) ?? ''}
                                                                                        name={`message_variable.${b}.value`}
                                                                                        // name={`.${b + 1}.value`}
                                                                                        // value={`edit?.variable[${i}]`}
                                                                                        className={`animation-item-name-${b}`}
                                                                                        // label="Group Name"
                                                                                        errors={errors}
                                                                                        rules={{ required: false }}
                                                                                        onChangeValue={(e) => { setMessageVariable(b, e) }}
                                                                                    // append={b  === 0 ? null : <InputGroupText role={"button"} onClick={e => bodyRemove(b)}>
                                                                                    //     <Trash2 className='text-danger' size={16} />
                                                                                    // </InputGroupText>
                                                                                    // }
                                                                                    />
                                                                                </InputGroup>
                                                                            </Col>
                                                                            <Col sm={12}>
                                                                                <br />
                                                                            </Col>
                                                                        </Row>
                                                                    </Tag>
                                                                )
                                                            })}

                                                        </Col>


                                                    </Row>
                                                </div>
                                            </Show>
                                            <Show IF={watch("parameter_format") === 'NAMED'}>
                                                <div className='mt-2'>
                                                    <h5 className='mt-1 fw-bolder'>Body <span className='text-danger'>*</span></h5>
                                                    <p> Enter the text for your message in the language you've selected.</p>

                                                    <Row>
                                                        <Col md="12">
                                                            <FormGroupCustom
                                                                // defaultOptions
                                                                key={`nameText-${nameMessage.length}`}
                                                                value={watch('message')}
                                                                control={control}
                                                                type={"textarea"}
                                                                errors={errors}
                                                                name={"message"}
                                                                style={{ minHeight: 100 }}
                                                                isClearable
                                                                placeholder="Enter Your content here"
                                                                className='mb-1'
                                                                // options={createConstSelectOptions(textType)}
                                                                // label="Priority"
                                                                noLabel
                                                                rules={{ required: true, maxLength: 1024 }}
                                                                onChangeValue={(e) => {

                                                                    if (e.length > 1024) {
                                                                        e = e.slice(0, 1024)
                                                                    }
                                                                    setValue('message', e)
                                                                }}
                                                                onKeyUp={(e) => {
                                                                    if (e.target.value.length > 1024) {
                                                                        e.target.value = e.target.value.slice(0, 1024)
                                                                    }
                                                                }}
                                                                append={<InputGroupText role={"button"}>
                                                                    <p>{countCharacters(renderNamedBodyText)}/{totalBodyCount} </p>
                                                                </InputGroupText>
                                                                }

                                                            />

                                                        </Col>
                                                        <div>

                                                        </div>
                                                        {/* <Col md="12" className='' style={{ backgroundColor: '#f5dc98' }}>

                                                    <p className='fw-bold mt-1'>
                                                        <WarningAmber color='warning' />      This template contains too many variable parameters relative to the message length. You need to decrease the number of variable parameters or increase the message length.
                                                    </p>

                                                    <p style={{ cursor: "pointer" }}>Learn more about formatting in Message Template Guidelines. </p>

                                                </Col> */}

                                                        {/* <Col md="12"> */}
                                                        {/* <div className='d-flex justify-content-between'>
                                            <p>Character : 0/1024</p>
                                        </div>
                                        <div >
                                            <p>Character : 0/1024</p>
                                        </div> */}
                                                        {/* </Col> */}

                                                        {/* <Col md="2">
                                                    <p>Character : 0/1024</p>
                                                </Col> */}
                                                        <div className='d-flex justify-content-end'>
                                                            <Badge pill color='primary' onClick={addNameBody} style={{ cursor: 'pointer' }}  >+ Add variable</Badge>
                                                        </div>

                                                        {/* <Col md="2" className='d-flex justify-content-end'>
                                                    <p onClick={addBody}>+ Add Variable </p>
                                                </Col> */}

                                                        <Col md="12" className='mt-2 border' >

                                                            <p className='fw-bolder mt-1'>
                                                                Samples for body content
                                                            </p>

                                                            <p className='fw-bold mt-1'>
                                                                To help us review your message template, please add an example of each variable in your body text. Do not use real customer information. Cloud API hosted by Meta reviews template and variable parameters to protect the security and integrity of our services
                                                            </p>


                                                            {nameMessage.map((body, b) => {
                                                                const Tag = b === 0 ? 'div' : SlideDown
                                                                return (
                                                                    <Tag key={body?.id}>
                                                                        <Row>
                                                                            <Col md={6}>
                                                                                <FormGroupCustom
                                                                                    key={`named_message_variable-${b}.param_name`}
                                                                                    type={"text"}
                                                                                    noLabel
                                                                                    control={control}
                                                                                    placeholder={`Enter variable name`}
                                                                                    value={watch(`named_message_variable.${b}.param_name`) ?? ''}
                                                                                    name={`named_message_variable.${b}.param_name`}
                                                                                    errors={errors}
                                                                                    rules={{ required: false }}
                                                                                    disabled
                                                                                />
                                                                            </Col>
                                                                            <Col md={6}>
                                                                                <InputGroup>
                                                                                    <FormGroupCustom
                                                                                        key={`named_message_variable-${b}.id`}
                                                                                        type={"hidden"}
                                                                                        noLabel
                                                                                        noGroup
                                                                                        control={control}
                                                                                        value={body?.id}
                                                                                        name={`named_message_variable.${b}.id`}
                                                                                    />
                                                                                    <FormGroupCustom
                                                                                        type={"text"}
                                                                                        key={`named_message_variable-${b}.example`}
                                                                                        noLabel
                                                                                        control={control}
                                                                                        placeholder={`Enter example value`}
                                                                                        value={watch(`named_message_variable.${b}.example`) ?? ''}
                                                                                        name={`named_message_variable.${b}.example`}
                                                                                        className={`animation-item-name-${b}`}
                                                                                        errors={errors}
                                                                                        rules={{ required: false }}
                                                                                        onChangeValue={(e) => { setValue(`named_message_variable.${b}.example`, e) }}
                                                                                    />
                                                                                </InputGroup>
                                                                            </Col>
                                                                        </Row>
                                                                        <Col sm={12}>
                                                                            <br />
                                                                        </Col>
                                                                    </Tag>
                                                                )
                                                            })}

                                                        </Col>


                                                    </Row>
                                                </div>
                                            </Show>

                                            <div className='mt-2'>

                                                <h5 className='mt-1 fw-bolder'>Footer </h5>

                                                <p> Add a short line of text to the bottom of your message template. If tou add the Marketing opt-out button, the associated footer will be shown here by default</p>

                                                <Row>
                                                    <Col md="12">
                                                        <FormGroupCustom
                                                            control={control}
                                                            type={"text"}
                                                            errors={errors}
                                                            name={"footer_text"}
                                                            isClearable
                                                            placeholder="Footer"
                                                            className='mb-1'
                                                            // options={createConstSelectOptions(textType)}
                                                            label="Footer"
                                                            noLabel
                                                            rules={{ required: false, maxLength: 60 }}
                                                            onChangeValue={(e) => { setFooterText(e) }}
                                                            onKeyUp={(e) => {
                                                                if (e.target.value.length > 60) {
                                                                    e.target.value = e.target.value.slice(0, 60)
                                                                }
                                                                // restrictCharacters(e, 60)
                                                            }}
                                                            append={<InputGroupText role={"button"} className='newStyle' >
                                                                <p className='extraParagraph' >{countCharacters(footerText)}/{totalFooterCount} </p>
                                                            </InputGroupText>
                                                            }
                                                        />

                                                    </Col>
                                                </Row>

                                            </div>


                                            <div className='mt-2'>
                                                <h5 className='mt-1 fw-bolder'>Tag</h5>

                                                <div className="tags-input-container d-flex flex-wrap align-items-center border p-1 rounded">
                                                    {tags.map((tag, index) => (
                                                        <Badge key={index} color='primary' className="d-flex align-items-center me-1 mb-1">
                                                            {tag}
                                                            <X
                                                                size={14}
                                                                className='ms-1'
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => removeTag(tag)}
                                                            />
                                                        </Badge>
                                                    ))}
                                                    <CreatableSelect
                                                        isClearable={false}
                                                        isSearchable
                                                        // options={tagOptions}
                                                        value={null}
                                                        inputValue={tagInputValue}
                                                        onInputChange={setTagInputValue}
                                                        onKeyDown={handleTagKeyDown}
                                                        placeholder="Enter text here"
                                                        className='react-select-container'
                                                        classNamePrefix='react-select'
                                                        styles={{
                                                            control: (base) => ({ ...base, border: 0, boxShadow: 'none' }),
                                                            container: (base) => ({ ...base, flexGrow: 1, minWidth: '150px' })
                                                        }}
                                                        onChange={(selectedOption) => {
                                                            if (selectedOption && !tags.includes(selectedOption.value)) {
                                                                setTags([...tags, selectedOption.value])
                                                            }
                                                            setTagInputValue('')
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className='mt-2'>

                                                <h5 className='mt-1 fw-bolder'>Buttons </h5>

                                                <p>Create buttons that let customer to response your message or text action. </p>

                                                <Alert color='primary'>
                                                    <div className='alert-body'>
                                                        {/* <Star size={15} /> */}
                                                        <TipsAndUpdates />
                                                        <span className='ms-1'>
                                                            We recommend adding the marketing opt-out button.
                                                        </span>
                                                        <br />
                                                        <span className='ms-1'>
                                                            Allow customers to request to opt-out of all marketing messages. This can help to reduce blocks form customer and increase your quality rating.
                                                        </span>
                                                    </div>
                                                </Alert>

                                                <div className='mt-1'>
                                                    <span className=''><TipsAndUpdates color='primary' />  You can add more than 3 buttons, they will appear in the list. </span>

                                                </div>

                                                {/* <UncontrolledButtonDropdown>
                                                <DropdownToggle className='mt-1' color='info' caret>Add Button</DropdownToggle>
                                                <DropdownMenu className=''>
                                                    <DropdownItem tag='a' header className='fw-bolder' disabled>Quick Reply Buttons</DropdownItem>
                                                    <DropdownItem tag='a' onClick={() => { addCustom(); setQuickReply(1) }} disabled={quickReply === 2} >Custom</DropdownItem>

                                                    <DropdownItem divider></DropdownItem>

                                                    <DropdownItem tag='a' header className='fw-bolder' disabled>Call to action buttons</DropdownItem>
                                                    <DropdownItem tag='a' onClick={() => { addWebsite(); setQuickReply(2) }} disabled={quickReply === 1}>Visit website <br /> <span className='fw-bold'>2 buttons maximum </span></DropdownItem>
                                                    <DropdownItem tag='a' onClick={() => { addPhone(); setQuickReply(2) }} disabled={quickReply === 1} >Call phone number <br /> <span className='fw-bold'>1 buttons maximum </span></DropdownItem>
                                                    </DropdownMenu>
                                            </UncontrolledButtonDropdown> */}
                                                <UncontrolledButtonDropdown>
                                                    <DropdownToggle className='mt-1' color='info' caret>Add Button</DropdownToggle>
                                                    <DropdownMenu className=''>
                                                        <DropdownItem tag='a' header className='fw-bolder' disabled>Quick Reply Buttons</DropdownItem>
                                                        <DropdownItem tag='a' onClick={() => { addCustom(); setQuickReply(1); buttonClick() }} disabled={buttonCount === 9} >Custom</DropdownItem>

                                                        <DropdownItem divider></DropdownItem>

                                                        <DropdownItem tag='a' header className='fw-bolder' disabled>Call to action buttons</DropdownItem>
                                                        <DropdownItem tag='a' onClick={() => { addWebsite(); setQuickReply(2); buttonClick() }} disabled={buttonCount === 9}>Visit website</DropdownItem>
                                                        <DropdownItem tag='a' onClick={() => { addPhone(); setQuickReply(2); buttonClick() }} disabled={buttonCount === 9} >Call phone number</DropdownItem>
                                                    </DropdownMenu>
                                                </UncontrolledButtonDropdown>
                                                <br />

                                            </div>

                                            {marketing.map((market, i) => {
                                                const Tag = i === 0 ? 'div' : SlideDown
                                                return (
                                                    <Tag key={market?.id}>


                                                        <div className='mt-2 border p-4'>
                                                            <h3 className='fw-bolder mb-2'>Quick Reply</h3>
                                                            <Row>
                                                                <Col md="12" className='mb-0'>

                                                                    <div className='border p-3'>

                                                                        <div className=''>
                                                                            <Row>
                                                                                <Col md="4">
                                                                                    <FormGroupCustom

                                                                                        control={control}
                                                                                        type={"select"}
                                                                                        value={"marketing_opt_opt"}
                                                                                        errors={errors}
                                                                                        // name={"button_type"}
                                                                                        name={`template_buttons.[${i}].button_type`}
                                                                                        isClearable
                                                                                        placeholder="Enter Message"
                                                                                        className='mb-1'
                                                                                        options={createConstSelectOptions(buttonActions)}
                                                                                        label="Type"
                                                                                        // noLabel
                                                                                        rules={{ required: false }}
                                                                                    />

                                                                                </Col>
                                                                                <Col md="4">
                                                                                    <FormGroupCustom

                                                                                        control={control}
                                                                                        type={"text"}
                                                                                        errors={errors}
                                                                                        name={"footer"}
                                                                                        isClearable
                                                                                        disabled
                                                                                        placeholder="Enter Message"
                                                                                        className='mb-1'
                                                                                        // options={createConstSelectOptions(textType)}
                                                                                        label="Button Text"
                                                                                        // noLabel
                                                                                        rules={{ required: false }}
                                                                                    />

                                                                                </Col>
                                                                                <Col md="4">
                                                                                    <FormGroupCustom

                                                                                        control={control}
                                                                                        type={"text"}
                                                                                        errors={errors}
                                                                                        name={"footer"}
                                                                                        isClearable
                                                                                        disabled
                                                                                        placeholder="Enter Message"
                                                                                        className='mb-1'
                                                                                        // options={createConstSelectOptions(textType)}
                                                                                        label="Footer Text"
                                                                                        // noLabel
                                                                                        rules={{ required: false }}


                                                                                    />

                                                                                </Col>

                                                                                {/* <Col md="12">
                                                                                <FormGroupCustom
                                                                                    label="I understand that it's Test Whatsapp Business Account's responsibility to stop sending marketing message to customers who otp out. "
                                                                                    control={control}
                                                                                    type={"checkbox"}
                                                                                    errors={errors}
                                                                                    name={"footer"}
                                                                                    isClearable
                                                                                    placeholder="Enter Message"
                                                                                    className='mb-1'
                                                                                    // options={createConstSelectOptions(textType)}

                                                                                    // noLabel
                                                                                    rules={{ required: false }}

                                                                                />
                                                                            </Col> */}
                                                                            </Row>

                                                                        </div>
                                                                        <BsTooltip title={'Delete'} content={'Remove Button'}>
                                                                            <Trash2 className='text-danger' size={16} onClick={e => marketingRemove(i)} style={{ cursor: 'pointer' }} />
                                                                        </BsTooltip>
                                                                    </div>
                                                                </Col>

                                                            </Row>
                                                        </div>

                                                    </Tag>
                                                )
                                            })}
                                            {custom.map((customAction, i) => {
                                                const Tag = i === 0 ? 'div' : SlideDown
                                                return (
                                                    <Tag key={customAction?.id}>


                                                        <div className='mt-2 border p-1'>
                                                            <h3 className='fw-bolder mb-2'> {customAction?.button_type === buttonActions.Custom ? 'Quick Reply' : 'Call To Action'}  </h3>

                                                            <Row>
                                                                <Col md="12" className='mb-0'>
                                                                    <div className='border p-1'>
                                                                        <div className=''>
                                                                            <Show IF={customAction?.button_type === buttonActions.Custom}>
                                                                                <Row>
                                                                                    <Col md="4">
                                                                                        <FormGroupCustom

                                                                                            control={control}
                                                                                            type={"select"}
                                                                                            value={customAction?.button_type}
                                                                                            errors={errors}
                                                                                            name={`template_buttons.[${i}].button_type`}
                                                                                            // name={"type"}
                                                                                            // isClearable
                                                                                            disabled
                                                                                            placeholder="Enter Message"
                                                                                            className='mb-1 pe-none'
                                                                                            options={createConstSelectOptions(buttonActions)}
                                                                                            label="Type"
                                                                                            // noLabel
                                                                                            rules={{ required: false }}
                                                                                        />

                                                                                    </Col>
                                                                                    <Col md="8">
                                                                                        <FormGroupCustom

                                                                                            control={control}
                                                                                            type={"text"}
                                                                                            errors={errors}
                                                                                            // name={"button_text"}
                                                                                            name={`template_buttons.[${i}].button_text`}

                                                                                            placeholder="Enter Message"
                                                                                            className='mb-1'
                                                                                            onChangeValue={(e) => { setButtonText(e) }}
                                                                                            // options={createConstSelectOptions(textType)}
                                                                                            label="Button Text"
                                                                                            // noLabel
                                                                                            rules={{ required: false }}
                                                                                        />

                                                                                    </Col>


                                                                                    {/* <Col md="12">
                                                                                <FormGroupCustom
                                                                                    label="I understand that it's Test Whatsapp Business Account's responsibility to stop sending marketing message to customers who otp out. "
                                                                                    control={control}
                                                                                    type={"checkbox"}
                                                                                    errors={errors}

                                                                                    name={"footer"}
                                                                                    isClearable
                                                                                    placeholder="Enter Message"
                                                                                    className='mb-1'
                                                                                    // options={createConstSelectOptions(textType)}

                                                                                    // noLabel
                                                                                    rules={{ required: false }}
                                                                                />
                                                                            </Col> */}
                                                                                </Row>
                                                                                <BsTooltip title={'Delete'} content={'Remove Button'}>
                                                                                    <Trash2 className='text-danger' size={16} onClick={() => {
                                                                                        if (i === 0) {
                                                                                            setQuickReply(0)
                                                                                        }
                                                                                        customRemove(i)

                                                                                    }} style={{ cursor: 'pointer' }} />
                                                                                </BsTooltip>
                                                                            </Show>
                                                                            <Show IF={customAction?.button_type === buttonActions['Visit Website']}>
                                                                                <Row>
                                                                                    <Col md="3">
                                                                                        <FormGroupCustom

                                                                                            control={control}
                                                                                            type={"text"}
                                                                                            value={'URL'}
                                                                                            errors={errors}
                                                                                            // name={"button_type"}
                                                                                            name={`template_buttons.[${i}].button_type`}
                                                                                            // isClearable
                                                                                            disabled
                                                                                            className='mb-1 pe-none'
                                                                                            // options={createConstSelectOptions(callToAction)}
                                                                                            label="Type"
                                                                                            // noLabel
                                                                                            rules={{ required: false }}
                                                                                        />

                                                                                    </Col>

                                                                                    <FormGroupCustom
                                                                                        control={control}
                                                                                        type={"hidden"}
                                                                                        errors={errors}
                                                                                        noLabel
                                                                                        noGroup
                                                                                        // name={'button_val_name'}
                                                                                        name={`template_buttons.[${i}].button_val_name`}
                                                                                        // value='url'
                                                                                        value={"url"}
                                                                                    />

                                                                                    <Col md="3">

                                                                                        <FormGroupCustom

                                                                                            control={control}
                                                                                            type={"text"}
                                                                                            errors={errors}
                                                                                            // name={"button_text"}
                                                                                            name={`template_buttons.[${i}].button_text`}
                                                                                            onChangeValue={(e) => { setButtonText(e) }}
                                                                                            placeholder="Enter Message"
                                                                                            className='mb-1'
                                                                                            // options={createConstSelectOptions(textType)}
                                                                                            label="Button Text"
                                                                                            // noLabel
                                                                                            rules={{ required: false }}
                                                                                        />

                                                                                    </Col>
                                                                                    <Hide IF={watch('type') === 'copy_offer_code'}>
                                                                                        <Col md="3">
                                                                                            <FormGroupCustom

                                                                                                control={control}
                                                                                                type={"select"}
                                                                                                errors={errors}
                                                                                                // name={"url_type"}
                                                                                                name={`template_buttons.[${i}].url_type`}
                                                                                                placeholder="Select Type"
                                                                                                className='mb-1'
                                                                                                options={createConstSelectOptions(urlType)}
                                                                                                label="URL Type"
                                                                                                // noLabel
                                                                                                rules={{ required: false }}
                                                                                            />

                                                                                        </Col>
                                                                                        <Show IF={watch(`template_buttons.[${i}].url_type`) === 'static'}>
                                                                                            <Col md="3">
                                                                                                <FormGroupCustom
                                                                                                    key={`urlText-${footer.length}`}
                                                                                                    value={urlText}
                                                                                                    control={control}
                                                                                                    type={"text"}
                                                                                                    errors={errors}
                                                                                                    // name={"button_value"}
                                                                                                    name={`template_buttons.[${i}].button_value`}
                                                                                                    placeholder="https://www.example.com"
                                                                                                    className='mb-1'
                                                                                                    // options={createConstSelectOptions(textType)}
                                                                                                    label="Website URL"
                                                                                                    // noLabel
                                                                                                    rules={{ required: false }}
                                                                                                    onChangeValue={(e) => { setUrlText(e) }}

                                                                                                />

                                                                                            </Col>
                                                                                        </Show>
                                                                                        <Show IF={watch(`template_buttons.[${i}].url_type`) === 'dynamic'}>
                                                                                            <Col md="3">
                                                                                                <FormGroupCustom
                                                                                                    key={`urlText-${footer.length}`}
                                                                                                    value={watch(`template_buttons.[${i}].button_value`)}
                                                                                                    control={control}
                                                                                                    type={"text"}
                                                                                                    errors={errors}

                                                                                                    // name={"button_value"}
                                                                                                    name={`template_buttons.[${i}].button_value`}
                                                                                                    placeholder="https://www.example.com"
                                                                                                    className='mb-1'
                                                                                                    // options={createConstSelectOptions(textType)}
                                                                                                    label="Website URL"
                                                                                                    // noLabel
                                                                                                    rules={{ required: false }}
                                                                                                    onChangeValue={(e) => { setUrlText(e) }}
                                                                                                    append={<InputGroupText role={"button"} onClick={e => addFooter(`template_buttons.[${i}].button_value`)}>
                                                                                                        <Plus size={16} />
                                                                                                    </InputGroupText>
                                                                                                    }
                                                                                                />

                                                                                            </Col>
                                                                                        </Show>

                                                                                        {/* <Show IF={watch('url_type') === 'dynamic'}> */}
                                                                                        {footer.map((foot, f) => {
                                                                                            const Tag = f === 0 ? 'div' : SlideDown
                                                                                            return (
                                                                                                <Tag key={foot?.id}>
                                                                                                    <Row className=''>
                                                                                                        <Col md={1} className=''>
                                                                                                            <p>{`{{${(f + 1)}}}`} </p>
                                                                                                        </Col>
                                                                                                        <Col md={11} className=''>
                                                                                                            <InputGroup>
                                                                                                                <FormGroupCustom
                                                                                                                    key={`template_buttons-${f}.id`}
                                                                                                                    type={"hidden"}
                                                                                                                    noLabel
                                                                                                                    noGroup
                                                                                                                    control={control}
                                                                                                                    value={foot?.id}
                                                                                                                    name={`template_buttons.${f}.id`}

                                                                                                                />
                                                                                                                <FormGroupCustom
                                                                                                                    type={"text"}
                                                                                                                    key={`template_buttons-${f}.button_variables`}
                                                                                                                    noLabel
                                                                                                                    control={control}
                                                                                                                    placeholder={`Enter content of {{${f + 1}}}`}
                                                                                                                    value={foot?.value}
                                                                                                                    name={`template_buttons.${f}.button_variables`}
                                                                                                                    // name={`.${b + 1}.value`}
                                                                                                                    // value={`edit?.variable[${i}]`}
                                                                                                                    className={`animation-item-name-${f}`}
                                                                                                                    // label="Group Name"
                                                                                                                    errors={errors}
                                                                                                                    rules={{ required: false }}
                                                                                                                    onChangeValue={(e) => { setFooterText(f, e) }}
                                                                                                                // append={b  === 0 ? null : <InputGroupText role={"button"} onClick={e => bodyRemove(b)}>
                                                                                                                //     <Trash2 className='text-danger' size={16} />
                                                                                                                // </InputGroupText>
                                                                                                                // }
                                                                                                                />
                                                                                                            </InputGroup>
                                                                                                        </Col>
                                                                                                        <Col sm={12}>
                                                                                                            <br />
                                                                                                        </Col>
                                                                                                    </Row>
                                                                                                </Tag>
                                                                                            )
                                                                                        })}
                                                                                        {/* </Show> */}
                                                                                    </Hide>
                                                                                    <Show IF={watch('type') === 'copy_offer_code'}>
                                                                                        <Col md="12">
                                                                                            <h4 className='fw-bolder mb-2'>Add sample offer code</h4>
                                                                                            <p className='fw-bolder'>
                                                                                                To help us review your message template, please add an example for your offer code.
                                                                                            </p>
                                                                                        </Col>

                                                                                        <Col md="12">
                                                                                            <FormGroupCustom

                                                                                                control={control}
                                                                                                type={"text"}
                                                                                                errors={errors}
                                                                                                // name={"offer_code"}
                                                                                                name={`template_buttons.[${i}].offer_code`}

                                                                                                placeholder="Enter Sample"
                                                                                                className='mb-1'
                                                                                                // options={createConstSelectOptions(textType)}
                                                                                                label="Offer Code"
                                                                                                // noLabel
                                                                                                rules={{ required: false }}
                                                                                            />

                                                                                        </Col>
                                                                                    </Show>
                                                                                </Row>
                                                                                <BsTooltip title={'Delete'} content={'Remove Button'}>
                                                                                    <Trash2 className='text-danger' size={16} onClick={() => {
                                                                                        if (i === 0) {
                                                                                            setQuickReply(0)
                                                                                        }

                                                                                        customRemove(i)
                                                                                        footerRemove(i)
                                                                                    }} style={{ cursor: 'pointer' }} />
                                                                                </BsTooltip>

                                                                            </Show>
                                                                            <Show IF={customAction?.button_type === buttonActions['Call Phone Number']}>
                                                                                <Row>
                                                                                    <Col md="3">
                                                                                        <FormGroupCustom

                                                                                            control={control}
                                                                                            type={"select"}
                                                                                            value={"call_phone_number"}
                                                                                            errors={errors}
                                                                                            // name={"button_type"}
                                                                                            // name={`button_type[${p}].value`}
                                                                                            name={`template_buttons.[${i}].button_type`}
                                                                                            // isClearable
                                                                                            disabled
                                                                                            placeholder="Enter Message"
                                                                                            className='mb-1 pe-none'
                                                                                            options={createConstSelectOptions(callToAction)}
                                                                                            label="Type"
                                                                                            // noLabel
                                                                                            rules={{ required: false }}
                                                                                        />

                                                                                    </Col>
                                                                                    <FormGroupCustom
                                                                                        // key={`message_variable-${b}.id`}
                                                                                        type={"hidden"}
                                                                                        noLabel
                                                                                        noGroup
                                                                                        control={control}

                                                                                        value={'phone_number'}
                                                                                        // name={`button_val_name`}
                                                                                        // name={`button_val_name[${i}].value`}
                                                                                        name={`template_buttons.[${i}].button_val_name`}
                                                                                    />
                                                                                    <Col md="3">

                                                                                        <FormGroupCustom

                                                                                            control={control}
                                                                                            type={"text"}
                                                                                            errors={errors}
                                                                                            // name={"button_text"}
                                                                                            // name={`button_text[${i}].value`}
                                                                                            name={`template_buttons.[${i}].button_text`}

                                                                                            onChangeValue={(e) => { setButtonText(e) }}
                                                                                            placeholder="Enter Message"
                                                                                            className='mb-1'
                                                                                            // options={createConstSelectOptions(textType)}
                                                                                            label="Button Text"
                                                                                            // noLabel
                                                                                            rules={{ required: false }}
                                                                                        />

                                                                                    </Col>

                                                                                    {/* <Col md="3">
                                                                                <FormGroupCustom

                                                                                    control={control}
                                                                                    type={"text"}
                                                                                    errors={errors}
                                                                                    name={"country_code"}

                                                                                    placeholder="Select Type"
                                                                                    className='mb-1'
                                                                                    options={createConstSelectOptions(urlType)}
                                                                                    label="Country"
                                                                                    // noLabel
                                                                                    rules={{ required: false }}
                                                                                />

                                                                            </Col> */}

                                                                                    <Col md="3">
                                                                                        <FormGroupCustom
                                                                                            control={control}
                                                                                            type={"number"}
                                                                                            errors={errors}
                                                                                            // name={"button_value"}
                                                                                            // name={`button_value[${i}].value`}
                                                                                            name={`template_buttons.[${i}].button_value`}
                                                                                            // placeholder="https://www.example.com"
                                                                                            className='mb-1'
                                                                                            // options={createConstSelectOptions(textType)}
                                                                                            label="Phone Number"
                                                                                            // noLabel
                                                                                            rules={{ required: false }}
                                                                                        />

                                                                                    </Col>


                                                                                </Row>
                                                                                <BsTooltip title={'Delete'} content={'Remove Button'}>
                                                                                    <Trash2 className='text-danger' size={16} onClick={() => {

                                                                                        if (i === 0) {
                                                                                            setQuickReply(0)
                                                                                        }
                                                                                        customRemove(i)
                                                                                    }} style={{ cursor: 'pointer' }} />
                                                                                </BsTooltip>
                                                                            </Show>
                                                                        </div>
                                                                        {/* <Trash2 className='text-danger' size={16} onClick={(i, market) => { customRemove(i) }} style={{ cursor: 'pointer' }} /> */}
                                                                    </div>
                                                                </Col>


                                                            </Row>

                                                        </div>

                                                    </Tag>
                                                )
                                            })}
                                            {/* <Button color='primary' type='submit' className='mt-2' > Save</Button > */}

                                            <LoadingButton color='primary' type='submit' className='mt-2' loading={loading} > Save</LoadingButton >
                                        </CardBody >
                                    </Card >
                                </Col >
                                <Col md="3">

                                    <div className="page">
                                        <div className="marvel-device nexus5">
                                            <div className="top-bar"></div>
                                            <div className="sleep"></div>
                                            <div className="volume"></div>
                                            <div className="camera"></div>
                                            <div className="screen">
                                                <div className="screen-container">
                                                    {/* <div className="status-bar">
                                                    <div className="time"></div>
                                                    <div className="battery">
                                                        <i className="zmdi zmdi-battery"></i>
                                                    </div>
                                                    <div className="network">
                                                        <i className="zmdi zmdi-network"></i>
                                                    </div>
                                                    <div className="wifi">
                                                        <i className="zmdi zmdi-wifi-alt-2"></i>
                                                    </div>
                                                    <div className="star">
                                                        <i className="zmdi zmdi-star"></i>
                                                    </div>
                                                </div> */}
                                                    <div className="chat">
                                                        <div className="chat-container">
                                                            <div className="user-bar">
                                                                <div className="back">
                                                                    {/* <i className="zmdi zmdi-arrow-left"></i> */}
                                                                    <ArrowLeft />
                                                                </div>
                                                                <div className="avatar">
                                                                    <img src={require("../../assets/images/avatars/avatar-blank.png").default} alt="Avatar" />
                                                                </div>
                                                                <div className="name">
                                                                    <span>Business</span>
                                                                    <span className="status">online</span>
                                                                </div>
                                                                {/* <div className="actions more">
                                                                <i className="zmdi zmdi-more-vert"></i>
                                                            </div>
                                                            <div className="actions attachment">
                                                                <i className="zmdi zmdi-attachment-alt"></i>
                                                            </div>
                                                            <div className="actions">
                                                                <i className="zmdi zmdi-phone"></i>
                                                            </div> */}
                                                            </div>
                                                            <div className="conversation">
                                                                <div className="conversation-container">
                                                                    {/* <div className="message sent">
                                                                    What happened last night?
                                                                    <span className="metadata">
                                                                        <span className="time"></span><span className="tick"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" id="msg-dblcheck-ack" x="2063" y="2076"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="#4fc3f7" /></svg></span>
                                                                    </span>
                                                                </div>
                                                                <div className="message received">
                                                                    You were drunk.
                                                                    <span className="metadata"><span className="time"></span></span>
                                                                </div>
                                                                <div className="message sent">
                                                                    No I wasn't.
                                                                    <span className="metadata">
                                                                        <span className="time"></span><span className="tick"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" id="msg-dblcheck-ack" x="2063" y="2076"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="#4fc3f7" /></svg></span>
                                                                    </span>
                                                                </div> */}
                                                                    <div className="message received">
                                                                        <Show IF={watch('template_type') === 'Media' && headerType === 0}>
                                                                            <img className='rounded me-50'
                                                                                // src={avatar ?? (user?.companyLogo ? httpConfig?.baseUrl2 + user?.companyLogo : null) ?? "https://via.placeholder.com/200"}
                                                                                src={avatar ? avatar : "https://via.placeholder.com/200"}
                                                                                alt='image' height='auto' width='100%' />
                                                                        </Show>
                                                                        <Show IF={watch('template_type') === 'Media' && headerType === 1}>
                                                                            {/* <img className='rounded me-50'
                                                                            src={avatar ? avatar : "https://via.placeholder.com/200"}
                                                                            alt='video' height='100' width='100' /> */}
                                                                            <video src={avatar ? avatar : "https://via.placeholder.com/200"} controls alt="Image_Photo" className='img-fluid' width="300" height="200" />
                                                                        </Show>


                                                                        <Show IF={watch('template_type') === 'Media' && headerType === 2}>
                                                                            {/* <img className='rounded me-50'
                                                                            src={avatar ? avatar : "https://via.placeholder.com/200"}
                                                                            alt='video' height='100' width='100' /> */}
                                                                            {/* <video src={avatar ? avatar : "https://via.placeholder.com/200"} controls alt="Image_Photo" className='img-fluid' width="300" height="200" /> */}
                                                                        </Show>
                                                                        <Show IF={watch('template_type') === 'Media' && headerType === 4}>
                                                                            {/* <img className='rounded me-50'
                                                                            src={avatar ? avatar : "https://via.placeholder.com/200"}
                                                                            alt='video' height='100' width='100' /> */}
                                                                            <audio src={''} controls={true} />
                                                                        </Show>
                                                                        <Show IF={watch("parameter_format") === 'POSITIONAL'}>
                                                                            <div id="random" className='fw-bolder' dangerouslySetInnerHTML={{ __html: renderTextWithFormatting(renderHeaderText) }} />
                                                                        </Show>
                                                                        <Show IF={watch("parameter_format") === 'NAMED'}>
                                                                            <div id="random" className='fw-bolder' dangerouslySetInnerHTML={{ __html: renderTextWithFormatting(renderNamedHeaderText) }} />
                                                                        </Show>
                                                                        {/* <br /> */}
                                                                        <Show IF={watch("parameter_format") === 'POSITIONAL'}>
                                                                            <div id="random" className='fw-bold mt-1' dangerouslySetInnerHTML={{ __html: renderTextWithFormatting(renderBodyText) }} />
                                                                        </Show>
                                                                        <Show IF={watch("parameter_format") === 'NAMED'}>
                                                                            <div id="random" className='fw-bold mt-1' dangerouslySetInnerHTML={{ __html: renderTextWithFormatting(renderNamedBodyText) }} />
                                                                        </Show>
                                                                        <br />
                                                                        <div id="random" dangerouslySetInnerHTML={{ __html: renderTextWithFormatting(footerText) }} />
                                                                        <span className="metadata"><span className="time"></span></span>

                                                                    </div>
                                                                    <Row>
                                                                        {watch('button_text')?.map((button, b) => {
                                                                            return (
                                                                                <Col md="6">
                                                                                    <Card>
                                                                                        <span className='fw-bold text-center' style={{ color: '#34B7F1' }}> {button?.value} </span>
                                                                                    </Card>
                                                                                </Col>
                                                                            )
                                                                        })}

                                                                    </Row>

                                                                    {custom.map((customAction, i) => {
                                                                        return (
                                                                            <Show IF={customAction?.button_type === buttonActions.Custom}>
                                                                                <div className='d-flex justify-content-center'>
                                                                                    <ContentCopy style={{ color: '34B7F1' }} /> <span className='' style={{ color: '#34B7F1' }}>Copy Offer Code</span>
                                                                                </div>
                                                                            </Show>
                                                                        )
                                                                    })}

                                                                    {/* <Show IF={isValidArray(custom)}>
                                                                    <Row>
                                                                        <span> {watch(`template_buttons.[${i}].button_text`)} </span>
                                                                    </Row>
                                                                </Show> */}


                                                                    {/* <div className="message received">
                                                                    <div className='col-md-6'>
                                                                        
                                                                    </div>
                                                                    <div className='col-md-6'>

                                                                    </div> */}

                                                                    {/* </div> */}
                                                                    {/* <Show IF={isValidArray(marketing) || isValidArray(custom) || isValidArray(website)
                                                                    || isValidArray(offer) || isValidArray(phone)}>

                                                                    <hr style={{ width: '100%', color: '#34B7F1' }} />
                                                                </Show>
                                                                <Show IF={isValidArray(offer)}>
                                                                    <div className='d-flex justify-content-center'>
                                                                        <ContentCopy style={{ color: '34B7F1' }} /> <span className='' style={{ color: '#34B7F1' }}>Copy Offer Code</span>
                                                                    </div>
                                                                </Show>
                                                                <Show IF={isValidArray(website)}>
                                                                    <div className='d-flex justify-content-center'>
                                                                        <Launch style={{ color: '34B7F1' }} />
                                                                    </div>
                                                                </Show>
                                                                <Show IF={isValidArray(phone)}>
                                                                    <div className='d-flex justify-content-center'>
                                                                        <LocalPhone style={{ color: '34B7F1' }} />
                                                                    </div>
                                                                </Show> */}
                                                                </div>
                                                                {/* <form className="conversation-compose">
                                                                <div className="emoji">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" id="smiley" x="3147" y="3209"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.153 11.603c.795 0 1.44-.88 1.44-1.962s-.645-1.96-1.44-1.96c-.795 0-1.44.88-1.44 1.96s.645 1.965 1.44 1.965zM5.95 12.965c-.027-.307-.132 5.218 6.062 5.55 6.066-.25 6.066-5.55 6.066-5.55-6.078 1.416-12.13 0-12.13 0zm11.362 1.108s-.67 1.96-5.05 1.96c-3.506 0-5.39-1.165-5.608-1.96 0 0 5.912 1.055 10.658 0zM11.804 1.01C5.61 1.01.978 6.034.978 12.23s4.826 10.76 11.02 10.76S23.02 18.424 23.02 12.23c0-6.197-5.02-11.22-11.216-11.22zM12 21.355c-5.273 0-9.38-3.886-9.38-9.16 0-5.272 3.94-9.547 9.214-9.547a9.548 9.548 0 0 1 9.548 9.548c0 5.272-4.11 9.16-9.382 9.16zm3.108-9.75c.795 0 1.44-.88 1.44-1.963s-.645-1.96-1.44-1.96c-.795 0-1.44.878-1.44 1.96s.645 1.963 1.44 1.963z" fill="#7d8489" /></svg>
                                                                </div>
                                                                <input className="input-msg" name="input" placeholder="Type a message" autocomplete="off" autofocus></input>
                                                                <div className="photo">
                                                                    <i className="zmdi zmdi-camera"></i>
                                                                </div>
                                                                <button className="send">
                                                                    <div className="circle">
                                                                        <i className="zmdi zmdi-mail-send"></i>
                                                                    </div>
                                                                </button>
                                                            </form> */}
                                                            </div>
                                                        </div> 
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* <div className="chat-container">
                            <div className="chat">

                                <div className="message outgoing">
                                    <div className="text">
                                        <p>Hi! How are you doing?</p>
                                        <span className="time">10:05 AM</span>
                                    </div>
                                </div>

                            </div>

                        </div> */}

                                </Col>
                            </Row >
                        </div >
                    </Hide>

                </Form >
            </div >

        </>
    )
}

export default CustomTemplate
