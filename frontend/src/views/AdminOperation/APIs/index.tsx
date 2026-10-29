// @ts-nocheck
import '@styles/react/libs/tables/react-dataTable-component.scss'
import React, { forwardRef, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, Download, Edit, Eye, Plus, RefreshCcw, Search, Sliders, Trash2 } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Button, ButtonGroup, Card, CardHeader, Col, DropdownItem, DropdownMenu, DropdownToggle, Form, Input, Row, UncontrolledButtonDropdown, UncontrolledTooltip } from 'reactstrap'
import { deleteApi, loadAllApi } from '../../../utility/apis/api'
import { apisDelete } from '../../../redux/reducers/apis'
import ConfirmAlert from '../../../utility/helpers/ConfirmAlert'
import { Permissions } from '../../../utility/Permissions'
import Show from '../../../utility/Show'
import FormGroupCustom from '../../components/formGroupCustom'
import Shimmer from '../../components/shimmers/Shimmer'
import Header from '../../components/header'
import LoadingButton from '../../components/buttons/LoadingButton'
import ApiIcon from '@mui/icons-material/Api'
import ViewApis from './ViewApis'
import AddApi from './AddApi'

const APIDocList = () => {
    const api = useSelector(a => a.apiList.apis)
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
        loadAllApi({
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
        if (filterData !== null) setReload(true)
    }, [filterData])

    const submitFilter = (d) => {
        setFilterData({
            ...d
            // filterData
        })
        // console.log(d)

    }

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        loadAllApi({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            // success: setDlr,
            dispatch,
            loading: setLoading
        })
    }
    useEffect(() => {
        preload()
    }, [filterData])

    const apiColumn = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "Title",
            selector: r => r.title,
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Language",
            selector: (row) => (row?.code_lang),
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Description",
            cell: (row, index) => {
                return (<span className='text-wrap'>{row.response_description}</span>)
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
                        <Show IF={Permissions?.dlrView}>
                            <UncontrolledTooltip placement='top' id='view' target='view'>
                                View
                            </UncontrolledTooltip>
                            <ViewApis Component={Button.Ripple} size="sm" color={"success"} edit={row} id="view"> <Eye size={15} /></ViewApis>
                        </Show>
                        <UncontrolledTooltip placement='top' id='edit' target='view'>
                            edit
                        </UncontrolledTooltip>
                        {/* <Show IF={Permissions?.dlrEdit}> */}
                        <UncontrolledTooltip placement='top' id='view' target='edit'>
                            Edit
                        </UncontrolledTooltip>
                        <AddApi Component={Button.Ripple} size="sm" color={"secondary"} edit={row} id="edit" preload={preload}> <Edit size={15} /> </AddApi>
                        {/* </Show> */}

                        <Show IF={Permissions?.dlrDelete}>
                            <ConfirmAlert
                                title={`Delete ${row?.sender_number} ?`}
                                color='text-warning'
                                onClickYes={() => deleteApi({ id: row?.id, loading: setLoading, success: e => { setDeletedId(row?.id); setDeleted(e) }, error: setFailed })}
                                // onClickYes={() => deletePrimaryRoute({ id: row?.id, loading: setLoading, success: setDeleted, error: setFailed })}
                                onSuccess={deleted}
                                onFailed={failed}

                                onClose={(e) => {
                                    if (e) {
                                        dispatch(apisDelete(deletedId))
                                    }
                                    setDeleted(null)
                                    setFailed(null)
                                }}
                                className="waves-effect btn btn-danger btn-sm"
                                id={`grid-delete-${row?.id}`}>

                                <Trash2 size={15} />
                            </ConfirmAlert>
                        </Show>
                    </ButtonGroup>
                )
            }
        }
    ]

    const CustomPagination = () => {
        const count = Math.ceil(api?.total / api?.per_page)
        return (
            <ReactPaginate
                initialPage={api?.current_page - 1}
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
            <Header icon={<ApiIcon />} title={"APIs"}>
                <ButtonGroup>

                    {/* <Show IF={user?.userType === 1 || user?.userType === 2}  > */}
                    {/* <Show IF={Permissions?.dltAction}  > */}
                    {/* <Button.Ripple size="sm" color="primary" onClick={() => handleImport()} outline>
                                <Download size="14" />    Import DLT Template
                            </Button.Ripple> */}
                    {/* </Show> */}
                    {/* <Show IF={Permissions?.dltCreate}> */}
                    <AddApi Component={Button.Ripple} size="sm" color={"primary"} preload={preload}><Plus size="14" />Add Api</AddApi>
                    {/* </Show> */}


                    <UncontrolledTooltip target="reload">Refresh Data</UncontrolledTooltip>
                    <UncontrolledTooltip target="filteree">Filter</UncontrolledTooltip>
                    <Button.Ripple size="sm" color="secondary" id="filteree" onClick={() => { setShowFilter(true) }}>
                        <Sliders size="14" />
                    </Button.Ripple>
                    <Button.Ripple size="sm" color="dark" id="reload" onClick={() => { setFilterData({}); setReload(true); setResetIt(new Date()); reset() }}>
                        <RefreshCcw size="14" />
                    </Button.Ripple>
                </ButtonGroup>
            </Header>

            <Card>
                {/* <CardHeader className='border-bottom inline'>
                
                </CardHeader> */}
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
                                columns={apiColumn}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                selectableRowsComponent={BootstrapCheckbox}
                                sortIcon={<ChevronDown size={10} />}
                                paginationComponent={CustomPagination}
                                data={api?.data}
                            />
                        </div>
                    </div>
                </>
                }

            </Card>
        </>
    )
}

export default APIDocList
