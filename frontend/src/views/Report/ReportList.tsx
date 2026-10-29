// @ts-nocheck
import React, { forwardRef, useContext, useEffect, useState } from 'react'
import { CheckSquare, ChevronDown, Download, Edit, Eye, FileText, Lock, MessageSquare, MoreVertical, Plus, RefreshCcw, Sliders, Trash, Trash2 } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Badge, Button, ButtonGroup, Card, CardHeader, CardTitle, Col, DropdownItem, DropdownToggle, Input, Row, UncontrolledDropdown, UncontrolledTooltip } from 'reactstrap'
import Shimmer from '../components/shimmers/Shimmer'
import DataTable from 'react-data-table-component'
import ReactPaginate from 'react-paginate'
import { changeCampaignStatusToComplete, getCampaignStatus, loadCampaign, restartCampaignStatus, startOrStopCampaign } from '../../utility/apis/campaign'
import { log } from '../../utility/helpers/common'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import { IconSizes } from '../../utility/Const'
import DropDownMenu from '../components/dropdown'
import { Can } from '../../utility/Show'
import Flag from '@mui/icons-material/Flag'
import Campaign from '@mui/icons-material/Campaign'
import ForwardToInbox from '@mui/icons-material/ForwardToInbox'
import { deliveryReport, exportByID } from '../../utility/apis/report'
import GetApp from '@mui/icons-material/GetApp'
import httpConfig from '../../utility/http/httpConfig'
import Header from '../components/header'
import ExportBySender from './ExportBySender'
import ExportByMobile from './ExportByMobile'
import FilterDelivery from './FilterDelivery'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import ResendCampaign from '../compaign/ResendCampaign'
import CampaignInfo from '../compaign/CampaignInfo'
import ManageCampaignRatio from '../compaign/ManageCampaignRatio'
import ConfirmStop from '../../utility/helpers/ConfirmStop'
import { Permissions } from '../../utility/Permissions'
import PendingActions from '@mui/icons-material/PendingActions'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const ReportList = ({ activeTab }) => {
    const { colors } = useContext(ThemeColors)
    const reportList = useSelector(a => a.report.report)
    const [detailModal, setDetailModal] = useState(false)
    const [editData, setEditData] = useState([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState("1")
    const [showModal, setShowModal] = useState(false)
    const [showFilter, setShowFilter] = useState(false)
    const [rowsPerPage] = useState("15")
    const navigate = useNavigate()
    const [admin, setAdmin] = useState(false)
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
        getValues,
        setError
    } = useForm()
    const [senderID, setSenderID] = useState(false)
    const [mobile, setMobile] = useState(false)
    const [reload, setReload] = useState(false)
    const [delivery, setDelivery] = useState(null)
    const [reloadButton, setReloadButton] = useState(false)
    const [forceStatusCheck, setForceStatusCheck] = useState(false)
    const [filterData, setFilterData] = useState({
        per_page_record: 15
    })
    const userLogin = useSelector(state => state.auth.userData)

    const handleSender = () => setSenderID(!senderID)
    const handleMobile = () => setMobile(!mobile)
    const [loadings, setLoadings] = useState(false)
    const [getUpdatedData, setGetUpdatedData] = useState(false)

    const dispatch = useDispatch()

    const preload = () => {
        deliveryReport({
            page: currentPage,
            perPage: rowsPerPage,
            // dispatch,
            success: (e) => {
                setDelivery(e)
            },
            loading: setLoading,
            jsonData: filterData
        })
    }

    useEffect(() => {
        if (activeTab === "1") {
            preload()
        }
    }, [filterData, activeTab])

    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])


    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        deliveryReport({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            // dispatch,
            success: setDelivery,
            loading: setLoading
        })
    }

    const handleReload = () => {
        preload()
    }
    const reLoadSetup = () => {
        if (reloadButton === true) {
            preload()
            setReloadButton(false)
        }
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
        const id = toast.loading("Please wait while the file is being prepared for download")
        exportByID({
            jsonData: {
                send_sms_id: row
            },
            loadings: setLoadings,
            success: (e) => {
                window.open(httpConfig?.baseUrl2 + e?.data?.file_path, "_blank")
                toast.update(id, { render: "All is good", type: "success", isLoading: false })

            }
        })
    }

    const getStatusMethod = (row) => {
        getCampaignStatus({
            id: row?.id,
            success: (e) => {

                setDetailModal(true)
                setEditData(row)
            }
        })

    }

    const callCheckStatusAndInfo = (row) => {
        if (row?.total_delivered === 0 && row?.total_failed === 0) {
            getStatusMethod(row)
        }
    }

    const restartPendingStatus = (row) => {
        restartCampaignStatus({
            id: row?.id,
            success: (e) => {

                setDetailModal(true)
                setEditData(row)
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
            selector: (row) => {
                if (userLogin?.userType === 0) {
                    return (
                        <>
                            <span>{row?.campaign} <br /> ({row?.id}) </span>
                        </>
                    )
                } else {
                    return (
                        <>
                            <span>{row?.campaign} </span>
                        </>
                    )
                }
            },
            sortable: true,
            minWidth: '170px'
        },

        {
            name: "Message",
            cell: (row, index) => {
                return (<span className='text-wrap' onClick={() => { setDetailModal(true); setEditData(row) }} style={{ cursor: "pointer", color: "darkorange" }} >{row.message}</span>)
            },
            sortable: true,
            minWidth: '400px'
        },
        {
            name: "Time",
            selector: r => r.campaign_send_date_time,
            sortable: true,
            minWidth: '170px'
        },

        {
            name: "Contact Info",
            selector: r => r.total_contacts,
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Credit Info",
            selector: r => r.total_credit_deduct,
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
        },
        {
            name: "actions",
            allowOverflow: true,
            minWidth: '170px',
            cell: row => {
                return (
                    <div>
                        <DropDownMenu
                            direction={'down'}
                            tooltip={"Menu"}
                            component={
                                <MoreVertical color={colors.primary.main} size={IconSizes.MenuVertical} />
                            }
                            options={[
                                {
                                    icon: <ForwardToInbox size={14} />,
                                    onClick: () => {
                                        setShowModal(true)
                                        setEditData(row)
                                    },
                                    name: "Resend Campaign"
                                },
                                {
                                    icon: <Campaign size={14} />,
                                    onClick: () => {
                                        setDetailModal(true)
                                        setEditData(row)
                                        // setGetUpdatedData(true)
                                        // callCheckStatusAndInfo(row)
                                    },
                                    name: "Campaign Info"
                                },

                                {
                                    // IF : row?.status === "Pending",
                                    icon: <GetApp size={14} />,
                                    onClick: () => {
                                        exportReportById(row?.id)
                                    },
                                    name: "Export"
                                },
                                {
                                    IF: Can(Permissions?.manageCampaignStatus),
                                    icon: <Lock size={14} />,
                                    onClick: () => {
                                        setAdmin(true)
                                        setEditData(row)
                                    },
                                    name: "Manage Campaign"
                                },

                                {
                                    IF: Can(Permissions?.manageCampaignStatus) && row?.status === "Pending",
                                    noWrap: true,
                                    name: <ConfirmStop
                                        item={row}
                                        eventId={`stop-campaign1-${row?.id}`}
                                        title={`Stop  ${row?.campaign} ?`}
                                        color='text-warning'
                                        onClickYes={() => startStopCamp(row?.id)}
                                        onSuccessEvent={(item) => { preload() }}
                                        onFailedEvent={((item) => { })}
                                        className="dropdown-item"
                                        id={`grid-delete-${row?.id}`}>
                                        <Trash size={15} /> <span className='ms-1 align-middle'>Stop</span>
                                    </ConfirmStop>
                                },
                                {
                                    IF: Can(Permissions?.manageCampaignStatus) && row?.status !== "Completed",
                                    noWrap: true,
                                    name: <ConfirmStop
                                        item={row}
                                        eventId={`Finish-Campaign21-${row?.id}`}
                                        title={`complete  ${row?.campaign} ?`}
                                        color='text-warning'
                                        onClickYes={() => { changeCampaignStatusToComplete({ id: row?.id }) }}
                                        onSuccessEvent={(item) => { preload() }}
                                        onFailedEvent={((item) => { })}
                                        className="dropdown-item"
                                        id={`grid-delete-${row?.id}`}>
                                        <CheckSquare size={15} /> <span className='ms-1 align-middle'>Complete</span>
                                    </ConfirmStop>
                                },
                                {
                                    icon: <Flag size={14} />,
                                    onClick: () => {
                                        // campaignStatusMethod(row)
                                        setDetailModal(true)
                                        setEditData(row)
                                        setForceStatusCheck(true)
                                        preload()

                                    },
                                    name: "Check Status"
                                }

                                // {
                                //     // IF: 
                                //     // IF: Can(Permissions?.manageCampaignStatus) && row?.status === "Pending",
                                //     noWrap: true,
                                //     name: <ConfirmStop
                                //         item={row}
                                //         eventId={`check-status-${row?.id}`}
                                //         title={`Check Status  ${row?.campaign} ?`}
                                //         color='text-success'
                                //         onClickYes={() => { getStatusMethod(row); setReloadButton(true) }}
                                //         text={'no-text'}
                                //         onSuccessEvent={(item) => { reLoadSetup() }}
                                //         onFailedEvent={((item) => { })}
                                //         className="dropdown-item"
                                //         id={`grid-delete-${row?.id}`}>
                                //         <Flag size={15} /> <span className='ms-1 align-middle'>Check Status</span>
                                //     </ConfirmStop>
                                // }

                            ]
                            }
                        />
                    </div>
                )
            }
        }
    ]

    const CustomPagination = () => {
        const count = Math.ceil(delivery?.data?.total / delivery?.data?.per_page)
        return (
            <ReactPaginate
                initialPage={delivery?.data?.current_page - 1}
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
            {/* <ResendCampaign Component={Button.Ripple} edit={editData} color={"secondary"} showModal={showModal} setShowModal={() => setShowModal(false)} noView />
            <CampaignInfo Component={Button.Ripple} edit={editData} color={"secondary"} showModal={detailModal} setShowModal={() => setDetailModal(false)} noView /> */}
            <ResendCampaign Component={Button.Ripple} edit={editData} color={"secondary"} showModal={showModal} preload={preload} setShowModal={() => setShowModal(false)} noView />
            <CampaignInfo Component={Button.Ripple} forceStatusCheck={forceStatusCheck} setForceStatusCheck={() => setForceStatusCheck(false)} edit={editData} color={"secondary"} showModal={detailModal} setShowModal={() => setDetailModal(false)} noView />
            <ManageCampaignRatio Component={Button.Ripple} edit={editData} color={"secondary"} showModal={admin} setShowModal={() => setAdmin(false)} noView />

            <Header icon={""} title="Text SMS" >
                {/* Tooltips */}
                {/* <ButtonGroup color='primary' className='me-25'>
                    <Button.Ripple size="sm" color="primary" id="filter" onClick={() => { navigate('/scheduled-campaign-report') }} >
                        <Campaign fontSize='small' /> Upcoming Campaign
                    </Button.Ripple>
                </ButtonGroup>
                <ButtonGroup color='primary' className='me-25'>
                    <Button.Ripple size="sm" color="primary" id="filter" onClick={() => handleSender()}>
                        <Sliders size="14" /> Export By Sender ID
                    </Button.Ripple>
                </ButtonGroup>
                <ButtonGroup color='info' className='me-25'>
                    <Button.Ripple size="sm" color="dark" id="filter" onClick={() => handleMobile()}>
                        <Sliders size="14" /> Export By Mobile Number
                    </Button.Ripple>
                </ButtonGroup> */}
                <ButtonGroup color='dark' className='me-25'>
                    <Button.Ripple size="sm" color="secondary" id="filter" onClick={() => { setShowFilter(true) }}>
                        <Sliders size="14" />
                    </Button.Ripple>
                </ButtonGroup>
                <UncontrolledTooltip target="reload">Refresh Data</UncontrolledTooltip>
                <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { setFilterData({}); setReload(true) }}>
                    <RefreshCcw size="14" />
                </Button.Ripple>
            </Header>

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
                                data={delivery?.data?.data}
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
            <FilterDelivery show={showFilter} filterData={filterData} setFilterData={e => {
                setCurrentPage(1)
                setFilterData(e)
            }} handleFilterModal={() => { setShowFilter(false) }} />
        </>
    )
}

export default ReportList
