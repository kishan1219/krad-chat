// @ts-nocheck

import { ThemeColors } from '@src/utility/context/ThemeColors'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import React, { forwardRef, useContext, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, RefreshCcw, Sliders } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Button, ButtonGroup, Card, Col, Form, Input, Row, Table, UncontrolledTooltip } from 'reactstrap'
import Hide from '../../utility/Hide'
import Show from '../../utility/Show'
import { createAsyncSelectMultiUserOptions, formatDate, minusDay } from '../../utility/Utils'
import { startOrStopCampaign } from '../../utility/apis/campaign'
import { exportByID, messageReport } from '../../utility/apis/report'
import { loadUserChild } from '../../utility/apis/userManagement'
import { formatIndianNumber, isValid, isValidArray, log } from '../../utility/helpers/common'
import httpConfig from '../../utility/http/httpConfig'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import Shimmer from '../components/shimmers/Shimmer'
import ExportByMobile from './ExportByMobile'
import ExportBySender from './ExportBySender'


const MessageConsumption = () => {
    const { colors } = useContext(ThemeColors)
    // const reportList = useSelector(a => a.report.report)
    const loginUser = useSelector(state => state.auth.userData)
    const [loading, setLoading] = useState(false)
    const [modal, setModal] = useState(false)
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
    const form = useForm()
    const [messageView, setMessageView] = useState(null)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form
    const [senderID, setSenderID] = useState(false)
    const [mobile, setMobile] = useState(false)
    const [user, setUser] = useState(null)
    const [reload, setReload] = useState(false)
    const [edit, setEdit] = useState(null)
    const [filterData, setFilterData] = useState({
        per_page_record: 15,
        user_id: ""
    })
    const [resetIt, setResetIt] = useState(new Date())

    const handleSender = () => setSenderID(!senderID)
    const handleMobile = () => setMobile(!mobile)

    const dispatch = useDispatch()


    const preload = () => {
        if (isValid(filterData?.user_id)) {
            messageReport({
                page: currentPage,
                perPage: rowsPerPage,
                // dispatch,
                success: (e) => {
                    setMessageView(e)
                },
                loading: setLoading,
                jsonData: {
                    ...filterData,
                    user_id: filterData?.user_id,
                    // user_id: [loginUser?.userType === 2 ? loginUser?.id : filterData?.user_id],
                    from_date: watch("from_date"),
                    to_date: watch("to_date"),
                    type: 2

                }
            })
        }
        // if (loginUser?.userType === 2) {
        //     messageReport({
        //         page: currentPage,
        //         perPage: rowsPerPage,
        //         // dispatch,
        //         success: (e) => {
        //             setMessageView(e)
        //         },
        //         loading: setLoading,
        //         jsonData: {
        //             ...filterData,
        //             type: 2,
        //             // user_id: filterData?.user_id,
        //             user_id: [loginUser?.userType === 2 ? loginUser?.id : filterData?.user_id],
        //             from_date: watch("from_date"),
        //             to_date: watch("to_date")

        //         }
        //     })
        // }
    }

    // const renderStats = () => {

    //     const tr = []
    //     const tr2 = []
    //     let  blackCount = 0
    //     let deliveredCount = 0
    //     let expiredCount = 0
    //     let failedCount = 0
    //     let invalidCount = 0
    //     let processCount = 0
    //     let rejectedCount = 0
    //     let totalCreditSubmission = 0
    //     let totalSubmission = 0


    //     messageView?.data?.map((data, index) => {

    //         blackCount += data.black_count
    //         deliveredCount += data.delivered_count
    //         expiredCount += data.expired_count
    //         failedCount += data.failed_count
    //         invalidCount += data.invalid_count
    //         processCount += data.process_count
    //         rejectedCount += data.rejected_count
    //         totalCreditSubmission += data.total_credit_submission
    //         totalSubmission += data.total_submission

    //         const keys = Object.keys(data)
    //         const values = Object.values(data)
    //         const td = []
    //         if (index === 0) {
    //             const td = [<th key={index}><b>#</b></th>]
    //             keys.map((d, i) => {
    //                 td.push(<th style={{ minWidth: 220 }} key={i}><b>{String(d).replaceAll('_', ' ')}</b></th>)
    //             })
    //             tr.push(<thead><tr key={index}>{td}</tr></thead>)
    //         }
    //         td.push(<td key={index}>{index + 1}</td>)
    //         values.map((d, i) => {
    //             td.push(<td key={i}>{d}</td>)
    //         })
    //         // tr2.push(<tr key={index}>{td}</tr>)
    //         // show total count
    //         tr2.push(<tr key={index}>
    //             <td>{index + 1}</td>
    //             <td>{data.date}</td>
    //             <td>{data.total_submission}</td>
    //             <td>{data.total_credit_submission}</td>
    //             <td>{data.delivered_count}</td>
    //             <td>{data.rejected_count}</td>
    //             <td>{data.process_count}</td>
    //             <td>{data.invalid_count}</td>
    //             <td>{data.failed_count}</td>
    //             <td>{data.expired_count}</td>
    //         </tr>)
    //     })
    //     return [tr, <tbody>{tr2}</tbody>]
    // }

    // const renderStats = () => {

    //     const tr = []
    //     const tr2 = []
    //     let blackCount = 0
    //     let deliveredCount = 0
    //     let expiredCount = 0
    //     let failedCount = 0
    //     let invalidCount = 0
    //     let processCount = 0
    //     let rejectedCount = 0
    //     let totalCreditSubmission = 0
    //     let totalSubmission = 0

    //     messageView?.data?.map((data, index) => {

    //         blackCount += data.black_count
    //         deliveredCount += data.delivered_count
    //         expiredCount += data.expired_count
    //         failedCount += data.failed_count
    //         invalidCount += data.invalid_count
    //         processCount += data.process_count
    //         rejectedCount += data.rejected_count
    //         totalCreditSubmission += data.total_credit_submission
    //         totalSubmission += data.total_submission

    //         const keys = Object.keys(data)
    //         const values = Object.values(data)
    //         const td = []

    //         if (index === 0) {
    //             const td = [<th key={index}><b>#</b></th>]
    //             keys.map((d, i) => {
    //                 td.push(<th style={{ minWidth: 220 }} key={i}><b>{String(d).replaceAll('_', ' ')}</b></th>)
    //             })
    //             tr.push(<thead><tr key={index}>{td}</tr></thead>)
    //         }

    //         td.push(<td key={index}>{index + 1}</td>)
    //         values.map((d, i) => {
    //             td.push(<td key={i}>{d}</td>)
    //         })
    //         tr2.push(<tr key={index}>{td}</tr>)
    //     })

    //     // Adding total row
    //     tr2.push(
    //         <tr key="total">
    //             <td>Total</td>
    //             <td>{totalSubmission}</td>
    //             <td>{totalCreditSubmission}</td>
    //             <td>{deliveredCount}</td>
    //             <td>{invalidCount}</td>
    //             <td>{blackCount}</td>
    //             <td>{expiredCount}</td>
    //             <td>{failedCount}</td>
    //             <td>{rejectedCount}</td>
    //             <td>{processCount}</td>


    //         </tr>
    //     )

    //     return [tr, <tbody>{tr2}</tbody>]
    // }

    const renderStats = () => {

        const tr = []
        const tr2 = []
        const tr3 = []

        const total = []

        messageView?.data?.map((data, index) => {

            const keys = Object.keys(data)
            const values = Object.values(data)
            const td = []
            const td2 = []

            if (index === 0) {
                const td = [<th key={index}><b>#</b></th>]
                keys.map((d, i) => {
                    td.push(<th style={{ minWidth: 220 }} key={i}><b>{String(d).replaceAll('_', ' ')}</b></th>)
                })
                tr.push(<thead><tr key={index}>{td}</tr></thead>)
            }

            // make total
        const t = total

            td.push(<td key={index}>{index + 1}</td>)
            values.map((d, i) => {
                if (keys[i] !== "date") {
                    t[i] = (t[i] || 0) + parseInt(d)
                    td.push(<td key={i}>{formatIndianNumber(parseInt(d))}</td>)
                } else {
                    t[i] = 0
                    td.push(<td key={i}>{d}</td>)
                }
            })
            tr2.push(<tr key={index}>{td}</tr>)

            //if last row
            if (index === messageView?.data?.length - 1) {
                td2.push(<th key={index}></th>)
                values.map((d, i) => {
                    if (keys[i] === "date") td2.push(<th key={i}><b>Total</b></th>)
                    else td2.push(<th style={{ fontSize: 14 }} key={i}>{formatIndianNumber(total[i])}</th>)
                })
                tr3.push(<tr key={index}>{td2}</tr>)
            }
        })

        log('total', total)

        return [tr, <><tbody>{tr2}</tbody><tfoot>{tr3}</tfoot></>]
    }


    const listUser = async (search, loadedOptions, { page }) => {

        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUser)

    }
    const submitFilter = (d) => {
        setFilterData({
            ...d,
            user_id: loginUser?.userType === 2 ? loginUser?.id : d?.user_id

        })

    }


    useEffect(() => {
        if (filterData !== null) setReload(true)
        else setReload(false)
    }, [filterData])

    useEffect(() => {
        preload()
    }, [filterData])
    

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        messageReport({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            // dispatch,
            success: setMessageView,
            loading: setLoading
        })
    }


    const ExpandableTable = ({ data }) => {
        return (
            <div className='expandable-content p-2 border-bottom'>

                <b className='text-primary'> Message:</b>  {data?.message}
            </div>
        )
    }

    const startStopCamp = (row) => {
        startOrStopCampaign({
            jsonData: {

                send_sms_id: row

            }
        })
    }


    const exportReportById = (row) => {
        exportByID({
            jsonData: {

                send_sms_id: row

            },
            success: (e) => {

                window.open(httpConfig?.baseUrl2 + e?.data?.file_path, "_blank")
            }
        })
    }


    const campaignListing = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "Campaign Date",
            selector: r => r.date,
            sortable: true,
            minWidth: '200px'
        },
        {
            name: "Total Submission",
            selector: r => r.total_submission,
            sortable: true,
            minWidth: '200px'
        },
        {
            name: "Total Credit Submission",
            selector: r => r.total_credit_submission,
            sortable: true,
            minWidth: '200px'
        },
        {
            name: "Delivered Count",
            selector: r => r.delivered_count,
            sortable: true,
            minWidth: '200px'

        },

        {
            name: "Rejected Count",
            selector: r => r.rejected_count,
            sortable: true,
            minWidth: '200px'
        },
        {
            name: "Process Count",
            selector: r => r.process_count,
            sortable: true,
            minWidth: '200px'

        },
        {
            name: "Invalid Count",
            selector: r => r.invalid_count,
            sortable: true,
            minWidth: '200px'

        },
        {
            name: "Failed Count",
            selector: r => r.failed_count,
            sortable: true,
            minWidth: '200px'

        },
        {
            name: "Expired Count",
            selector: r => r.expired_count,
            sortable: true,
            minWidth: '200px'

        }

    ]

    const CustomPagination = () => {
        const count = Math.ceil(messageView?.data?.total / messageView?.data?.per_page)
        return (
            <ReactPaginate
                initialPage={messageView?.data?.current_page - 1}
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

    const dateList = () => {

        const re = []
        if (isValid(messageView?.data)) {
            for (const key in messageView?.data) {
                const data = messageView?.data[key]
                if (isValid(data)) {
                    re.push({
                        ...data
                    })
                } else {
                    re.push({
                        id: null,
                        user_id: 0,
                        date: key,
                        total_submission: 0,
                        total_credit_submission: 0,
                        rejected_count: 0,
                        process_count: 0,
                        invalid_count: 0,
                        failed_count: 0,
                        expired_count: 0,
                        delivered_count: 0

                    })
                }

            }

        }
        return re
    }
    const BootstrapCheckbox = forwardRef((props, ref) => (
        <div className='form-check'>
            <Input type='checkbox' innerRef={ref} {...props} />
        </div>
    ))


    return (

        <>

            <Header icon={""} title="Message Consumption Report" >
                {/* Tooltips */}
                <Hide IF={loginUser?.account_type === 2}>

                    <ButtonGroup color='primary' className='me-25'>
                        <Button.Ripple size="sm" color="primary" id="filter" onClick={() => handleSender()}>
                            <Sliders size="14" /> Export By Sender ID
                        </Button.Ripple>
                    </ButtonGroup>
                </Hide>
                <ButtonGroup color='info' className='me-25'>
                    <Button.Ripple size="sm" color="dark" id="filter" onClick={() => handleMobile()}>
                        <Sliders size="14" /> Export By Mobile Number
                    </Button.Ripple>
                </ButtonGroup>
                <UncontrolledTooltip target="reload">Reset Field</UncontrolledTooltip>
                <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { setFilterData({}); setReload(true); setResetIt(new Date()); reset() }} >
                    <RefreshCcw size="14" />
                </Button.Ripple>
            </Header>
            <Card>
                <Form onSubmit={handleSubmit(submitFilter)}>
                    <Row className='justify-content-start mx-0 mb-1'>
                        <Show IF={loginUser?.userType === 2}>
                            <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>

                                <Input
                                    type='text'
                                    value={loginUser?.name}
                                    disabled
                                    className="mb-1"
                                />
                            </Col>

                        </Show>
                        <Hide IF={loginUser?.userType === 2}>

                            <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                                <FormGroupCustom
                                    key={resetIt}
                                    noLabel
                                    async
                                    setValue={setValue}
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"user_id"}
                                    isClearable
                                    placeholder="Select User"
                                    className='mb-1'
                                    loadOptions={listUser}
                                    options={user}
                                    label="User"
                                    rules={{ required: true }}

                                />
                            </Col>
                        </Hide>


                        {watch("type") === 1 ? <>
                            <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                                <FormGroupCustom
                                    key={resetIt}
                                    noLabel
                                    defaultOptions
                                    control={control}
                                    name={"from_date"}
                                    type={"date"}
                                    errors={errors}
                                    label={"From"}
                                    dateFormat={"YYYY-MM-DD"}
                                    setValue={setValue}
                                    className="mb-1"
                                    rules={{ required: false }}


                                />
                            </Col>
                            <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                                <FormGroupCustom
                                    key={resetIt}
                                    noLabel
                                    defaultOptions
                                    control={control}
                                    name={"to_date"}
                                    type={"date"}
                                    errors={errors}
                                    options={{
                                        // enableTime: true,
                                        minDate: watch("from_date")
                                    }}
                                    label={"To"}
                                    dateFormat={"YYYY-MM-DD"}
                                    setValue={setValue}
                                    isClearable
                                    className="mb-1"
                                    rules={{ required: false }}
                                />

                            </Col>
                        </> : <>
                            <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                                <FormGroupCustom
                                    key={resetIt}
                                    noLabel
                                    defaultOptions
                                    control={control}
                                    name={"from_date"}
                                    type={"date"}
                                    errors={errors}
                                    options={{
                                        minDate: formatDate(new Date(
                                            minusDay(
                                                new Date(), 30
                                            )
                                        ))
                                    }}
                                    label={"From"}
                                    dateFormat={"YYYY-MM-DD"}
                                    setValue={setValue}
                                    className="mb-1"
                                    rules={{ required: true }}


                                />
                            </Col>
                            <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                                <FormGroupCustom
                                    key={resetIt}
                                    noLabel
                                    defaultOptions
                                    control={control}
                                    name={"to_date"}
                                    type={"date"}
                                    errors={errors}

                                    options={{
                                        // enableTime: true,
                                        minDate: watch("from_date")
                                    }}
                                    label={"To"}
                                    dateFormat={"YYYY-MM-DD"}
                                    setValue={setValue}
                                    isClearable
                                    className="mb-1"
                                    rules={{ required: true }}

                                />

                            </Col>
                        </>}

                        <Col className='d-flex align-items-center justify-content-center ' md='2' sm='12'>
                            <LoadingButton loading={loading} type='submit' className='btn-icon' color='primary' block>
                                <span className='align-middle ms-25'>Search</span>
                            </LoadingButton>
                        </Col>

                    </Row>

                </Form>
            </Card>
            <Card>

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

                    {/* <div className='card-datatable app-user-list table-responsive'>
                        <div className='react-dataTable'>

                            <DataTable
                                noHeader
                                // selectableRows
                                pagination
                                paginationServer
                                className='react-dataTable mh-600'
                                // expandableRows
                                // expandOnRowClicked
                                columns={campaignListing}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                selectableRowsComponent={BootstrapCheckbox}
                                sortIcon={<ChevronDown size={10} />}
                                // expandableRowsComponent={ExpandableTable}
                                paginationComponent={CustomPagination}
                                data={messageView?.data}
                            // onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div> */}

                    <Show IF={isValidArray(messageView?.data)}>
                        <Table striped responsive>
                            {renderStats()}
                        </Table>
                    </Show>

                    <Hide IF={isValidArray(messageView?.data)}>
                        <div className='text-center p-2'>Data not found</div>
                    </Hide>
                </>}

            </Card>
            <ExportBySender
                handleSender={handleSender}
                setSenderID={setSenderID}
                senderID={senderID}
            />
            <ExportByMobile
                handleMobile={handleMobile}
                setMobile={setMobile}
                mobile={mobile}
            />
        </>
    )
}

export default MessageConsumption
