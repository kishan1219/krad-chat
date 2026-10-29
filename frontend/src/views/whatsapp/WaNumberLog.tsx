// @ts-nocheck
import '@styles/react/libs/tables/react-dataTable-component.scss'
import React, { forwardRef, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import * as Icon from 'react-feather'
import { ChevronDown } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Button, ButtonGroup, Card, CardHeader, CardTitle, Col, Form, Input, Popover, Row, UncontrolledTooltip } from 'reactstrap'
import useUser from '../../utility/hooks/useUser'
import { whatsAppCampaignInfo } from '../../utility/apis/whatsappConfig'
import { isValid, isValidArray, log } from '../../utility/helpers/common'
import Show from '../../utility/Show'
import FormGroupCustom from '../components/formGroupCustom'
import LoadingButton from '../components/buttons/LoadingButton'
import Shimmer from '../components/shimmers/Shimmer'
import BsTooltip from '../components/tooltip'
import { formatDate } from '../../utility/Utils'
import WaMobileScreen from './WaMobileScreen'
import Hide from '../../utility/Hide'
import Info from '@mui/icons-material/Info'
import CustomTooltip from '../../utility/helpers/CustomTooltip'
import { Tooltip } from '@mui/material'
import toast from 'react-hot-toast'
import WhatsApp from '@mui/icons-material/WhatsApp'


const WaNumberLog = ({ edit, activeTab }) => {

    const loginUser = useUser()
    const [open, setOpen] = useState(false)

    const [editData, setEditData] = useState(null)
    const [threadResponse, setThreadResponse] = useState(null)
    const [loading, setLoading] = useState(false)
    const [list, setList] = useState(null)
    const users = useSelector(state => state.auth.userData)
    const [showModal, setShowModal] = useState(false)
    const dispatch = useDispatch()
    const [currentPage, setCurrentPage] = useState("1")
    const [formVisible, setFormVisible] = useState(false)
    const [rowsPerPage] = useState("15")
    const form = useForm()
    const [perPage, setPerPage] = useState(15)
    const [id, setId] = useState(null)
    const [resetIt, setResetIt] = useState(new Date())
    const [filterData, setFilterData] = useState({
        per_page_record: 15,
        search: ""
    })
    const [reload, setReload] = useState(false)

    const [user, setUser] = useState(null)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form


    const handleShow = () => {
        reset()
        setOpen(!open)

        if (edit === null) setEditData(null)

    }

    useEffect(() => {
        setId(edit?.id)
    }, [edit])


    const submitFilter = (d) => {
        setFilterData({
            ...d
            // filterData
        })
        // console.log(d)

    }

    const listWhatsappInfo = (data) => {
        whatsAppCampaignInfo({
            id: edit?.id,
            page: currentPage,
            perPage: rowsPerPage,
            loading: setLoading,
            // showS: !isValid(filterData?.search),
            jsonData: {
                ...filterData,
                search: filterData?.search
            },
            success: setList

        })
    }
    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])

    useEffect(() => {
        if (activeTab === '2') {
            listWhatsappInfo()

        }

    }, [filterData, activeTab])

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        listWhatsappInfo({
            id,
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            success: setList,
            loading: setLoading
        })
    }

    const handleReload = () => {
        listWhatsappInfo()
    }

    // const messageStatus = (row) => {
       
    //     if (row?.stat === 'Failed') {

    //         return <span className='text-danger'>{row?.stat}</span>


    //     } else if (row?.stat === 'Sent') {
    //         return <span className='text-secondary'>{row?.stat}</span>
    //     } else if (row?.stat === 'Delivered') {
    //         return <span className='text-success'>{row?.stat}</span>
    //     } else if (row?.stat === 'read') {
    //         return <span style={{ color: '#34B7F1' }}>{row?.stat}</span>
    //     } else {
    //         return <span className='text-primary'>{row?.stat}</span>
    //     }
    // }
    const messageStatus = (row) => {
        const stat = row?.stat ? row.stat.toUpperCase() : ''
        if (stat === 'FAILED') {
            return <span className='text-danger'>{stat}</span>
        } else if (stat === 'SENT') {
            return <span className='text-secondary'>{stat}</span>
        } else if (stat === 'DELIVERED') {
            return <span className='text-success'>{stat}</span>
        } else if (stat === 'READ') {
            return <span style={{ color: '#34B7F1' }}>{stat}</span>
        } else {
            return <span className='text-primary'>{stat}</span>
        }
    }

    // function displayErrorTitlesAndCodesFromString(errorInfoString) {
    //     try {
    //         const errors = JSON.parse(errorInfoString)
    //         return errors
    //             .map(error => `Code: ${error.code},<br />${error.title}`)
    //             .join('\n')
    //     } catch (err) {
    //         return "Invalid error format"
    //     }
    // }

    function displayErrorTitlesAndCodesFromString(errorInfoString) {
        try {
            const errors = JSON.parse(errorInfoString)
            return (
                <div>
                    {errors.map((error, idx) => (
                        <div key={idx}>
                            <strong>Code:</strong> {error.code},<br />
                            {error.title}
                        </div>
                    ))}
                </div>
            )
        } catch (err) {
            return "Invalid error format"
        }
    }

    let columnn = []
    if (loginUser?.userType === 0 || loginUser?.userType === 3) {
        columnn = [

            {
                name: "#",
                cell: (row, index) => {
                    // return (filterData?.per_page_record * (page - 1)) + (index + 1)
                    return (rowsPerPage * (currentPage - 1)) + (index + 1)
                },
                maxWidth: "10px"
            },
            {
                name: "Mobile No.",
                // selector: 'mobile',
                cell: (row, index) => {
                    return (<> <div>
                        <span className='text-wrap' >{row.mobile}</span>
                        <br />
                        <Show IF={loginUser?.userType === 0 || loginUser?.userType === 3}><Show IF={row?.is_auto === 0} >  <Button.Ripple color="primary" onClick={() => { }} size="sm" style={{ marginTop: "7px" }}> <Icon.Send size={"14"} />&nbsp; No </Button.Ripple> </Show></Show>
                        <Show IF={loginUser?.userType === 0 || loginUser?.userType === 3}><Show IF={row?.is_auto === 1} >  <Button.Ripple color="primary" onClick={() => { }} size="sm" style={{ marginTop: "7px" }}> <Icon.Send size={"14"} />&nbsp; Yes </Button.Ripple>  </Show></Show>

                    </div> </>)
                },
                sortable: true,
                minWidth: '170px'
            },
            {
                name: "Sent",
                selector: r => {
                    return (
                        <>
                            <span>{(r?.sent_date_time)} </span>
                        </>
                    )
                },
                sortable: true,
                minWidth: '170px'
            },
            {
                name: "Delivery",
                selector: r => {
                    return (<><span> {(r?.delivered_date_time)} </span></>)
                    // <>
                    //     <span>{r?.delivered} <br /> {formatDate(r?.delivered_date_time)} </span>
                    // </>
                },
                sortable: true,
                minWidth: '170px'
            },
            {
                name: "Read",
                selector: r => {
                    return (
                        <>
                            <span>{(r?.read_date_time)} </span>
                        </>
                    )
                },
                sortable: true,
                minWidth: '170px'
            },

            // {
            //     name: "Message",
            //     cell: (row, index) => {
            //         return (<><div><BsTooltip title={row?.dlr_info?.description}><span className='text-wrap'>{row.message}</span></BsTooltip> </div></>)
            //     },
            //     sortable: true,
            //     minWidth: '400px'
            // },
            {
                name: "Used Credit",
                selector: r => r.use_credit,
                sortable: true,
                minWidth: '170px'
            },


            {
                name: "Status",
                selector: row => {


                    return <>

                        {/* <Show IF={row?.stat === "read" && isValidArray(row?.whats_app_reply_threads)}>
                            <UncontrolledTooltip title="View Whatsapp Reply" target="thread">
                                <span id="thread" style={{ cursor: 'pointer' }} onClick={() => { setThreadResponse(row); setShowModal(!showModal) }} >
                                    {messageStatus(row)}</span>&nbsp; <WhatsApp style={{ color: '#25D366', marginBottom: '5px' }} />
                            </UncontrolledTooltip> */}
                        <Show IF={row?.stat === "read" && isValidArray(row?.whats_app_reply_threads)}>
                            <span id={`thread-${row.mobile}`} style={{ cursor: 'pointer' }} onClick={() => { setThreadResponse(row); setShowModal(!showModal) }} >
                                {messageStatus(row)}
                                &nbsp;
                                <WhatsApp style={{ color: '#25D366', marginBottom: '5px' }} />
                            </span>
                            <UncontrolledTooltip placement="top" target={`thread-${row.mobile}`}>
                                View Whatsapp Reply
                            </UncontrolledTooltip>
                        </Show>
                        <Hide IF={(row?.stat === "read" && isValidArray(row?.whats_app_reply_threads)) || row?.stat === "failed"}>
                            <span  >
                                {messageStatus(row)}</span>
                           
                        </Hide>
                        <Show IF={row?.stat === "failed"}>
                            <span style={{ cursor: 'pointer' }} onClick={() => toast.error(displayErrorTitlesAndCodesFromString(row?.error_info))} >
                                {messageStatus(row)}</span>
                           
                        </Show>
                       
                    </>
                },
                sortable: true,
                minWidth: '170px'
            }

        ]
    } else {
        columnn = [

            {
                name: "#",
                cell: (row, index) => {
                    return (rowsPerPage * (currentPage - 1)) + (index + 1)
                },
                maxWidth: "10px"
            },
            {
                name: "Mobile No.",
                selector: r => r.mobile,

                sortable: true,
                minWidth: '170px'
            },
            {
                name: "Sent",
                selector: r => {
                    return (
                        <>
                            <span>{(r?.sent_date_time)} </span>
                        </>
                    )
                },
                sortable: true,
                minWidth: '170px'
            },
            {
                name: "Delivery",
                selector: r => {
                    return (
                        <>
                            <span>{(r?.delivered_date_time)} </span>
                        </>
                    )
                },
                sortable: true,
                minWidth: '170px'
            },
            {
                name: "Read",
                selector: r => {
                    return (
                        <>
                            <span>{(r?.read_date_time)} </span>
                        </>
                    )
                },
                sortable: true,
                minWidth: '170px'
            },

            {
                name: "Status",
                // selector: row => { messageStatus(row) },
                selector: row => {
                    return (
                        <>

                            {/* <span style={{ cursor: 'pointer' }} onClick={() => { setShowModal(!showModal); setThreadResponse(row) }} >
                                {messageStatus(row)}
                            </span> */}
                            <Show IF={row?.stat === "read" && isValidArray(row?.whats_app_reply_threads)}>
                                <span style={{ cursor: 'pointer' }} onClick={() => { setThreadResponse(row); setShowModal(!showModal) }} >
                                    {messageStatus(row)}</span><WhatsApp style={{ color: '#34B7F1', marginBottom: '5px' }} />
                            </Show>
                            <Hide IF={(row?.stat === "read" && isValidArray(row?.whats_app_reply_threads)) || row?.stat === "failed"}>
                                <span >
                                    {messageStatus(row)}</span>

                            </Hide>
                            <Show IF={row?.stat === "failed"}>
                                <span style={{ cursor: 'pointer' }} onClick={() => toast.error(displayErrorTitlesAndCodesFromString(row?.error_info))} >
                                    {messageStatus(row)}</span>

                            </Show>
                        </>
                    )
                },
                sortable: true,
                minWidth: '170px'
            }

        ]
    }

    const CustomPagination = () => {
        const count = Math.ceil(list?.data?.total / list?.data?.per_page)
        return (
            <ReactPaginate
                initialPage={list?.data?.current_page - 1}
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


    return (
        <>
            <WaMobileScreen Component={Button.Ripple} edit={threadResponse} color={"secondary"} showModal={showModal} setShowModal={() => setShowModal(false)} noView />

            <Card className='border'>

                <CardHeader className='border-bottom inline'>
                    <CardTitle className='text-primary' tag='h4'>Send Numbers Final Report</CardTitle>
                    <ButtonGroup>
                        <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { setFilterData({}); setReload(true); setResetIt(new Date()); reset() }}>
                            <Icon.RefreshCcw size="14" />
                        </Button.Ripple>
                    </ButtonGroup>
                </CardHeader>
                <Row className='justify-content-end mx-0'>
                    <Col className='d-flex align-items-center justify-content-end mt-1' md='3' sm='12'>

                        <Form onSubmit={e => e.preventDefault()}>

                            <FormGroupCustom
                                key={resetIt}
                                name={"search"}
                                type={"text"}
                                errors={errors}
                                label="Search"
                                noLabel
                                setValue={setValue}
                                className="mb-2"
                                control={control}
                                append={
                                    <>
                                        <LoadingButton
                                            onClick={() => {
                                                handleSubmit(submitFilter)()
                                            }}
                                            loading={loading}
                                            className="btn btn-primary"
                                            color="primary"
                                            // type="submit"
                                            size="sm"
                                        >
                                            <Icon.Search size={15} />
                                        </LoadingButton>
                                    </>
                                }
                            />
                        </Form>
                    </Col>
                </Row>
                {loading ? <>
                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5, marginTop: 5 }} />
                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />

                </> : <>
                    <div className='card-datatable app-user-list table-responsive'>
                        <div className='react-dataTable'>

                            <DataTable
                                noHeader
                                // selectableRows
                                pagination
                                paginationServer
                                className='react-dataTable'
                                // expandableRows
                                // expandOnRowClicked
                                columns={columnn}
                                noDataComponent={<div className="nodata-class fw-bold" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                selectableRowsComponent={BootstrapCheckbox}
                                sortIcon={<ChevronDown size={10} />}
                                // expandableRowsComponent={ExpandableTable}
                                paginationComponent={CustomPagination}
                                data={list?.data?.data}
                            // onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div>
                </>}

            </Card>
            {/* </form> */}


        </>
    )
}

export default WaNumberLog
