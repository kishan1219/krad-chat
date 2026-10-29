// @ts-nocheck
import React, { forwardRef, useContext, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ArrowLeft, ChevronDown, Edit, Eye, MoreVertical, Trash, Trash2 } from 'react-feather'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button, ButtonGroup, Card, Input, UncontrolledTooltip } from 'reactstrap'
import { deleteTwoWay, loadTwoSms } from '../../../utility/apis/TwoWaySMS'
import Header from '../../components/header'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import Shimmer from '../../components/shimmers/Shimmer'
import BsTooltip from '../../components/tooltip'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import Show from '../../../utility/Show'
import { Permissions } from '../../../utility/Permissions'
import { twoWayDelete } from '../../../redux/reducers/TwoWay'
import ConfirmAlert from '../../../utility/helpers/ConfirmAlert'
import DropDownMenu from '../../components/dropdown'
import { IconSizes } from '../../../utility/Const'
import { getPath } from '../../../router/RouteHelper'
import BorderColor from '@mui/icons-material/BorderColor'
import DeleteForever from '@mui/icons-material/DeleteForever'
import ViewTwoWaySMS from './ViewTwoWaySMS'
import Visibility from '@mui/icons-material/Visibility'
import ConfirmStop from '../../../utility/helpers/ConfirmStop'

const TwoWaySMSList = () => {
    const { colors } = useContext(ThemeColors)

    const twoWay = useSelector(a => a?.twoWay?.twoWay)
    const [loading, setLoading] = useState(false)
    const [deleted, setDeleted] = useState(false)
    const [failed, setFailed] = useState(false)
    const [showFilter, setShowFilter] = useState(false)
    const [deletedId, setDeletedId] = useState(null)
    const [rowsPerPage] = useState("15")
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsSelected, setRowsSelected] = useState([])
    const [importModal, setImportModal] = useState(false)
    const [modal, setModal] = useState(false)
    const [editData, setEditData] = useState(null)
    const [detailModal, setDetailModal] = useState(false)
    const [filterData, setFilterData] = useState({
        per_page_record: 15,
        is_web_temp: 1
    })
    const [reload, setReload] = useState(false)
    const dispatch = useDispatch()

    const handleImport = () => setImportModal(!importModal)
    const navigate = useNavigate()
    const sendTwoWay = () => {
        navigate('/add-two-ways-sms')
    }
    const preload = (data) => {
        loadTwoSms({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: (e) => {
                // setDlr(e)
            },
            loading: setLoading,
            jsonData: filterData
        })
    }

    const deleteTheTwoWay = (row) => {
        deleteTwoWay({
            id: row,
            success: (e) => {
            }
        })
    }
    useEffect(() => {
        preload()
    }, [filterData])

    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        loadTwoSms({
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

    const twoWayColumn = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "Title",
            selector: (row) => (row?.title),
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "BG Color",
            // selector: (row) => (row?.bg_color ?? 'N/A'),
            selector: (row) => {
                return (
                    <>
                        <div style={{ backgroundColor: row?.bg_color, width: 60, height: 20, display: 'block' }} size="sm" className="border"></div>
                    </>
                )

            },
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Integrate Form",
            selector: row => {
                if (row.take_response === 0) { return 'None' }
                if (row.take_response === 1) { return 'Interest' }
                if (row.take_response === 2) { return 'Feedback/Contact' }
                if (row.take_response === 3) { return 'Rating' }

            },
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Expired AT",
            selector: (row) => (row?.content_expired ?? 'N/A'),
            sortable: true,
            minWidth: '170px'
        },
        // {
        //     name: "Created AT",
        //     selector: 'dlr_code',
        //     sortable: true,
        //     minWidth: '170px'
        // },
        {
            name: "Created By",
            selector: r => r.created_by_name,
            sortable: true,
            minWidth: '170px'
        },

        {
            name: "actions",
            allowOverflow: true,
            minWidth: '170px',
            cell: row => {
                return (
                    <div>
                        <DropDownMenu
                            direction={'down'}
                            component={<MoreVertical color={colors.primary.main} size={IconSizes.MenuVertical} />}
                            options={[
                                {
                                    icon: <Visibility size={14} />,
                                    onClick: () => {
                                        setDetailModal(true)
                                        setEditData(row)
                                    },
                                    name: "View Message"
                                },
                                {
                                    IF: Permissions.twoWay,
                                    icon: <BorderColor size={14} />,
                                    // state: row,
                                    to: {
                                        pathname: getPath('add.two.way', { id: row?.id })
                                    },
                                    name: 'Edit'
                                },
                                {
                                    IF: Permissions.twoWay,
                                    noWrap: true,
                                    name: (
                                        // <ConfirmAlert
                                        //     title={`Delete ${row?.title} ?`}
                                        //     color='text-warning'
                                        //     onClickYes={() => deleteTwoWay({ id: row?.id, loading: setLoading, success: e => { setDeletedId(row?.id); setDeleted(e) }, error: setFailed })}
                                        //     // onClickYes={() => deletePrimaryRoute({ id: row?.id, loading: setLoading, success: setDeleted, error: setFailed })}
                                        //     onSuccess={deleted}
                                        //     onFailed={failed}

                                        //     onClose={(e) => {
                                        //         if (e) {
                                        //             dispatch(twoWayDelete(deletedId))
                                        //         }
                                        //         setDeleted(null)
                                        //         setFailed(null)
                                        //     }}
                                        //     className="dropdown-item"
                                        //     id={`grid-delete-${row?.id}`}>

                                        //     <DeleteForever size={14} /> <span className='ms-1 align-middle'>Delete</span>
                                        // </ConfirmAlert>
                                        <ConfirmStop
                                            item={row}
                                            // eventId={`delete-${row?.id}`}
                                            title={`Delete  ${row?.title} ?`}
                                            color='text-warning'
                                            onClickYes={() => deleteTheTwoWay(row?.id)}
                                            // onSuccessEvent={(item) => { dispatch(userDelete(item?.id)); preload() }}
                                            // onFailedEvent={((item) => { })}
                                            onSuccessEvent={(item) => { preload() }}
                                            onFailedEvent={((item) => { })}
                                            className="dropdown-item"
                                            style={{ cursor: "pointer" }}
                                            id={`grid-delete-${row?.id}`}>

                                            <DeleteForever size={14} /> <span className='ms-1 align-middle'>Delete</span>
                                        </ConfirmStop>
                                    )
                                }

                            ]}
                        />
                    </div>
                )
            }
        }
    ]

    const CustomPagination = () => {
        const count = Math.ceil(twoWay?.total / twoWay?.per_page)
        return (
            <ReactPaginate
                initialPage={twoWay?.current_page - 1}
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
            {/* <ViewTwoWaySMS Component={Button.Ripple} edit={editData} color={"secondary"} model={modal} setModal={setModal(false)} noView /> */}
            <ViewTwoWaySMS Component={Button.Ripple} edit={editData} color={"secondary"} showModal={detailModal} setShowModal={() => setDetailModal(false)} noView />

            <Header title={'Two Way SMS List'} icon={<ArrowLeft size={'25'} className='text-primary' onClick={() => navigate(-1)} />}>
                <ButtonGroup>
                    <Button.Ripple size='sm' className='text-primary' outline onClick={() => { sendTwoWay() }}>
                        Create Two Way SMS Template
                    </Button.Ripple>
                    {/* <BsTooltip title={'Go Back'}> */}
                    {/* <UncontrolledTooltip title='Go Back' target="backGO"> */}
                    <Button.Ripple size='sm' className='text-primary' color='dark' id="backGO" onClick={() => navigate(-1)}>
                        <ArrowLeft size={'14'} />
                    </Button.Ripple>
                    {/* </UncontrolledTooltip> */}
                    {/* </BsTooltip> */}
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
                                selectableRows

                                pagination
                                paginationServer
                                className='react-dataTable'
                                columns={twoWayColumn}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                selectableRowsComponent={BootstrapCheckbox}
                                sortIcon={<ChevronDown size={10} />}
                                paginationComponent={CustomPagination}
                                data={twoWay?.data}
                                onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div>
                </>
                }

            </Card>
        </>
    )
}

export default TwoWaySMSList
