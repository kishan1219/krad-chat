// @ts-nocheck
// ** React Imports
import { useContext, useEffect, useState, forwardRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
// ** Third Party Components
import DataTable from 'react-data-table-component'
import { ArrowLeft, Award, CheckCircle, ChevronDown, Edit, Eye, Flag, Framer, Loader, MoreVertical, Plus, Radio, RefreshCcw, Repeat, Search, Sliders, Trash, Unlock, Users } from 'react-feather'
import ReactPaginate from 'react-paginate'
// ** Reactstrap Imports
import { useForm } from 'react-hook-form'
import {
    Badge,
    Button, ButtonGroup, Card, CardHeader, Col, DropdownItem, DropdownMenu, DropdownToggle, Form, Input, Row, Spinner, Table, UncontrolledButtonDropdown, UncontrolledTooltip
} from 'reactstrap'

import SpeakerPhone from '@mui/icons-material/SpeakerPhone'

import { ThemeColors } from '@src/utility/context/ThemeColors'
import '@styles/react/libs/tables/react-dataTable-component.scss'

import { useLocation, useNavigate } from 'react-router-dom'

import { IconSizes } from '../../../../utility/Const'
import { bulkVoiceFileAction, deleteUploadVoice, loadAllVoiceFile, loadUploadVoice, uploadVoice, checkVoiceFileStatus } from '../../../../utility/apis/voiceUpload'

import Header from '../../../components/header'
import Show, { Can } from '../../../../utility/Show'
import { Permissions } from '../../../../utility/Permissions'
import FormGroupCustom from '../../../components/formGroupCustom'
import LoadingButton from '../../../components/buttons/LoadingButton'
import Shimmer from '../../../components/shimmers/Shimmer'
import BsTooltip from '../../../components/tooltip'
import DropDownMenu from '../../../components/dropdown'
import ConfirmStop from '../../../../utility/helpers/ConfirmStop'
import AllVoiceFilter from './AllVoiceFilter'
import { isValidArray, log } from '../../../../utility/helpers/common'
import UploadVoice from '../UploadVoice'
import VoiceProcessActionModal from '../VoiceProcessActionModal'
const VoiceUpload = () => {
    const userLogin = useSelector(state => state.auth.userData)
    const { colors } = useContext(ThemeColors)
    const users = useSelector(state => state.auth.userData)
    const voiceList = useSelector(a => a.voiceUpload.allVoiceStatus)
    const [loading, setLoading] = useState(false)
    const [showFilter, setShowFilter] = useState(false)

    const [deleted, setDeleted] = useState(false)
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue
    } = useForm()

    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState("1")

    const [fetchStatus, setFetchStatus] = useState(false)
    const [fetchIndex, setFetchIndex] = useState(null)
    const [rowsPerPage] = useState("15")
    const [rowsSelected, setRowsSelected] = useState(null)
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
        loadAllVoiceFile({
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
        setRowsSelected(null)

    }, [filterData])

    // const handleReload = () => {
    //     preload()
    // }

    const refreshPage = () => {
        // window.location.href = window.location.href
        window.location.assign("dashboard")
        // navigate("/dashboard")

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
        const selectedR = selectedRows.map((item) => {
            return item.id
        })
        setRowsSelected(selectedR)
    }

    const fileTypeStatus = (row) => {
        if (row?.file_status === "1") {
            return <Badge color='light-warning'>
                {"Pending"}
            </Badge>
        } else if (row?.file_status === "2") {
            return <Badge color='light-primary'>
                {"Processing"}
            </Badge>
        } else if (row?.file_status === "3") {
            return <Badge color='light-success'>
                {"Approved"}
            </Badge>
        } else if (row?.file_status === "4") {
            return <Badge color='light-danger' >
                {"Rejected"}
            </Badge>

        }

    }
    const getStatusMethod = (row, index) => {
        checkVoiceFileStatus({
            id: row?.id,
            loading: setFetchStatus,
            success: (e) => {
                preload()
                setFetchIndex(index)

            }
        })

    }

    const fetctSpinner = (row, index) => {
        if (fetchStatus === true && fetchIndex === index) {
            return <Spinner animation="border" color='primary' size={"md"}>
                <span className="visually-hidden">Loading...</span>
            </Spinner>

        } else {
            return fileTypeStatus(row)
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
            name: "Name",
            allowOverflow: true,
            cell: row => {
                return (
                    <>
                        <BsTooltip role="button" className="me-1" title={null}>

                            <span className='text-primary'>{row?.name}</span>

                        </BsTooltip>
                    </>
                )
            },
            // sortable: true,
            maxWidth: '250px'
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
            selector: r => r.file_location,
            sortable: true,
            minWidth: '250px'
        },

        {
            name: "Route Name",
            selector: r => r.route_name,
            sortable: true,
            maxWidth: '250px'
        },
        {
            name: "File Status",
            cell: (row, index) => {
                return (
                    <>
                        <BsTooltip role="button" className="me-1" title={null}>
                            {fetctSpinner(row, index)}
                        </BsTooltip>
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
            cell: (row, index) => {
                return (
                    <div>
                        <DropDownMenu
                            direction={'down'}
                            tooltip={"Menu"}
                            component={
                                <MoreVertical color={colors.primary.main} size={IconSizes.MenuVertical} />
                            }
                            options={[
                                {
                                    icon: <Flag size={IconSizes.Menu} />,
                                    onClick: () => {
                                        getStatusMethod(row, index)
                                    },
                                    name: "Fetch Status"
                                },

                                {

                                    noWrap: true,
                                    name: <ConfirmStop
                                        item={row}
                                        // eventId={`delete-${row?.id}`}
                                        title={`Delete  ${row?.name} ?`}
                                        color='text-warning'
                                        // onClickYes={() => { deleteUser({ id: row?.id }) }}
                                        // onSuccessEvent={(item) => { dispatch(userDelete(item?.id)); preload() }}
                                        onFailedEvent={((item) => { })}

                                        className="dropdown-item"
                                        id={`grid-delete-${row?.id}`}>

                                        <Trash size={15} /> <span className='ms-1 align-middle'>Delete</span>
                                    </ConfirmStop>
                                }
                            ]
                            }
                        />
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
    //log("permissionCHeck", Can(Permissions?.bulkVoiceFileAction) && (users?.userType === 0 || users?.userType === 3))
    return (
        <>
            <Header icon={<ArrowLeft size={18} style={{ cursor: 'pointer' }} onClick={() => { navigate(-1) }} />} title="All Voice Status">
                <ButtonGroup color="primary" className='me-25'>
                    <Show IF={Permissions.syncVoiceTemplateToVendor && (users?.userType === 0 || users?.userType === 3)}>
                        <BsTooltip Tag={Button.Ripple} size="sm" color={"primary"} title={"Sync Voice Template To Vendor"}>
                            <VoiceProcessActionModal title="Sync Voice Template To Vendor" > <Framer size={15} /> </VoiceProcessActionModal>
                        </BsTooltip>
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

                        <Col className='d-flex align-items-center justify-content-start' md='3' sm='12'>
                            <Show IF={isValidArray(rowsSelected)}>
                                <CardHeader>
                                    <UploadVoice setShowModal={(e) => {
                                        if (e === false) {
                                            preload()
                                        }
                                    }
                                    } Component={Button.Ripple} size="sm" color={"primary"} id="add" edit={{ title: "Change Status", rows: rowsSelected }} > <CheckCircle size='14' /> Change Status </UploadVoice>
                                </CardHeader>
                            </Show>
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
                                selectableRows
                                pagination
                                paginationServer
                                className='react-dataTable'
                                columns={voiceColumn}
                                selectableRowDisabled={(row) => {
                                    if (Can(Permissions?.bulkVoiceFileAction) && (users?.userType === 0 || users?.userType === 3)) {
                                        return false
                                    } else {
                                        return true
                                    }
                                }}
                                selectableRowsComponent={BootstrapCheckbox}

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

            <AllVoiceFilter show={showFilter} filterData={filterData} setFilterData={e => {
                setCurrentPage(1)
                setFilterData(e)
            }} handleFilterModal={() => { setShowFilter(false) }} />
        </>
    )
}


export default VoiceUpload
