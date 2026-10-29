// @ts-nocheck
import ContentCopy from '@mui/icons-material/ContentCopy'
import Launch from '@mui/icons-material/Launch'
import LocalPhone from '@mui/icons-material/LocalPhone'
import WhatsApp from '@mui/icons-material/WhatsApp'
import CSVReader from '@components/csv-reader'
import ListIcon from '@mui/icons-material/List'
import ReplyIcon from '@mui/icons-material/Reply'
import PlaceholderImage from '@src/assets/images/logo/image.png'
import { forwardRef, useEffect, useRef, useState } from 'react'
import { ArrowLeft } from 'react-feather'
import { useFieldArray, useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import SlideDown from '@components/slide-down'
import { Alert, Button, ButtonGroup, Card, Col, Form, Input, InputGroup, InputGroupText, Label, Progress, Row, Table } from 'reactstrap'
import { uploadFiles } from '../../utility/apis/common'
import { loadContactGroup } from '../../utility/apis/contactGroup'
import { getCountry } from '../../utility/apis/country'
import { loadUserChild } from '../../utility/apis/userManagement'
import { loadWhatsappCharges } from '../../utility/apis/whatsappCharges'
import { loadWhatsappConfig, sendWhatsappMessage } from '../../utility/apis/whatsappConfig'
import { downloadSampleFileWa, loadWhatsappTemplate } from '../../utility/apis/whatsappTemplate'
import { isValid, isValidArray, log, renderTextWithFormatting } from '../../utility/helpers/common'
import Hide from '../../utility/Hide'
import httpConfig from '../../utility/http/httpConfig'
import Show from '../../utility/Show'
import { SpaceTrim, createAsyncSelectConfigOptions, createAsyncSelectMultiUserOptions, createAsyncSelectMultiWaTempOptions, createAsyncSelectOptions, fastLoop, findName, findVariables } from '../../utility/Utils'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import WhatsappMediaCollection from './WhatsappMediaCollection'


function getHeaderType(header_variable) {
    let value = header_variable

    // Try parsing JSON if it's a JSON-like string
    try {
        value = JSON.parse(header_variable)
    } catch (e) {
        // Not JSON, keep original
    }

    // If it's an array with one element, unwrap it
    if (Array.isArray(value) && value.length === 1) {
        value = value[0]
    }

    // Regex to find {{something}}
    const match = typeof value === "string" ? value.match(/{{(.*?)}}/) : null

    if (match) {
        const insideBraces = match[1].trim()

        // If inside braces is all digits → number
        if (/^\d+$/.test(insideBraces)) {
            return "number"
        } else {
            return "string"
        }
    }

    // Fallback to normal type check
    if (Array.isArray(value)) {
        return "array"
    } else if (typeof value === "number") {
        return "number"
    } else if (typeof value === "string") {
        return "string"
    } else {
        return typeof value // object, boolean, etc.
    }
}

const SendWhatsapp = () => {
    const form = useForm()
    const contactList = useSelector(a => a.contactGroup.contactGroup)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues, setError } = form
    const users = useSelector(state => state.auth.userData)
    const [loading, setLoading] = useState(null)
    const dispatch = useDispatch()
    const [secondary, setSecondary] = useState(null)
    const [template, setTemplate] = useState(null)
    const [dltMessage, setDltMessage] = useState(null)
    const [count, setCount] = useState(1)
    const [code, setCode] = useState(null)
    const [sender, setSender] = useState(null)
    const [rSelected, setRSelected] = useState(1)
    const [user, setUser] = useState(null)
    const [messageType, setMessageType] = useState(1)
    const [shows, setShows] = useState(false)
    const [getTemplate, setGetTemplate] = useState(false)
    const [data, setData] = useState([])
    const [dataTotal, setDataTotal] = useState([])
    const [file, setFile] = useState(null)
    const [contact, setContact] = useState(null)
    const [rowsSelected, setRowsSelected] = useState([])
    const [trans, setTrans] = useState(null)
    const [avatar, setAvatar] = useState('')
    const [two, setTwo] = useState(null)
    const [pro, setPro] = useState(null)
    const [voice, setVoice] = useState(null)
    const [cSelected, setCSelected] = useState(1)
    const [columns, setColumns] = useState([])
    const [customMessageType, setCustomMessageType] = useState(1)
    const [progress, setProgress] = useState(0)
    const [progress2, setProgress2] = useState(0)
    const [uploaded, setUploaded] = useState(null)
    const [mediaUploaded, setMediaUploaded] = useState(null)
    const [group, setGroup] = useState(null)
    const [loadConfig, setLoadConfig] = useState(false)
    const [controller, setController] = useState(new AbortController())
    const [filterData, setFilterData] = useState({ per_page_record: 10 })
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage, setRowsPerPage] = useState("2")
    const [page, setPage] = useState(1)
    const textAreaRef = useRef()
    const csvRef = useRef()
    const mediaRef = useRef()
    const [configData, setConfigData] = useState(null)
    const [wordCount, setWordCount] = useState(0)
    const [inputRemove, setInputRemove] = useState(null)
    const [open, setOpen] = useState('')
    const [userDetails, setUserDetails] = useState(null)
    const [getMessageType, setGetMessageType] = useState(0)
    const [media, setMedia] = useState(null)
    const [getEmail, setGetEmail] = useState(null)
    const [country, setCountry] = useState(null)
    const [sampleFile, setSampleFile] = useState(null)
    const [setWa, getWa] = useState(null)
    const [userData, setUserData] = useState(null)
    const [tempId, setTempId] = useState(null)
    const navigate = useNavigate()
    const [listConfig, setListConfig] = useState(null)
    const [details, setDetails] = useState(null)
    const [whatsappAmount, setWhatsappAmount] = useState(null)
    const [renderHeaderText, setRenderHeaderText] = useState('')
    const [formData, setFormData] = useState({
        headerText: [''],
        bodyTexts: [''],
        urlTexts: [''],
        couponTexts: ['']
    })
    const [mediaData, setMediaData] = useState(null)
    const [fileCaption, setFileCaption] = useState(null)
    const [mediaFilePath, setMediaFilePath] = useState(null)
    const [charge, setCharge] = useState(null)
    const [apiFilterData, setApiFilterData] = useState({
        per_page_record: 15,
        user_id: users?.id
    })

    const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
        control: form.control, // control props comes from useForm (optional: if you are using FormContext)
        name: "header_variable" // unique name for your Field Array
    })


console.log(mediaFilePath, 'mediaFilePath')
    // const loadUserOther = () => {
    //     loadUserChild({
    //         perPage: 1000,
    //         jsonData: {
    //             search: users?.email
    //             // search: users?.userType === 0 || users?.userType === 3 ? watch("user_id")?.id : users?.id ?? ""
    //         },
    //         loading: setLoading,
    //         dispatch,
    //         success: (e) => {
    //             setUserDetails(e)

    //         }
    //     })
    // }

    const ButtonIcons = ({ buttonType }) => {
        switch (buttonType) {
            case 'PHONE_NUMBER':
                return (<>
                    <LocalPhone style={{ color: '34B7F1' }} />
                </>)
            case 'URL':
                return <Launch style={{ color: '34B7F1' }} />
            case 'COPY_CODE':
                return <ContentCopy style={{ color: '34B7F1' }} />


            case 'QUICK_REPLY':
                return <ReplyIcon style={{ color: '34B7F1' }} />

            default:
                return <ListIcon style={{ color: '34B7F1' }} />

        }
    }
    function renderWhatsAppTemplateButtons() {
        const buttons = details?.whats_app_template_buttons
        const renderedButtons = []

        if (buttons) {
            for (let index = 0; index < buttons.length; index++) {
                if (index <= 1) {
                    renderedButtons.push(
                        <div className='d-flex justify-content-center border-top p-1'>
                            <span className='fw-bold text-center' style={{ color: '#34B7F1' }}>{ButtonIcons({ buttonType: buttons[index].button_type })} {buttons[index]?.button_text}</span>
                        </div>
                    )
                } else {
                    break
                }
            }

            if (buttons.length > 1) {
                renderedButtons.push(
                    <div className='d-flex justify-content-center border-top p-1'>
                        <span className='fw-bold text-center' style={{ color: '#34B7F1' }}><ListIcon style={{ color: '34B7F1' }} /> See all options</span>
                    </div>
                )
            }
        }

        return renderedButtons
    }


    const loadUserOther = async (search, loadedOptions, { page }) => {
        // if (user_id)
        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            // dispatch,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", null, setUserDetails)

    }

    const listWhatsappTemplate = async (search, loadedOptions, { page }) => {
        // if (user_id)
        const res = await loadWhatsappTemplate({
            async: true,
            page,
            perPage: 25,
            // dispatch,
            jsonData: { wa_configuration_id: watch("whats_app_configuration_id")?.id, user_id: users?.userType === 0 || users?.userType === 3 ? watch("user_id")?.id : users?.id ?? "", wa_status: 'APPROVED', search }
        })
        return createAsyncSelectMultiWaTempOptions(res, page, "xName", null, getWa)

    }

    const listCountry = async (search, loadedOptions, { page }) => {

        const res = await getCountry({
            async: true,
            page,
            perPage: 500,
            jsonData: { name: search }
        })
        return createAsyncSelectOptions(res, page, "name", "id", setCountry)

    }


    const sampleFileDownload = () => {
        downloadSampleFileWa({
            id: tempId,
            type: customMessageType === 1 ? "normal" : "custom",
            loading: setLoading,
            success: (e) => {
                window.open(e, "_blank")
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

    const listContactGroup = () => {
        loadContactGroup({
            jsonData: {
                per_page_record: 10,
                user_id: users?.userType === 1 || users?.userType === 2 ? users?.id : watch("user_id")
            },
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: (e) => {
                // setContact(e?.data)
                navigate('/admin-send-sms')
            },
            loading: setLoading
        })
    }

    const chargesApi = () => {
        loadWhatsappCharges({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: (e) => {
                setCharge(e)
            },
            loading: setLoading,
            jsonData: apiFilterData
        })
    }

    useEffect(() => {
        if (users?.userType === 1 || users?.userType === 2) {
            chargesApi()
        }
    }, [apiFilterData])

    const showButton = () => {
        setShows(!shows)
    }
    const papaParseOptions = {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: header => header.toLowerCase().replace(/\W/g, "_")
    }
    const handleForce = (data, fileInfo) => {

        setFile(fileInfo)
        setUploaded(null)
        setData(data?.slice(0, 4))
        setDataTotal(data)
        // csvRef.current.reset()
    }

    const removeData = () => {
        // setFile(false)
        setUploaded(false)
        setData([])
        setDataTotal([])
        setInputRemove(new Date().getTime())

    }

    useEffect(() => {
        if (isValidArray(data)) {
            const k = Object.keys(data[0])
            setColumns(k)
        }
    }, [data])

    const renderTable = () => {
        const tr = []
        if (isValidArray(data)) {
            const k = Object.keys(data[0])
            fastLoop(data, (d, i) => {
                const td = []
                for (const key in Object(d)) {
                    td.push(<td>
                        {d[key]}
                    </td>)
                }
                tr.push(<tr>
                    {td}
                </tr>)
            })
            return (
                <>
                    <div className='mt-2'>

                        {/* <FormGroupCustom name={"file_mobile_field_name"} label={"Select mobile number from column"} type={"select"} control={control} options={k?.map(d => ({
                            label: d,
                            value: d
                        }))}
                            append={
                                <BsTooltip className="me-1" title={"Click here to refresh"}>
                                    <InputGroupText role={"button"} onClick={() => { removeData() }} color='danger'>
                                        <Refresh className='text-success' size={16} />

                                    </InputGroupText>
                                </BsTooltip>
                            }
                        />
 */}

                        <Table striped responsive className='mt-1'>
                            <thead>
                                <tr>
                                    {k?.map(d => (<>
                                        {/* <td className='fw-bolder text-nowrap'>   <th scope='col' className='text-nowrap'></th>{d}
                    </td> */}
                                        <th>{d}</th>
                                    </>))}
                                </tr>
                            </thead>
                            <tbody>
                                {tr}

                            </tbody>
                        </Table>
                    </div>
                </>
            )
        } else {
            return null
        }
    }

    // useEffect(() => {
    //     if (isValid(watch('user_id')) || users?.userType === 1 || users?.userType === 2) {
    //         listContactGroup()
    //     }
    // }, [watch("user_id")])


    const countWords = (e, getMessageType) => {
        // const messageType = 0 // 0 = english, 1 = unicode
        const word = String(e)
        // const lines = word.split(/\r|\r\n|\n/)
        // const countEnter = lines.length
        const numWords = word.length
        // log('lenght', numWords)
        let credit = 1
        // { `templte-form-${rSelected}` }
        if (getMessageType === 0) {

            if (parseInt(numWords) <= 306) {
                credit = (numWords / 160)
                if (numWords % 160 !== 0) credit = credit + 1
            } else {
                credit = (numWords / 153)
                if (credit % 153 !== 0) credit = credit + 1
            }
        } else {
            if (parseInt(numWords) <= 70) credit = 1

            else {

                credit = (numWords / 67)
                if (numWords % 67 !== 0) credit = credit + 1
                // log("SDfsdfsdf")
            }
        }
        // log(getMessageType, "type")
        // log(count, "count")
        setWordCount(numWords)
        setCount(parseInt(credit))
    }

    const handlePagination = page => {
        setPage(page?.selected + 1)
        loadContactGroup({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            // success: setPhoneBook,
            dispatch,
            loading: setLoading
        })
    }
    const CustomPagination = () => {
        const count = Math.ceil(contactList?.total / contactList?.per_page)
        return (
            <ReactPaginate
                initialPage={contactList?.current_page - 1}
                disableInitialCallback
                previousLabel={''}
                nextLabel={''}
                breakLabel='...'
                pageCount={count}
                activeClassName='active'
                onPageChange={page => handlePagination(page)}
                pageClassName={'page-item'}
                nextLinkClassName={'page-link'}
                nextClassName={'page-item next'}
                previousClassName={'page-item prev'}
                previousLinkClassName={'page-link'}
                pageLinkClassName={'page-link'}
                breakClassName='page-item'
                breakLinkClassName='page-link'
                containerClassName={
                    'pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1'
                }
            />

        )
    }
    const contactGroup = [
        {
            name: "#",
            cell: (row, index) => {
                return (filterData?.per_page_record * (page - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },

        {
            name: "Group Name",
            selector: 'group_name',
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Total Number",
            selector: 'contact_numbers_count',
            sortable: true,
            minWidth: '170px'
        }
    ]
    const listWhatsappConfig = async (search, loadedOptions, { page }) => {

        const res = await loadWhatsappConfig({
            async: true,
            page,
            perPage: 25,
            // dispatch,
            jsonData: { user_id: user?.userType === 2 || user?.userType === 1 ? user?.id : watch('user_id')?.id, search }
        })
        return createAsyncSelectConfigOptions(res, page, "xName", null, setLoadConfig)

    }

    const handleDynamicValue = (myValue) => {
        const myField = textAreaRef.current
        if (isValid(myField)) {
            const startPos = myField.selectionStart
            const endPos = myField.selectionEnd
            const c = "{{"
            const cc = "}}"
            myField.value = myField.value.substring(0, startPos)
                + c + myValue + cc + myField.value.substring(endPos, myField.value.length)

            setDltMessage(myField.value)
            setValue("message", myField.value)
        }
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

    // 

    const onSubmit = (data, file1, file2, headerVariable) => {

        let headerVariablesPayload = null
        if (details?.parameter_format === "NAMED" && isValidArray(formData.headerText)) {
            headerVariablesPayload = formData.headerText
                .filter(v => isValid(v))
                .map((text, idx) => ({
                    type: "text",
                    // parameter_name: headerVariable?.map(),
                    // in parameter_name load the variable name from details?.header_text
                    parameter_name: findVariables(details?.header_text)?.[idx] ? findVariables(details?.header_text)?.[idx].replace('{{', '').replace('}}', '').trim() : `var${idx + 1}`,
                    text
                }))
        } else if (isValidArray(formData.headerText)) {
            // For POSITIONAL or other formats, keep as before
            headerVariablesPayload = formData.headerText.filter(v => isValid(v))
        }

        // If headerVariablesPayload is an empty array, set it to null
        if (isValidArray(headerVariablesPayload) && headerVariablesPayload.length === 0) {
            headerVariablesPayload = null
        }

        let messageVariablesPayload = null
        if (details?.parameter_format === "NAMED" && isValidArray(formData.bodyTexts)) {
            messageVariablesPayload = formData.bodyTexts
                .filter(v => isValid(v))
                .map((text, idx) => ({
                    type: "text",
                    // parameter_name: headerVariable?.map(),
                    // in parameter_name load the variable name from details?.header_text
                    parameter_name: findVariables(details?.message)?.[idx] ? findVariables(details?.message)?.[idx].replace('{{', '').replace('}}', '').trim() : `var${idx + 1}`,
                    text
                }))
        } else if (isValidArray(formData.bodyTexts)) {
            // For POSITIONAL or other formats, keep as before
            messageVariablesPayload = formData.bodyTexts.filter(v => isValid(v))
        }

        // If messageVariablesPayload is an empty array, set it to null
        if (isValidArray(messageVariablesPayload) && messageVariablesPayload.length === 0) {
            messageVariablesPayload = null
        }

        sendWhatsappMessage({
            jsonData: {
                ...data,
                user_id: users?.userType === 1 || users?.userType === 2 ? users?.id : watch("user_id")?.id,
                whats_app_template_id: watch("whats_app_template_id")?.id,
                header_variables: headerVariablesPayload,
                body_variables: messageVariablesPayload,
                file_path: file1,
                sms_type: isValid(customMessageType) ? customMessageType : "",
                file_mobile_field_name: 'mobile_numbers',
                url_variable_array: isValidArray(formData?.urlTexts?.filter(b => isValid(b))) ? formData?.urlTexts : null,
                coupon_code_variable: isValidArray(formData?.couponTexts?.filter(b => isValid(b))) ? formData?.couponTexts.toString() : null,
                whats_app_configuration_id: watch('whats_app_configuration_id')?.id,
                wa_file_id: mediaFilePath && mediaFilePath?.length > 0 ? mediaFilePath[0]?.toString() : null,

                mobile_numbers: "",
                contact_group_ids: [],
                // upload_wa_file_path:  mediaData[0],
                // file_caption: fileCaption[0] 
                // Convert upload_wa_file_path to string or null if no file
                // Convert upload_wa_file_path to string or null if no file
                upload_wa_file_path: mediaData && mediaData?.length > 0 ? mediaData[0]?.toString() : null,

                // Convert file_caption to string or null if no file
                file_caption: fileCaption && fileCaption?.length > 0 ? fileCaption[0]?.toString() : null

            },
            loading: setLoading,
            success: (e) => {
                navigate('/send-whatsapp')
                // navigate(-1)
                // setResetIt(new Date())
                reset()
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
        log(data, 'data')

        // const record = {

        //         payload: [
        //             {
        //                 type : 'header',
        //                 parameters: formData.headerText.map(text => ({
        //                     type: 'text',
        //                     text
        //                 }))
        //             },
        //             {
        //                 type: 'body',
        //                 parameters: formData.bodyTexts.map(text => ({
        //                     type: 'text',
        //                     text
        //                 }))
        //             }
        //         ]

        // }

        // const record = {
        //     header_variables: formData.headerText,
        //     body_variables: formData.bodyTexts
        // }


        // Send the record to your desired destination
        // console.log(JSON.stringify(record,
        //     null,
        //     4))

        // log(record, 'data')

    }

    const handleFileUpload = (e) => {
        return uploadFiles({
            async: true,
            // success: (d) => {
            //     setMediaUploaded(d?.data)

            // },
            // loading: setLoading,
            progress: setProgress2,
            controller,
            formData: { is_multiple: 0, file: mediaRef.current?.files[0] }
        })
    }

    const handleBodyChange = (e, index) => {
        const updatedBodyTexts = [...formData.bodyTexts]
        updatedBodyTexts[index
        ] = e
        setFormData({
            ...formData,
            bodyTexts: updatedBodyTexts
        })
    }

    const handleHeaderChange = (e, index) => {
        const updatedHeaderText = [...formData.headerText]
        updatedHeaderText[index
        ] = e
        setFormData({
            ...formData,
            headerText: updatedHeaderText
        })
    }

    const handleUrlChange = (e, index) => {
        const updatedUrlText = [...formData.urlTexts]
        updatedUrlText[index
        ] = e
        setFormData({
            ...formData,
            urlTexts: updatedUrlText
        })
    }

    const handleCouponChange = (e, index) => {
        const updatedCouponText = [...formData.couponTexts]
        updatedCouponText[index
        ] = e
        setFormData({
            ...formData,
            couponTexts: updatedCouponText
        })
    }

    const handleUpload = () => {

        return uploadFiles({
            async: true,
            // success: (d) => {
            //     setProgress(0)
            //     setUploaded(d?.data)

            // },
            loading: setLoading,
            progress: setProgress,
            controller,
            formData: { is_multiple: 0, file: csvRef.current?.files[0], file_for: 'wa' }
        })
    }
    log(details?.whats_app_template_buttons, "log bytton")
    log(details?.whats_app_template_buttons?.map((a) => a?.button_type), "log bytton1")

    const uploadAndSave = () => {
        handleSubmit(e => {
            // if (isValidArray(csvRef.current?.files) && !isValid(uploaded)) {
            //     handleUpload()
            // } if (isValidArray(mediaRef.current?.files) && !isValid(mediaUploaded)) {
            //     handleFileUpload()
            // }

            // if (isValid(uploaded) && isValid(mediaUploaded)) {
            //     onSubmit(e)
            // }
            setProgress(0)
            setProgress2(0)
            if (isValidArray(csvRef.current?.files) && isValidArray(mediaRef.current?.files)) {
                Promise.all([handleUpload(), handleFileUpload()]).then((files) => {
                    log('all done', files)
                    const file1 = files[0]?.data?.data?.file_name
                    const file2 = files[1]?.data?.data?.file_name
                    setProgress(0)
                    setProgress2(0)
                    onSubmit(e, file1, file2)
                })
            } else if (isValidArray(csvRef.current?.files)) {
                handleUpload().then((file) => {
                    setProgress(0)
                    log('csv done', file)
                    onSubmit(e, file?.data?.data?.file_name)
                })
            } else if (isValidArray(mediaRef.current?.files)) {
                handleFileUpload().then((file) => {
                    setProgress2(0)
                    log('media done', undefined, file)
                    onSubmit(e, undefined, file?.data?.data?.file_name)


                })
            }
        })()
    }

    // const isfDisabled = () => {
    //     let re = false
    //     // if (isValid(watch("mobile_numbers"))) {
    //     //     re = true
    //     // } else
    //     if (isValidArray(mediaRef.current?.files)) {
    //         re = true
    //     } if (details?.media_type === 'IMAGE' || details?.media_type === 'VIDEO' || details?.media_type === 'DOCUMENT' || details?.media_type === 'AUDIO') {
    //         re = true

    //     else if (isValidArray(csvRef.current?.files)) {
    //         re = true
    //     }

    //     return !re
    // }

    const isfDisabled = () => {
        let re = false

        if (isValidArray(mediaRef.current?.files)) {
            re = true
        }

        if (
            customMessageType === 1 &&
            (
                details?.media_type === 'IMAGE' ||
                details?.media_type === 'VIDEO' ||
                details?.media_type === 'DOCUMENT' ||
                details?.media_type === 'AUDIO'
            )
        ) {
            if (!mediaData || mediaData.length === 0) {
                return true
            }
            re = true
        }

        // Check if CSV files are valid
        if (isValidArray(csvRef.current?.files)) {
            re = true
        }

        return !re
    }

    const BootstrapCheckbox = forwardRef((props, ref) => (
        <div className='form-check'>
            <Input type='checkbox' innerRef={ref} {...props} />
        </div>
    ))


    const messageVariable = findVariables(details?.message)
    const headerVariable = findVariables(details?.header_text)
    const headerVariableType = getHeaderType(details?.header_text)
    const messageVariableType = getHeaderType(details?.message)

    const urlVariable = details?.whats_app_template_buttons.filter(a => findVariables(a?.button_value)?.length > 0)
    const couponVariable = details?.whats_app_template_buttons.filter(a => findName(a?.button_type)?.length > 0)

    return (
        <>
            <Header title={'Whatsapp Message'} icon={<WhatsApp />} />
            <Form onSubmit={w => w.preventDefault()}>
                <Row>
                    <Col lg={4}>
                        <Card className='p-2'>
                            <Row>
                                <Hide IF={users?.userType === 1 || users?.userType === 2}>
                                    <Col md="12">

                                        <FormGroupCustom
                                            // defaultOptions
                                            async
                                            control={control}
                                            type={"select"}
                                            errors={errors}
                                            name={"user_id"}
                                            isClearable
                                            className='mb-1'
                                            loadOptions={loadUserOther}
                                            // value={loadUserOther}
                                            // onChangeValue={(e) => { setGetTemplate(e?.id); setTrans(e?.transaction_credit); setPro(e?.promotional_credit); setGetMessageType(e?.is_unicode); setTwo(e?.two_waysms_credit); setVoice(e?.voice_sms_credit); setGroup(e?.id) }}
                                            onChangeValue={(e) => { setGroup(e?.id); setUserData(e); setWhatsappAmount(e?.wa_amount) }}
                                            options={userDetails}
                                            label="User"
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    <Col md="12">
                                        <Label className=''>Whatsapp Balance (₹)</Label>
                                        <Input
                                            value={whatsappAmount ?? '0'}
                                            label="Whatsapp Amount"
                                            disabled
                                            className='mb-1'
                                            type="text"
                                            name="whatsapp_amount"
                                            control={control}
                                            errors={errors}
                                        />

                                    </Col>

                                </Hide>
                                <Hide IF={users?.userType === 0 || users?.userType === 3}>
                                    <Col md="12">
                                        <Label className=''>Whatsapp Balance (₹)</Label>
                                        <Input
                                            value={charge?.data?.[0]?.user?.wa_amount ?? '0'}
                                            label="Whatsapp Amount"
                                            disabled
                                            className='mb-1'
                                            type="text"
                                            name="whatsapp_amount"
                                            control={control}
                                            errors={errors}
                                        />

                                    </Col>
                                </Hide>
                                <Col md="12">
                                    <FormGroupCustom
                                        key={`qfo2pfsdfs${watch('user_id')?.id}-kmlkm`}
                                        async
                                        type={"select"}
                                        control={control}
                                        name="whats_app_configuration_id"
                                        isClearable
                                        defaultOptions
                                        // onChangeValue={(e) => { setGetSender(e?.id) }}
                                        // value={edit?.user_id}
                                        loadOptions={listWhatsappConfig}
                                        onChangeValue={(e) => { setConfigData(e) }}
                                        className='mb-1'
                                        label="Whatsapp Configuration"
                                        errors={errors}
                                        options={loadConfig}
                                        rules={{ required: true }}

                                    />
                                </Col>


                                {users?.userType === 1 || users?.userType === 2 ? <Col md="12">
                                    <FormGroupCustom
                                        key={`$qfopfsdfs${watch('user_id')?.id}-${watch("whats_app_configuration_id")?.id}-fd2saf`}
                                        async
                                        type={"select"}
                                        control={control}
                                        errors={errors}
                                        defaultOptions
                                        isClearable
                                        // disabled={!isValid(watch("user_id"))}
                                        loadOptions={listWhatsappTemplate}
                                        name={"whats_app_template_id"}
                                        className='mb-1'
                                        onChangeValue={(e) => { setTempId(e?.id); setDetails(e) }}
                                        label="Whatsapp Template"
                                        options={setWa}
                                        rules={{ required: true }}
                                    />
                                </Col> : <Col md="12">
                                    <FormGroupCustom
                                        key={`$qfopfsdfs${watch('user_id')?.id}-${watch("whats_app_configuration_id")?.id}-fdsa3f`}
                                        async
                                        type={"select"}
                                        control={control}
                                        errors={errors}
                                        defaultOptions
                                        isClearable
                                        isDisabled={!isValid(watch("user_id"))}
                                        loadOptions={listWhatsappTemplate}
                                        name={"whats_app_template_id"}
                                        className='mb-1'
                                        onChangeValue={(e) => { setTempId(e?.id); setDetails(e) }}
                                        label="Whatsapp Template"
                                        options={setWa}
                                        rules={{ required: true }}
                                    />
                                </Col>
                                }
                                <Col md="12">

                                    <FormGroupCustom
                                        async
                                        defaultOptions
                                        control={control}
                                        type={"select"}
                                        errors={errors}
                                        name={"country_id"}
                                        isClearable
                                   

                                        className='mb-1'

                                        loadOptions={listCountry}
                                        options={country}
                                        value={76}
                                        label="Country"
                                        rules={{
                                            required: true,
                                            validate: (v) => {
                                                return isValid(v) ? !SpaceTrim(v) : true
                                            }
                                        }}
                                    />
                                </Col>

                                <Col md="12">
                                    <FormGroupCustom
                                        type={"text"}
                                        control={control}
                                        name="campaign"

                                        className='mb-1'
                                        label="Campaign Name"
                                        errors={errors}
                                        rules={{ required: true }}

                                    />
                                </Col>


                                <Col md="12" sm="12">
                                    <FormGroupCustom
                                        type={"checkbox"}
                                        control={control}
                                        name="schedule"
                                        className='mb-1'
                                        isClearable
                                        label="Schedule SMS"
                                        errors={errors}
                                    />
                                </Col>
                                {watch("schedule") === 1 ? <Col md="12">
                                    <FormGroupCustom
                                        name={"campaign_send_date_time"}
                                        type={"date"}
                                        errors={errors}
                                        label={"Date & Time"}
                                        options={{
                                            enableTime: true,
                                            minDate: Date.now()
                                        }}
                                        dateFormat={"YYYY-MM-DD HH:mm:ss"}
                                        setValue={setValue}
                                        className="mb-2"
                                        control={control}
                                        rules={{ required: false }}
                                    // values={edit?.out_time}
                                    />
                                </Col> : ""}


                            </Row>
                            <Show IF={progress !== 0 && progress2 !== 0}>
                                <Progress animated striped className='progress-bar-success my-1' value={(progress + progress2) / 2} />
                            </Show>
                            <Show IF={progress !== 0 && progress2 === 0}>
                                <Progress animated striped className='progress-bar-success my-1' value={progress} />
                            </Show>
                            <Show IF={progress === 0 && progress2 !== 0}>
                                <Progress animated striped className='progress-bar-success my-1' value={progress2} />
                            </Show>
                            <Col className='mt-2' sm='12'>
                                {/* <Button type='submit'
                                disabled={isfDisabled()}
                                onClick={uploadAndSave} className='me-1' color='primary' outline={isfDisabled()}>
                                {watch("schedule") ? "Schedule Message" : "Send Message Now"}
                            </Button> */}
                                {/* <LoadingButton loading={loading} type='submit'
                                    onClick={uploadAndSave} className='me-1' color='primary' outline={isfDisabled()}>
                                    {watch("schedule") ? "Schedule Message" : "Send Message Now"}
                                </LoadingButton> */}

                            </Col>
                        </Card>
                    </Col>
                    <Col lg={4}>
                        <Card className='p-2'>
                            <ButtonGroup className='mb-1'>
                                <Button block outline={cSelected !== 1} color='primary' lg={6} md={12} onClick={() => { setCSelected(1); setCustomMessageType(1) }} active={cSelected === 1}>
                                    Normal
                                </Button>
                                <Button block outline={cSelected !== 2} color='primary' lg={6} md={12} onClick={() => { setCSelected(2); setCustomMessageType(2) }} active={cSelected === 2}>
                                    Custom
                                </Button>
                            </ButtonGroup>


                            <Hide IF={customMessageType === 1}>
                                <div className=''>
                                    <h5 className='fw-dark'>Send personalized SMS to multiple users at same time e.g</h5>
                                </div>
                                {/* <Alert color='primary mb-2'>
                                    <p className='alert-heading mb-1'>Hello, this is your name {"{{name}}"} and your mobile number is {"{{mobile}}"}</p>

                                </Alert> */}
                            </Hide>

                            <Show IF={isValid(tempId)}>
                                <Col md="12">
                                    {/* <FormGroupCustom
                                    type={"file"}
                                    control={control}
                                    errors={errors}
                                    message={"Please upload CSV & XLSX files Only."}
                                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                    rules={{ required: true }}
                                    name="file_path"
                                    className='mb-1'
                                    label={"Upload Number"}
                                /> */}
                                    <CSVReader
                                        // label={""}
                                        cssInputClass="form-control"
                                        onFileLoaded={handleForce}
                                        inputRef={csvRef}
                                        // inputName={"my"}
                                        parserOptions={papaParseOptions}
                                        key={`change${inputRemove}`}
                                    />
                                </Col>
                                <Col md="12" className='mb-1'>
                                    <span className='fw-bolder  text-center newUnderLineColor' style={{ cursor: 'pointer' }} onClick={() => { sampleFileDownload(tempId) }}><u>Click to download sample file</u></span>
                                    {renderTable()}
                                </Col>

                            </Show>


                            <Show IF={customMessageType === 1}>
                                <Alert color='primary mt-1'>
                                    <p className='alert-heading mb-1'>Note:- Only mobile {"{{mobile_numbers}}"}  will be accepted as a header.</p>

                                </Alert>
                                {/* <small className='fw-bold mt-50 d-block'><span className='fw-bolder'>Mobile Number</span> will be accepted as a header in lowercase and without space</small> */}
                            </Show>
                            <Show IF={customMessageType === 1}>
                                {/* {mediaData} {fileCaption} */}
                                <Show IF={details?.media_type === 'IMAGE'}>

                                    <p className='fw-bolder text-primary text-underline text-center' style={{ cursor: "pointer", textDecoration: "underline" }}> <WhatsappMediaCollection setMediaFilePath={setMediaFilePath} setMediaData={setMediaData} setFileCaption={setFileCaption} fileType={details?.media_type} getUserId={watch("user_id")} Component={Button.Ripple} size="sm" color={"primary"}>Browse uploaded collection</WhatsappMediaCollection></p>

                                </Show>
                                <Show IF={details?.media_type === 'VIDEO'}>


                                    <p className='fw-bolder text-primary text-underline text-center' style={{ cursor: "pointer", textDecoration: "underline" }}> <WhatsappMediaCollection setMediaFilePath={setMediaFilePath} setMediaData={setMediaData} setFileCaption={setFileCaption} fileType={details?.media_type} getUserId={watch("user_id")} Component={Button.Ripple} size="sm" color={"primary"}>Browse uploaded collection</WhatsappMediaCollection></p>

                                </Show>
                                <Show IF={details?.media_type === 'DOCUMENT'}>


                                    <p className='fw-bolder text-primary text-underline text-center' style={{ cursor: "pointer", textDecoration: "underline" }}> <WhatsappMediaCollection setMediaFilePath={setMediaFilePath} setMediaData={setMediaData} setFileCaption={setFileCaption} fileType={details?.media_type} getUserId={watch("user_id")} Component={Button.Ripple} size="sm" color={"primary"}>Browse uploaded collection</WhatsappMediaCollection></p>

                                </Show>
                                <Show IF={details?.media_type === 'AUDIO'}>

                                    <p className='fw-bolder text-primary text-underline text-center' style={{ cursor: "pointer", textDecoration: "underline" }}> <WhatsappMediaCollection setMediaFilePath={setMediaFilePath} setMediaData={setMediaData} setFileCaption={setFileCaption} Component={Button.Ripple} size="sm" color={"primary"}>Browse uploaded collection</WhatsappMediaCollection></p>

                                </Show>
                            </Show>

                            {/* <Show IF={details?.media_type === 'AUDIO'}>
                                <Col md="12" className='mt-1 mb-1'>
                                    <Label for="header_handle">Upload Audio</Label>

                                    <Input innerRef={mediaRef} type='file' name={'upload_wa_file_path'} onChange={onChange} accept="audio/aac, audio/mp4, audio/mpeg, audio/amr, audio/ogg" />
                                </Col>
                            </Show> */}
                            <Hide IF={customMessageType === 2}>


                                <Show IF={isValidArray(headerVariable)}>
                                    <Show IF={details?.parameter_format === "POSITIONAL"}>
                                        <div className='border p-1 mb-1'>
                                            <span className='fw-bolder mt-1 text-center' >Header Variable</span>
                                            <Col md="12" className='mt-1'>
                                                {headerVariable?.map((count, h) => {
                                                    const Tag = h === 0 ? 'div' : SlideDown
                                                    return (
                                                        <Tag key={count?.id}>
                                                            <Row className=''>

                                                                <Col md={12} className=''>
                                                                    <InputGroup>
                                                                        <FormGroupCustom
                                                                            key={`header_variable-${h}.id`}
                                                                            type={"hidden"}
                                                                            noLabel
                                                                            noGroup
                                                                            control={control}
                                                                            value={headerVariable?.id}
                                                                            name={`header_variable.${h}.id`}

                                                                        />
                                                                        <FormGroupCustom
                                                                            key={`header_variable-${h}.value`}
                                                                            type={"text"}
                                                                            noLabel
                                                                            control={control}
                                                                            value={headerVariable?.value}
                                                                            placeholder={`Enter header variable of {{${h + 1}}}`}
                                                                            name={`header_variable.${h}.value`}
                                                                            className={`animation-item-name-${h}`}
                                                                            errors={errors}
                                                                            rules={{ required: false }}
                                                                            onChangeValue={(e) => { handleHeaderChange(e, h) }}
                                                                            prepend={<InputGroupText role={"button"} className='newStyle' >
                                                                                <p className='extraParagraph'>{`{{${(h + 1)}}}`}</p>
                                                                            </InputGroupText>}
                                                                        />
                                                                    </InputGroup>
                                                                </Col>
                                                                <Col sm={12}>
                                                                    <br />
                                                                </Col>
                                                            </Row>
                                                        </Tag>
                                                    )
                                                }
                                                )}
                                            </Col>
                                        </div>
                                    </Show>
                                    <Show IF={details?.parameter_format === "NAMED"}>
                                        <div className='border p-1 mb-1'>
                                            <span className='fw-bolder mt-1 text-center' >Header Variable</span>
                                            <Col md="12" className='mt-1'>
                                                {headerVariable?.map((count, h) => {
                                                    const Tag = h === 0 ? 'div' : SlideDown
                                                    return (
                                                        <Tag key={count?.id}>
                                                            <Row className=''>

                                                                <Col md={12} className=''>
                                                                    <InputGroup>
                                                                        <FormGroupCustom
                                                                            key={`header_variable-${h}.id`}
                                                                            type={"hidden"}
                                                                            noLabel
                                                                            noGroup
                                                                            control={control}
                                                                            value={headerVariable?.id}
                                                                            name={`header_variable.${h}.id`}

                                                                        />
                                                                        <FormGroupCustom
                                                                            key={`header_variable-${h}.value`}
                                                                            type={"text"}
                                                                            noLabel
                                                                            control={control}
                                                                            value={headerVariable?.value}
                                                                            placeholder={`Enter header variable of {${count}}`}
                                                                            name={`header_variable.${h}.value`}
                                                                            className={`animation-item-name-${h}`}
                                                                            errors={errors}
                                                                            rules={{ required: false }}
                                                                            onChangeValue={(e) => { handleHeaderChange(e, h) }}
                                                                            prepend={<InputGroupText role={"button"} className='newStyle' >
                                                                                <p className='extraParagraph'>{`${(count)}`}</p>
                                                                            </InputGroupText>}
                                                                        />
                                                                    </InputGroup>
                                                                </Col>
                                                                <Col sm={12}>
                                                                    <br />
                                                                </Col>
                                                            </Row>
                                                        </Tag>
                                                    )
                                                }
                                                )}
                                            </Col>
                                        </div>
                                    </Show>
                                </Show>


                                <Show IF={isValidArray(messageVariable)}>
                                    <Show IF={details?.parameter_format === "POSITIONAL"}>
                                        <div className='border p-1 mt-1'>
                                            <span className='fw-bolder mt-1 text-center' >Message Variable</span>
                                            <Col md="12" className='mt-1'>
                                                {messageVariable?.map((count, c) => {
                                                    const Tag = c === 0 ? 'div' : SlideDown
                                                    return (
                                                        <Tag key={count?.id}>
                                                            <Row className=''>
                                                                {/* <Col md={1} className=''>
                                                                <p>{`{{${(c + 1)}}}`} </p>
                                                            </Col> */}

                                                                <Col md={12} className=''>
                                                                    <InputGroup>
                                                                        <FormGroupCustom
                                                                            key={`header_variable-${c}.id`}
                                                                            type={"hidden"}
                                                                            noLabel
                                                                            noGroup
                                                                            control={control}
                                                                            value={messageVariable?.id}
                                                                            name={`header_variable.${c}.id`}

                                                                        />
                                                                        <FormGroupCustom
                                                                            key={`header_variable-${c}.value`}
                                                                            type={"text"}
                                                                            noLabel
                                                                            control={control}
                                                                            value={messageVariable?.value}
                                                                            placeholder={`Enter message variable of {{${c + 1}}}`}
                                                                            name={`header_variable.${c}.value`}
                                                                            className={`animation-item-name-${c}`}
                                                                            errors={errors}
                                                                            rules={{ required: false }}
                                                                            onChangeValue={(e) => { handleBodyChange(e, c) }}
                                                                            prepend={<InputGroupText role={"button"} className='newStyle' >
                                                                                <p className='extraParagraph'>{`{{${(c + 1)}}}`}</p>
                                                                            </InputGroupText>}
                                                                        />
                                                                    </InputGroup>
                                                                </Col>

                                                                <Col sm={12}>
                                                                    <br />
                                                                </Col>
                                                            </Row>
                                                        </Tag>
                                                    )
                                                }
                                                )}
                                            </Col>
                                        </div>
                                    </Show>
                                    <Show IF={details?.parameter_format === "NAMED"}>

                                        <div className='border p-1 mt-1'>
                                            <span className='fw-bolder mt-1 text-center' >Message Variable</span>
                                            <Col md="12" className='mt-1'>
                                                {messageVariable?.map((count, c) => {
                                                    const Tag = c === 0 ? 'div' : SlideDown
                                                    console.log(count, "message type")
                                                    return (
                                                        <Tag key={count?.id}>
                                                            <Row className=''>


                                                                <Col md={12} className=''>
                                                                    <InputGroup>
                                                                        <FormGroupCustom
                                                                            key={`header_variable-${c}.id`}
                                                                            type={"hidden"}
                                                                            noLabel
                                                                            noGroup
                                                                            control={control}
                                                                            value={messageVariable?.id}
                                                                            name={`header_variable.${c}.id`}

                                                                        />
                                                                        <FormGroupCustom
                                                                            key={`header_variable-${c}.value`}
                                                                            type={"text"}
                                                                            noLabel
                                                                            control={control}
                                                                            value={messageVariable?.value}
                                                                            placeholder={`Enter message variable of {${count}}`}
                                                                            name={`header_variable.${c}.value`}
                                                                            className={`animation-item-name-${c}`}
                                                                            errors={errors}
                                                                            rules={{ required: false }}
                                                                            onChangeValue={(e) => { handleBodyChange(e, c) }}
                                                                            prepend={<InputGroupText role={"button"} className='newStyle' >
                                                                                <p className='extraParagraph'>{`${(count)}`}</p>
                                                                            </InputGroupText>}
                                                                        />
                                                                    </InputGroup>
                                                                </Col>

                                                                <Col sm={12}>
                                                                    <br />
                                                                </Col>
                                                            </Row>
                                                        </Tag>
                                                    )
                                                }
                                                )}
                                            </Col>
                                        </div>
                                    </Show>
                                </Show>

                                <Show IF={details?.media_type === 'CATALOG'}>
                                    <div className='border p-1 mt-1'>
                                        <span className='fw-bolder mt-1  text-center' >Catalog Variable</span>
                                        <Col md={12} className='mt-2'>

                                            <FormGroupCustom
                                                type={"text"}
                                                control={control}
                                                name="catalog_code_variable"

                                                className='mb-1'
                                                label="Catalog Code Variable"
                                                errors={errors}
                                                rules={{ required: true }}

                                            />

                                        </Col>
                                    </div>

                                </Show>

                                <Show IF={details?.whats_app_template_buttons?.[0]?.button_type === 'FLOW'}>
                                    <div className='border p-1 mt-1'>
                                        <span className='fw-bolder mt-1  text-center' >Flow Variable</span>
                                        <Col md={12} className='mt-2'>

                                            <FormGroupCustom
                                                type={"text"}
                                                control={control}
                                                name="flow_code_variable"

                                                className='mb-1'
                                                label="Flow Code Variable"
                                                errors={errors}
                                                rules={{ required: true }}

                                            />

                                        </Col>
                                    </div>
                                </Show>

                                <Show IF={details?.media_type === 'LOCATION'}>
                                    <div className='border p-1 mt-1'>
                                        <span className='fw-bolder mt-1  text-center' >Location Variable</span>
                                        <Col md={12} className='mt-2'>

                                            <FormGroupCustom
                                                type={"text"}
                                                control={control}
                                                name="latitude"

                                                className='mb-1'
                                                label="Latitude"
                                                errors={errors}
                                                rules={{ required: true }}

                                            />
                                            <FormGroupCustom
                                                type={"text"}
                                                control={control}
                                                name="longitude"

                                                className='mb-1'
                                                label="Longitude"
                                                errors={errors}
                                                rules={{ required: true }}

                                            />
                                            <FormGroupCustom
                                                type={"text"}
                                                control={control}
                                                name="location_name"
                                                className='mb-1'
                                                label="Location Name"
                                                errors={errors}
                                                rules={{ required: true }}

                                            />
                                            <FormGroupCustom
                                                type={"text"}
                                                control={control}
                                                name="location_address"

                                                className='mb-1'
                                                label="Location Address"
                                                errors={errors}
                                                rules={{ required: true }}

                                            />

                                        </Col>

                                    </div>
                                </Show>


                                <Show IF={isValidArray(urlVariable)}>
                                    <div className='border p-1 mt-1'>
                                        <span className='fw-bolder mt-1 text-center' >URL Variable</span>
                                        <Col md="12" className='mt-1'>
                                            {urlVariable?.map((count, c) => {
                                                const Tag = c === 0 ? 'div' : SlideDown
                                                return (
                                                    <Tag key={count?.id}>
                                                        <Row className=''>
                                                            {/* <Col md={1} className=''>
                                                                <p>{`{{${(c + 1)}}}`} </p>
                                                            </Col> */}

                                                            <Col md={12} className=''>
                                                                <InputGroup>

                                                                    <FormGroupCustom
                                                                        key={`url_variable_array-${c}.id`}
                                                                        type={"hidden"}
                                                                        noLabel
                                                                        noGroup
                                                                        control={control}
                                                                        value={urlVariable?.id}
                                                                        name={`url_variable_array.${c}.id`}
                                                                    />

                                                                    <FormGroupCustom
                                                                        key={`url_variable_array-${c}.value`}
                                                                        type={"text"}
                                                                        noLabel
                                                                        control={control}
                                                                        value={urlVariable?.value}
                                                                        placeholder={`Enter url variable of {{${c + 1}}}`}
                                                                        name={`url_variable_array.${c}.value`}
                                                                        className={`animation-item-name-${c}`}
                                                                        errors={errors}
                                                                        rules={{ required: false }}
                                                                        onChangeValue={(e) => { handleUrlChange(e, c) }}
                                                                        prepend={<InputGroupText role={"button"} className='newStyle' >
                                                                            <p className='extraParagraph'>{`{{${(c + 1)}}}`}</p>
                                                                        </InputGroupText>}
                                                                    />
                                                                </InputGroup>
                                                            </Col>
                                                            <Col sm={12}>
                                                                <br />
                                                            </Col>
                                                        </Row>
                                                    </Tag>
                                                )
                                            }
                                            )}
                                        </Col>
                                    </div>
                                </Show>

                                <Show IF={isValidArray(couponVariable)}>
                                    <div className='border p-1 mt-1'>
                                        <span className='fw-bolder mt-1 text-center' >Coupon Variable</span>
                                        <Col md="12" className='mt-1'>
                                            {couponVariable?.map((coupon, c) => {
                                                const Tag = c === 0 ? 'div' : SlideDown
                                                return (
                                                    <Tag key={coupon?.id}>
                                                        <Row className=''>

                                                            <Col md={12} className=''>
                                                                <InputGroup>
                                                                    <FormGroupCustom
                                                                        key={`coupon_variable-${c}.id`}
                                                                        type={"hidden"}
                                                                        noLabel
                                                                        noGroup
                                                                        control={control}
                                                                        value={couponVariable?.id}
                                                                        name={`coupon_variable.${c}.id`}

                                                                    />
                                                                    <FormGroupCustom
                                                                        key={`coupon_variable-${c}.value`}
                                                                        type={"text"}
                                                                        noLabel
                                                                        control={control}
                                                                        value={couponVariable?.value}
                                                                        placeholder={`Enter coupon variable of {{${c + 1}}}`}
                                                                        name={`coupon_variable.${c}.value`}
                                                                        className={`animation-item-name-${c}`}
                                                                        errors={errors}
                                                                        rules={{ required: false }}
                                                                        onChangeValue={(e) => { handleCouponChange(e, c) }}
                                                                        prepend={<InputGroupText role={"button"} className='newStyle' >
                                                                            <p className='extraParagraph'>{`{{${(c + 1)}}}`}</p>
                                                                        </InputGroupText>}
                                                                    />
                                                                </InputGroup>
                                                            </Col>

                                                            <Col sm={12}>
                                                                <br />
                                                            </Col>
                                                        </Row>
                                                    </Tag>
                                                )
                                            }
                                            )}
                                        </Col>
                                    </div>
                                </Show>
                            </Hide>
                        </Card>
                    </Col>
                    {/* <Show IF={isValid(watch('user_id')) || users?.userType === 1 || users?.userType === 2}> */}
                    <Col lg={4}>
                        <Card className='p-1'>
                            <div className="page">
                                <div className="marvel-device nexus5">
                                    <div className="top-bar"></div>
                                    <div className="sleep"></div>
                                    <div className="volume"></div>
                                    <div className="camera"></div>
                                    <div className="screen">
                                        <div className="screen-container">

                                            <div className="chat">
                                                <div className="chat-container">
                                                    <div className="user-bar">
                                                        <div className="back">

                                                            <ArrowLeft />
                                                        </div>
                                                        <div className="avatar">
                                                            <img src={require("../../assets/images/avatars/avatar-blank.png").default} alt="Avatar" />
                                                        </div>
                                                        <div className="name">
                                                            <span>{configData ? configData?.verified_name : 'Business'}</span>
                                                            <span className="status">online</span>
                                                        </div>

                                                    </div>
                                                    <div className="conversation">
                                                        <div className="conversation-container">

                                                            <div className="message received">
                                                                <Show IF={details?.media_type === 'IMAGE'}>
                                                                    {/* {mediaData ? <> <img className='rounded me-50'
                                                                        src={`${httpConfig?.baseUrl2}/${mediaData}` ? `${httpConfig?.baseUrl2}/${mediaData}` : `https://dummyimage.com/600x400/000/fff`}
                                                                        alt='image' height='auto' width='100%' /></> : <> <img className='rounded me-50'
                                                                            src={avatar ? avatar : "https://dummyimage.com/600x400/000/fff"}
                                                                            alt='image' height='auto' width='100%' /></>} */}
                                                                    {
                                                                        mediaData && mediaData.length > 0 ? (
                                                                            <img
                                                                                className='rounded me-50'
                                                                                src={`${httpConfig?.baseUrl2}/${mediaData}`}
                                                                                alt='image'
                                                                                height='auto'
                                                                                width='100%'
                                                                            />
                                                                        ) : (
                                                                            <img
                                                                                className='rounded me-50'
                                                                                src={PlaceholderImage}
                                                                                alt='image'
                                                                                height='10%'
                                                                                width='100%'
                                                                            />
                                                                        )
                                                                    }
                                                                </Show>
                                                                <Show IF={details?.media_type === 'VIDEO'}>
                                                                    {mediaData ? (
                                                                        <video src={`${httpConfig?.baseUrl2}/${mediaData}`} controls alt="Image_Photo" className='img-fluid' width="300" height="200" />
                                                                    ) : (
                                                                        <video src={avatar} controls alt="Image_Photo" className='img-fluid' width="300" height="200" />
                                                                    )}
                                                                </Show>
                                                                <Show IF={details?.media_type === 'DOCUMENT'}>
                                                                    <img className='rounded me-50'
                                                                        src={"https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/391px-PDF_file_icon.svg.png"}
                                                                        alt='image' height='100' width='100%' />
                                                                    {/* <iframe src= {avatar ? avatar : "https://via.placeholder.com/200"} width="800" height="600"  /> */}

                                                                </Show>
                                                                <div id="random" className='fw-bolder' dangerouslySetInnerHTML={{ __html: renderTextWithFormatting(details?.header_text) }} />

                                                                <div id="random" className='fw-bold mt-1' dangerouslySetInnerHTML={{ __html: renderTextWithFormatting(details?.message) }} />
                                                                <br />
                                                                {/* <div id="random" dangerouslySetInnerHTML={{ __html: renderTextWithFormatting(details?.footer_text) }} /> */}
                                                                <span className='footerTextStyle'>{details?.footer_text}</span>
                                                                <span className="metadata"><span className="time"></span></span>
                                                                <Show IF={isValidArray(details?.whats_app_template_buttons)}>
                                                                    {/* <hr style={{ width: '100%' }} /> */}

                                                                    <div className="">
                                                                        {/* {renderIcon(editData)} */}
                                                                        {renderWhatsAppTemplateButtons()}
                                                                    </div>

                                                                </Show>
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

                                                            {/* <p> {replaceVariables(details?.message, formData?.headerTexts)}</p> */}


                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Row className='text-center mt-2'>
                                <Col md="12" className='text-center'>
                                    <LoadingButton loading={loading} type='submit' disabled={isfDisabled() || loading}
                                        onClick={uploadAndSave} className='me-1' color='primary' outline={isfDisabled()}>
                                        {watch("schedule") ? "Schedule Message" : "Send Message Now"}
                                    </LoadingButton>
                                </Col>
                            </Row>
                        </Card>

                    </Col>
                    {/* </Show> */}
                </Row>
                {/* <Hide IF={} */}

            </Form>
        </>
    )
}


export default SendWhatsapp
