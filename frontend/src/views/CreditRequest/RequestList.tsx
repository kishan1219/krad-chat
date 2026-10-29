// @ts-nocheck
import AccountBalanceWallet from '@mui/icons-material/AccountBalanceWallet'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import React, { forwardRef, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, Edit, Plus, RefreshCcw, Sliders } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Button, ButtonGroup, Card, Input, UncontrolledTooltip } from 'reactstrap'
import Hide from '../../utility/Hide'
import Show from '../../utility/Show'
import { loadCreditRequest } from '../../utility/apis/creditRequest'
import Header from '../components/header'
import Shimmer from '../components/shimmers/Shimmer'
import BsTooltip from '../components/tooltip'
import AddRequest from './AddRequest'
import FilterRequest from './FilterRequest'
import ReplyCreditRequest from './ReplyCreditRequest'


const RequestList = () => {

    const creditRequest = useSelector(a => a.creditRequest.creditRequest)
    const userLogin = useSelector(state => state.auth.userData)
    const [creditList, setCreditRequest] = useState(null)
    const [loading, setLoading] = useState(false)
    const [modal, setModal] = useState(false)
    const [formModal, setFormModal] = useState(false)
    const [deleted, setDeleted] = useState(false)
    const [failed, setFailed] = useState(false)
    const [deletedId, setDeletedId] = useState(null)
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
    const { register, errors, handleSubmit } = useForm()
    const [showFilter, setShowFilter] = useState(false)
    const [filterData, setFilterData] = useState({
        per_page_record: 15
    })

    const user = useSelector(state => state.auth.userData)
    const [reload, setReload] = useState(false)
    const dispatch = useDispatch()

    const preload = (data) => {
        loadCreditRequest({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: (e) => {
                // setCreditRequest(e)
            },
            loading: setLoading,
            jsonData: filterData
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
        loadCreditRequest({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            // success: setCreditRequest,
            dispatch,
            loading: setLoading
        })
    }


    const handleReload = () => {
        preload()
    }


    const creditRequestColumn = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "Requested By",
            selector: (row) => (row?.created_by?.name),
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Credit Request",
            selector: r => r.credit_request,
            sortable: true,
            minWidth: '170px'
        },

        {
            name: "Route Type",
            sortable: true,
            minWidth: '170px',
            selector: row => {
                if (parseInt(row.route_type) === 1) { return 'Transaction' }
                if (parseInt(row.route_type) === 2) { return 'Promotional' }
                if (parseInt(row.route_type) === 3) { return 'Two-Way SMS' }
                if (parseInt(row.route_type) === 4) { return 'Voice' }

            }

        },
        {
            name: "Comment",
            cell: (row, index) => {
                return (<span className='text-wrap' style={{ cursor: "pointer", color: "darkorange" }} >{row.comment}</span>)
            },
            sortable: true,
            minWidth: '400px'
        },
        {
            name: "Request Reply",
            cell: (row, index) => {
                return (<span className='text-wrap' style={{ cursor: "pointer", color: "darkorange" }} >{row.request_reply}</span>)
            },
            sortable: true,
            minWidth: '400px'
        },

        {
            name: "actions",
            allowOverflow: true,
            minWidth: '170px',
            cell: row => {
                return (

                    <ButtonGroup>
                        <Show IF={row?.created_by?.id !== userLogin?.id && row?.request_reply === null}>
                            <BsTooltip title="Reply" >
                                <ReplyCreditRequest Component={Button.Ripple} size="sm" color={"primary"} edit={row} preload={preload}> <Edit size="15" /> </ReplyCreditRequest>
                            </BsTooltip>
                        </Show>

                    </ButtonGroup>
                )
            }
        }
    ]


    const CustomPagination = () => {
        const count = Math.ceil(creditRequest?.total / creditRequest?.per_page)
        return (
            <ReactPaginate
                initialPage={creditRequest?.current_page - 1}
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
            <Header icon={<AccountBalanceWallet size={20} />} title="Credit List" >
                <ButtonGroup>

                    <Hide IF={user?.userType === 0 || user?.userType === 3}>
                        <AddRequest Component={Button.Ripple} size="sm" color={"primary"}><Plus size="14" /> Add Credit</AddRequest>
                    </Hide>
                    <UncontrolledTooltip target="reload">refresh data</UncontrolledTooltip>
                    <UncontrolledTooltip target="filteree">Filter</UncontrolledTooltip>
                    <Button.Ripple size="sm" color="dark" id="filteree" onClick={() => setShowFilter(true)}>
                        <Sliders size="14" on />
                    </Button.Ripple>
                    <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { setFilterData({}); setReload(true) }}>
                        <RefreshCcw size="14" />
                    </Button.Ripple>
                </ButtonGroup>
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
                                columns={creditRequestColumn}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                selectableRowsComponent={BootstrapCheckbox}
                                sortIcon={<ChevronDown size={10} />}
                                paginationComponent={CustomPagination}
                                data={creditRequest?.data}
                            // onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div>
                </>
                }

            </Card>
            <FilterRequest show={showFilter} filterData={filterData} setFilterData={e => {
                setCurrentPage(1)
                setFilterData(e)
            }} handleFilterModal={() => { setShowFilter(false) }} />

        </>

    )

}

export default RequestList
