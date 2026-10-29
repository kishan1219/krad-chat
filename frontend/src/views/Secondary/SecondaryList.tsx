// @ts-nocheck
// ** React Imports
import { forwardRef, useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
// ** Third Party Components
import DataTable from 'react-data-table-component'
import { ChevronDown, Edit, Eye, Plus, RefreshCcw, Sliders, Trash2 } from 'react-feather'
import ReactPaginate from 'react-paginate'
import '@styles/react/libs/tables/react-dataTable-component.scss'
// ** Reactstrap Imports
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import {
    Badge,
    Button, ButtonGroup, Card, CardHeader, CardTitle, Col, DropdownItem, DropdownMenu, DropdownToggle, Input, Row, UncontrolledButtonDropdown, UncontrolledTooltip
} from 'reactstrap'
import { getPath } from '../../router/RouteHelper'
import ConfirmAlert from '../../utility/helpers/ConfirmAlert'
import Shimmer from '../components/shimmers/Shimmer'
import { loadPrimaryRoute } from '../../utility/apis/primaryRoutes'
import { deleteSecondaryRoute, loadSecondaryRoute, secondaryRouteAction } from '../../utility/apis/seconday'
import AddSeconday from './AddSeconday'
import ActionSecondary from './ActionSecondary'
import ViewSecondary from './ViewSecondary'
import { secondaryDelete } from '../../redux/reducers/secondaryRoute'
import FilterSecondary from './FilterSecondary'
import Header from '../components/header'
import ConfirmStop from '../../utility/helpers/ConfirmStop'


const SecondaryList = () => {
    const secondaryList = useSelector(a => a.secondary.secondary)
    // const [secondary, setSecondary] = useState(null)
    const [loading, setLoading] = useState(false)
    const [modal, setModal] = useState(false)
    const [formModal, setFormModal] = useState(false)
    const [showFilter, setShowFilter] = useState(false)
    const [deleted, setDeleted] = useState(false)
    const [failed, setFailed] = useState(false)
    const [deletedId, setDeletedId] = useState(null)
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
    const { register, errors, handleSubmit } = useForm()
    const [rowsSelected, setRowsSelected] = useState([])
    const [filterData, setFilterData] = useState({
        // per_page_record: 15
    })
    const [reload, setReload] = useState(false)


    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])

    const dispatch = useDispatch()

    const preload = (data) => {
        loadSecondaryRoute({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: (e) => {
                // setSecondary(e)
            },
            loading: setLoading,
            jsonData: filterData
        })
    }

    useEffect(() => {
        preload()
    }, [filterData])

    const deleteTheSecondary = (row) => {
        deleteSecondaryRoute({
            id: row,
           success: () => {
           }
        })
    }


    // const history = useHistory()
    const handleModal = () => setModal(!modal)

    const handleViewModal = () => setFormModal(!formModal)

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        loadSecondaryRoute({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            // success: setSecondary,
            dispatch,
            loading: setLoading
        })
    }

    // Handle Rows selection
    const handleReportChange = ({ selectedRows }) => {

        const selectedR = selectedRows.map((item, index) => {
            return item.id
        })
        setRowsSelected(selectedR)

    }


    const handleReload = () => {
        preload()
    }

    const activityColumn = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "Secondary Route ",
            selector: r => r.sec_route_name,
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Primary Route",
            selector: (row) => (row.primary_route?.route_name),
            sortable: true,
            minWidth: '170px'
        },


        {
            name: "Status",
            selector: (row) => (row?.status === 1 ? <Badge color='info'> Active</Badge> : <Badge color='danger'> InActive</Badge>),
            sortable: true,
            minWidth: '170px'
        },

        {
            name: "actions",
            allowOverflow: true,
            minWidth: '170px',
            cell: row => {
                return (
                    <ButtonGroup>
                        <ViewSecondary Component={Button.Ripple} size="sm" color={"success"} edit={row}> <Eye size={15} /> </ViewSecondary>

                        <AddSeconday Component={Button.Ripple} size="sm" color={"secondary"} edit={row}> <Edit size={15} /> </AddSeconday>

                        {/* <ConfirmAlert
                            title={`Delete ${row?.sec_route_name} ?`}
                            color='text-warning'
                            onClickYes={() => deleteSecondaryRoute({ id: row?.id, loading: setLoading, success: e => { setDeletedId(row?.id); setDeleted(e) }, error: setFailed })}
                            // onClickYes={() => deletePrimaryRoute({ id: row?.id, loading: setLoading, success: setDeleted, error: setFailed })}
                            onSuccess={deleted}
                            onFailed={failed}

                            onClose={(e) => {
                                if (e) {
                                    dispatch(secondaryDelete(deletedId))
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
                            title={`Delete  ${row?.sec_route_name} ?`}
                            color='text-warning'
                            onClickYes={() => deleteTheSecondary(row?.id)}
                            // onSuccessEvent={(item) => { dispatch(userDelete(item?.id)); preload() }}
                            // onFailedEvent={((item) => { })}
                            onSuccessEvent={(item) => { preload() }}
                            onFailedEvent={((item) => { })}
                            className="waves-effect btn btn-danger btn-sm"
                            style={{ cursor: "pointer" }}
                            id={`grid-delete-${row?.id}`}>

                            <Trash2 size={15} />
                        </ConfirmStop>
                    </ButtonGroup>
                )
            }
        }
    ]

    const CustomPagination = () => {
        const count = Math.ceil(secondaryList?.total / secondaryList?.per_page)
        return (
            <ReactPaginate
                initialPage={secondaryList?.current_page - 1}
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
            secondaryRouteAction({
                // id: edit?.id,
                jsonData: {
                    status: 1,
                    secondary_routes_id: rowsSelected

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
            secondaryRouteAction({
                // id: edit?.id,
                jsonData: {
                    status: 0,
                    secondary_routes_id: rowsSelected

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
            <Header icon={""} title={"Secondary Route"}>
                <ButtonGroup>

                    <AddSeconday Component={Button.Ripple} size="sm" color={"primary"}> <Plus size="14" /> </AddSeconday>

                    <UncontrolledTooltip target="reload">Refresh Data</UncontrolledTooltip>
                    <UncontrolledTooltip target="filteree">Filter</UncontrolledTooltip>
                    <Button.Ripple size="sm" color="dark" id="filteree" onClick={() => setShowFilter(true)}>
                        <Sliders size="14" on />
                    </Button.Ripple>
                    <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { setFilterData({}); setReload(true) }} >
                        <RefreshCcw size="14" />
                    </Button.Ripple>
                </ButtonGroup>
            </Header>
            <Card>
                <CardHeader className='border-bottom inline'>
                    {/* <CardTitle className='text-primary' tag='h4'>Secondary Route</CardTitle> */}
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
                                data={secondaryList?.data}
                                onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div>
                </>
                }

            </Card>
            <FilterSecondary show={showFilter} filterData={filterData} setFilterData={e => {
                setCurrentPage(1)
                setFilterData(e)
            }} handleFilterModal={() => { setShowFilter(false) }} />

        </>
    )
}


export default SecondaryList
