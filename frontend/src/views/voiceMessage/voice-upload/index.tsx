// @ts-nocheck
// ** React Imports
import { forwardRef, useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
// ** Third Party Components
import DataTable from 'react-data-table-component'
import { Award, ChevronDown, Edit, Eye, Loader, MoreVertical, Plus, Radio, RefreshCcw, Search, Sliders, Trash, Trash2, Unlock, Users } from 'react-feather'
import ReactPaginate from 'react-paginate'
// ** Reactstrap Imports
import { useForm } from 'react-hook-form'
import {
    Badge,
    Button, ButtonGroup, Card, CardHeader, Col, DropdownItem, DropdownMenu, DropdownToggle, Form, Input, Row, Table, UncontrolledButtonDropdown, UncontrolledTooltip
} from 'reactstrap'

// import AddPrimaryRoute from './AddPrimaryRoute'
// import PrimaryRouteAction from './PrimaryRouteAction'
import SpeakerPhone from '@mui/icons-material/SpeakerPhone'
import { AbilityContext } from '@src/utility/context/Can'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import base64 from 'base-64'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useUser from '../../../utility/hooks/useUser'
import { IconSizes } from '../../../utility/Const'
import { deleteUploadVoice, loadUploadVoice } from '../../../utility/apis/voiceUpload'

import ViewUser from '../../UserManagement/ViewUser'
import Header from '../../components/header'
import Show from '../../../utility/Show'
import { Permissions } from '../../../utility/Permissions'
import FormGroupCustom from '../../components/formGroupCustom'
import LoadingButton from '../../components/buttons/LoadingButton'
import Shimmer from '../../components/shimmers/Shimmer'
import FilterUser from '../../UserManagement/FilterUser'
import BsTooltip from '../../components/tooltip'
import BsPopover from '../../components/popover'
import DropDownMenu from '../../components/dropdown'
import ConfirmStop from '../../../utility/helpers/ConfirmStop'
import UploadVoice from './UploadVoice'
import FilterVoiceUpload from './FilterVoiceUpload'
import { getPath } from '../../../router/RouteHelper'
import VoiceProcessActionModal from './VoiceProcessActionModal'
import { log } from '../../../utility/helpers/common'
import httpConfig from '../../../utility/http/httpConfig'
import { uploadVoiceDelete } from '../../../redux/reducers/voiceUpload'
import ConfirmAlert from '../../../utility/helpers/ConfirmAlert'


const extraPermissions = [
    {
        action: 'dashboard-view',
        subject: 'all'
    },
    {
        action: 'private-view',
        subject: 'all'
    }
]
const VoiceUpload = () => {

    const { colors } = useContext(ThemeColors)
    const location = useLocation()
    const users = useSelector(state => state.auth.userData)
    const voiceList = useSelector(a => a.voiceUpload.voiceUpload)
    const [loading, setLoading] = useState(false)
    const [showFilter, setShowFilter] = useState(false)
    const [deleted, setDeleted] = useState(null)
    const [deletedId, setDeletedId] = useState(null)
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
    const [showModal, setShowModal] = useState(false)
    const [processModal, setProcessModal] = useState(false)
    const ability = useContext(AbilityContext)
    const [passwordModal, setPasswordModal] = useState(false)
    const [ratioModal, setRatioModal] = useState(false)
    const [editModal, setEditModal] = useState(false)
    const [failed, setFailed] = useState(false)
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState("1")
    const [editData, setEditData] = useState(null)
    const userT = useUser()
    const [rowsPerPage] = useState("15")
    const [rowsSelected, setRowsSelected] = useState([])
    const [filterData, setFilterData] = useState({
        per_page_record: 15
    })
    const [reload, setReload] = useState(false)
    const [resetIt, setResetIt] = useState(new Date())

    const dispatch = useDispatch()

    // log(userList?.data, "userList")

    const submitFilter = (d) => {
        setFilterData({
            ...d
            // filterData
        })
        // console.log(d)

    }

    const preload = () => {
        loadUploadVoice({
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

    // const credit = [<>{row?.}</>]
    useEffect(() => {
        preload()

    }, [filterData])

    // const handleReload = () => {
    //     preload()
    // }

    const refreshPage = () => {
        // window.location.href = window.location.href
        window.location.assign("dashboard")
        // navigate("/dashboard")

    }

    const deleteTheVoice = (row) => {
        deleteUploadVoice({
            id: row,
            success: (e) => {

            }
        })
    }

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        loadUploadVoice({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            // success: setUser,
            dispatch,
            loading: setLoading
        })
    }

    // Handle Rows selection
    const handleReportChange = ({ selectedRows }) => {
        log(selectedRows, "handleReportChange")
        const selectedR = selectedRows.map((item) => {
            return item.id
        })
        setRowsSelected(selectedR)
    }

    const fileTypeStatus = (row) => {
        if (row?.fileStatus === "1") {
            return <Badge color='light-warning'>
                {"Pending"}
            </Badge>
        } else if (row?.fileStatus === "2") {
            return <Badge color='light-primary'>
                {"Processing"}
            </Badge>
        } else if (row?.fileStatus === "3") {
            return <Badge color='light-success'>
                {"Approved"}
            </Badge>
        } else if (row?.fileStatus === "4") {
            return <Badge color='light-danger' >
                {"Rejected"}
            </Badge>

        }

    }


    const voiceColumn = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "Voice ID",
            cell: row => {
                return (
                    <>

                        <BsTooltip role="button" className="me-1" title={null}>

                            <span className='text-primary fw-bolder'>{row?.voiceId}</span>

                        </BsTooltip>
                    </>
                )
            },
            sortable: true,
            minWidth: '250px'
        },
        {
            name: "Title",
            allowOverflow: true,
            cell: row => {
                return (
                    <>
                        <BsTooltip role="button" className="me-1" title={null}>
                            <span className='text-primary'>{row?.title}</span>
                        </BsTooltip>
                    </>
                )
            },
            // sortable: true,
            maxWidth: '250px'
        },
        {
            name: "File Location",
            selector: r => <span><audio style={{ height: "40px", width: "150px" }} controls src={`${httpConfig.baseUrl2}${r.file_location}`} /></span>,
            sortable: true,
            minWidth: '250px'
        },


        {
            name: "Mime Type",
            cell: row => {

                return (
                    <>

                        <div>
                            <span className='text-primary fw-bolder'>{row?.file_mime_type}</span><br />
                            <small className='text-muted'>{row?.file_time_duration} Sec</small>
                        </div>
                    </>
                )
            },
            sortable: true

        },
        {
            name: "File Status",
            cell: row => {
                return (
                    <>

                        <div>
                            {fileTypeStatus(row)}
                        </div>
                    </>
                )
            },
            sortable: true,
            maxWidth: '250px'
        },

        {
            name: "actions",
            allowOverflow: true,
            minWidth: '10px',
            cell: row => {
                return (
                    <div>
                        <ButtonGroup size="sm">
                            <Show IF={Permissions.voiceFileProcess && (users?.userType === 0 || users?.userType === 3)}>

                                <BsTooltip Tag={Button.Ripple} size="sm" color={"primary"} title={"Voice File Process"}>
                                    <VoiceProcessActionModal title={"Voice Process"} edit={row}> <Loader size={15} /> </VoiceProcessActionModal>
                                </BsTooltip>
                            </Show>
                            {/* <ConfirmAlert
                                title={`Delete ${row?.title} ?`}
                                color='text-warning'
                                onClickYes={() => deleteUploadVoice({ id: row?.id, loading: setLoading, success: e => { setDeletedId(row?.id); setDeleted(e) }, error: setFailed })}
                                // onClickYes={() => deletePrimaryRoute({ id: row?.id, loading: setLoading, success: setDeleted, error: setFailed })}
                                onSuccess={deleted}
                                onFailed={failed}
                                onClose={(e) => {
                                    if (e) {
                                        dispatch(uploadVoiceDelete(deletedId))
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
                                title={`Delete  ${row?.title} ?`}
                                color='text-warning'
                                onClickYes={() => deleteTheVoice(row?.id)}
                                // onSuccessEvent={(item) => { dispatch(userDelete(item?.id)); preload() }}
                                // onFailedEvent={((item) => { })}
                                onSuccessEvent={(item) => { preload() }}
                                onFailedEvent={((item) => { })}
                                className="waves-effect btn btn-danger btn-sm"
                                style={{ cursor: "pointer" }}
                                id={`grid-delete-${row?.id}`}>

                                <Trash2 size={15} />
                            </ConfirmStop>
                        </ButtonGroup>
                    </div>
                )
            }
        }
    ]

    const CustomPagination = () => {
        const count = Math.ceil(voiceList?.total / voiceList?.per_page)
        return (
            <ReactPaginate
                initialPage={voiceList?.current_page - 1}
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

    log(rowsSelected, "rowsSelected")

    return (

        <>
            {/* <ViewUser Component={Button.Ripple} size="sm" color={"success"} id='asdad' edit={editData} showModal={userModal} setShowModal={() => setUserModal(false)} noView /> */}
            <UploadVoice setModal={() => preload()} Component={Button.Ripple} size="sm" color={"secondary"} id="edit" edit={editData} showModal={editModal} setShowModal={() => setEditModal(false)} noView />
            <Header icon={<Radio size={"25px"} />} title="Voice Uploads">
                <UncontrolledTooltip target="get-all-voice-file">Get All Voice</UncontrolledTooltip>
                <ButtonGroup color="primary" className='me-25'>
                    <Link className='btn btn-secondary btn-sm' size="sm" color="secondary" id="get-all-voice-file" to={"/admin-all-voice-status"}>
                        <Award size="14" on />
                    </Link>
                </ButtonGroup>

                <ButtonGroup color="primary" className='me-25'>
                    <Show IF={Permissions?.voiceUploadCreate}>

                        <UploadVoice setShowModal={(e) => {
                            if (e === false) {
                                preload()
                            }
                        }} Component={Button.Ripple} size="sm" color={"primary"} id="add" > <Plus size='14' /> Upload Voice</UploadVoice>
                    </Show>

                    <Button.Ripple size="sm" color="dark" id="filteree" onClick={() => setShowFilter(true)}>
                        <Sliders size="14" on />
                    </Button.Ripple>
                    <UncontrolledTooltip target="reload">refresh data</UncontrolledTooltip>
                    <UncontrolledTooltip target="filteree">Filter</UncontrolledTooltip>
                    {/* <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => {
                        setFilterData({ }); setReload(true)
                    }} > */}
                    <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { setFilterData({}); setReload(true); setResetIt(new Date()); reset() }} >
                        <RefreshCcw size="14" />
                    </Button.Ripple>
                </ButtonGroup>

            </Header>
            <Card>
                <Show IF={Permissions?.userAction}>
                    <Row className='justify-content-between mx-0'>
                        <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                            <CardHeader>

                                {/* <UncontrolledButtonDropdown disabled={rowsSelected?.length === 0}> */}
                                {/* <DropdownToggle color={rowsSelected?.length === 0 ? 'secondary' : 'primary'} outline caret>
                                        Actions
                                    </DropdownToggle> */}
                                {/* <DropdownMenu> */}
                                {/* <DropdownItem onClick={submitHandler} href='/' tag='a'>Active</DropdownItem>
                                        <DropdownItem onClick={submitHandler2} href='/' tag='a'>In-Active</DropdownItem> */}
                                {/* </DropdownMenu> */}
                                {/* </UncontrolledButtonDropdown> */}
                            </CardHeader>
                        </Col>
                        {/* <Show IF={!Can(Permissions?.userAction)}> */}
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
                        {/* </Show> */}
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
                                // selectableRows
                                pagination
                                paginationServer
                                className='react-dataTable'
                                columns={voiceColumn}
                                // selectableRowDisabled={(row) => {
                                //     if (userLogin?.id === row?.id) {
                                //         return true
                                //     }
                                // }}
                                selectableRowsComponent={BootstrapCheckbox}
                                // selectableRowDisabled={(row) => {
                                //     // eslint-disable-next-line no-unused-expressions
                                //     userLogin?.id !== row?.id
                                // }}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                sortIcon={<ChevronDown size={10} />}
                                paginationComponent={CustomPagination}
                                data={voiceList?.data}
                                onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div>
                </>
                }
            </Card>

            <FilterVoiceUpload show={showFilter} filterData={filterData} setFilterData={e => {
                setCurrentPage(1)
                setFilterData(e)
            }} handleFilterModal={() => { setShowFilter(false) }} />

        </>
    )
}


export default VoiceUpload
