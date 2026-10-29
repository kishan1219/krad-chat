// @ts-nocheck
import SimCardDownload from '@mui/icons-material/SimCardDownload'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, Code, Download, Eye, RefreshCcw, Search, Sliders, Trash2 } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, ButtonGroup, Card, Col, Form, Input, Row, UncontrolledTooltip } from 'reactstrap'
import { whatsappTemplateDelete } from '../../redux/reducers/whatsappTemplate'
import { Permissions } from '../../utility/Permissions'
import Show from '../../utility/Show'
import { deleteWhatsappTemplate, downloadSampleFileWa, loadWhatsappTemplate, whatsappGeneratePull } from '../../utility/apis/whatsappTemplate'
import ConfirmAlert from '../../utility/helpers/ConfirmAlert'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import Shimmer from '../components/shimmers/Shimmer'
import TemplateFilter from './Filter/TemplateFilter'
import ViewWhatsappTemplate from './ViewWhatsappTemplate'
import WhatsappTemplatePull from './WhatsappTemplatePull'
import WhatsappTemplatePayloadPage from './WhatsappTemplatePayloadPage'


const MessageTemplate = () => {
    const user = useSelector(state => state.auth.userData)
    const template = useSelector(a => a.whatsappTemplate.whatsappTemplate)
    const [showFilter, setShowFilter] = useState(false)
    const [loading, setLoading] = useState(false)
    const [modal, setModal] = useState(false)
    const [formModal, setFormModal] = useState(false)
    const [deleted, setDeleted] = useState(false)
    const [failed, setFailed] = useState(false)
    const [deletedId, setDeletedId] = useState(null)
    const [currentPage, setCurrentPage] = useState("1")
    const [payload, setPayload] = useState(null)
    const [editData, setEditData] = useState(null)
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
    const [rowsSelected, setRowsSelected] = useState([])
    const [payloadModal, setPayloadModal] = useState(false)
    const [filterData, setFilterData] = useState({
        // per_page_record: 15
    })
    const [reload, setReload] = useState(false)
    const [resetIt, setResetIt] = useState(new Date())
    const navigate = useNavigate()

    const customTemplate = () => {
        navigate('/custom-template')
    }

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

    const preload = (data) => {
        loadWhatsappTemplate({
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

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        loadWhatsappTemplate({
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

    const downloadNormalFile = (row) => {
        downloadSampleFileWa({
            id: row,
            type: "normal",
            loading: setLoading,
            success: (e) => {
                window.open(e, "_blank")
            }
        })


    }
    const downloadCustomFile = (row) => {
        downloadSampleFileWa({
            id: row,
            type: "custom",
            loading: setLoading,
            success: (e) => {
                window.open(e, "_blank")
            }
        })

    }

    const viewWhatsappPayload = (row) => {
        whatsappGeneratePull({
            whats_app_template_id: row.id,
            user_id: row?.user_id,
            loading: setLoading,
            success: (e) => {
                setPayload(e)
            }

        })
    }

    let templateColumn = []
    if (user?.userType === 0 || user?.userType === 3) {
        templateColumn = [

            {
                name: "#",
                cell: (row, index) => {
                    return (rowsPerPage * (currentPage - 1)) + (index + 1)
                },
                maxWidth: "10px"
            },
            {
                name: "User Name",
                selector: row => row?.name,
                sortable: true,
                minWidth: '170px'
            },
            {
                name: "Verified Name",
                selector: row => row?.verified_name,
                sortable: true,
                minWidth: '170px'
            },
          

            {
                name: "Template Name",
                selector: row => row?.template_name,
                sortable: true,
                minWidth: '190px'
            },
            {
                name: "Category",
                selector: row => row?.category,
                sortable: true,
                minWidth: '190px'
            },

            {
                name: "Template ID",
                selector: row => row?.wa_template_id,
                sortable: true,
                minWidth: '190px'
            },
            {

                name: "Template Type",
                selector: row => row?.template_type,
                sortable: true,
                minWidth: '190px'
            },
            // {
            //     name: "Language",
            //     selector: 'template_language',
            //     sortable: true,
            //     minWidth: '190px'
            // },
            {
                name: "Media",

                selector: (r) => (r?.media_type ?? 'N/A'),
                sortable: true,
                minWidth: '200px'
            },
            {
                name: "Whatsapp Status",

                selector: row => {
                    if (String(row?.wa_status).toLowerCase() === "approved") {
                        return <Badge color='success' >Approved</Badge>
                    } else if (String(row?.wa_status).toLowerCase() === "pending") {
                        return <Badge color='warning' >Pending</Badge>
                    } else if (String(row?.wa_status).toLowerCase() === "rejected") {
                        return <Badge color='danger' >Rejected</Badge>
                    } else {
                        return <Badge color='info'>
                            {row?.wa_status}
                        </Badge>
                    }
                },
                sortable: true,
                minWidth: '200px'
            },

            {
                name: "actions",
                allowOverflow: true,
                minWidth: '170px',
                cell: row => {
                    return (
                        <ButtonGroup>
                            <UncontrolledTooltip title='View Template Payload' target='payload-form'>
                                View Template Payload
                            </UncontrolledTooltip>
                            <Button.Ripple size="sm" color={"primary"} id='payload-form' onClick={() => { viewWhatsappPayload(row); setPayloadModal(true); setEditData(payload) }}><Code size={15} /></Button.Ripple>

                            <UncontrolledTooltip title='Download Sample File' target='normal-form'>
                                Click here to download sample file (Normal Template)
                            </UncontrolledTooltip>

                            <Button.Ripple size="sm" id='normal-form' color={"info"} onClick={() => downloadNormalFile(row?.id)}><Download size={15} /></Button.Ripple>


                            <UncontrolledTooltip title='Download Custom File' target='custom-form'>
                                Click here to download sample file (Custom Template)
                            </UncontrolledTooltip>

                            <Button.Ripple size="sm" id='custom-form' color={"warning"} onClick={() => downloadCustomFile(row?.id)}><SimCardDownload fontSize='sm' /></Button.Ripple>

                            <Show IF={Permissions?.whatsappTemplateView}>
                                <ViewWhatsappTemplate Component={Button.Ripple} size="sm" color={"success"} edit={row}> <Eye size={15} /> </ViewWhatsappTemplate>
                            </Show>

                            <Show IF={Permissions?.whatsappTemplateDelete}>
                                <ConfirmAlert
                                    title={`Delete ${row?.template_name} ?`}
                                    color='text-warning'
                                    onClickYes={() => deleteWhatsappTemplate({ id: row?.id, loading: setLoading, success: e => { setDeletedId(row?.id); setDeleted(e) }, error: setFailed })}
                                    // onClickYes={() => deletePrimaryRoute({ id: row?.id, loading: setLoading, success: setDeleted, error: setFailed })}
                                    onSuccess={deleted}
                                    onFailed={failed}
                                    onClose={(e) => {
                                        if (e) {
                                            dispatch(whatsappTemplateDelete(deletedId))
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

    } else {
        templateColumn = [
            {
                name: "#",
                cell: (row, index) => {
                    return (rowsPerPage * (currentPage - 1)) + (index + 1)
                },
                maxWidth: "10px"
            },
            {
                name: "Verified Name",
                selector: row => row?.verified_name,
                sortable: true,
                minWidth: '170px'
            },

            {
                name: "Template Name",
                selector: row => row?.template_name,
                sortable: true,
                minWidth: '190px'
            },
            {
                name: "Template ID",
                selector: row => row?.wa_template_id,
                sortable: true,
                minWidth: '190px'
            },
            {
                name: "Template Type",
                selector: row => row?.template_type,
                sortable: true,
                minWidth: '190px'
            },
            {
                name: "Language",
                selector: row => row?.template_language,
                sortable: true,
                minWidth: '190px'
            },

            {
                name: "Media",

                selector: (r) => (r?.media_type ?? 'N/A'),
                sortable: true,
                minWidth: '200px'
            },
            // {
            //     name: "Whatsapp Status",

            //     selector: (r) => (r?.wa_status ?? 'N/A'),
            //     sortable: true,
            //     minWidth: '200px'
            // },
            {
                name: "Whatsapp Status",

                selector: row => {
                    if (String(row?.wa_status).toLowerCase() === "approved") {
                        return <Badge color='success' >Approved</Badge>
                    } else if (String(row?.wa_status).toLowerCase() === "pending") {
                        return <Badge color='warning' >Pending</Badge>
                    } else if (String(row?.wa_status).toLowerCase() === "rejected") {
                        return <Badge color='danger' >Rejected</Badge>
                    } else {
                        return <Badge color='info'>
                            {row?.wa_status}
                        </Badge>
                    }
                },
                sortable: true,
                minWidth: '200px'
            },
            {
                name: "actions",
                allowOverflow: true,
                minWidth: '170px',
                cell: row => {
                    return (
                        <ButtonGroup>
                            {/* <UncontrolledTooltip title='View Template Payload' target='payload-form'>
                               View Template Payload
                            </UncontrolledTooltip> */}

                            {/* <Button.Ripple size="sm" color={"info"} onClick={() => downloadNormalFile(row?.id)}>werewr</Button.Ripple> */}

                            <UncontrolledTooltip title='View Template Payload' target='payload-form'>
                                View Template Payload
                            </UncontrolledTooltip>
                            <Button.Ripple size="sm" color={"primary"} id='payload-form' onClick={() => { viewWhatsappPayload(row); setPayloadModal(true); setEditData(payload) }}><Code size={15} /></Button.Ripple>
                            <UncontrolledTooltip title='Download Sample File' target='download-form'>
                                Click here to download sample file (Normal Template)
                            </UncontrolledTooltip>

                            <Button.Ripple size="sm" id='download-form' color={"info"} onClick={() => downloadNormalFile(row?.id)}><Download size={15} /></Button.Ripple>

                            <UncontrolledTooltip title='Download Custom File' target='download-custom'>
                                Click here to download sample file (Custom Template)
                            </UncontrolledTooltip>

                            <Button.Ripple size="sm" id='download-custom' color={"primary"} onClick={() => downloadCustomFile(row?.id)}><SimCardDownload fontSize='sm' /></Button.Ripple>

                            <Show IF={Permissions?.whatsappTemplateView}>
                                <ViewWhatsappTemplate Component={Button.Ripple} size="sm" color={"success"} edit={row}> <Eye size={15} /> </ViewWhatsappTemplate>
                            </Show>


                            {/* <Show IF={Permissions?.whatsappTemplateEdit}>
                            <WhatsappTemplatePull Component={Button.Ripple} size="sm" color={"primary"} edit={row}><Edit size={15} /></WhatsappTemplatePull>
                          
                        </Show> */}
                            <Show IF={Permissions?.whatsappTemplateDelete}>
                                <ConfirmAlert
                                    title={`Delete ${row?.template_name} ?`}
                                    color='text-warning'
                                    onClickYes={() => deleteWhatsappTemplate({ id: row?.id, loading: setLoading, success: e => { setDeletedId(row?.id); setDeleted(e) }, error: setFailed })}
                                    // onClickYes={() => deletePrimaryRoute({ id: row?.id, loading: setLoading, success: setDeleted, error: setFailed })}
                                    onSuccess={deleted}
                                    onFailed={failed}
                                    onClose={(e) => {
                                        if (e) {
                                            dispatch(whatsappTemplateDelete(deletedId))
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
    }


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

    return (
        <>
            <WhatsappTemplatePayloadPage Component={Button.Ripple} size="sm" color={"info"} preload={preload} id='payload' edit={payload} showModal={payloadModal} setShowModal={() => setPayloadModal(false)} noView />
            <Header icon={""} title={"Whatsapp Templates"}>
                <ButtonGroup>

                    {/* <Show IF={user?.userType === 1 || user?.userType === 2}  > */}
                    {/* <Show IF={Permissions?.dltAction}  > */}
                    {/* <Button.Ripple size="sm" color="primary" onClick={() => handleImport()} outline>
                                <Download size="14" />    Import DLT Template
                            </Button.Ripple> */}
                    {/* </Show> */}

                    <Show IF={Permissions?.whatsappTemplateCreate}>
                        <WhatsappTemplatePull Component={Button.Ripple} size="sm" color={"primary"} preload={preload} >Pull Whatsapp Template WABA</WhatsappTemplatePull>
                    </Show>
                    <Show IF={Permissions?.whatsappTemplateCreate}>
                        <Button.Ripple size="sm" color="dark" onClick={() => { customTemplate() }}>
                            Create Template
                        </Button.Ripple>
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
                                columns={templateColumn}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
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
            <TemplateFilter show={showFilter} filterData={filterData} setFilterData={e => {
                setCurrentPage(1)
                setFilterData(e)
            }} handleFilterModal={() => { setShowFilter(false) }} />

        </>
    )
}

export default MessageTemplate
