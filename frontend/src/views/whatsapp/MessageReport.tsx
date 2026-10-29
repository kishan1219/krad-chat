// @ts-nocheck
import Campaign from '@mui/icons-material/Campaign'
import Flag from '@mui/icons-material/Flag'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import React, { useContext, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, MoreVertical, RefreshCcw, Search, Sliders } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Badge, Button, ButtonGroup, Card, Col, Form, Row, UncontrolledTooltip } from 'reactstrap'
import { IconSizes } from '../../utility/Const'
import { getCampaignStatus } from '../../utility/apis/campaign'
import DropDownMenu from '../components/dropdown'
import Shimmer from '../components/shimmers/Shimmer'
// import ManageCampaignRatio from './ManageCampaignRatio'
import Summarize from '@mui/icons-material/Summarize'
import { useNavigate } from 'react-router-dom'
import { exportWhatsappReport, loadWhatsappReport } from '../../utility/apis/whatsappConfig'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import WaCampaignInfo from './WaCampaignInfo'
import WhatsappReportFilter from './Filter/WhatsappReportFilter'
import httpConfig from '../../utility/http/httpConfig'
import ExportWhatsappReport from './ExportWhatsappReport'
import ExportWhatsappConversation from './ExportWhatsappConversation'
import { exportWaConversation } from '../../utility/apis/whatsappTemplate'
import Chat from '@mui/icons-material/Chat'
import ExportWhatsappSummaryReport from './ExportWhatsappSummaryReport'
import { InsertDriveFile } from '@mui/icons-material'

const MessageReport = () => {
    const waList = useSelector(a => a.whatsappReport.whatsappReport)
    const { colors } = useContext(ThemeColors)
    // const campaignList = useSelector(a => a.campaign.campaign)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [exportID, setExportID] = useState(false)
    const [currentPage, setCurrentPage] = useState("1")
    const [showFilter, setShowFilter] = useState(false)
    const [rowsPerPage] = useState("15")
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
    const userLogin = useSelector(state => state.auth.userData)
    const [editData, setEditData] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [detailModal, setDetailModal] = useState(false)
    const [admin, setAdmin] = useState(false)
    const [reload, setReload] = useState(false)
    const [forceStatusCheck, setForceStatusCheck] = useState(false)
    const [conversationExport, setConversationExport] = useState(false)
    const [summaryExport, setSummaryExport] = useState(false)
    const [filterData, setFilterData] = useState({
        per_page_record: 15
    })
    const [resetIt, setResetIt] = useState(new Date())
    const [loadings, setLoadings] = useState(false)

    const handleExport = () => setExportID(!exportID)
    const handleConversationExport = () => setConversationExport(!conversationExport)
    const handleSummaryExport = () => setSummaryExport(!summaryExport)

    const submitFilter = (d) => {
        setFilterData({
            ...d
            // filterData
        })
        // console.log(d)

    }
    const dispatch = useDispatch()

    const preload = () => {
        loadWhatsappReport({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: (e) => {
                // setCampaign(e)
            },
            loading: setLoading,
            jsonData: {
                ...filterData,
                search: filterData?.search
            }
        })
    }

    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])


    useEffect(() => {
        preload()
    }, [filterData])


    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        loadWhatsappReport({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            dispatch,
            loading: setLoading
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

    const exportReportById = (row) => {
        exportWhatsappReport({
            jsonData: {
                whats_app_send_sms_id: row?.id
            },
            success: (e) => {
                window.open(httpConfig?.baseUrl2 + e?.data?.file_path, "_blank")
            }

        })
    }

    const exportWaConversationById = (row) => {
        exportWaConversation({
            jsonData: {
                whats_app_send_sms_id: row?.id
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
            selector: (row) => {
                return <div className='text-primary cursor-pointer' onClick={() => {
                    setDetailModal(true)
                    setEditData(row)
                    // callCheckStatusAndInfo(row)
                }} >
                    {userLogin?.userType === 0 ? (
                        <>
                            <span>{row?.campaign} <br /> ({row?.id}) </span>
                        </>
                    ) : (
                        <>
                            <span>{row?.campaign}</span>
                        </>
                    )}
                </div>
            },
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "User Name",
            selector: r => r.name.charAt(0).toUpperCase() + r.name.slice(1),
            sortable: true,
            minWidth: '180px'
        },
        {
            name: "Country",

            selector: r => (<>{r?.country?.name} <span className='fw-bolder'>({r?.country?.currency_code}/{r?.country?.currency_symbol})</span></>),
            sortable: true,
            minWidth: '180px'
        },
        {
            name: "Time",
            selector: r => r.campaign_send_date_time,
            sortable: true,
            minWidth: '180px'
        },
        // {
        //     name: "Message",
        //     cell: (row, index) => {
        //         return (<span className='text-wrap' onClick={() => { setDetailModal(true); setEditData(row); callCheckStatusAndInfo(row) }} style={{ cursor: "pointer", color: "darkorange" }} >{row.message}</span>)
        //     },
        //     sortable: true,
        //     minWidth: '400px'
        // },

        {
            name: "Contact/Credit Used",
            // selector: 'total_contacts',
            selector: (row) => (<>{row?.total_contacts}/{row?.total_credit_deduct}</>),
            sortable: true,
            minWidth: '190px'
        },
        // {
        //     name: "Block",
        //     selector: r => r.total_block_number,
        //     sortable: true,
        //     maxWidth: '115px'
        // },
        // {
        //     name: "Deliver",
        //     selector: r => r.total_delivered,
        //     sortable: true,
        //     maxWidth: '115px'
        // },
        // {
        //     name: "Failed",
        //     selector: r => r.total_failed,
        //     sortable: true,
        //     maxWidth: '115px'
        // },
        // {
        //     name: "Invalid",
        //     selector: r => r.total_invalid_number,
        //     sortable: true,
        //     maxWidth: '115px'
        // },
        // {
        //     name: "Status",
        //     selector: (row) => (<Badge color='primary' className='badge-glow'> {row?.status}</Badge>),
        //     sortable: true,
        //     minWidth: '170px'
        // },
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
            maxWidth: '100px',
            cell: (row, index) => {
                return (
                    <div>
                        <DropDownMenu
                            direction={'down'}
                            tooltip={"Menu"}
                            component={
                                <MoreVertical color={colors.primary.main} size={IconSizes.MenuVertical} />
                            }
                            options={[
                                // {
                                //     icon: <ForwardToInbox size={14} />,
                                //     onClick: () => {
                                //         setShowModal(true)
                                //         setEditData(row)
                                //     },
                                //     name: "Resend Campaign"
                                // },
                                {
                                    icon: <Campaign size={14} />,
                                    onClick: () => {
                                        setDetailModal(true)
                                        setEditData(row)

                                        // callCheckStatusAndInfo(row)
                                    },
                                    name: "Campaign Info"
                                },
                                {
                                    IF: row?.status !== "Completed",
                                    icon: <Flag size={14} />,
                                    onClick: () => {
                                        // campaignStatusMethod(row)
                                        setDetailModal(true)
                                        setEditData(row)
                                        setForceStatusCheck(true)
                                        preload()


                                    },
                                    name: "Check Status"
                                },
                                {
                                    // IF: row?.status !== "Completed",
                                    icon: <Summarize size={14} />,
                                    onClick: () => {
                                        exportReportById(row)
                                        // campaignStatusMethod(row)
                                        // setDetailModal(true)
                                        // setEditData(row)
                                        // setForceStatusCheck(true)
                                        // preload()


                                    },
                                    name: "Export Report"
                                },
                                {
                                    // IF: row?.status !== "Completed",
                                    icon: <Chat size={14} />,
                                    onClick: () => {
                                        exportWaConversationById(row)
                                        // campaignStatusMethod(row)
                                        // setDetailModal(true)
                                        // setEditData(row)
                                        // setForceStatusCheck(true)
                                        // preload()
                                    },
                                    name: "Export Conversation"
                                }

                                // {
                                //     // IF : row?.status === "Pending",
                                //     icon: <GetApp size={14} />,
                                //     onClick: () => {
                                //         exportReportById(row?.id)
                                //     },
                                //     name: "Export"
                                // },
                                // {
                                //     IF: Can(Permissions?.manageCampaignStatus),
                                //     icon: <Lock size={14} />,
                                //     onClick: () => {
                                //         setAdmin(true)
                                //         setEditData(row)
                                //     },
                                //     name: "Manage Campaign"
                                // },

                                // {
                                //     IF: Can(Permissions?.manageCampaignStatus) && row?.status === "Pending",
                                //     noWrap: true,
                                //     name: <ConfirmStop
                                //         item={row}
                                //         // eventId={`stop-campaign-${row?.id}`}
                                //         title={`Stop  ${row?.campaign} ?`}
                                //         color='text-warning'
                                //         onClickYes={() => startStopCamp(row?.id)}
                                //         onSuccessEvent={(item) => { preload() }}
                                //         onFailedEvent={((item) => { })}
                                //         className="dropdown-item"
                                //         id={`grid-delete-${row?.id}`}>
                                //         <Trash size={15} /> <span className='ms-1 align-middle'>Stop</span>
                                //     </ConfirmStop>
                                // },
                                // {
                                //     IF: Can(Permissions?.manageCampaignStatus) && row?.status !== "Completed",
                                //     noWrap: true,
                                //     name: <ConfirmStop
                                //         item={row}
                                //         // eventId={`Finish-Campaign-${row?.id}`}
                                //         title={`complete  ${row?.campaign} ?`}
                                //         color='text-warning'
                                //         onClickYes={() => { changeCampaignStatusToComplete({ id: row?.id }) }}
                                //         onSuccessEvent={(item) => { preload() }}
                                //         onFailedEvent={((item) => { })}
                                //         className="dropdown-item"
                                //         id={`grid-delete-${row?.id}`}>
                                //         <CheckSquare size={15} /> <span className='ms-1 align-middle'>Complete</span>
                                //     </ConfirmStop>
                                // },
                                // {
                                //     // IF: 
                                //     // IF: Can(Permissions?.manageCampaignStatus) && row?.status === "Pending",
                                //     noWrap: true,
                                //     name: <ConfirmStop
                                //         item={row}
                                //         // eventId={`stop-campaign-${row?.id}`}
                                //         title={`Check Status  ${row?.campaign} ?`}
                                //         color='text-success'

                                //         text={'no-text'}
                                //         onClickYes={() => getStatusMethod(row)}
                                //         onSuccessEvent={(item) => { preload() }}
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
        const count = Math.ceil(waList?.total / waList?.per_page)
        return (
            <ReactPaginate
                initialPage={waList?.current_page - 1}
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
    return (
        <>
            {/* <WaCampaignInfo Component={Button.Ripple} edit={editData} color={"secondary"} showModal={detailModal} setShowModal={() => setDetailModal(false)} noView /> */}
            <WaCampaignInfo Component={Button.Ripple} edit={editData} color={"secondary"} showModal={detailModal} setShowModal={() => setDetailModal(false)} forceStatusCheck={forceStatusCheck} setForceStatusCheck={() => setForceStatusCheck(false)} noView />

            <Header icon={""} title="Whatsapp Report">
                {/* <ButtonGroup color='primary' className='me-25'>
                  <Button.Ripple size="sm" color="primary" id="filter" onClick={() => { navigate('/scheduled-campaign-report') }} >
                      <Campaign fontSize='25px' /> Upcoming Campaign
                  </Button.Ripple>
              </ButtonGroup> */}
                <ButtonGroup>
                    <Button.Ripple size="sm" color="primary" id="filter" onClick={() => handleExport()}>
                        <Summarize fontSize="small" /> Export Report
                    </Button.Ripple>
                    <Button.Ripple size="sm" color="info" id="filter" onClick={() => handleConversationExport()}>
                        <Chat fontSize="small" /> Export Conversation
                    </Button.Ripple>
                    <UncontrolledTooltip target="summary">Export Summary Report</UncontrolledTooltip>
                    <Button.Ripple size="sm" color="success" id="summary" onClick={() => handleSummaryExport()}>
                        <InsertDriveFile fontSize="small" /> Export Summary
                    </Button.Ripple>
                    <UncontrolledTooltip target="reload">Refresh Data</UncontrolledTooltip>
                    <UncontrolledTooltip target="filteree">Filter</UncontrolledTooltip>
                    <Button.Ripple size="sm" color="dark" id="filteree" onClick={() => { setShowFilter(true) }}>
                        <Sliders size="14" />
                    </Button.Ripple>
                    <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { setFilterData({}); setReload(true); setResetIt(new Date()); reset() }}>
                        <RefreshCcw size="14" />
                    </Button.Ripple>
                </ButtonGroup>
            </Header>

            <Card>
                <Row className='justify-content-end mx-0'>
                    <Col className='d-flex align-items-center justify-content-end mt-1' md='3' sm='12'>
                        <Form onSubmit={handleSubmit(submitFilter)}>

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
                                            loading={loading}
                                            className="btn btn-primary"
                                            color="primary"
                                            type="submit"
                                            size="sm"
                                        >
                                            <Search size={15} />
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
                                columns={campaignListing}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                //   selectableRowsComponent={BootstrapCheckbox}
                                sortIcon={<ChevronDown size={10} />}
                                // expandableRowsComponent={ExpandableTable}
                                paginationComponent={CustomPagination}
                                data={waList?.data}
                            // onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div>
                </>}

            </Card>

            <ExportWhatsappReport
                handleExport={handleExport}
                setExportID={setExportID}
                exportID={exportID}
            />
            
            <ExportWhatsappConversation
                handleConversationExport={handleConversationExport}
                setConversationExport={setConversationExport}
                conversationExport={conversationExport}
            />
            <ExportWhatsappSummaryReport
                handleSummaryExport={handleSummaryExport}
                setSummaryExport={setSummaryExport}
                summaryExport={summaryExport}
            />
            <WhatsappReportFilter show={showFilter} filterData={filterData} setFilterData={e => {
                setCurrentPage(1)
                setFilterData(e)
            }} handleFilterModal={() => { setShowFilter(false) }} />
        </>
    )
}

export default MessageReport
