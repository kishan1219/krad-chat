// @ts-nocheck
import Campaign from '@mui/icons-material/Campaign'
import ForwardToInbox from '@mui/icons-material/ForwardToInbox'
import GetApp from '@mui/icons-material/GetApp'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import React, { forwardRef, useContext, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { CheckSquare, ChevronDown, Lock, MoreVertical, RefreshCcw, Sliders, Trash } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Badge, Button, ButtonGroup, Card, Col, Input, Row, UncontrolledTooltip } from 'reactstrap'
import { IconSizes } from '../../utility/Const'
import { Permissions } from '../../utility/Permissions'
import { Can } from '../../utility/Show'
import { changeCampaignStatusToComplete, loadCampaign, startOrStopCampaign } from '../../utility/apis/campaign'
import { exportByID } from '../../utility/apis/report'
import ConfirmStop from '../../utility/helpers/ConfirmStop'
import { log } from '../../utility/helpers/common'
import httpConfig from '../../utility/http/httpConfig'
import DropDownMenu from '../components/dropdown'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import Shimmer from '../components/shimmers/Shimmer'
import CampaignInfo from './CampaignInfo'
import FilterCampaign from './FilterCampaign'
import ManageCampaignRatio from './ManageCampaignRatio'
import ResendCampaign from './ResendCampaign'


const CompaignList = () => {
    const { colors } = useContext(ThemeColors)
    const user = useSelector(state => state.auth.userData)
    const campaignList = useSelector(a => a.campaign.campaign)
    const [campaign, setCampaign] = useState(null)
    const [loading, setLoading] = useState(false)
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
    const [editId, setEditId] = useState(null)
    const [show, setShow] = useState(false)
    const [perPage, setPerPage] = useState(15)
    const [rowsSelected, setRowsSelected] = useState([])
    const [importModal, setImportModal] = useState(false)
    const [editData, setEditData] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [detailModal, setDetailModal] = useState(false)
    const [admin, setAdmin] = useState(false)
    const [edit, setEdit] = useState(null)
    const [reload, setReload] = useState(false)
    const [filterData, setFilterData] = useState({
        per_page_record: 15
    })


    const dispatch = useDispatch()

    const preload = () => {
        loadCampaign({
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
        loadCampaign({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            dispatch,
            loading: setLoading
        })
    }

    const callCheckStatusAndInfo = (row) => {
        if (row?.total_delivered === 0 && row?.total_failed === 0) {

        }
    }

    const startStopCamp = (row) => {
        startOrStopCampaign({
            // dispatch,
            jsonData: {

                send_sms_id: row

            },
            success: (e) => {
                //    preload()
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
            selector: r => r.campaign,
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Time",
            selector: r => r.campaign_send_date_time,
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
            name: "Contact/Credit Used",
            // selector: 'total_contacts',
            selector: (row) => (<>{row?.total_contacts}/{row?.total_credit_deduct}</>),
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Block",
            selector: r => r.total_block_number,
            sortable: true,
            maxWidth: '115px'
        },
        {
            name: "Deliver",
            selector: r => r.total_delivered,
            sortable: true,
            maxWidth: '115px'
        },
        {
            name: "Failed",
            selector: r => r.total_failed,
            sortable: true,
            maxWidth: '115px'
        },
        {
            name: "Invalid",
            selector: r => r.total_invalid_number,
            sortable: true,
            maxWidth: '115px'
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
                                    IF: row?.status === "Pending",
                                    noWrap: true,
                                    name: <ConfirmStop
                                        item={row}
                                        eventId={`stop-campaign-${row?.id}`}
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
                                    // IF:  row?.status !== "Completed" && (user?.userType === 0 || user?.userType === 3),
                                    IF: Can(Permissions?.manageCampaignStatus) && row?.status !== "Completed",
                                    noWrap: true,
                                    name: <ConfirmStop
                                        item={row}
                                        eventId={`Finish-Campaign-${row?.id}`}
                                        title={`complete  ${row?.campaign} ?`}
                                        color='text-warning'
                                        text={null}
                                        onClickYes={() => { changeCampaignStatusToComplete({ id: row?.id }) }}
                                        onSuccessEvent={(item) => { preload(); log('yessss') }}
                                        onFailedEvent={((item) => { })}
                                        className="dropdown-item"
                                        id={`grid-delete-${row?.id}`}>
                                        <CheckSquare size={15} /> <span className='ms-1 align-middle'>Complete</span>
                                    </ConfirmStop>
                                }
                            ]
                            }
                        />
                    </div >
                )
            }
        }
    ]

    const CustomPagination = () => {
        const count = Math.ceil(campaignList?.total / campaignList?.per_page)
        return (
            <ReactPaginate
                initialPage={campaignList?.current_page - 1}
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
            <ResendCampaign Component={Button.Ripple} edit={editData} color={"secondary"} showModal={showModal} preload={preload} setShowModal={() => setShowModal(false)} noView />
            <CampaignInfo Component={Button.Ripple} edit={editData} color={"secondary"} showModal={detailModal} setShowModal={() => setDetailModal(false)} noView />
            <ManageCampaignRatio Component={Button.Ripple} edit={editData} color={"secondary"} showModal={admin} setShowModal={() => setAdmin(false)} noView />

            <Header icon={""} title="Campaign List">

                <ButtonGroup>
                    <UncontrolledTooltip target="reload">Refresh Data</UncontrolledTooltip>
                    <UncontrolledTooltip target="filteree">Filter</UncontrolledTooltip>
                    <Button.Ripple size="sm" color="dark" id="filteree" onClick={() => { setShowFilter(true) }}>
                        <Sliders size="14" />
                    </Button.Ripple>
                    <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { setFilterData({}); setReload(true) }}>
                        <RefreshCcw size="14" />
                    </Button.Ripple>
                </ButtonGroup>


            </Header>
            <Card>
                <Row className='justify-content-end mx-0'>
                    <Col className='d-flex align-items-center justify-content-end mt-1' md='3' sm='12'>
                        <FormGroupCustom
                            name={"search"}
                            type={"text"}
                            errors={errors}
                            label="Search"
                            noLabel
                            // dateFormat={"YYYY-MM-DD"}
                            onChangeValue={(v) => {
                                // log(v)
                                setFilterData({
                                    ...filterData,
                                    search: v
                                })
                            }}
                            setValue={setValue}
                            className="mb-2"
                            control={control}
                        />
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

                                pagination
                                paginationServer
                                className='react-dataTable'

                                columns={campaignListing}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                selectableRowsComponent={BootstrapCheckbox}
                                sortIcon={<ChevronDown size={10} />}

                                paginationComponent={CustomPagination}
                                data={campaignList?.data}

                            />
                        </div>
                    </div>
                </>}

            </Card>
            <FilterCampaign show={showFilter} filterData={filterData} setFilterData={e => {
                setCurrentPage(1)
                setFilterData(e)
            }} handleFilterModal={() => { setShowFilter(false) }} />
        </>
    )
}

export default CompaignList
