// @ts-nocheck
import { forwardRef, useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
// ** Third Party Components
import DataTable from 'react-data-table-component'
import { ChevronDown, Download, Edit, Eye, Plus, RefreshCcw, Search, Trash2 } from 'react-feather'
import ReactPaginate from 'react-paginate'

// ** Reactstrap Imports
import { useForm } from 'react-hook-form'
import {
    Button, ButtonGroup, Card,
    Col, Form, Input, Row
} from 'reactstrap'
import { contactGroupDelete } from '../../redux/reducers/contactGroup'
import { deleteContactGroup, loadContactGroup } from '../../utility/apis/contactGroup'
import ConfirmAlert from '../../utility/helpers/ConfirmAlert'
import Shimmer from '../components/shimmers/Shimmer'
import AddPhoneBook from './AddPhoneBook'
import ViewPhoneBook from './ViewPhoneBook'
// ** Styles
import '@styles/react/libs/tables/react-dataTable-component.scss'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import ImportContactNumber from './ImportContactNumber'


const PhoneBookList = () => {
    const contactList = useSelector(a => a.contactGroup.contactGroup)
    const [phoneBook, setPhoneBook] = useState(null)
    const [loading, setLoading] = useState(false)
    const [modal, setModal] = useState(false)
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
    const [formModal, setFormModal] = useState(false)
    const [showFilter, setShowFilter] = useState(false)
    const [deleted, setDeleted] = useState(false)
    const [failed, setFailed] = useState(false)
    const [deletedId, setDeletedId] = useState(null)
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
    const [page, setPage] = useState(1)
    const [viewPhoneBook, setViewPhoneBook] = useState(false)
    const [editId, setEditId] = useState(null)
    const [perPage, setPerPage] = useState(15)
    const [showModal, setShowModal] = useState(false)
    const [editData, setEditData] = useState([])
    const [reload, setReload] = useState(false)
    const [rowsSelected, setRowsSelected] = useState([])
    const [filterData, setFilterData] = useState({
        per_page_record: 15
    })
    const [importModal, setImportModal] = useState(false)
    const handleImport = () => setImportModal(!importModal)
    const dispatch = useDispatch()
    const [resetIt, setResetIt] = useState(new Date())


    const preload = () => {
        loadContactGroup({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: (e) => {
                // setPhoneBook(e)
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

        })


    }

    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])

    const handleClose = (e) => {
        if (e === false) {
            setShowFilter(e)
            setShowModal(false)
        }
    }

    useEffect(() => {
        preload()
    }, [filterData])

    const handleFilterModal = () => setShowFilter(!showFilter)


    const handleModal = () => setModal(!modal)

    const handleViewModal = () => setFormModal(!formModal)

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        loadContactGroup({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            // success: setPhoneBook,
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
        // setFilterData()
        preload()
    }

    const phoneBookColumn = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "Group Name",
            selector: r => r.group_name,
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Total Numbers",
            selector: r => r.contact_numbers_count,
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Created By",
            selector: (row) => (row?.user?.name),
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

                        <Button.Ripple className="waves-effect btn btn-success btn-sm" onClick={() => { setViewPhoneBook(true); setEditData(row) }}>
                            <Eye size={15} />
                        </Button.Ripple>

                        <Button.Ripple className="waves-effect btn btn-primary btn-sm" onClick={() => { setShowModal(true); setEditData(row) }}>
                            <Edit size={15} />
                        </Button.Ripple>
                        {/* <AddPhoneBook Component={Button.Ripple} size="sm" color={"secondary"} edit={row}> <Edit size={15} /> </AddPhoneBook> */}
                        <ConfirmAlert
                            title={`Delete ${row?.group_name} ?`}
                            color='text-warning'
                            onClickYes={() => deleteContactGroup({ id: row?.id, loading: setLoading, success: e => { setDeletedId(row?.id); setDeleted(e) }, error: setFailed })}
                            // onClickYes={() => deletePrimaryRoute({ id: row?.id, loading: setLoading, success: setDeleted, error: setFailed })}
                            onSuccess={deleted}
                            onFailed={failed}
                            isClearable={true}
                            onClose={(e) => {
                                if (e) {
                                    dispatch(contactGroupDelete(deletedId))
                                }
                                setDeleted(null)
                                setFailed(null)
                            }}
                            className=" btn btn-danger btn-sm"
                            id={`grid-delete-${row?.id}`}>
                            <Trash2 size={15} />
                        </ConfirmAlert>
                    </ButtonGroup >
                )
            }
        }
    ]

    const CustomPagination = () => {
        const count = Math.ceil(contactList?.total / contactList?.per_page)
        return (
            <ReactPaginate
                initialPage={contactList?.current_page - 1}
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
            <AddPhoneBook Component={Button.Ripple} edit={editData} size="sm" color={"secondary"} preload={preload} showModal={showModal} setShowModal={setShowModal} noView />
            <ViewPhoneBook Component={Button.Ripple} edit={editData} size="sm" color={"secondary"} showModal={viewPhoneBook} setShowModal={setViewPhoneBook} noView />
            <Header icon={""} title="Group Management">
                <ButtonGroup>
                    <Button.Ripple size="sm" color="dark" onClick={() => handleImport()}>
                        <Download size="14" on /> Import Contact
                    </Button.Ripple>
                    <AddPhoneBook Component={Button.Ripple} preload={preload} size="sm" color={"primary"} id="add" > <Plus size='14' /> Add Group</AddPhoneBook>
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
                                name={"group_name"}
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
                                columns={phoneBookColumn}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                selectableRowsComponent={BootstrapCheckbox}
                                sortIcon={<ChevronDown size={10} />}
                                paginationComponent={CustomPagination}
                                data={contactList?.data}
                            // onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div>
                </>
                }

            </Card>
            <ImportContactNumber
                importModal={importModal}
                preload={preload}
                setImportModal={setImportModal}
                handleImport={handleImport}
                filterData={filterData}
            />
        </>
    )
}

export default PhoneBookList
