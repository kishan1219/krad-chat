// @ts-nocheck
import { ThemeColors } from '@src/utility/context/ThemeColors'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import React, { forwardRef, useContext, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ArrowLeft, ChevronDown, RefreshCcw, Sliders } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, ButtonGroup, Card, Col, Input, Row } from 'reactstrap'
import { startOrStopCampaign } from '../../utility/apis/campaign'
import { exportByID, scheduleReport } from '../../utility/apis/report'
import { loadUser } from '../../utility/apis/userManagement'
import { log } from '../../utility/helpers/common'
import Hide from '../../utility/Hide'
import httpConfig from '../../utility/http/httpConfig'
import { createAsyncSelectMultiUserOptions, createAsyncSelectOptions, createSelectOptions } from '../../utility/Utils'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import Shimmer from '../components/shimmers/Shimmer'
import ExportByMobile from './ExportByMobile'
import ExportBySender from './ExportBySender'

const ScheduleReport = () => {
    const { colors } = useContext(ThemeColors)
    const loginUser = useSelector(state => state.auth.userData)
    const navigate = useNavigate()
    const reportList = useSelector(a => a.report.report)
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
    const [page, setPage] = useState(1)
    const [editId, setEditId] = useState(null)
    const [show, setShow] = useState(false)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form
    const [senderID, setSenderID] = useState(false)
    const [mobile, setMobile] = useState(false)
    const [user, setUser] = useState(null)
    const [edit, setEdit] = useState(null)
    const [filterData, setFilterData] = useState({
        per_page_record: 15,
        user_id: ""
    })


    const [reload, setReload] = useState(false)

    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])

    const handleSender = () => setSenderID(!senderID)
    const handleMobile = () => setMobile(!mobile)

    const dispatch = useDispatch()

    const preload = () => {
        scheduleReport({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: (e) => {
                // setCampaign(e)
            },
            loading: setLoading,
            jsonData: {
                ...filterData,
                user_id: filterData?.user_id
            }
        })
    }

    const loadUserData = async (search, loadedOptions, { page }) => {

        const res = await loadUser({
            async: true,
            page,
            perPage: 25,
            jsonData: { name: search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUser)

    }
    // useEffect(() => {
    //     if (loginUser?.userType !== 2) {
    //         loadUserData()

    //     }
    // }, [])

    useEffect(() => {
        preload()
    }, [filterData])


    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        scheduleReport({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            dispatch,
            loading: setLoading
        })
    }

    const handleReload = () => {
        preload()
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
            name: "Campaign",
            selector: 'campaign',
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Message",
            cell: (row, index) => {
                return (<span className='text-wrap'>{row.message}</span>)
            },
            sortable: true,
            minWidth: '400px'
        },
        {
            name: "Time",
            selector: 'campaign_send_date_time',
            sortable: true,
            minWidth: '170px'
        },

        {
            name: "Contact Info",
            selector: 'total_contacts',
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Credit Info",
            selector: 'total_credit_deduct',
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Status",
            selector: (row) => {
                if (row?.status === "Pending") {
                    return (<Badge color='warning' className='badge-glow'> {row?.status}</Badge>)
                } else if (row?.status === "Ready-to-complete") {
                    return (<Badge color='info' className='badge-glow'> {row?.status}</Badge>)
                } else if (row?.status === "Completed") {
                    return (<Badge color='success' className='badge-glow'> {row?.status}</Badge>)
                } else if (row?.status === "Stop") {
                    return (<Badge color='danger' className='badge-glow'> {row?.status}</Badge>)
                }
            },
            sortable: true,
            minWidth: '170px'
        }

    ]

    const CustomPagination = () => {
        const count = Math.ceil(reportList?.total / reportList?.per_page)
        return (
            <ReactPaginate
                initialPage={reportList?.current_page - 1}
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

            <Header icon={<ArrowLeft onClick={() => { navigate(-1) }} style={{ cursor: "pointer" }} />} title="Schedule Campaign Report" >
                {/* Tooltips */}


                {/* <ButtonGroup color='primary' className='me-25'>
                    <Button.Ripple size="sm" color="primary" id="filter" onClick={() => handleSender()}>
                        <Sliders size="14" /> Export By Sender ID
                    </Button.Ripple>
                </ButtonGroup>
                <ButtonGroup color='info' className='me-25'>
                    <Button.Ripple size="sm" color="dark" id="filter" onClick={() => handleMobile()}>
                        <Sliders size="14" /> Export By Mobile Number
                    </Button.Ripple>
                </ButtonGroup> */}
                <ButtonGroup color='dark'>
                    <Button.Ripple size="sm" color="secondary" id="filter" onClick={() => { setFilterData({}); setReload(true) }}>
                        <RefreshCcw size="14" />
                    </Button.Ripple>
                </ButtonGroup>
            </Header>

            <Card>

                <Hide IF={loginUser?.userType === 2}>

                    <Row className='justify-content-end mx-0'>
                        <Col className='d-flex align-items-center justify-content-end mt-1' md='3' sm='12'>
                            <FormGroupCustom
                                async
                                noLabel
                                loadOptions={loadUserData}
                                // defaultOptions
                                control={control}
                                type={"select"}
                                placeholder="Select User"
                                errors={errors}
                                name={"user_id"}
                                isClearable
                                onChangeValue={(v) => {

                                    setFilterData({
                                        ...filterData,
                                        user_id: v
                                    })
                                }}
                                className='mb-1'

                                options={user}
                                label="User"

                            />
                        </Col>
                    </Row>
                </Hide>
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
                                columns={campaignListing}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                selectableRowsComponent={BootstrapCheckbox}
                                sortIcon={<ChevronDown size={10} />}
                                // expandableRowsComponent={ExpandableTable}
                                paginationComponent={CustomPagination}
                                data={reportList?.data}
                            // onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div>
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

export default ScheduleReport
