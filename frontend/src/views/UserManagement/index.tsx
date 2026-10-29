// @ts-nocheck
// ** React Imports
import { forwardRef, useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
// ** Third Party Components
import DataTable from 'react-data-table-component'
import { ChevronDown, Edit, Eye, MoreVertical, Plus, RefreshCcw, Search, Sliders, Trash, Unlock, Users } from 'react-feather'
import ReactPaginate from 'react-paginate'
// ** Reactstrap Imports
import { useForm } from 'react-hook-form'
import {
    Badge,
    Button, ButtonGroup, Card, CardHeader, Col, DropdownItem, DropdownMenu, DropdownToggle, Form, Input, Row, Table, UncontrolledButtonDropdown, UncontrolledTooltip
} from 'reactstrap'
import Shimmer from '../components/shimmers/Shimmer'
// import AddPrimaryRoute from './AddPrimaryRoute'
// import PrimaryRouteAction from './PrimaryRouteAction'
import LanguageIcon from '@mui/icons-material/Language'
import SpeakerPhone from '@mui/icons-material/SpeakerPhone'
import { AbilityContext } from '@src/utility/context/Can'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import base64 from 'base-64'
import { useLocation, useNavigate } from 'react-router-dom'
import { handleLogin } from '../../redux/authentication'
import { IconSizes } from '../../utility/Const'
import { Permissions } from '../../utility/Permissions'
import Show from '../../utility/Show'
import { childLogin, deleteUser, loadUser, userAction } from '../../utility/apis/userManagement'
import ConfirmStop from '../../utility/helpers/ConfirmStop'
import useUser from '../../utility/hooks/useUser'
import LoadingButton from '../components/buttons/LoadingButton'
import DropDownMenu from '../components/dropdown'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import BsPopover from '../components/popover'
import BsTooltip from '../components/tooltip'
import AddUser from './AddUser'
import AdminAssignRoute from './AdminAssignRoute'
import AdminRatioSet from './AdminRatioSet'
import FilterUser from './FilterUser'
import ResetUserPassword from './UserActions/ResetUserPassword'
import ViewUser from './ViewUser'
import Webhook from './Webhook'

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
const UserList = () => {
    const userLogin = useSelector(state => state.auth.userData)
    const { colors } = useContext(ThemeColors)
    const location = useLocation()
    const userList = useSelector(a => a.user.user)
    const [loading, setLoading] = useState(false)
    const [showFilter, setShowFilter] = useState(false)
    const [userModal, setUserModal] = useState(false)
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
    const [showModal, setShowModal] = useState(false)
    const ability = useContext(AbilityContext)
    const [passwordModal, setPasswordModal] = useState(false)
    const [ratioModal, setRatioModal] = useState(false)
    const [editModal, setEditModal] = useState(false)
    const [webModal, setWebModal] = useState(false)
    const [failed, setFailed] = useState(false)
    const [deletedId, setDeletedId] = useState(null)
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState("1")
    const [editData, setEditData] = useState(null)
    const userT = useUser()
    const [rowsPerPage] = useState("15")
    const [rowsSelected, setRowsSelected] = useState([])
    const [filterData, setFilterData] = useState({
        // email: "",
        // mobile: "",
        // name: "",
        // status: "",
        // username: ""
        per_page_record: 15
    })
    const [reload, setReload] = useState(false)
    const [resetIt, setResetIt] = useState(new Date())

    const dispatch = useDispatch()

    // log(userList?.data, "userList")

    useEffect(() => {
        if (ratioModal === false) {
            setEditData(null)
        }
    }, [ratioModal])

    // const submitFilter = (d) => {
    //     setCurrentPage(1)
    //     setFilterData({
    //         ...d
    //         // filterData
    //     })

    //     // console.log(d)
    // }


    const submitFilter = (d) => {
        setCurrentPage(1)
        setFilterData({
            ...d
            // filterData
        })

        // console.log(d)
    }

    const preload = (cp = currentPage) => {
        loadUser({
            page: cp,
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

    const deleteTheUser = (row) => {
        deleteUser({
            id: row,
            success: () => {
            }
        })
    }


    // const credit = [<>{row?.}</>]
    useEffect(() => {
        preload(1)
    }, [filterData])

    // const handleReload = () => {
    //     preload()
    // }

    const refreshPage = () => {
        // window.location.href = window.location.href
        window.location.assign("admin-send-sms")
        // navigate("/dashboard")

    }

    const childLoginButton = (row) => {
        const encoded = base64.encode(row?.uuid)
        childLogin({
            jsonData: {
                // ...userT,
                account_uuid: encoded
            },
            success: (data) => {
                const p = data?.data?.permissions?.map(a => ({
                    action: a.name,
                    subject: "all"
                })) ?? []

                // user type === 0 or 3 to dikhana hai or is_visible_dlt_template_group === 1 to dikhana hai
                // if (data?.data?.userType === 0 || data?.data?.userType === 3 || data?.data?.is_visible_dlt_template_group === 1) {
                //     p.push({
                //         action: "is-visible-dlt-template-group",
                //         subject: 'all'
                //     })
                // }
                const m = {
                    ...data.data,
                    // role: data.payload.roles,
                    ability: p?.concat(extraPermissions)
                }

                dispatch(handleLogin(m))
                if (data?.data?.permissions) ability.update(m?.ability)
                refreshPage()
            }
        })
    }

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        loadUser({
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

    const userColumn = [
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
                            <BsPopover className='not-important' placement='right' trigger='hover' title={row?.name} content={
                                <>

                                    <Table responsive>
                                        <thead>
                                            <tr>
                                                <th scope='col' className='text-nowrap'>
                                                    #
                                                </th>
                                                <th scope='col' className='text-nowrap'>
                                                    Transactional
                                                </th>
                                                <th scope='col' className='text-nowrap'>
                                                    Promotional
                                                </th>
                                                <th scope='col' className='text-nowrap'>
                                                    Two-Way
                                                </th>
                                                <th scope='col' className='text-nowrap'>
                                                    Voice
                                                </th>
                                                <th scope='col' className='text-nowrap'>
                                                    Whatsapp
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className='text-nowrap'>Credit</td>
                                                <td className='text-nowrap'>{row?.transaction_credit}</td>
                                                <td className='text-nowrap'>{row?.promotional_credit}</td>
                                                <td className='text-nowrap'>  {row?.two_waysms_credit}</td>
                                                <td className='text-nowrap'>{row?.voice_sms_credit}</td>
                                                <td className='text-nowrap'>₹{row?.whatsapp_credit}</td>
                                            </tr>
                                        </tbody>

                                    </Table>
                                </>
                            }>
                                <span className='text-primary'>{row?.name}</span>
                            </BsPopover>
                        </BsTooltip>
                    </>
                )
            },
            // sortable: true,
            maxWidth: '200px'
        },
        {
            name: "Email",
            selector: r => r.email,
            sortable: true,
            minWidth: '230px'
        },

        {
            name: "User Name",
            selector: r => r.username,
            sortable: true,
            maxWidth: '180px'
        },
        {
            name: "Mobile",
            selector: r => r.mobile,
            sortable: true,
            maxWidth: '150px'
        },
        {
            name: "User Type",
            sortable: true,
            minWidth: '170px',
            selector: row => {
                if (parseInt(row.userType) === 0) { return <strong className='text-primary'>{'Admin'}</strong> }
                if (parseInt(row.userType) === 1) { return <strong className='text-info'>{'Reseller'}</strong> }
                if (parseInt(row.userType) === 2) { return <strong className='text-danger'>{'Client'}</strong> }
                if (parseInt(row.userType) === 3) { return <strong className='text-success'>{'Employee'}</strong> }

            }

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
                    <div>
                        <DropDownMenu
                            direction={'down'}
                            tooltip={"Menu"}
                            component={
                                <MoreVertical color={colors.primary.main} size={IconSizes.MenuVertical} />
                            }
                            options={[
                                {
                                    IF: userLogin?.parent_key === null && userLogin?.id !== row?.id,
                                    icon: <Unlock size={14} />,
                                    onClick: () => {
                                        childLoginButton(row)

                                    },
                                    name: "Child Login"
                                },
                                {
                                    IF: Permissions?.userChangePassword && userLogin?.id !== row?.id,
                                    icon: <Edit size={14} />,
                                    onClick: () => {
                                        setPasswordModal(true)
                                        setEditData(row)
                                    },
                                    name: "Change Password"
                                },

                                {
                                    IF: Permissions?.userView,
                                    icon: <Eye size={14} />,
                                    onClick: () => {
                                        setUserModal(true)
                                        setEditData(row)
                                    },
                                    name: "Basic Info."
                                },
                                {
                                    IF: Permissions?.userRatioSet,
                                    icon: <SpeakerPhone size={14} />,
                                    onClick: () => {
                                        setRatioModal(true)
                                        setEditData(row)
                                    },
                                    name: "Set Ratio"
                                },
                                {
                                    IF: userLogin?.userType !== 3 && userLogin?.id !== row?.id,
                                    icon: <Edit size={14} />,
                                    onClick: () => {
                                        setEditModal(true)
                                        setEditData(row)
                                    },
                                    name: "Edit User"
                                },
                                // {
                                //     IF: userLogin?.userType === 0,
                                //     icon: <LanguageIcon size={14} />,
                                //     onClick: () => {
                                //         setWebModal(true)
                                //         setEditData(row)
                                //     },
                                //     name: "Webhook URL"
                                // },


                                {
                                    IF: userLogin?.userType !== 3 && userLogin?.id !== row?.id,
                                    noWrap: true,
                                    name: <ConfirmStop
                                        item={row}
                                        // eventId={`delete-${row?.id}`}
                                        title={`Delete  ${row?.name} ?`}
                                        color='text-warning'
                                        onClickYes={() => deleteTheUser(row?.id)}
                                        // onSuccessEvent={(item) => { dispatch(userDelete(item?.id)); preload() }}
                                        // onFailedEvent={((item) => { })}
                                        onSuccessEvent={(item) => { preload() }}
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
        const count = Math.ceil(userList?.total / userList?.per_page)
        return (
            <ReactPaginate
                initialPage={userList?.current_page - 1}
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
            userAction({
                jsonData: {
                    status: 1,
                    user_ids: rowsSelected
                },
                loading: setLoading,
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
            userAction({
                jsonData: {
                    status: 0,
                    user_ids: rowsSelected
                },
                loading: setLoading,
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
            <ResetUserPassword Component={Button.Ripple} size="sm" color={"warning"} id='change' edit={editData} showModal={passwordModal} preload={preload} setShowModal={() => setPasswordModal(false)} noView />
            <ViewUser Component={Button.Ripple} size="sm" color={"success"} id='asdad' edit={editData} showModal={userModal} setShowModal={() => setUserModal(false)} noView />
            <AdminRatioSet Component={Button.Ripple} size="sm" color={"info"} preload={preload} id='ratio' edit={editData} showModal={ratioModal} setShowModal={() => setRatioModal(false)} noView />
            <Webhook Component={Button.Ripple} size="sm" color={"info"} preload={preload} id='webhook' edit={editData} showModal={webModal} setShowModal={() => setWebModal(false)} noView />
            <AddUser Component={Button.Ripple} size="sm" color={"secondary"} id="edit" edit={editData} showModal={editModal} setShowModal={() => setEditModal(false)} noView />
            <Header icon={<Users />} title="User List">

                <ButtonGroup color="primary" className='me-25'>
                    <Show IF={Permissions?.userCreate}>

                        <AddUser Component={Button.Ripple} size="sm" color={"primary"} id="add" > <Plus size='14' /> Add User</AddUser>
                    </Show>

                    <Show IF={Permissions?.userRouteSetting}>
                        <AdminAssignRoute Component={Button.Ripple} size="sm" color={"primary"} outline ><Plus size='14' /> Assign Route  </AdminAssignRoute>
                        {/* <UserPriority Component={Button.Ripple} size="sm" color={"primary"} outline ><Compass size = "14" /> Change  Priority </UserPriority> */}

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
                                columns={userColumn}
                                selectableRowDisabled={(row) => {
                                    if (userLogin?.id === row?.id) {
                                        return true
                                    }
                                }}

                                // selectableRowDisabled={(row) => {
                                //     // eslint-disable-next-line no-unused-expressions
                                //     userLogin?.id !== row?.id
                                // }}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                selectableRowsComponent={BootstrapCheckbox}
                                sortIcon={<ChevronDown size={10} />}
                                paginationComponent={CustomPagination}
                                data={userList?.data}
                                onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div>
                </>
                }

            </Card>
            <FilterUser show={showFilter} filterData={filterData} setFilterData={e => {
                setCurrentPage(1)
                setFilterData(e)
            }} handleFilterModal={() => { setShowFilter(false) }} />

        </>
    )
}


export default UserList
