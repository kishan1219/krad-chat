// @ts-nocheck
import React, { forwardRef, useContext, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, ChevronsDown, Edit, MoreVertical, Plus, RefreshCcw, Search, Sliders } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Button, ButtonGroup, Card, Col, Form, Input, Row, Table, UncontrolledTooltip } from 'reactstrap'
import DropDownMenu from '../../components/dropdown'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import Header from '../../components/header'
import Shimmer from '../../components/shimmers/Shimmer'
import { userWiseMonthlyReport } from '../../../utility/apis/userWiseReport'
import Show from '../../../utility/Show'
import { Permissions } from '../../../utility/Permissions'
import AddUserReport from './AddUserReport'
import FilterUserReport from './FilterUserReport'
import FormGroupCustom from '../../components/formGroupCustom'
import LoadingButton from '../../components/buttons/LoadingButton'
import UpdateUserReport from './UpdateUserReport'
import BsTooltip from '../../components/tooltip'
import BsPopover from '../../components/popover'

const MonthlyReportByUser = () => {
    const { colors } = useContext(ThemeColors)
    const [loading, setLoading] = useState(false)
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
    const [showFilter, setShowFilter] = useState(false)
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
    const reportData = useSelector(state => state.userWiseReport?.userWiseReport)
    const [downloadPdf, setDownloadPdf] = useState(false)
    const loginUser = useSelector(state => state.auth.userData)
    const [filterData, setFilterData] = useState({
        per_page_record: 15
    })
    const [reload, setReload] = useState(false)
    const [report, setReport] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [primaryRoute, setPrimaryRoute] = useState(null)
    const [resetIt, setResetIt] = useState(new Date())
    const dispatch = useDispatch()

    const preload = () => {
        userWiseMonthlyReport({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            error: (e) => {
                // setError("email", { message: e?.data?.payload?.email[0] ?? 'djkdsl' })
            },
            success: () => {
                // setUser(e)
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
        userWiseMonthlyReport({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            // success: setUser,
            dispatch,
            loading: setLoading
        })
    }

    const submitFilter = (d) => {
        setFilterData({
            ...d
        })
    }

    const userColumn = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },

        // {
        //     name: "Name",
        //     selector: r => r.user?.name,
        //     sortable: true,
        //     minWidth: '180px'
        // },
        {
            name: "Name",
            allowOverflow: true,
            cell: row => {
                return (
                    <>
                        <BsTooltip role="button" className="me-1" title={null}>
                            <BsPopover className='not-important' placement='right' trigger='hover' title={row?.user?.name} content={
                                <>

                                    <Table responsive>
                                        <thead>
                                            <tr>
                                                <th scope='col' className='text-nowrap'>
                                                    #
                                                </th>
                                                <th scope='col' className='text-nowrap'>
                                                    Submission
                                                </th>
                                                <th scope='col' className='text-nowrap'>
                                                     Delivered
                                                </th>
                                                <th scope='col' className='text-nowrap'>
                                                     Failed
                                                </th>
                                                <th scope='col' className='text-nowrap'>
                                                     Rejected
                                                </th>
                                                <th scope='col' className='text-nowrap'>
                                                     InValid
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className='text-nowrap'>SMS Count</td>
                                                <td className='text-nowrap'>{row?.sms_count_submission}</td>
                                                <td className='text-nowrap'>{row?.sms_count_delivered}</td>
                                                <td className='text-nowrap'>  {row?.sms_count_failed}</td>
                                                <td className='text-nowrap'>{row?.sms_count_rejected}</td>
                                                <td className='text-nowrap'>{row?.sms_count_invalid}</td>
                                            </tr>
                                            <tr>
                                                <td className='text-nowrap'>Mobile Count</td>
                                                <td className='text-nowrap'>{row?.mobile_count_submission}</td>
                                                <td className='text-nowrap'>{row?.mobile_count_delivered}</td>
                                                <td className='text-nowrap'>  {row?.mobile_count_failed}</td>
                                                <td className='text-nowrap'>{row?.mobile_count_rejected}</td>
                                                <td className='text-nowrap'>{row?.mobile_count_invalid}</td>
                                            </tr>
                                        </tbody>

                                    </Table>
                                </>
                            }>
                                <span className='text-primary'>{row?.user?.name}</span>
                            </BsPopover>
                        </BsTooltip>
                    </>
                )
            },
            // sortable: true,
            minWidth: '200px'
        },
        {
            name: "Group Name",
            selector: r => (r.group_name ?? "N/A"),
            sortable: true,
            minWidth: '150px'
        },

        {
            name: "Year/Month",
            cell: (row, index) => {
                return `${row?.year}  ${row?.month}`
            },
            sortable: true,
            minWidth: '150px'
        },
        {
            name: "Message Type",
            cell: (row, index) => {
                return `${row?.message_type}`
            },
            sortable: true,
            minWidth: '150px'
        },

        // {
        //     name: "Submission",
        //     selector: r => r.total_submission,
        //     sortable: true,
        //     minWidth: '150px'
        // },
        // {
        //     name: "Credit Deducted",
        //     selector: r => r.total_credit_deduct,
        //     sortable: true,
        //     minWidth: '150px'
        // },
        // {
        //     name: "Delivered",
        //     selector: r => r.total_delivered,
        //     sortable: true,
        //     minWidth: '100px'
        // },
        // {
        //     name: "Failed",
        //     selector: r => r.total_failed,
        //     sortable: true,
        //     minWidth: '100px'
        // },
        // {
        //     name: "Rejected",
        //     selector: r => r.total_rejected,
        //     sortable: true,
        //     minWidth: '100px'
        // },


        {
            name: "actions",
            allowOverflow: true,
            minWidth: '170px',
            cell: row => {
                return (
                    <ButtonGroup>

                        <Show IF={Permissions?.adminOperation}>
                            <UncontrolledTooltip placement='top' id='view' target='edit'>
                                Edit
                            </UncontrolledTooltip>
                            <UpdateUserReport Component={Button.Ripple} size="sm" color={"secondary"} edit={row} id="edit"> <Edit size={15} onClick={() => { setShowEditModal(true) }} /> </UpdateUserReport>
                        </Show>


                    </ButtonGroup>
                )
            }
        }
    ]

    const CustomPagination = () => {
        const count = Math.ceil(reportData?.total / reportData?.per_page)
        return (
            <ReactPaginate
                initialPage={reportData?.current_page - 1}
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
            <UpdateUserReport Component={Button.Ripple} color={"secondary"} showModal={showEditModal} setShowModal={() => setShowEditModal(false)} noView />

            <Header icon={''} title="User Monthly Report">
                <ButtonGroup>
                    <Show IF={Permissions?.adminOperation}>
                        <AddUserReport Component={Button.Ripple} preload={preload} size="sm" color={"primary"}><Plus size="14" />Add User Report</AddUserReport>
                    </Show>
                    <UncontrolledTooltip target="reload">refresh data</UncontrolledTooltip>
                    <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { setFilterData({}); setReload(true); setResetIt(new Date()); reset() }} >
                        <RefreshCcw size="14" />
                    </Button.Ripple>
                    <UncontrolledTooltip target="filteree">Filter</UncontrolledTooltip>
                    <Button.Ripple size="sm" color="dark" id="filteree" onClick={() => { setShowFilter(true) }}>
                        <Sliders size="14" />
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
                                columns={userColumn}
                                // selectableRowDisabled={(row) => {
                                //     if (userLogin?.id === row?.id) {
                                //         return true
                                //     }
                                // }}

                                // selectableRowDisabled={(row) => {
                                //     // eslint-disable-next-line no-unused-expressions
                                //     userLogin?.id !== row?.id
                                // }}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                // selectableRowsComponent={BootstrapCheckbox}
                                sortIcon={<ChevronsDown size={10} />}
                                paginationComponent={CustomPagination}
                                data={reportData?.data}
                            // onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div>
                </>
                }

            </Card>
            <FilterUserReport show={showFilter} filterData={filterData} setFilterData={e => {
                setCurrentPage(1)
                setFilterData(e)
            }} handleFilterModal={() => { setShowFilter(false) }} />
        </>
    )
}

export default MonthlyReportByUser
