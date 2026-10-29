// @ts-nocheck
import '@styles/react/libs/tables/react-dataTable-component.scss'
import React, { forwardRef, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, Download, Edit, Eye, Plus, RefreshCcw, Search, Sliders, Trash2 } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Button, ButtonGroup, Card, CardHeader, Col, DropdownItem, DropdownMenu, DropdownToggle, Form, Input, Row, UncontrolledButtonDropdown, UncontrolledTooltip } from 'reactstrap'
import { dlrDelete } from '../../redux/reducers/dlr'
import { Permissions } from '../../utility/Permissions'
import Show from '../../utility/Show'
import { deleteDlr, dlrAction, loadDlr } from '../../utility/apis/dlr'
import ConfirmAlert from '../../utility/helpers/ConfirmAlert'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import Shimmer from '../components/shimmers/Shimmer'
import AddDlr from './AddDlr'
import FilterDlr from './FilterDlr'
import ImportDlr from './ImportDlr'
import ViewDlr from './ViewDlr'
import BsTooltip from '../components/tooltip'
import BsPopover from '../components/popover'
import ConfirmStop from '../../utility/helpers/ConfirmStop'


const DlrList = () => {
    const dlrList = useSelector(a => a.dlr.dlr)
    const [loading, setLoading] = useState(false)
    const [modal, setModal] = useState(false)
    const [formModal, setFormModal] = useState(false)
    const [deleted, setDeleted] = useState(false)
    const [failed, setFailed] = useState(false)
    const [showFilter, setShowFilter] = useState(false)
    const [deletedId, setDeletedId] = useState(null)
    const [currentPage, setCurrentPage] = useState("1")
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
    const [rowsSelected, setRowsSelected] = useState([])
    const [importModal, setImportModal] = useState(false)
    const [rSelected, setRSelected] = useState(null)
    const [type, setType] = useState(null)
    const [refundType, setRefundType] = useState(null)
    const [filterData, setFilterData] = useState({
        per_page_record: 15
    })
    const [reload, setReload] = useState(false)
    const handleImport = () => setImportModal(!importModal)
    const dispatch = useDispatch()
    const [resetIt, setResetIt] = useState(new Date())


    const preload = (data) => {
        loadDlr({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: (e) => {
                // setDlr(e)
            },
            loading: setLoading,
            jsonData: {
                ...filterData,
                search: filterData?.search
            }
        })
    }

    useEffect(() => {
        preload()
    }, [filterData])

    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])

    const submitFilter = (d) => {
        setFilterData({
            ...d
            // filterData
        })
        // console.log(d)

    }

    const deleteTheDlr = (row) => {
        deleteDlr({
            id: row,
            success: () => {
            }
        })
    }

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        loadDlr({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            // success: setDlr,
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
        setFilterData()
    }

    const dlrColumn = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "Primary Route",
            selector: (row) => {
                return (
                    <>
                        <span>{row?.primary_route?.route_name} <br /> ({row?.primary_route_id})</span>
                    </>
                )
            },
            sortable: true,
            minWidth: '170px'
        },
        // {
        //     name: "Primary Route ID",
        //     selector: r => r.primary_route_id,
        //     sortable: true,
        //     minWidth: '170px'
        // },
        {
            name: "DLR Code",
            allowOverflow: true,
            cell: row => {
                return (
                    <>
                        <BsTooltip role="button" className="me-1" title={null}>
                            <BsPopover className='not-important' placement='right' trigger='hover' title={row?.name} content={
                                <>
                                    <span className='text-primary'>{row?.description}</span>

                                </>
                            }>
                                <span className='text-primary'>{row?.dlr_code}</span>
                            </BsPopover>
                        </BsTooltip>
                    </>
                )
            },
            // sortable: true,
            maxWidth: '200px'
        },
        // {
        //     name: "Dlr Code",
        //     selector: r => r.dlr_code,
        //     sortable: true,
        //     minWidth: '170px'
        // },
        {
            name: "Refund Applicable",
            sortable: true,
            minWidth: '170px',
            selector: row => {
                if (row.is_refund_applicable === 0) { return 'No' }
                if (row.is_refund_applicable === 1) { return 'Yes' }

            }

        },

        {
            name: "Retry Applicable",
            // selector: 'is_retry_applicable',
            selector: row => {
                if (row.is_retry_applicable === 0) { return 'No' }
                if (row.is_retry_applicable === 1) { return 'Yes' }
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
                    <ButtonGroup>
                        <Show IF={Permissions?.dlrView}>
                            <UncontrolledTooltip placement='top' id='view' target='view'>
                                View
                            </UncontrolledTooltip>
                            <ViewDlr Component={Button.Ripple} size="sm" color={"success"} edit={row} id="view"> <Eye size={15} /></ViewDlr>
                        </Show>
                        {/* <UncontrolledTooltip placement='top' id='edit' target='view'>
                            edit
                        </UncontrolledTooltip> */}
                        <Show IF={Permissions?.dlrEdit}>
                            <UncontrolledTooltip placement='top' id='view' target='edit'>
                                Edit
                            </UncontrolledTooltip>
                            <AddDlr Component={Button.Ripple} size="sm" color={"secondary"} edit={row} id="edit"> <Edit size={15} /> </AddDlr>
                        </Show>

                        <Show IF={Permissions?.dlrDelete}>
                            {/* <ConfirmAlert
                                title={`Delete ${row?.dlr_code} ?`}
                                color='text-warning'
                                onClickYes={() => deleteDlr({ id: row?.id, loading: setLoading, success: e => { setDeletedId(row?.id); setDeleted(e) }, error: setFailed })}
                                // onClickYes={() => deletePrimaryRoute({ id: row?.id, loading: setLoading, success: setDeleted, error: setFailed })}
                                onSuccess={deleted}
                                onFailed={failed}

                                onClose={(e) => {
                                    if (e) {
                                        dispatch(dlrDelete(deletedId))
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
                                title={`Delete  ${row?.dlr_code} ?`}
                                color='text-warning'
                                onClickYes={() => deleteTheDlr(row?.id)}
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
                    </ButtonGroup>
                )
            }
        }
    ]

    const CustomPagination = () => {
        const count = Math.ceil(dlrList?.total / dlrList?.per_page)
        return (
            <ReactPaginate
                initialPage={dlrList?.current_page - 1}
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

    const submitHandler = (type) => {
        // e.preventDefault()
        if (rowsSelected.length > 0) {
            // if (isObjEmpty(errors)) {
            dlrAction({
                // id: edit?.id,
                jsonData: {
                    status: 1,
                    action: type === 1 ? "refund_applicable" : "retry_applicable",
                    dlrcode_vender_ids: rowsSelected

                },
                loading: setLoading,
                dispatch,
                success: () => {
                    // preload()
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
            <Header title={"DLR List"} >
                <ButtonGroup>
                    {/* <Show IF = {Permissions?.dlri} */}
                    <Button.Ripple size="sm" color="info" onClick={() => handleImport()}>
                        <Download size="14" on /> Import Dlr
                    </Button.Ripple>
                    <Show IF={Permissions?.dlrCreate}>
                        <AddDlr Component={Button.Ripple} size="sm" color={"primary"}><Plus size="14" /> Dlr Code</AddDlr>
                    </Show>
                    <UncontrolledTooltip target="reload">refresh data</UncontrolledTooltip>
                    <UncontrolledTooltip target="filter">Filter</UncontrolledTooltip>
                    <Button.Ripple size="sm" color="dark" id="filter" onClick={() => setShowFilter(true)}>
                        <Sliders size="14" on />
                    </Button.Ripple>
                    <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { setFilterData({}); setReload(true); setResetIt(new Date()); reset() }} >
                        <RefreshCcw size="14" />
                    </Button.Ripple>
                </ButtonGroup>
            </Header>
            <Card>
                <Show IF={Permissions?.dlrAction}>
                    <Row className='justify-content-between mx-0'>
                        <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                            <CardHeader className='border-bottom inline'>

                                <UncontrolledButtonDropdown disabled={rowsSelected?.length === 0}>
                                    <DropdownToggle color={rowsSelected?.length === 0 ? 'secondary' : 'primary'} outline caret>
                                        Actions
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem onClick={() => { submitHandler(1) }} href='/' tag='span'>Refund Applicable</DropdownItem>
                                        <DropdownItem onClick={() => { submitHandler(2) }} href='/' tag='span'>Retry Applicable</DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledButtonDropdown>
                            </CardHeader>
                        </Col>
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
                </Show>
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
                                columns={dlrColumn}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                selectableRowsComponent={BootstrapCheckbox}
                                sortIcon={<ChevronDown size={10} />}
                                paginationComponent={CustomPagination}
                                data={dlrList?.data}
                                onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div>
                </>
                }

            </Card>
            <ImportDlr
                open={importModal}
                importModal={importModal}
                setImportModal={setImportModal}
                handleImport={handleImport}
                filterData={filterData}
            />
            <FilterDlr show={showFilter} filterData={filterData} setFilterData={e => {
                setCurrentPage(1)
                setFilterData(e)
            }} handleFilterModal={() => { setShowFilter(false) }} />

        </>
    )
}

export default DlrList
