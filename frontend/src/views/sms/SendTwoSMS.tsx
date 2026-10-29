// @ts-nocheck
import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'
import CSVReader from '@components/csv-reader'
import MarkEmailReadOutlined from '@mui/icons-material/MarkEmailReadOutlined'
import MicNone from '@mui/icons-material/MicNone'
import MobiledataOff from '@mui/icons-material/MobiledataOff'
import Refresh from '@mui/icons-material/Refresh'
import Message from '@mui/icons-material/Message'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import classNames from 'classnames'
import React, { forwardRef, useEffect, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, Sliders } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { AccordionBody, AccordionHeader, AccordionItem, Alert, Button, ButtonGroup, Card, CardBody, CardHeader, Col, DropdownItem, DropdownMenu, DropdownToggle, Form, Input, InputGroupText, Label, Progress, Row, Table, UncontrolledAccordion, UncontrolledButtonDropdown } from 'reactstrap'
import Hide from '../../utility/Hide'
import { Permissions } from '../../utility/Permissions'
import Show from '../../utility/Show'
import { createAsyncSelectMultiMessageOptions, createAsyncSelectMultiUserOptions, createAsyncSelectOptions, createSelectOptions, fastLoop } from '../../utility/Utils'
import { loadTwoSms } from '../../utility/apis/TwoWaySMS'
import { uploadFiles } from '../../utility/apis/common'
import { loadContactGroup } from '../../utility/apis/contactGroup'
import { loadDlt } from '../../utility/apis/dlt'
import { loadSecondaryRoute } from '../../utility/apis/seconday'
import { addSMS } from '../../utility/apis/sms'
import { loadUserChild } from '../../utility/apis/userManagement'
import { formatIndianNumber, isValid, isValidArray, log } from '../../utility/helpers/common'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import BsTooltip from '../components/tooltip'

const SendTwoSMS = () => {
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
    const [filterData, setFilterData] = useState({
        per_page_record: 10
    })
    const navigate = useNavigate()

    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage, setRowsPerPage] = useState("2")
    const [page, setPage] = useState(1)
    const textAreaRef = useRef()
    const csvRef = useRef()
    const [twoWay, setTwoWay] = useState(null)
    const [wordCount, setWordCount] = useState(0)
    const [userDetails, setUserDetails] = useState(null)
    const [inputRemove, setInputRemove] = useState(null)
    const [open, setOpen] = useState('')
    const [screen, setScreen] = useState(1)
    const dispatch = useDispatch()
    const [showGroup, setShowGroup] = useState(false)
    const showButton = () => {
        setShows(!shows)
    }
    const [creditInfo, setCreditInfo] = useState(null)
    const [getMessage, setGetMessage] = useState(null)
    const [getMessageType, setGetMessageType] = useState(0)

    // const listDltTemplate = () => {
    //     // if (rSelected === 1) {
    //     loadDlt({
    //         perPage: 100,
    //         jsonData: {
    //             // user_id: users?.userType === 1 || users?.userType === 2 ? users?.id : watch("user_id")?.id ?? "",
    //             // sender_id_type: 1
    //         },
    //         loading: setLoading,
    //         dispatch,
    //         success: (e) => {
    //             setTemplate(createSelectOptions(e?.data?.data?.map(a => ({
    //                 ...a,
    //                 xName: `${a?.template_name} | ${a?.dlt_template_id} | ${a?.dlt_message}`
    //             })), "xName"))
    //         }
    //     })
    //     // }
    //     // }

    // }
    const loadUser = async (search, loadedOptions, { page }) => {

        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", null, setUser)

    }
    const loadUserW = () => {
        loadUserChild({
            perPage: 1000,
            jsonData: {
                // search: users?.email
                // search: users?.userType === 0 || users?.userType === 3 ? watch("user_id")?.id : users?.id ?? ""
            },
            loading: setLoading,
            dispatch,
            success: (e) => {
                setUserDetails(createSelectOptions(e?.data?.data, 'username', null))


            }
        })
    }
    const listSecondary = async (search, loadedOptions, { page }) => {

        const res = await loadSecondaryRoute({
            async: true,
            page,
            perPage: 25,
            jsonData: { name: search, status: 1 }
        })
        return createAsyncSelectOptions(res, page, "sec_route_name", "id", setSecondary)

    }

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
    // const listDltTemplate = async (search, loadedOptions, { page }) => {

    //     const res = await loadDlt({
    //         async: true,
    //         page,
    //         perPage: 25,
    //         jsonData: { search }
    //     })
    //     return createAsyncSelectMultiOptions(res, page, "xName", null, setTemplate)

    // }

    const loadMessageTemplate = () => {
        loadTwoSms({
            jsonData: {
                created_by: users?.userType === 1 || users?.userType === 2 ? users?.id : watch("user_id")?.id ?? "",
                with_expired: "no"
            },
            loading: setLoading,
            // dispatch,
            success: (e) => {
                setTwoWay(e)
            }
        })
    }
    // log(twoWay, 'yyoyo')

    const listDltTemplate = async (search, loadedOptions, { page }) => {

        const res = await loadDlt({
            async: true,
            page,
            perPage: 100,
            jsonData: {
                user_id: users?.userType === 1 || users?.userType === 2 ? users?.id : watch("user_id")?.id ?? "",
                sender_id_type: 1,
                search

            }
        })
        return createAsyncSelectMultiMessageOptions(res, page, "xName", null, setTemplate)

    }

    const listDltTemplates = () => {
        loadDlt({
            perPage: 100,
            jsonData: {
                user_id: users?.userType === 1 || users?.userType === 2 ? users?.id : watch("user_id")?.id ?? ""
                // sender_id_type: 1
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

        // }

    }
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

    const BootstrapCheckbox = forwardRef((props, ref) => (
        <div className='form-check'>
            <Input type='checkbox' innerRef={ref} {...props} />
        </div>
    ))
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
    useEffect(() => {
        listContactGroup()
    }, [group, currentPage, rowsPerPage])
    // useEffect(() => {
    //     // if (watch("user_id")) {
    //     listDltTemplate()
    //     // }

    // }, [watch("user_id"), users?.userType === 1, users?.userType === 2, rSelected])
    useEffect(() => {
        // if (watch("user_id")) {
        loadMessageTemplate()
        // }

    }, [users?.id, users?.userType, watch("user_id")?.id])

    const onSubmit = (data, file) => {
        // handleSubmit(onSubmit)
        addSMS({
            jsonData: {
                ...data,
                route_type: 3,
                sms_type: 1,
                // message: dltMessage ? dltMessage : getMessage,
                message: isValid(data?.getMessage) && isValid(dltMessage) ? data?.getMessage : dltMessage,
                // message: dltMessage,
                file_path: file,
                contact_group_ids: rowsSelected,
                user_id: data?.user_id?.id
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
                navigate("/admin-send-two-ways-sms")
                reset()
                // location.reload()
            }
        })
        // log(data)
    }

    const countWords = (e, getMessageType) => {
        // const messageType = 0 // 0 = english, 1 = unicode
        const word = String(e)
        // const lines = word.split(/\r|\r\n|\n/)
        // const countEnter = lines.length
        const numWords = word.length
        let credit = 1
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
            }
        }
        setWordCount(numWords)
        setCount(parseInt(credit))
    }

    const handleUpload = () => {
        // log(csvRef.current?.files)
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
    const loadUserOther = () => {
        loadUserChild({
            perPage: 1000,
            jsonData: {
                search: users?.email
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
    }, [Permissions])
    // const handleDynamicValue = (myValue) => {
    //     const myField = textAreaRef.current
    //     if (isValid(myField)) {
    //         const startPos = myField.selectionStart
    //         const endPos = myField.selectionEnd
    //         const c = "{{"
    //         const cc = "}}"
    //         myField.value = myField.value.substring(0, startPos)
    //             + c + myValue + cc + myField.value.substring(endPos, myField.value.length)

    //         setDltMessage(myField.value)
    //     }
    // }
    const handleDynamicValue = (myValue) => {
        const myField = textAreaRef.current
        if (isValid(myField)) {
            const startPos = myField.selectionStart
            const endPos = myField.selectionEnd
            const c = "{{"
            const cc = "}}"
            myField.value = `${myField.value.substring(0, startPos)
                + c}2way-sms-link-${myValue?.id}${cc}${myField.value.substring(endPos, myField.value.length)}`
            // log('sadsadsa', myField.value)
            setDltMessage(myField.value)
            setValue("getMessage", myField.value)

        }
    }

    const papaParseOptions = {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: header => header.toLowerCase().replace(/\W/g, "_")
    }
    const handleForce = (data, fileInfo) => {
        log(data, fileInfo, "fgdgdfgdf")
        setFile(fileInfo)
        setUploaded(null)
        setData(data?.slice(0, 4))
        setDataTotal(data)
        // csvRef.current.reset()
    }
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

    const sendToLink = () => {
        navigate('/add-short-link-generate')
    }
    const sendToTemplate = () => {
        navigate('/two-ways-sms')
    }
    const remove = () => {
        // setFile(false)
        setUploaded(false)
        setData([])
        setDataTotal([])
        setInputRemove(new Date().getTime())

    }

    // log(watch("getMessage"))

    ///use effect setDltMessage when watch getMessage
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
    return (
        <>

            <Header title={"Two way SMS"} icon={<Message />}>
                <ButtonGroup>
                    <Button.Ripple size="sm" color="primary" outline onClick={() => sendToLink()}>
                        <Sliders size="14" /> Generate Short Link
                    </Button.Ripple>
                    <Button.Ripple size="sm" onClick={() => sendToTemplate()} >
                        <Sliders size="14" /> Create Two Way SMS Template
                    </Button.Ripple>
                </ButtonGroup>
            </Header>
            <Form onSubmit={w => w.preventDefault()}>
                <Show IF={users?.userType === 1 || users?.userType === 2}>

                    <Row>
                        {creditInfo?.data?.data.map((item, index) => {
                            return (
                                <>


                                    <Col lg='3' sm='6'>
                                        <StatsHorizontal icon={<MarkEmailReadOutlined size={21} />} color='success' stats={isValid(item?.transaction_credit)  ?  formatIndianNumber(parseInt(item?.transaction_credit)) : 0} statTitle={"Transactional"} />
                                    </Col>
                                    <Col lg='3' sm='6'>
                                        <StatsHorizontal icon={<MarkEmailReadOutlined size={21} />} color='success' stats={isValid(item?.promotional_credit)  ?  formatIndianNumber(parseInt(item?.promotional_credit)) : 0} statTitle={"Promotional"} />
                                    </Col>
                                    <Col lg='3' sm='6'>
                                        <StatsHorizontal icon={<MicNone size={21} />} color='success' stats={isValid(item?.voice_sms_credit)  ?  formatIndianNumber(parseInt(item?.voice_sms_credit)) : 0} statTitle={"Voice"} />
                                    </Col>
                                    <Col lg='3' sm='6'>
                                        <StatsHorizontal icon={<MobiledataOff size={21} />} color='success' stats={isValid(item?.two_waysms_credit)  ?  formatIndianNumber(parseInt(item?.two_waysms_credit)) : 0} statTitle={"Two-Way"} />
                                    </Col>
                                </>
                            )
                        })}
                    </Row>
                </Show>
                <Show IF={users?.userType === 0 || users?.userType === 3}>

                    <Row>
                        <Col lg='3' sm='6'>
                            <StatsHorizontal icon={<MarkEmailReadOutlined size={21} />} color='success' stats={isValid(trans) ? formatIndianNumber(parseInt(trans)) : 0} statTitle={"Transactional"} />
                        </Col>
                        <Col lg='3' sm='6'>
                            <StatsHorizontal icon={<MarkEmailReadOutlined size={21} />} color='success' stats={isValid(pro) ? formatIndianNumber(parseInt(pro)) : 0} statTitle={"Promotional"} />
                        </Col>
                        <Col lg='3' sm='6'>
                            <StatsHorizontal icon={<MicNone size={21} />} color='success' stats={isValid(voice) ? formatIndianNumber(parseInt(voice)) : 0} statTitle={"Voice"} />
                        </Col>
                        <Col lg='3' sm='6'>
                            <StatsHorizontal icon={<MobiledataOff size={21} />} color='success' stats={isValid(two) ? formatIndianNumber(parseInt(two)) : 0} statTitle={"Two-Way"} />
                        </Col>
                    </Row>
                </Show>
                <Row>
                    <Col md="6" lg="6" sm="12">
                        <Card className='p-2'>
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
                                            onChangeValue={(e) => { log(e, "users"); setGetTemplate(e?.id); setTrans(e?.transaction_credit); setPro(e?.promotional_credit); setTwo(e?.two_waysms_credit); setVoice(e?.voice_sms_credit); setGroup(e?.id); log(e?.id, "234234wrw") }}
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
                                {/* <Col md="12">
                                <FormGroupCustom
                                    // defaultOptions
                                    async
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"dlt_template_id"}
                                    isClearable
                                    className='mb-1'
                                    loadOptions={listDltTemplate}
                                    options={template}
                                    onChangeValue={(e) => { log(e, "dlt"); setSender(e?.sender_id); setDltMessage(e?.dlt_message); setCode(e?.is_unicode); setValue("dlt_template_id", e?.id) }}
                                    label="DLT Template"
                                    rules={{ required: true }}

                                />
                            </Col> */}
                                {users?.userType === 1 || users?.userType === 2 ? <Col md="12">
                                    <FormGroupCustom
                                        defaultOptions
                                        async
                                        control={control}
                                        type={"select"}
                                        errors={errors}
                                        name={"dlt_template_id"}
                                        isClearable
                                        className='mb-1'
                                        loadOptions={listDltTemplate}
                                        options={template}
                                        onChangeValue={(e) => { setSender(e?.sender_id); setDltMessage(e?.dlt_message); setGetMessageType(e?.is_unicode); setCode(e?.is_unicode); countWords(e?.dlt_message, e?.is_unicode); setValue("dlt_template_id", e?.id) }}
                                        label="DLT Template"
                                        rules={{ required: true }}

                                    />
                                </Col> : <Col md="12">
                                    <FormGroupCustom
                                        async
                                        defaultOptions
                                        control={control}
                                        type={"select"}
                                        errors={errors}
                                        key={`templtse-form-${watch('user_id')?.id}`}

                                        name={"dlt_template_id"}
                                        isClearable
                                        isDisabled={!isValid(watch("user_id"))}
                                        className='mb-1'
                                        loadOptions={listDltTemplate}
                                        options={template}
                                        onChangeValue={(e) => { setSender(e?.sender_id); setDltMessage(e?.dlt_message); setGetMessageType(e?.is_unicode); setCode(e?.is_unicode); countWords(e?.dlt_message, e?.is_unicode); setValue("dlt_template_id", e?.id) }}
                                        label="DLT Template"
                                        rules={{ required: true }}

                                    />
                                </Col>}
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
                                <Col md="6">
                                    <FormGroupCustom
                                        key={`${sender}-dsfsdf`}
                                        type={"text"}
                                        control={control}
                                        name="fgdfg"
                                        value={sender}
                                        className='mb-1 pe-none'
                                        label="Sender ID"
                                        errors={errors}
                                    // rules={{ required: true }}

                                    />
                                </Col>
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
                                        // onClick={showButton}
                                        onClick={() => { showButton(); setShowGroup(true) }}
                                    />
                                    <p className='mb-1 mt-25 fw-bolder'>
                                        {isValid(watch('mobile_numbers')) ? String(watch('mobile_numbers'))?.replace(/\n/g, " ")?.replace(/\s+/g, ' ')?.trim().split(" ").length : 0} Contacts,{" "}
                                        {rowsSelected.length} Groups, {" "} {dataTotal?.length} CSV Contacts (*Approx)</p>
                                </Col>
                                <Col md="12">

                                    <Row className='align-items-end'>
                                        <Col>
                                            <Label className='fw-bolder mr-2'>Message</Label> (
                                            <span className='fw-bolder text-primary'> {code === 1 ? 'Unicode' : "English"} </span>
                                            )
                                        </Col>
                                        {/* <Hide IF={customMessageType === 1}>
                                            <Show IF={isValidArray(columns)}> */}
                                        <Col md="5" className='mb-25'>
                                            <UncontrolledButtonDropdown>
                                                <DropdownToggle className='pb-25 pt-25' color='flat-primary' caret>
                                                    Insert A Dynamic value
                                                </DropdownToggle>
                                                <DropdownMenu style={{ height: "300px", overflow: "scroll" }}>
                                                    {
                                                        twoWay?.data?.map(d => (<DropdownItem onClick={(e) => handleDynamicValue(d, e)} tag='span'>{d?.title}</DropdownItem>))
                                                    }
                                                </DropdownMenu>
                                            </UncontrolledButtonDropdown>
                                        </Col>

                                        {/* </Show>
                                        </Hide> */}
                                    </Row>
                                    <FormGroupCustom
                                        noLabel
                                        key={`${dltMessage}-dsfsdfsdf`}
                                        type={"textarea"}
                                        control={control}
                                        style={{ minHeight: 100 }}
                                        name="getMessage"
                                        className='mb-25'
                                        label="Message"
                                        value={dltMessage}
                                        // setValue = {dltMessage}
                                        errors={errors}
                                        innerRef={textAreaRef}
                                        rules={{ required: false }}
                                        onChangeValue={e => { countWords(e, getMessageType) }}
                                    />
                                    <div className='d-flex justify-content-between'>
                                        {/* <p className='fw-bolder'> {code === 1 ? 'Unicode' : "English"} </p> */}
                                        <p className={classNames("fw-bolder mb-1", { 'text-danger': count > 1 })}>({wordCount}/{count})</p>

                                    </div>

                                </Col>
                                <Col md="6" sm="12">
                                    <FormGroupCustom
                                        type={"checkbox"}
                                        control={control}
                                        name="is_flash"
                                        className='mb-1'
                                        isClearable
                                        label="Send as a Flash SMS"
                                        errors={errors}


                                    />
                                </Col>
                                <Col md="6" sm="12">
                                    <FormGroupCustom
                                        type={"checkbox"}
                                        control={control}
                                        name="same_as_template"
                                        className='mb-1'
                                        isClearable
                                        label="Same As Template"
                                        errors={errors}
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

                                {/* <Show IF={users?.sp_operation === 1} >
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

                                </Show> */}
                                {watch("schedule") === 1 ? <Col md="6">
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
                                {/* <Show IF={users?.sp_operation === 1} >
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
                                </Show> */}

                                <Show IF={users?.sp_operation === 1} >
                                    <UncontrolledAccordion>
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
                            </Row>
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
                                    {watch("schedule") ? "Schedule Message" : "Send Message Now"}
                                </LoadingButton>

                            </Col>
                        </Card>

                    </Col>
                    <Col md="6" lg="6" sm="12">
                        <Card>
                            <CardHeader className='border-bottom'>
                                <h3 className='fw-bolder'>Send Two way SMS</h3>
                            </CardHeader>
                            <div className='p-2'>
                                <p className='fw-bold'>Just create two way sms template and add link to your message.
                                    you can also create template by clicking <span className='text-primary'>Create Two way SMS Template</span> tab .</p>
                                <Alert color='primary mb-2'>
                                    <p className='alert-heading mb-1'>Hello, my name is Jhon Doe and Please rate my skills through below link {"{{2way-sms-link}}"} </p>

                                </Alert>
                                <Show IF={showGroup === true}>
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

                                    <small className='fw-bolder mt-50 d-block'>Upload CSV File Only. <a href='https://www.ablebits.com/office-addins-blog/convert-excel-csv/'>Convert Excel into CSV</a></small>
                                    {/* </Show> */}
                                    {/* </Hide> */}
                                    {renderTable()}
                                </Show>
                            </div>
                            {/* <div className='p-2'>
                           
                        </div> */}


                        </Card>
                        <Show IF={showGroup === true}>

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
                                                selectableRowsComponent={BootstrapCheckbox}
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
                        </Show>
                    </Col>
                </Row>
            </Form>
        </>
    )
}

export default SendTwoSMS
