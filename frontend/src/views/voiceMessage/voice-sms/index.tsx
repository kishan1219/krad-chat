// @ts-nocheck
import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'
import CSVReader from '@components/csv-reader'
import MarkEmailReadOutlined from '@mui/icons-material/MarkEmailReadOutlined'
import MicNone from '@mui/icons-material/MicNone'
import MobiledataOff from '@mui/icons-material/MobiledataOff'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import classNames from 'classnames'
import React, { useEffect, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, Trash2, X } from 'react-feather'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { AccordionBody, AccordionHeader, AccordionItem, Alert, Button, ButtonGroup, Card, CardBody, CardHeader, Col, DropdownItem, DropdownMenu, DropdownToggle, Form, Input, InputGroupText, Label, Progress, Row, Table, UncontrolledAccordion, UncontrolledButtonDropdown } from 'reactstrap'
import { uploadFiles } from '../../../utility/apis/common'
import { loadContactGroup } from '../../../utility/apis/contactGroup'
import { loadDlt } from '../../../utility/apis/dlt'
import { loadSecondaryRoute } from '../../../utility/apis/seconday'
import { addSMS, customSmsSample, normalSmsSample } from '../../../utility/apis/sms'
import { loadUserChild } from '../../../utility/apis/userManagement'
import { isValid, isValidArray, log } from '../../../utility/helpers/common'
import Hide from '../../../utility/Hide'
import { Permissions } from '../../../utility/Permissions'
import Show from '../../../utility/Show'
import { createAsyncSelectDltOptions, createAsyncSelectMultiMessageOptions, createAsyncSelectMultiOptions, createAsyncSelectMultiUserOptions, createAsyncSelectOptions, createAsyncSelectVoiceTemplateOptions, createSelectOptions, fastLoop } from '../../../utility/Utils'
import LoadingButton from '../../components/buttons/LoadingButton'
import FormGroupCustom from '../../components/formGroupCustom'
import BsTooltip from '../../components/tooltip'
import Refresh from '@mui/icons-material/Refresh'
import httpConfig from '../../../utility/http/httpConfig'
import { loadUploadVoice } from '../../../utility/apis/voiceUpload'
import { voiceSmsCreate } from '../../../utility/apis/voiceSMS'
import http from '../../../utility/http/useHttp'

const VoiceSms = ({ }) => {
    const form = useForm()
    const contactList = useSelector(a => a.contactGroup.contactGroup)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues, setError } = form
    const users = useSelector(state => state.auth.userData)
    const [secondary, setSecondary] = useState(null)
    const [loading, setLoading] = useState(null)
    const [template, setTemplate] = useState(null)
    const [dltMessage, setDltMessage] = useState(null)
    const [count, setCount] = useState(1)
    const [code, setCode] = useState(null)
    // const [sender, setSender] = useState(null)
    const [rSelected, setRSelected] = useState(2)
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
    const [two, setTwo] = useState(null)
    const [pro, setPro] = useState(null)
    const [voice, setVoice] = useState(null)
    const [cSelected, setCSelected] = useState(1)
    const [columns, setColumns] = useState([])
    const [customMessageType, setCustomMessageType] = useState(1)
    const [progress, setProgress] = useState(0)
    const [uploaded, setUploaded] = useState(null)
    const [group, setGroup] = useState(null)
    const [controller, setController] = useState(new AbortController())
    const [filterData, setFilterData] = useState({ per_page_record: 10 })
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage, setRowsPerPage] = useState("2")
    const [page, setPage] = useState(1)
    const textAreaRef = useRef()
    const csvRef = useRef()
    const [wordCount, setWordCount] = useState(0)
    const [inputRemove, setInputRemove] = useState(null)
    const [open, setOpen] = useState('')
    const [userDetails, setUserDetails] = useState(null)
    const [getMessageType, setGetMessageType] = useState(0)
    const [getEmail, setGetEmail] = useState(null)
    const [creditInfo, setCreditInfo] = useState(null)
    const toggle = id => {
        open === id ? setOpen() : setOpen(id)
    }
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const listSecondary = async (search, loadedOptions, { page }) => {

        const res = await loadSecondaryRoute({
            async: true,
            page,
            perPage: 25,
            jsonData: { name: search, status: 1, gateway_type: 4 }
        })
        return createAsyncSelectOptions(res, page, "sec_route_name", "id", setSecondary)

    }

    const sampleFileForNormal = () => {
        normalSmsSample({
            success: (e) => {

                window.open(httpConfig?.baseUrl2 + e, "_blank")

            }
        })
    }


    const sampleFileForCustom = () => {
        customSmsSample({
            success: (e) => {

                window.open(httpConfig?.baseUrl2 + e, "_blank")

            }
        })
    }
    // const listSecondary = () => {
    //     loadSecondaryRoute({
    //         perPage: 15,
    //         loading: setLoading,
    //         dispatch,
    //         success: (e) => {
    //             setSecondary(createSelectOptions(e?.data?.data, "sec_route_name", "id"))
    //         }
    //     })
    // }


    const listUser = async (search, loadedOptions, { page }) => {

        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectOptions(res, page, "name", null, setUser)

    }


    const loadUserOther = () => {
        loadUserChild({
            perPage: 1000,
            jsonData: {
                search: users?.email
                // search: users?.userType === 0 || users?.userType === 3 ? watch("user_id")?.id : users?.id ?? ""
            },
            loading: setLoading,
            dispatch,
            success: (e) => {
                setCreditInfo(e)

            }
        })
    }
    useEffect(() => {
        if (Permissions?.userDdlList) {
            loadUserOther()

        }
    }, [users?.email])

    // log(userDetails, "user")

    // const loadUser = async (search, loadedOptions, { page }) => {

    //     const res = await loadUserChild({
    //         async: true,
    //         page,
    //         perPage: 10,
    //         jsonData: { search }
    //     })
    //     return createAsyncSelectMultiUserOptions(res, page, "xName", null, setUser)

    // }

    const loadUserOtherCheck = () => {
        loadUserChild({
            perPage: 1000,
            jsonData: {
                // search: users?.email

            },
            loading: setLoading,
            dispatch,
            success: (e) => {
                setUserDetails(createSelectOptions(e?.data?.data, 'username_name', null))


            }
        })
    }

    useEffect(() => {
        if (Permissions?.userDdlList) {
            loadUserOtherCheck()
        }
    }, [users?.userType])

    const listVoiceTemplate = async (search, loadedOptions, { page }) => {
        if (rSelected === 1) {
            const res = await loadUploadVoice({
                async: true,
                page,
                perPage: 100,
                jsonData: {
                    user_id: users?.userType === 1 || users?.userType === 2 ? users?.id : watch("user_id")?.id ?? "",
                    sender_id_type: 1,
                    file_status: 1,
                    search
                }
            })
            return createAsyncSelectVoiceTemplateOptions(res, page, "xName", null, setTemplate)
        } if (rSelected === 2) {
            const res = await loadUploadVoice({
                async: true,
                page,
                perPage: 100,
                jsonData: {
                    user_id: users?.userType === 1 || users?.userType === 2 ? users?.id : watch("user_id")?.id ?? "",
                    sender_id_type: 2,
                    file_status: 1,
                    search
                }
            })
            return createAsyncSelectVoiceTemplateOptions(res, page, "xName", null, setTemplate)
        }
    }


    const listDltTemplates = () => {
        if (rSelected === 1) {
            loadDlt({
                perPage: 100,
                jsonData: {
                    user_id: users?.userType === 1 || users?.userType === 2 ? users?.id : watch("user_id")?.id ?? "",
                    sender_id_type: 1
                },
                loading: setLoading,
                dispatch,
                success: (e) => {
                    setTemplate(createSelectOptions(e?.data?.data?.map(a => ({
                        ...a,
                        xName: `${a?.template_name} | ${a?.dlt_template_id} | ${a?.dlt_message}`
                    })), "xName"))
                }
            })
        } if (rSelected === 2) {
            loadDlt({
                perPage: 1000,
                jsonData: {
                    user_id: users?.userType === 1 || users?.userType === 2 ? users?.id : watch("user_id")?.id ?? "",
                    sender_id_type: 2
                },
                loading: setLoading,
                dispatch,
                success: (e) => {
                    setTemplate(createSelectOptions(e?.data?.data?.map(a => ({
                        ...a,
                        xName: `${a?.template_name} | ${a?.dlt_template_id} | ${a?.dlt_message}`
                    })), "xName"))
                }
            })
        }
        // }

    }

    // const listDltTemplate = async (search, loadedOptions, { page }) => {
    //     if (rSelected === 1) {
    //         const res = await loadDlt({
    //             async: true,
    //             page,
    //             perPage: 25,
    //             jsonData: {
    //                 user_id: users?.userType === 1 || users?.userType === 2 ? users?.id : watch("user_id")?.id ?? "",
    //                 sender_id_type: 1
    //             }
    //         })
    //         return createAsyncSelectDltOptions(res, page, "xName", "id", setTemplate)
    //     } if (rSelected === 2) {
    //         const res = await loadDlt({
    //             async: true,
    //             page,
    //             perPage: 25,
    //             jsonData: {
    //                 user_id: users?.userType === 1 || users?.userType === 2 ? users?.id : watch("user_id")?.id ?? "",
    //                 sender_id_type: 2
    //             }
    //         })
    //         return createAsyncSelectDltOptions(res, page, "xName", "id", setTemplate)
    //     }
    // }
    const listContactGroup = () => {
        loadContactGroup({
            jsonData: {
                per_page_record: 10,
                user_id: group
            },
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: () => {},
            loading: setLoading


        })
    }


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

    const remove = () => {
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

                        <FormGroupCustom name={"file_mobile_field_name"} label={"Select mobile number from column"} type={"select"} control={control} options={k?.map(d => ({
                            label: d,
                            value: d
                        }))}
                            append={
                                <BsTooltip className="me-1" title={"Click here to refresh"}>
                                    <InputGroupText role={"button"} onClick={() => { remove() }} color='danger'>
                                        <Refresh className='text-success' size={16} />

                                    </InputGroupText>
                                </BsTooltip>
                            }
                        />


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

    // const listContactGroup = async (search, loadedOptions, { page }) => {

    //     const res = await loadContactGroup({
    //         async: true,
    //         page,
    //         perPage: 25,
    //         dispatch,
    //         jsonData: { name: search }
    //     })
    //     return createAsyncSelectOptions(res, page, "name")

    // }


    // useEffect(() => {
    //     if (users?.userType === 0 || users?.userType === 3) {


    //         loadUser()
    //     }

    // }, [])

    useEffect(() => {
        listContactGroup()
    }, [group, currentPage, rowsPerPage])

    // useEffect(() => {
    //     if (isValid(watch("user_id")) || users?.userType === 1 || users?.userType === 2) {
    //         listDltTemplate()
    //     }

    // }, [watch("user_id"), users, rSelected])

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
            selector: row => row?.group_name,
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Total Number",
            selector: row => row?.contact_numbers_count,
            sortable: true,
            minWidth: '170px'
        }
    ]

    const handleReportChange = ({ selectedRows }) => {

        const selectedR = selectedRows.map((item, index) => {
            return item.id
        })
        setRowsSelected(selectedR)

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

    const onSubmit = (data, file) => {
        // handleSubmit(onSubmit)
        voiceSmsCreate({
            jsonData: {
                ...data,

                sms_type: isValid(customMessageType) ? customMessageType : "",

                message: isValid(data?.message) && isValid(dltMessage) ? data?.message : dltMessage,
                file_path: file,
                contact_group_ids: rowsSelected,
                user_id: data?.user_id?.id,
                campaign: data?.campaign,
                secondary_route_id: data?.secondary_route_id?.id,
                voice_upload_id: data?.voice_upload_id?.id,

                dtmf: data?.dtmf,

                call_patch_number: data?.call_patch_number,
                priority: data?.priority,
                mobile_numbers: data?.mobile_numbers,
                file_mobile_field_name: data?.file_mobile_field_name,
                ratio_set: data?.ratio_set,
                failed_ratio: data?.failed_ratio

            },

            loading: setLoading,
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
            },
            success: (e) => {
                navigate("/admin-send-sms")
                reset()

            }
        })
    }


    const handleUpload = () => {

        uploadFiles({
            success: (d) => {
                setProgress(0)
                setUploaded(d?.data)
                handleSubmit(e => onSubmit(e, d?.data?.file_name))()
            },
            loading: setLoading,
            progress: setProgress,
            controller,
            formData: { is_multiple: 0, file: csvRef.current?.files[0] }
        })
    }


    const uploadAndSave = () => {
        handleSubmit(e => {
            if (isValidArray(csvRef.current?.files) && !isValid(uploaded)) {
                handleUpload()
            } else {
                onSubmit(e, uploaded?.file_name)
            }
        })()
    }
    // const isfDisabled = () => {
    //     let re = false
    //     if (isValid(watch("mobile_numbers"))) {
    //         re = true
    //     } else if (isValidArray(rowsSelected)) {
    //         re = true
    //     } else if (isValidArray(csvRef.current?.files)) {
    //         re = true
    //     }

    //     return !re
    // }
    const isfDisabled = () => {
        let re = false
        if (isValid(watch("mobile_numbers"))) {
            re = true
        } else if (isValidArray(rowsSelected)) {
            re = true
        } else if (isValidArray(csvRef.current?.files)) {
            re = true
        }

        return !re
    }

    return (
        <Form onSubmit={w => w.preventDefault()}>
            <Show IF={users?.userType === 1 || users?.userType === 2}>

                <Row>

                    {creditInfo?.data?.data.map((item, index) => {
                        return (
                            <>


                                <Col lg='3' sm='6'>
                                    <StatsHorizontal icon={<MarkEmailReadOutlined size={21} />} color='success' stats={item?.transaction_credit} statTitle={"Transactional"} />
                                </Col>
                                <Col lg='3' sm='6'>
                                    <StatsHorizontal icon={<MarkEmailReadOutlined size={21} />} color='success' stats={item?.promotional_credit} statTitle={"Promotional"} />
                                </Col>
                                <Col lg='3' sm='6'>
                                    <StatsHorizontal icon={<MicNone size={21} />} color='success' stats={item?.voice_sms_credit} statTitle={"Voice"} />
                                </Col>
                                <Col lg='3' sm='6'>
                                    <StatsHorizontal icon={<MobiledataOff size={21} />} color='success' stats={item?.two_waysms_credit} statTitle={"Two-Way"} />
                                </Col>
                            </>
                        )
                    })}
                </Row>
            </Show>
            <Show IF={users?.userType === 0 || users?.userType === 3}>

                <Row>
                    <Col lg='3' sm='6'>
                        <StatsHorizontal icon={<MarkEmailReadOutlined size={21} />} color='success' stats={trans} statTitle={"Transactional"} />
                    </Col>
                    <Col lg='3' sm='6'>
                        <StatsHorizontal icon={<MarkEmailReadOutlined size={21} />} color='success' stats={pro} statTitle={"Promotional"} />
                    </Col>
                    <Col lg='3' sm='6'>
                        <StatsHorizontal icon={<MicNone size={21} />} color='success' stats={voice} statTitle={"Voice"} />
                    </Col>
                    <Col lg='3' sm='6'>
                        <StatsHorizontal icon={<MobiledataOff size={21} />} color='success' stats={two} statTitle={"Two-Way"} />
                    </Col>
                </Row>
            </Show>

            <Row>


                <Col lg={6}>
                    <Card className='p-2'>
                        <ButtonGroup className='mb-1'>
                            {/* <Button block outline={rSelected !== 1} color='primary' lg={6} md={12} onClick={() => { setRSelected(1); setMessageType(1); setValue("dlt_template_id", null) }} active={rSelected === 1}>
                                Transactional
                            </Button> */}
                            {/* <Button block outline={rSelected !== 2} color='primary' lg={6} md={12} onClick={() => { setRSelected(2); setMessageType(2); setValue("") }} active={rSelected === 2}>
                                Promotional
                            </Button> */}

                        </ButtonGroup>
                        <Row>

                            <Hide IF={users?.userType === 1 || users?.userType === 2}>
                                <Col md="12">
                                    {/* <FormGroupCustom
                                        // defaultOptions
                                        async
                                        control={control}
                                        type={"select"}
                                        errors={errors}
                                        name={"user_id"}
                                        isClearable
                                        className='mb-1'
                                        loadOptions={loadUser}
                                        onChangeValue={(e) => { setGetTemplate(e?.id); setTrans(e?.transaction_credit); setPro(e?.promotional_credit); setGetMessageType(e?.is_unicode); setTwo(e?.two_waysms_credit); setVoice(e?.voice_sms_credit); setGroup(e?.id) }}
                                        options={user}
                                        label="User"
                                        rules={{ required: true }}
                                    /> */}
                                    <FormGroupCustom
                                        defaultOptions
                                        // async
                                        control={control}
                                        type={"select"}
                                        errors={errors}
                                        name={"user_id"}
                                        isClearable
                                        className='mb-1'
                                        // loadOptions={loadUserOther}
                                        // value={loadUserOther}
                                        onChangeValue={(e) => { setGetTemplate(e?.id); setTrans(e?.transaction_credit); setPro(e?.promotional_credit); setGetMessageType(e?.is_unicode); setTwo(e?.two_waysms_credit); setVoice(e?.voice_sms_credit); setGroup(e?.id) }}
                                        options={userDetails}
                                        label="User"
                                        rules={{ required: true }}
                                    />
                                </Col>
                            </Hide>
                            {users?.userType === 1 || users?.userType === 2 ? <Col md="12">
                                <FormGroupCustom
                                    defaultOptions
                                    async
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"voice_upload_id"}
                                    key={`templte-form-${rSelected}`}
                                    // key={`templte-form-${watch('user_id')?.id}-${rSelected}`}
                                    isClearable
                                    className='mb-1'
                                    loadOptions={listVoiceTemplate}
                                    options={template}
                                    onChangeValue={(e) => { setDltMessage(e?.dlt_message); setGetMessageType(e?.is_unicode); setCode(e?.is_unicode); countWords(e?.dlt_message, e?.is_unicode); setValue("dlt_template_id", e?.id) }}
                                    label="Voice Template"
                                    rules={{ required: true }}

                                />
                            </Col> : <Col md="12">
                                <FormGroupCustom
                                    async
                                    defaultOptions
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    key={`templte-form-${watch('user_id')?.id}-${rSelected}`}
                                    name={"voice_upload_id"}
                                    isClearable
                                    isDisabled={!isValid(watch("user_id"))}
                                    className='mb-1'
                                    loadOptions={listVoiceTemplate}
                                    options={template}
                                    onChangeValue={(e) => { setDltMessage(e?.dlt_message); setGetMessageType(e?.is_unicode); setCode(e?.is_unicode); countWords(e?.dlt_message, e?.is_unicode); setValue("dlt_template_id", e?.id) }}
                                    label="Voice Template"
                                    rules={{ required: true }}

                                />
                            </Col>}
                            <Show IF={isValid(watch("voice_upload_id"))}>
                                <Col md="12">
                                    <audio muted style={{ height: "40px", color: "primary" }} controls src={`${httpConfig.baseUrl2}${watch("voice_upload_id")?.file_location}`} />
                                </Col>
                            </Show>

                            <Col md="6">
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

                            {/* <Col md="6">
                                <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="mobile_numbers"

                                    className='mb-1'
                                    label="Mobile Number"
                                    errors={errors}
                                    message={"Length must be of 10 Digits"}
                                    rules={{ required: true, minlength : 10 }}

                                />

                            </Col> */}
                            <Show IF={Permissions?.secondaryView} >
                                <Col md="6">
                                    <FormGroupCustom
                                        async
                                        // defaultOptions
                                        control={control}
                                        type={"select"}
                                        errors={errors}
                                        name={"secondary_route_id"}
                                        isClearable
                                        className='mb-1'
                                        loadOptions={listSecondary}
                                        options={secondary}
                                        label="Route"
                                        rules={{ required: true }}
                                    />
                                </Col>
                            </Show>

                            <>
                                <Col md="6">
                                    <BsTooltip title={"DTMF"}>
                                        <FormGroupCustom
                                            type={"text"}
                                            control={control}
                                            name="dtmf"

                                            className='mb-1'
                                            label="DTMF"
                                            errors={errors}
                                            rules={{ required: false }}
                                        />
                                    </BsTooltip>
                                </Col>
                                <Col md="6">
                                    <BsTooltip title={"Call Patch Number"}>
                                        <FormGroupCustom
                                            type={"text"}
                                            control={control}
                                            name="call_patch_number"

                                            className='mb-1'
                                            label="Call Patch Number"
                                            errors={errors}
                                            rules={{ required: false }}

                                        />
                                    </BsTooltip>
                                </Col>
                            </>

                            <Col md="12">
                                <FormGroupCustom
                                    type={"textarea"}
                                    control={control}
                                    name="mobile_numbers"
                                    className=''
                                    forceValue
                                    style={{ minHeight: 100 }}
                                    value={watch("mobile_numbers")}
                                    label="Contact"
                                    onChangeValue={(e) => {
                                        // log(e.replace(/\D/g, ''))
                                        setValue("mobile_numbers", e.replace(/[^\d \n]/g, ''))
                                    }}
                                    errors={errors}
                                    onClick={showButton}
                                />
                                <p className='mb-1 mt-25 fw-bolder'>
                                    {isValid(watch('mobile_numbers')) ? String(watch('mobile_numbers'))?.replace(/\n/g, " ")?.replace(/\s+/g, ' ')?.trim().split(" ").length : 0} Contacts,{" "}
                                    {rowsSelected.length} Groups, {" "} {dataTotal?.length} CSV Contacts (*Approx)</p>
                            </Col>
                            <Col md="12" sm="12">
                                <FormGroupCustom
                                    type={"checkbox"}
                                    control={control}
                                    name="schedule"
                                    className='mb-1'
                                    isClearable
                                    label="Schedule Voice SMS"
                                    errors={errors}


                                />
                            </Col>

                            {watch("schedule") === 1 ? <Col md="6">
                                <FormGroupCustom
                                    name={"campaign_date"}
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

                        <Show IF={users?.sp_operation === 1} >
                            <UncontrolledAccordion defaultOpen='1'>
                                <AccordionItem>
                                    <AccordionHeader targetId='1'><h4 className='fw-bolder'>Admin Operation</h4></AccordionHeader>
                                    <AccordionBody accordionId='1'>
                                        <Row>
                                            <Show IF={users?.sp_operation === 1} >

                                                <Show IF={users?.sp_operation === 1} >
                                                    <Col md="6">
                                                        <FormGroupCustom
                                                            type={"number"}
                                                            control={control}
                                                            name="ratio_set"
                                                            className='mb-1'
                                                            label="Ratio Set"
                                                            errors={errors}
                                                            rules={{ required: false }}

                                                        />

                                                    </Col>
                                                </Show>
                                                <Col md="6">

                                                    <FormGroupCustom
                                                        type={"number"}
                                                        control={control}
                                                        name="failed_ratio"
                                                        className='mb-1'
                                                        label="Failed Ratio"
                                                        errors={errors}
                                                        rules={{ required: false }}

                                                    />
                                                </Col>
                                            </Show>

                                        </Row>
                                    </AccordionBody>
                                </AccordionItem>
                            </UncontrolledAccordion>
                        </Show>
                        <Hide IF={progress === 0}>
                            <Progress animated striped className='progress-bar-success my-1' value={progress} />
                        </Hide>
                        <Col className='mt-2' sm='12'>
                            {/* <Button type='submit'
                                disabled={isfDisabled()}
                                onClick={uploadAndSave} className='me-1' color='primary' outline={isfDisabled()}>
                                {watch("schedule") ? "Schedule Message" : "Send Message Now"}
                            </Button> */}
                            <LoadingButton loading={loading} type='submit' disabled={isfDisabled() || loading}
                                onClick={uploadAndSave} className='me-1' color='primary' outline={isfDisabled()}>
                                {watch("schedule") ? "Schedule Voice" : "Send Voice SMS Now"}
                            </LoadingButton>

                        </Col>

                    </Card>
                </Col>
                <Col lg={6}>
                    <Card className='p-1'>
                        {/* <Show IF={!shows}>

                            <CardHeader className='border-bottom' >
                                <CardTitle tag='h4' className='fw-bolder mb-0'>OTHER WAYS TO SEND SMS </CardTitle>
                            </CardHeader>
                        </Show> */}
                        {/* <Show IF={!shows}>
                            <h4 className='fw-bolder'> OTHER WAYS TO SEND SMS </h4>
                        </Show> */}

                        <ButtonGroup className='mb-1'>
                            {/* <Button block outline={cSelected !== 1} color='primary' lg={6} md={12} onClick={() => { setCSelected(1); setCustomMessageType(1) }} active={cSelected === 1}>
                                Normal
                            </Button> */}
                            {/* <Button block outline={cSelected !== 2} color='primary' lg={6} md={12} onClick={() => { setCSelected(2); setCustomMessageType(2); toast('Now Please choose csv file for send custom SMS!', { icon: '👏' }) }} active={cSelected === 2}>
                            Custom
                        </Button> */}
                        </ButtonGroup>
                        <CardBody className='p-1 mt-0'>
                            <>
                                <Hide IF={customMessageType === 1}>
                                    <div className=''>
                                        <h5 className='fw-dark'>Send personalized SMS to multiple users at same time e.g</h5>
                                    </div>
                                    <Alert color='primary mb-2'>
                                        <p className='alert-heading mb-1'>Hello, this is your name {"{{name}}"} and your mobile number is {"{{mobile}}"}</p>

                                    </Alert>
                                </Hide>

                                {/* </Show>
                                <Show IF={shows}> */}
                                {/* <Hide IF={isValidArray(data)} > */}
                                <CSVReader
                                    // label={""}
                                    cssInputClass="form-control"
                                    onFileLoaded={handleForce}
                                    inputRef={csvRef}
                                    // inputName={"my"}
                                    parserOptions={papaParseOptions}
                                    key={`change${inputRemove}`}
                                />
                                <small className='fw-bolder mt-50 d-block'>Upload CSV File Only.   <a href='https://www.ablebits.com/office-addins-blog/convert-excel-csv/' target="_blank">Convert Excel into CSV</a> / <Show IF={customMessageType === 1}><span className='text-primary' style={{ cursor: 'pointer' }} onClick={sampleFileForNormal}>Download Sample File</span></Show>
                                    <Show IF={customMessageType === 2}><span className='text-primary' style={{ cursor: 'pointer' }} onClick={sampleFileForCustom}>Download Sample File</span></Show>
                                </small>
                                <Show IF={customMessageType === 1}>
                                    <Alert color='primary mt-1'>
                                        <p className='alert-heading mb-1'>Note:- Only mobile {"{{mobile}}"} (header title) will be accepted as a header in lowercase and without space.</p>

                                    </Alert>
                                    {/* <small className='fw-bold mt-50 d-block'><span className='fw-bolder'>Mobile Number</span> will be accepted as a header in lowercase and without space</small> */}
                                </Show>
                                <Show IF={customMessageType === 2}>
                                    <Alert color='primary mt-1'>
                                        <p className='alert-heading mb-1'>Note:- You can add variables  <span className='fw-bolder'>(header title)</span> as per your requirement in lowercase without space</p>

                                    </Alert>
                                    {/* <small className='fw-bold mt-50 d-block'>You can add variables  <span className='fw-bolder'>(header title)</span> as per your requirement in lowercase without space</small> */}
                                </Show>
                                {/* </Show> */}
                                {/* </Hide> */}

                                {renderTable()}
                            </>
                        </CardBody>
                    </Card>
                    {/* <Show IF={shows}> */}
                    <Hide IF={customMessageType === 2}>
                        <Card className=''>
                            <CardHeader className='d-flex justify-content-between border-bottom'>
                                <h4 className='fw-bolder mb-0'> PHONE GROUP </h4>
                                {/* <div> <ArrowLeft onClick={showButton} /></div> */}
                            </CardHeader>
                            <CardBody className='p-0'>


                                <div className='card-datatable app-user-list table-responsive'>
                                    <div className='react-dataTable'>

                                        <DataTable
                                            noHeader
                                            selectableRows
                                            pagination
                                            paginationServer
                                            className='react-dataTable'
                                            columns={contactGroup}
                                            noDataComponent={<div className="nodata-class fw-bold" style={{ padding: "2rem" }}>
                                                No Contact Group Found
                                            </div>}
                                            sortIcon={<ChevronDown size={10} />}
                                            paginationComponent={CustomPagination}
                                            data={contactList?.data}
                                            onSelectedRowsChange={handleReportChange}
                                        />
                                    </div>
                                </div>
                                {/* <Table responsive>
                            <thead>
                                <tr>
                                    <th scope='col' className='text-nowrap'>
                                        #
                                    </th>
                                    <th scope='col' className='text-nowrap'>
                                        Heading 1
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {contact?.data?.map((item, index) => {
                                
                                    return (
                                        <tr>
                                            <td className='text-nowrap'> {index + 1} </td>
                                            <td className='text-nowrap'> {item?.group_name} </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </Table> */}
                                {/* <FormGroupCustom
                            type={"checkbox"}
                            control={control}
                            name="testing"
                            className='mb-1'
                            isClearable
                            label="Testing(2 Contacts)"
                            errors={errors}
                        /> */}
                            </CardBody>
                        </Card>
                    </Hide>
                    {/* </Show> */}
                </Col>
            </Row>
        </Form>

    )
}

export default VoiceSms
