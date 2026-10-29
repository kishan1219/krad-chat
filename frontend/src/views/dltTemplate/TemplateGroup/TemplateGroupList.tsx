// @ts-nocheck
import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ArrowLeft, ChevronDown, Edit, Eye, Plus, RefreshCcw, Search, Trash2 } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, ButtonGroup, Card, Col, Form, Row, UncontrolledTooltip } from 'reactstrap'
import { Permissions } from '../../../utility/Permissions'
import Show from '../../../utility/Show'
import { deleteGroup, loadGroup } from '../../../utility/apis/templateGroup'
import ConfirmStop from '../../../utility/helpers/ConfirmStop'
import LoadingButton from '../../components/buttons/LoadingButton'
import FormGroupCustom from '../../components/formGroupCustom'
import Header from '../../components/header'
import Shimmer from '../../components/shimmers/Shimmer'
import AddTemplateGroup from './AddTemplateGroup'
import ViewTemplateGroup from './ViewTemplateGroup'


const TemplateGroupList = () => {
    const templateList = useSelector(a => a.group.group)
    const [templateGroupList, setTemplateGroupList] = useState()
    const [loading, setLoading] = useState(false)
    const [modal, setModal] = useState(false)
    const [formModal, setFormModal] = useState(false)
    const [deleted, setDeleted] = useState(false)
    const [failed, setFailed] = useState(false)
    const navigate = useNavigate()
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
    const [reload, setReload] = useState(false)
    const handleImport = () => setImportModal(!importModal)
    const dispatch = useDispatch()
    const [resetIt, setResetIt] = useState(new Date())
    const [filterData, setFilterData] = useState({
        per_page_record: 15
    })

    const preload = (data) => {
        loadGroup({
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
        })
    }

    const removeGroup = (row) => {
        deleteGroup({
            id: row,
            // dispatch,
            jsonData: {

                send_sms_id: row

            },
            success: (e) => {
                //    preload()
            }
        })
    }

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        loadGroup({
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

    const groupColumn = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "Template Group Name",
            selector: (row) => {
                return (
                    <>
                        <span>{row?.group_name}</span>
                    </>
                )
            },
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "User",
            selector: (row) => {
                return (
                    <>
                        <span>{row?.user?.name}</span>
                    </>
                )
            },
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Connected DLT Templates Count",
            selector: (row) => {
                return (
                    <>
                        <Badge color='primary'>  <span>{row?.dlt_templates_count}</span></Badge>
                    </>
                )
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

                        {/* <UncontrolledTooltip placement='top' id='edit' target='view'>
                            edit
                        </UncontrolledTooltip> */}
                        <Show IF={Permissions?.dltIsVisible}>
                            <UncontrolledTooltip placement='top' id='view' target='view'>
                                View
                            </UncontrolledTooltip>
                            <ViewTemplateGroup Component={Button.Ripple} size="sm" color={"success"} edit={row} id="view"> <Eye size={15} /> </ViewTemplateGroup>
                        </Show>
                        <Show IF={Permissions?.dltIsVisible}>
                            <UncontrolledTooltip placement='top' id='view' target='edit'>
                                Edit
                            </UncontrolledTooltip>
                            <AddTemplateGroup Component={Button.Ripple} size="sm" color={"secondary"} edit={row} id="edit"> <Edit size={15} /> </AddTemplateGroup>
                        </Show>

                        <Show IF={Permissions?.dltDelete}>
                            {/* <ConfirmAlert
                                title={`Delete ${row?.group_name} ?`}
                                color='text-warning'
                                onClickYes={() => deleteGroup({ id: row?.id, loading: setLoading, success: e => { setDeletedId(row?.id); setDeleted(e) }, error: setFailed })}
                                // onClickYes={() => deletePrimaryRoute({ id: row?.id, loading: setLoading, success: setDeleted, error: setFailed })}
                                onSuccess={deleted}
                                onFailed={failed}

                                onClose={(e) => {
                                    if (e) {
                                        dispatch(groupDelete(deletedId))
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
                                // eventId={`stop-campaign-${row?.id}`}
                                title={`Delete  ${row?.group_name} ?`}
                                color='text-warning'
                                onClickYes={() => removeGroup(row?.id)}
                                text={'no-text'}
                                onSuccessEvent={(item) => { preload() }}
                                onFailedEvent={((item) => { })}
                                className="waves-effect btn btn-danger btn-sm"
                                style={{ cursor: 'pointer' }}
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
        const count = Math.ceil(templateList?.total / templateList?.per_page)
        return (
            <ReactPaginate
                initialPage={templateList?.current_page - 1}
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
            <Header title="Template Group" icon={<ArrowLeft size={18} style={{ cursor: 'pointer' }} onClick={() => { navigate(-1) }} />} >
                <ButtonGroup>
                    
                    <Show IF={Permissions?.dltIsVisible}>
                        <AddTemplateGroup Component={Button.Ripple} size="sm" color={"primary"}><Plus size="14" />  Template Group</AddTemplateGroup>
                    </Show>
                    <UncontrolledTooltip target="reload">refresh data</UncontrolledTooltip>
                    <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { setFilterData({}); setReload(true); setResetIt(new Date()); reset() }} >
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
                                pagination
                                paginationServer
                                className='react-dataTable'
                                columns={groupColumn}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                // selectableRowsComponent={BootstrapCheckbox}
                                sortIcon={<ChevronDown size={10} />}
                                paginationComponent={CustomPagination}
                                data={templateList?.data}
                            // onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div>
                </>
                }
            </Card>
        </>
    )
}

export default TemplateGroupList
