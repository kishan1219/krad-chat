// @ts-nocheck
import AssignmentInd from '@mui/icons-material/AssignmentInd'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import React, { forwardRef, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, Download, Edit, Eye, Plus, RefreshCcw, Search, Sliders, Trash2 } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Badge, Button, ButtonGroup, Card, Col, Form, Input, Row, UncontrolledTooltip } from 'reactstrap'
import { dltDelete } from '../../redux/reducers/dlt'
import Hide from '../../utility/Hide'
import { Permissions } from '../../utility/Permissions'
import Show from '../../utility/Show'
import { deleteDlt, loadDlt } from '../../utility/apis/dlt'
import ConfirmAlert from '../../utility/helpers/ConfirmAlert'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import Shimmer from '../components/shimmers/Shimmer'
import AddDlt from './AddDlt'
import AssignUser from './AssignUser'
import ChangeTemplatePriority from './ChangeTemplatePriority'
import FilterTemplate from './FilterTemplate'
import ImportDlt from './ImportDlt'
import ViewDlt from './ViewDlt'
import { useNavigate } from 'react-router-dom'
import AssignTemplateGroup from './TemplateGroup/AssignTemplateGroup'
import ConfirmStop from '../../utility/helpers/ConfirmStop'
import useUser from '../../utility/hooks/useUser'

const DltTemplate = () => {

    // const [template, setTemplate] = useState(null)
    const user = useSelector(state => state.auth.userData)
    const template = useSelector(a => a.dltList.dlt)
    const [showFilter, setShowFilter] = useState(false)
    const [loading, setLoading] = useState(false)
    const [modal, setModal] = useState(false)
    const [formModal, setFormModal] = useState(false)
    const [deleted, setDeleted] = useState(false)
    const navigate = useNavigate()
    const [failed, setFailed] = useState(false)
    // const user = useUser()
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
    const [importModal, setImportModal] = useState(false)
    const [userModal, setUserModal] = useState(false)
    const [templateModal, setTemplateModal] = useState(false)
    const [rowsSelected, setRowsSelected] = useState([])
    const [filterData, setFilterData] = useState({
        // per_page_record: 15
    })
    const [reload, setReload] = useState(false)
    const [resetIt, setResetIt] = useState(new Date())

    const submitFilter = (d) => {
        setFilterData({
            ...d
            // filterData
        })
        // console.log(d)

    }
    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])

    const dispatch = useDispatch()

    const handleImport = () => setImportModal(!importModal)
    const handleModal = () => setUserModal(!userModal)
    const handleTemplateModal = () => setTemplateModal(!templateModal)


    const preload = (data) => {
        loadDlt({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: (e) => {
                // setTemplate(e)
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


    const deleteTheDlt = (row) => {
        deleteDlt({
            id: row,
            success: () => {
            }
        })
    }

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        loadDlt({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            // success: setTemplate,
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

    const templatePriority = (r) => {
        if (r?.priority === "0") {
            return (
                <Show IF = {user?.userType === 0 || user?.userType === 3} >
                <Badge color='danger' className='mt-1'>Normal</Badge>
                </Show>
            )
        } else if (r?.priority === "1") {
            return (
                <Show IF={user?.userType === 0 || user?.userType === 3} >
                <Badge color='primary' className='mt-1'>Medium</Badge>
                </Show>
            )
        } else if (r?.priority === "2") {
            return (
                <Show IF={user?.userType === 0 || user?.userType === 3} >
                <Badge color='info' className='mt-1'>Fast</Badge>
                </Show>
            )
        } else if (r?.priority === "3") {
            return (
                <Show IF={user?.userType === 0 || user?.userType === 3} >
                <Badge color='success' className='mt-1'>Instant</Badge>
                </Show>
            )
        }
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
            name: "Temp Name",
            // selector: r => r.template_name,
            selector : (r) => {
                return (
                    <>
                        <span >{r?.template_name} <br />  {templatePriority(r)} </span>
                    </>
                )
            },
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Message",
            cell: (row, index) => {
                return (<span className='text-wrap'>{row?.dlt_message}</span>)
            },
            sortable: true,
            minWidth: '400px'
        },
        {
            name: "Template ID",
            selector: r => r.dlt_template_id,
            sortable: true,
            minWidth: '190px'
        },
        {
            name: "Entity ID",
            selector: r => r.entity_id,
            sortable: true,
            minWidth: '190px'
        },
        {
            name: "Header ID",
            selector: r => r.header_id,
            sortable: true,
            minWidth: '190px'
        },
        {
            name: "Assign To",
            selector: (row) => (row?.name),
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Unicode",
            selector: (row) => (Number(row?.is_unicode) === 1 ? <Badge color='info' className='badge-glow'>Yes</Badge> : <Badge color='warning' className='badge-glow'>No</Badge>),
            sortable: true,
            minWidth: '140px'
        },

        {
            name: "Status",
            selector: (row) => (Number(row?.status) === 1 ? <Badge color='success' className='badge-glow'>Active</Badge> : <Badge color='danger' className='badge-glow'>In-Active</Badge>),
            sortable: true,
            minWidth: '140px'
        },

        {
            name: "actions",
            allowOverflow: true,
            minWidth: '170px',
            cell: row => {
                return (
                    <ButtonGroup>
                        <Show IF={Permissions?.dltView}>
                            <ViewDlt Component={Button.Ripple} size="sm" color={"success"} edit={row}> <Eye size={15} /> </ViewDlt>
                        </Show>

                        <Show IF={Permissions?.dltEdit}>
                            <AddDlt Component={Button.Ripple} size="sm" color={"secondary"} edit={row}> <Edit size={15} /> </AddDlt>
                        </Show>
                        <Show IF={Permissions?.dltDelete}>
                            {/* <ConfirmAlert
                                title={`Delete ${row?.template_name} ?`}
                                color='text-warning'
                                onClickYes={() => deleteDlt({ id: row?.id, loading: setLoading, success: e => { setDeletedId(row?.id); setDeleted(e) }, error: setFailed })}
                                // onClickYes={() => deletePrimaryRoute({ id: row?.id, loading: setLoading, success: setDeleted, error: setFailed })}
                                onSuccess={deleted}
                                onFailed={failed}
                                onClose={(e) => {
                                    if (e) {
                                        dispatch(dltDelete(deletedId))
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
                                title={`Delete  ${row?.template_name} ?`}
                                color='text-warning'
                                onClickYes={() => deleteTheDlt(row?.id)}
                                // onSuccessEvent={(item) => { dispatch(userDelete(item?.id)); preload() }}
                                // onFailedEvent={((item) => { })}
                                onSuccessEvent={(item) => { preload() }}
                                onFailedEvent={((item) => { })}
                                className="waves-effect btn btn-danger btn-sm"
                                style={{cursor:"pointer"}}
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
        const count = Math.ceil(template?.total / template?.per_page)
        return (
            <ReactPaginate
                initialPage={template?.current_page - 1}
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
            <Header icon={""} title={"DLT Template List"}>
                <Show IF={Permissions?.dltIsVisible}>
                <ButtonGroup>
                    <Button.Ripple size="sm" color="primary"  onClick={() => { navigate('/template-group-list') }} >
                        Template Group List
                    </Button.Ripple>
                    <Button.Ripple size="sm" color="dark" onClick={() => handleTemplateModal()} >
                        <AssignmentInd style={{ fontSize: 14 }} />   Assign Template Group
                    </Button.Ripple>
                </ButtonGroup>
                </Show>
            </Header>

            <Card>
                {/* <CardHeader className='border-bottom inline'>
                
                </CardHeader> */}
                <Row className='justify-content-between mx-0'>
                    <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
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
                    <Col className='d-flex align-items-center justify-content-end mt-1' md='9' sm='12'>
                        <ButtonGroup>

                            {/* <Show IF={user?.userType === 1 || user?.userType === 2}  > */}
                            {/* <Show IF={Permissions?.dltAction}  > */}
                            <Show IF={Permissions?.dltCreate}>
                                <AddDlt Component={Button.Ripple} size="sm" color={"primary"}><Plus size="14" /> DLT Template</AddDlt>
                            </Show>
                            <Button.Ripple size="sm" color="primary" onClick={() => handleImport()} outline>
                                <Download size="14" />    Import DLT Template
                            </Button.Ripple>
                            {/* </Show> */}
                            

                            <Hide IF={user?.userType === 2}>
                                <Button.Ripple size="sm" color="dark" onClick={() => handleModal()} >
                                    <AssignmentInd style={{ fontSize: 14 }} />   Assign DLT
                                </Button.Ripple>
                            </Hide>

                            <Show IF={user?.userType === 0 || user?.userType === 3} >
                                <ChangeTemplatePriority Component={Button.Ripple} size="sm" color={"info"} preload={preload}> Change Priority </ChangeTemplatePriority>
                            </Show>

                            <UncontrolledTooltip target="reload">Refresh Data</UncontrolledTooltip>
                            <UncontrolledTooltip target="filteree">Filter</UncontrolledTooltip>
                            <Button.Ripple size="sm" color="secondary" id="filteree" onClick={() => { setShowFilter(true) }}>
                                <Sliders size="14" />
                            </Button.Ripple>
                            <Button.Ripple size="sm" color="dark" id="reload" onClick={() => { setFilterData({}); setReload(true); setResetIt(new Date()); reset() }}>
                                <RefreshCcw size="14" />
                            </Button.Ripple>
                        </ButtonGroup>
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
                                columns={activityColumn}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                selectableRowsComponent={BootstrapCheckbox}
                                sortIcon={<ChevronDown size={10} />}
                                paginationComponent={CustomPagination}
                                data={template?.data}
                                onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div>
                </>
                }

            </Card>

            <ImportDlt
                open={importModal}
                importModal={importModal}
                setImportModal={setImportModal}
                handleImport={handleImport}
                filterData={filterData}
                preload={preload}
            />

            <AssignUser
                open={userModal}
                userModal={userModal}
                setUserModal={setUserModal}
                handleModal={handleModal}
                filterData={filterData}
            />
            <AssignTemplateGroup
                open={templateModal}
                templateModal={templateModal}
                setTemplateModal={setTemplateModal}
                handleTemplateModal={handleTemplateModal}
                filterData={filterData}
            />
            <FilterTemplate show={showFilter} filterData={filterData} setFilterData={e => {
                setCurrentPage(1)
                setFilterData(e)
            }} handleFilterModal={() => { setShowFilter(false) }} />

        </>
    )
}

export default DltTemplate
