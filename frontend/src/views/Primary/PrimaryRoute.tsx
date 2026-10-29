// @ts-nocheck
// ** React Imports
import { forwardRef, useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
// ** Third Party Components
import DataTable from 'react-data-table-component'
import { ChevronDown, Edit, Eye, MessageCircle, Plus, RefreshCcw, Sliders, Trash2 } from 'react-feather'
import ReactPaginate from 'react-paginate'

// ** Reactstrap Imports
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import {
    Badge,
    Button, ButtonGroup, Card, CardHeader, CardTitle, Col, DropdownItem, DropdownMenu, DropdownToggle, Input, Row, UncontrolledButtonDropdown, UncontrolledTooltip
} from 'reactstrap'
import { getPath } from '../../router/RouteHelper'
import { checkPrimaryRouteConnection, checkVoiceBalance, deletePrimaryRoute, loadPrimaryRoute, primaryRouteAction } from '../../utility/apis/primaryRoutes'
import ConfirmAlert from '../../utility/helpers/ConfirmAlert'
import Shimmer from '../components/shimmers/Shimmer'
import AddPrimaryRoute from './AddPrimaryRoute'
import PrimaryRouteAction from './PrimaryRouteAction'
import { primaryDelete } from '../../redux/reducers/primaryRoute'
import ViewPrimaryRoute from './ViewPrimaryRoute'
import BsTooltip from '../components/tooltip'
import SensorsIcon from '@mui/icons-material/Sensors'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import FilterPrimary from './FilterPrimary'
import Show from '../../utility/Show'
import { Permissions } from '../../utility/Permissions'
import Header from '../components/header'
import Hide from '../../utility/Hide'
import KeyboardVoice from '@mui/icons-material/KeyboardVoice'
import Campaign from '@mui/icons-material/Campaign'
import CurrencyRupee from '@mui/icons-material/CurrencyRupee'
import ToggleOn from '@mui/icons-material/ToggleOn'
import ToggleOff from '@mui/icons-material/ToggleOff'
import toast from 'react-hot-toast'
import ForwardToInbox from '@mui/icons-material/ForwardToInbox'
import UnsubscribeIcon from '@mui/icons-material/Unsubscribe'
import ConfirmStop from '../../utility/helpers/ConfirmStop'

const PrimaryRoute = () => {

    const primaryList = useSelector(a => a.primary.primary)

    const [primary, setPrimary] = useState(null)
    const [loading, setLoading] = useState(false)
    const [modal, setModal] = useState(false)
    const [formModal, setFormModal] = useState(false)
    const [deleted, setDeleted] = useState(false)
    const [failed, setFailed] = useState(false)
    const [deletedId, setDeletedId] = useState(null)
    const { register, errors, handleSubmit } = useForm()
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
    const [rowsSelected, setRowsSelected] = useState([])
    const [showFilter, setShowFilter] = useState(false)
    const [filterData, setFilterData] = useState({
        per_page_record: 15
    })
    const [reload, setReload] = useState(false)


    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])

    const dispatch = useDispatch()

    const preload = (data) => {
        loadPrimaryRoute({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: (e) => {
                // setPrimary(e)
            },
            loading: setLoading,
            jsonData: filterData
        })
    }

    useEffect(() => {
        preload()
    }, [filterData])

    const handleFilterModal = () => setShowFilter(!showFilter)

    // const history = useHistory()
    const handleModal = () => setModal(!modal)

    const handleViewModal = () => setFormModal(!formModal)

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        loadPrimaryRoute({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            dispatch,
            // success: setPrimary,
            loading: setLoading
        })
    }

    const deleteThePrimaryRoute = (row) => {
        deletePrimaryRoute({
            id: row,
            success: () => {
                // preload()
            }
        })
    }

    const checkConnection = (id) => {
        checkPrimaryRouteConnection({
            id,
            success: () => {
                preload()
            }
        })
    }

    const checkVoiceBalances = (id) => {
        checkVoiceBalance({
            id,
            success: (e) => {
                toast.success(e?.data)
                // preload()
                // handleClick(e?.data)
            }
        })
    }

    // Handle Rows selection
    const handleReportChange = ({ selectedRows }) => {

        const selectedR = selectedRows.map((item, index) => {
            return item.id
        })
        setRowsSelected(selectedR)

    }

    const activityColumn = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        // {
        //     name: "Smsc ID",
        //     selector: r => r.smsc_id,
        //     sortable: true,
        //     minWidth: '170px'
        // },
        {
            name: "Route Name",
            selector: r => r.route_name,
            sortable: true,
            maxWidth: '190px'
        },
        {
            name: "Type",
            selector: (r) => {
                if (r?.gateway_type === 1) {
                    return (
                        <BsTooltip title="Transactional">
                            <ForwardToInbox color='success' style={{ cursor: 'pointer' }} />
                        </BsTooltip>
                    )
                } else if (r?.gateway_type === 2) {
                    return (
                        <BsTooltip title="Promotional">
                            <UnsubscribeIcon color='danger' style={{ cursor: 'pointer' }} />
                        </BsTooltip>

                    )
                } else if (r?.gateway_type === 4) {

                    return (
                        <BsTooltip title="Voice">
                            <KeyboardVoice color='warning' style={{ cursor: 'pointer' }} />
                        </BsTooltip>
                    )
                }

            },
            sortable: true,
            maxWidth: '70px'
        },

        {
            name: "IP Address",
            selector: r => r.ip_address,
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Port",
            selector: (row) => (row?.transceiver_mode === 0 ? `${row?.port} / ${row?.receiver_port}` : `${row?.port} / ${row?.port}`),
            sortable: true,
            maxWidth: '140px'
        },
        {
            name: "Online From",
            selector: (row) => (row?.online_from ?? "N/A"),
            sortable: true,
            minWidth: '170px'
        },
        // {
        //     name: "Smsc Username",
        //     selector: r => r.smsc_username,
        //     sortable: true,
        //     minWidth: '170px'
        // },
        {
            name: "Status",
            selector: (row) => (Number(row?.status) === 1 ? <BsTooltip title={"Connected"}> <Badge color='success' className='badge-glow'><ToggleOn /></Badge></BsTooltip> : <BsTooltip title={"Disconnected"}> <Badge color='danger' className='badge-glow'><ToggleOff /></Badge></BsTooltip>),
            sortable: true,
            maxWidth: '120px'
        },

        {
            name: "actions",
            allowOverflow: true,
            minWidth: '170px',
            cell: row => {
                return (
                    <ButtonGroup>

                        <Show IF={Permissions?.checkPrimaryRouteConnection}>
                            <Hide IF={row?.gateway_type === 4}>
                                <BsTooltip title="Connection check">
                                    <div className="waves-effect btn btn-primary btn-sm" id='view' onClick={() => { checkConnection(row?.id) }} style={{ cursor: "pointer" }} >
                                        <SensorsIcon />
                                    </div>
                                </BsTooltip>
                            </Hide>
                        </Show>
                        <Show IF={Permissions?.checkPrimaryRouteConnection}>
                            <Show IF={row?.gateway_type === 4}>
                                <BsTooltip title="Balance Check">
                                    <div className="waves-effect btn btn-primary btn-sm" id='view' style={{ cursor: "pointer" }} onClick={() => { checkVoiceBalances(row?.id) }} >
                                        <KeyboardVoice />
                                    </div>
                                </BsTooltip>
                            </Show>
                        </Show>
                        <Show IF={Permissions?.primaryView}>
                            <ViewPrimaryRoute Component={Button.Ripple} size="sm" color={"success"} edit={row}>  <Eye size={15} /> </ViewPrimaryRoute>

                        </Show>

                        <Show IF={Permissions?.primaryEdit}>
                            <AddPrimaryRoute Component={Button.Ripple} size="sm" color={"secondary"} edit={row}> <Edit size={15} /> </AddPrimaryRoute>
                        </Show>
                        <Show IF={Permissions?.primaryDelete}>
                            {/* <ConfirmAlert
                                title={`Delete ${row?.route_name} ?`}
                                color='text-warning'
                                onClickYes={() => deletePrimaryRoute({ id: row?.id, loading: setLoading, success: e => { setDeletedId(row?.id); setDeleted(e) }, error: setFailed })}
                                // onClickYes={() => deletePrimaryRoute({ id: row?.id, loading: setLoading, success: setDeleted, error: setFailed })}
                                onSuccess={deleted}
                                onFailed={failed}

                                onClose={(e) => {
                                    if (e) {
                                        dispatch(primaryDelete(deletedId))
                                    }
                                    setDeleted(null)
                                    setFailed(null)
                                }}
                                className="waves-effect btn btn-danger btn-sm"
                                id={`grid-delete-${row?.id}`}>
                                <Trash2 size={15} />
                            </ConfirmAlert> */}
                            <ConfirmStop
                                item={row}
                                // eventId={`delete-${row?.id}`}
                                title={`Delete  ${row?.route_name} ?`}
                                color='text-warning'
                                onClickYes={() => deleteThePrimaryRoute(row?.id)}
                                // onSuccessEvent={(item) => { dispatch(userDelete(item?.id)); preload() }}
                                // onFailedEvent={((item) => { })}
                                onSuccessEvent={(item) => { preload() }}
                                onFailedEvent={((item) => { })}
                                className="waves-effect btn btn-danger btn-sm"
                                style={{ cursor: "pointer" }}
                                id={`grid-delete-${row?.id}`}>

                                <Trash2 size={15} />
                            </ConfirmStop>
                        </Show>
                    </ButtonGroup >
                )
            }
        }
    ]

    const CustomPagination = () => {
        const count = Math.ceil(primaryList?.total / primaryList?.per_page)
        return (
            <ReactPaginate
                initialPage={primaryList?.current_page - 1}
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
    const submitHandler = (e) => {
        e.preventDefault()
        if (rowsSelected.length > 0) {
            // if (isObjEmpty(errors)) {
            primaryRouteAction({
                // id: edit?.id,
                jsonData: {
                    status: 1,
                    primary_routes_id: rowsSelected

                },
                loading: setLoading,
                dispatch,
                success: () => {
                    preload()
                    setRowsSelected([])
                }
            })
            // }
        }
    }
    const submitHandler2 = (e) => {
        e.preventDefault()
        if (rowsSelected.length > 0) {
            // if (isObjEmpty(errors)) {
            primaryRouteAction({
                // id: edit?.id,
                jsonData: {
                    status: 0,
                    primary_routes_id: rowsSelected

                },
                loading: setLoading,
                dispatch,
                success: () => {
                    preload()
                    setRowsSelected([])
                }
            })
            // }
        }
    }

    const BootstrapCheckbox = forwardRef((props, ref) => (
        <div className='form-check'>
            <Input type='checkbox' innerRef={ref} {...props} />
        </div>
    ))
    return (
        <>

            <Header title={"Primary Route"} >
                <ButtonGroup>

                    <Show IF={Permissions?.primaryCreate}>
                        <AddPrimaryRoute Component={Button.Ripple} size="sm" color={"primary"}> <Plus size='14' /> Primary Route</AddPrimaryRoute>
                    </Show>
                    <UncontrolledTooltip target="reload">refresh data</UncontrolledTooltip>
                    <UncontrolledTooltip target="filteree">Filter</UncontrolledTooltip>
                    <Button.Ripple size="sm" color="dark" id="filteree" onClick={() => setShowFilter(true)}>
                        <Sliders size="14" on />
                    </Button.Ripple>
                    <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => {
                        setFilterData({

                        }); setReload(true)
                    }} >
                        <RefreshCcw size="14" />
                    </Button.Ripple>
                </ButtonGroup>
            </Header>

            <Card>
                <CardHeader className='border-bottom inline'>
                    <UncontrolledButtonDropdown disabled={rowsSelected?.length === 0}>
                        <DropdownToggle color={rowsSelected?.length === 0 ? 'secondary' : 'primary'} outline caret>
                            Actions
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem onClick={submitHandler} href='/' tag='a'>Active</DropdownItem>
                            <DropdownItem onClick={submitHandler2} href='/' tag='a'>In-Active</DropdownItem>
                        </DropdownMenu>
                    </UncontrolledButtonDropdown>

                   
                </CardHeader>
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
                                selectableRows

                                pagination
                                paginationServer
                                className='react-dataTable'
                                columns={activityColumn}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                selectableRowsComponent={BootstrapCheckbox}
                                sortIcon={<ChevronDown size={10} />}
                                paginationComponent={CustomPagination}
                                data={primaryList?.data}
                                onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div>
                </>
                }

            </Card>
            <AddPrimaryRoute
                open={modal}
                setModal={setModal}
                handleModal={handleModal}
                filterData={filterData}
            />


            <FilterPrimary show={showFilter} filterData={filterData} setFilterData={e => {
                setCurrentPage(1)
                setFilterData(e)
            }} handleFilterModal={() => { setShowFilter(false) }} />

        </>
    )
}


export default PrimaryRoute
