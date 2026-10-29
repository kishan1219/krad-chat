// @ts-nocheck
import { forwardRef, useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
// ** Third Party Components
import DataTable from 'react-data-table-component'
import { ChevronDown, Edit, Eye, Plus, RefreshCcw, Search, Sliders, Trash2 } from 'react-feather'
import ReactPaginate from 'react-paginate'
import { Link } from 'react-router-dom'
import {
    Badge,
    Button, ButtonGroup, Card, CardHeader, CardTitle, Col, DropdownItem, DropdownMenu, DropdownToggle, Form, Input, Row, UncontrolledButtonDropdown, UncontrolledTooltip
} from 'reactstrap'
import Shimmer from '../components/shimmers/Shimmer'

// ** Reactstrap Imports
import { useForm } from 'react-hook-form'
import { actionSenderIds, deleteSenderIds, loadSenderIds } from '../../utility/apis/senderIds'
import { deleteSenderIdsRedux } from '../../redux/reducers/manageSender'
import AddSenderID from './AddSenderID'
import AddSenderIDAction from './AddSenderIDAction'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import ActionSenderID from './ActionSenderID'
import { AssignmentInd, ForwardToInbox, KeyboardVoice } from '@mui/icons-material'
import Show from '../../utility/Show'
import ConfirmAlert from '../../utility/helpers/ConfirmAlert'
import Header from '../components/header'
import { Permissions } from '../../utility/Permissions'
import FilterSender from './FilterSender'
import Hide from '../../utility/Hide'
import { log } from '../../utility/helpers/common'
import FormGroupCustom from '../components/formGroupCustom'
import LoadingButton from '../components/buttons/LoadingButton'
import UnsubscribeIcon from '@mui/icons-material/Unsubscribe'
import BsTooltip from '../components/tooltip'
import ConfirmStop from '../../utility/helpers/ConfirmStop'


const SenderList = () => {

    const user = useSelector(state => state.auth.userData)
    const senderList = useSelector(a => a.managerSender.senderId)
    // const [sender, setSender] = useState(null)
    const [loading, setLoading] = useState(false)
    const [formModal, setFormModal] = useState(false)
    const [deleted, setDeleted] = useState(false)
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
    const [failed, setFailed] = useState(false)
    const [deletedId, setDeletedId] = useState(null)
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
    const [showFilter, setShowFilter] = useState(false)
    const [editId, setEditId] = useState(null)
    const [rowsSelected, setRowsSelected] = useState([])
    const [filterData, setFilterData] = useState({
        per_page_record: 15
    })
    const [reload, setReload] = useState(false)
    const [userModal, setUserModal] = useState(false)
    const handleModal = () => setUserModal(!userModal)
    const dispatch = useDispatch()
    const [resetIt, setResetIt] = useState(new Date())


    const preload = (data) => {
        loadSenderIds({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: (e) => {
                // setSender(e)
            },
            loading: setLoading,
            jsonData: {
                ...filterData,
                search: filterData?.search
            }
        })
    }

    const submitFilter = (d) => {
        setFilterData({
            ...d
            // filterData
        })
        // console.log(d)

    }

    useEffect(() => {
        preload()
    }, [filterData])

    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])


    const handleViewModal = () => setFormModal(!formModal)

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        loadSenderIds({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            dispatch,
            loading: setLoading
        })
    }

    const handleReportChange = ({ selectedRows }) => {

        const selectedR = selectedRows.map((item, index) => {
            return item.id
        })
        setRowsSelected(selectedR)

    }

    const deleteTheSender = (row) => {
        deleteSenderIds({
            id: row,
            // dispatch,
            jsonData: {

                // send_sms_id: row

            },
            success: (e) => {
                //    preload()
            }
        })
    }

    const senderColumn = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
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
            name: "Sender ID",
            selector: r => r.sender_id,
            sortable: true,
            maxWidth: '150px'
        },
        {
            name: "Company Name",
            selector: r => r.company_name,
            sortable: true,
            minWidth: '170px'
        },
        // {
        //     name: "Type",
        //     selector: (row) => (Number(row?.sender_id_type) === 1 ? "Transactional" : "Promotional"),
        //     sortable: true,
        //     minWidth: '140px'
        // },
        {
            name: "Type",
            selector: (r) => {
                if (r?.sender_id_type === 1) {
                    return (
                        <BsTooltip title="Transactional">
                            <ForwardToInbox color='success' style={{ cursor: 'pointer' }} />
                        </BsTooltip>
                    )
                } else if (r?.sender_id_type === 2) {
                    return (
                        <BsTooltip title="Promotional">
                            <UnsubscribeIcon color='danger' style={{ cursor: 'pointer' }} />
                        </BsTooltip>

                    )
                } else if (r?.sender_id_type === 4) {

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
            name: "Status",
            selector: (row) => (Number(row?.status) === 1 ? <Badge color='success' className='badge-glow'>Active</Badge> : <Badge color='danger' className='badge-glow'>In-Active</Badge>),
            sortable: true,
            maxWidth: '120px'
        },
        {
            name: "actions",
            allowOverflow: true,
            maxWidth: '120px',
            cell: row => {
                return (
                    <ButtonGroup>
                        <Show IF={Permissions?.senderEdit}>

                            <AddSenderID Component={Button.Ripple} size="sm" color={"primary"} preload={preload} edit={row}> <Edit size={15} /> </AddSenderID>
                        </Show>

                        <Show IF={Permissions?.senderDelete}>
                            {/* <ConfirmAlert
                                title={`Delete ${row?.sender_id} ?`}
                                color='text-warning'
                                onClickYes={() => deleteSenderIds({ id: row?.id, loading: setLoading, success: e => { setDeletedId(row?.id); setDeleted(e) }, error: setFailed })}
                                // onClickYes={() => deletePrimaryRoute({ id: row?.id, loading: setLoading, success: setDeleted, error: setFailed })}
                                onSuccess={deleted}
                                onFailed={failed}

                                onClose={(e) => {
                                    if (e) {
                                        dispatch(deleteSenderIdsRedux(deletedId))
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
                                title={`Delete  ${row?.sender_id} ?`}
                                color='text-warning'
                                onClickYes={() => deleteTheSender(row?.id)}
                                text={'no-text'}
                                onSuccessEvent={(item) => { preload() }}
                                onFailedEvent={((item) => { })}
                                className="waves-effect btn btn-danger btn-sm"
                                style={{ cursor: 'pointer' }}
                                id={`grid-delete-${row?.id}`}>
                                <Trash2 size={15}  />
                            </ConfirmStop>
                        </Show>
                    </ButtonGroup>
                )
            }
        }
    ]

    const CustomPagination = () => {
        const count = Math.ceil(senderList?.total / senderList?.per_page)
        return (
            <ReactPaginate
                initialPage={senderList?.current_page - 1}
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
            actionSenderIds({
                // id: edit?.id,
                jsonData: {
                    status: 1,
                    manage_sender_ids: rowsSelected

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
            actionSenderIds({
                // id: edit?.id,
                jsonData: {
                    status: 0,
                    manage_sender_ids: rowsSelected

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
            <Header icon={""} title={"Sender IDs"}>
                <ButtonGroup>
                    <Show IF={Permissions?.senderCreate}>
                        <AddSenderID Component={Button.Ripple} size="sm" color={"primary"}> <Plus size='14' /> Add Sender ID</AddSenderID>
                    </Show>
                    <Hide IF={user?.userType === 2}>
                        <Button.Ripple size="sm" color="dark" onClick={() => handleModal()} >
                            <AssignmentInd style={{ fontSize: 14 }} />   Assign Sender ID
                        </Button.Ripple>
                    </Hide>
                    <UncontrolledTooltip target="reload">refresh data</UncontrolledTooltip>
                    <UncontrolledTooltip target="filteree">Filter</UncontrolledTooltip>
                    <Button.Ripple size="sm" color="secondary" id="filteree" onClick={() => { setShowFilter(true) }}>
                        <Sliders size="14" on />
                    </Button.Ripple>
                    <Button.Ripple size="sm" color="dark" id="reload" onClick={() => { setFilterData({}); setReload(true); setResetIt(new Date()); reset() }} >
                        <RefreshCcw size="14" />
                    </Button.Ripple>
                </ButtonGroup>
            </Header>
            <Card>
                <Show IF={Permissions?.senderAction}>
                    <Row className='justify-content-between mx-0'>
                        <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                            <CardHeader>
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
                                columns={senderColumn}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                selectableRowsComponent={BootstrapCheckbox}
                                sortIcon={<ChevronDown size={10} />}
                                paginationComponent={CustomPagination}
                                data={senderList?.data}
                                onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div>
                </>
                }

            </Card>
            <ActionSenderID
                // open={userModal}
                userModal={userModal}
                setUserModal={setUserModal}
                handleModal={handleModal}
                filterData={filterData}
                preload={preload}
            />
            <FilterSender show={showFilter} filterData={filterData} setFilterData={e => {
                setCurrentPage(1)
                setFilterData(e)
            }} handleFilterModal={() => { setShowFilter(false) }} />
        </>
    )
}

export default SenderList
