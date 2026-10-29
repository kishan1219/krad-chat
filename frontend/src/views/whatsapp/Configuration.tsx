// @ts-nocheck
import { Call, Report } from '@mui/icons-material'
import Aod from '@mui/icons-material/Aod'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import Loyalty from '@mui/icons-material/Loyalty'
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid'
import VerifiedIcon from '@mui/icons-material/Verified'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import base64 from 'base-64'
import { useContext, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, Edit, Eye, MoreVertical, Plus, RefreshCcw, Search, Sliders, Trash2 } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Button, ButtonGroup, Card, Col, Form, Input, Row, UncontrolledTooltip } from 'reactstrap'
import { whatsappConfigDelete } from '../../redux/reducers/whatsappConfig'
import { deleteWhatsappConfig, loadWhatsappConfig, onboardPartnersToMmLite, waAccountQualityCheck, WAdebugToken, waMarketingLiteApiStatus, waPhoneNumberRequest, waSubscribeApps } from '../../utility/apis/whatsappConfig'
import { IconSizes } from '../../utility/Const'
import ConfirmAlert from '../../utility/helpers/ConfirmAlert'
// import ConfirmPhoneNumber from '../../utility/helpers/ConfirmPhoneNumber' // Commented out as it will be replaced
import { Permissions } from '../../utility/Permissions'
import Show from '../../utility/Show'
import LoadingButton from '../components/buttons/LoadingButton'
import DropDownMenu from '../components/dropdown'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import Shimmer from '../components/shimmers/Shimmer'
import BsTooltip from '../components/tooltip'
import VerificationModal from '../components/VerificationModal' // New import
import WhatsappTemplatePull from './AddWhatsappConfig'
import CheckPhoneStatus from './CheckPhoneStatus'
import ConfigFilter from './Filter/ConfigFilter'
import ViewConfigInModal from './VIewConfigInModal'
import WhatsappPhoneNumberRegister from './WhatsappPhoneNumberRegister'
import WhatsappEcommerce from './WhatsappEcommerce'
import WhatsappCallingModal from './WhatsappCallingModal' // New import
import WhatsApp from '@mui/icons-material/WhatsApp'

const Configuration = () => {
    const config = useSelector(a => a.whatsappConfig.whatsappConfig)
    const [configData, setConfigData] = useState(null)
    const [register, setRegister] = useState(null)
    const [loading, setLoading] = useState(false)
    const [modal, setModal] = useState(false)
    const [formModal, setFormModal] = useState(false)
    const loginUser = useSelector(state => state.auth.userData)
    const [deleted, setDeleted] = useState(false)
    const [failed, setFailed] = useState(false)
    const [showFilter, setShowFilter] = useState(false)
    const { colors } = useContext(ThemeColors)
    const [deletedId, setDeletedId] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [showRegisterModal, setShowRegisterModal] = useState(null)
    const [showVerificationModal, setShowVerificationModal] = useState(false) // New state for verification modal
    const [verificationModalItem, setVerificationModalItem] = useState(null) // To pass row data to modal
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
    const [registerUserId, setRegisterUserId] = useState(null)
    const [rowId, setRowId] = useState(null)
    const [ecommerceModal, setEcommerceModal] = useState(false)
    const [callingModal, setCallingModal] = useState(false) // New state for calling modal
    const [importModal, setImportModal] = useState(false)
    const [rSelected, setRSelected] = useState(null)
    const [type, setType] = useState(null)
    const [subscribeApps, setSubscribeApps] = useState(null)
    const [refundType, setRefundType] = useState(null)
    const [filterData, setFilterData] = useState({
        per_page_record: 15
    })
    const [reload, setReload] = useState(false)
    const handleImport = () => setImportModal(!importModal)
    const dispatch = useDispatch()
    const [resetIt, setResetIt] = useState(new Date())


    const preload = (data) => {
        loadWhatsappConfig({
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
        preload()
    }, [filterData])

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
        loadWhatsappConfig({
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

    // const getEncodedData = (row) => {
    // }

    const phoneNumber = (row) => {
        waAccountQualityCheck({
            id: row?.id,
            success: (e) => {
                preload()
            }
        })
    }

    const phoneNumberRequest = (row) => {
        waPhoneNumberRequest({
            id: row?.id,
            success: (e) => {
                setShowModal(true)
                setConfigData(row?.id)
            }
        })
    }
    const subscribeAppsRequest = (row) => {
        waSubscribeApps({
            id: row?.id,
            jsonData: {
                // ...data,
                user_id: row?.user_id
            },
            success: (e) => {
                // setShowModal(true)
                // setConfigData(row?.id) 
                preload()
            }
        })
    }
    const debugTokenWA = (row) => {
        WAdebugToken({
            id: row?.id,
            jsonData: {
                // ...data,
                user_id: row?.user_id
            },
            success: (e) => {
                // setShowModal(true)
                // setConfigData(row?.id) 
                preload()
            }
        })
    }


    const showStatus = (row) => {
        if (row?.code_verification_status === 'VERIFIED') {
            return (<BsTooltip title={'VERIFIED'} placement='top' className='text-success' style={{ cursor: 'pointer' }} > <VerifiedIcon style={{ color: "success" }} /> </BsTooltip>)
        }
        if (row?.code_verification_status === 'NOT_VERIFIED') {
            return (<BsTooltip title={'NOT VERIFIED'} placement='top' className='text-danger' style={{ cursor: 'pointer' }} > <Report style={{ color: "warning" }} /> </BsTooltip>)
        }
    }

    const verificationColor = (row) => {
        const status = row?.quality_rating === "UNKNOWN" || !row?.quality_rating ? "black" : (row?.quality_rating).toLowerCase()
        return <span style={{ height: 10, width: 50, backgroundColor: status, display: 'inline-block', borderRadius: 8 }}></span>
    }


    const configColumn = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "Username",
            selector: (row) => {
                return (
                    <>
                        <span>{row?.name}</span>
                    </>
                )
            },
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Verified Name",
            selector: (row) => {
                return (
                    <>
                        {showStatus(row)} <span>{row?.verified_name}</span>
                    </>
                )
            },
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Sender Number",
            selector: row => row?.display_phone_number_req,
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Business Account Id",
            selector: (row) => {
                return (
                    <>
                        <span>{row?.business_account_id}</span>
                        {/* <BsTooltip title={code(row)} placement='top' className='text-info' style={{ cursor: 'pointer' }} > <Info /> </BsTooltip> <CopyToClipboard text={code(row)} onCopy={() => toast('Copied!')}><Copy size={15} style={{ cursor: 'pointer', color: 'InfoText' }} /></CopyToClipboard> */}
                    </>
                )
            },
            sortable: true,
            minWidth: '190px'
        },
        // {
        //     name: "Facebook Add Id",
        //     selector: 'app_id',
        //     sortable: true,
        //     minWidth: '170px'
        // },

        {
            name: "Quality",
            selector: (row) => {
                return (
                    <>
                        <BsTooltip title={row?.quality_rating} placement='top' className='text-danger' style={{ cursor: 'pointer' }} > <span>{verificationColor(row)}</span></BsTooltip>
                    </>
                )

            },
            sortable: true,
            maxWidth: '120px'
        },
        // {
        //     name: "Quality Checked At",
        //     selector: 'last_quality_checked',
        //     sortable: true,
        //     minWidth: '170px'
        // },

        {
            name: "actions",
            allowOverflow: true,
            minWidth: '250px',
            selector: row => {
                return (
                    <>
                        <DropDownMenu
                            direction={'down'}
                            tooltip={"Menu"}
                            component={
                                <MoreVertical color={colors.primary.main} size={IconSizes.MenuVertical} />
                            }
                            options={[
                                {
                                    IF: row?.platform_type === 'NOT_APPLICABLE',
                                    icon: <Aod size={14} />,
                                    onClick: () => {
                                        // childLoginButton(row)
                                        setRegisterUserId(row)
                                        setShowRegisterModal(true)

                                    },
                                    name: "Register Phone No."
                                },
                                {
                                    // IF: loginUser?.userType === 0 || loginUser?.userType === 3,
                                    icon: <Loyalty size={14} />,
                                    onClick: () => {
                                        // childLoginButton(row)
                                        // setRegisterUserId(row)
                                        // setShowRegisterModal(true)
                                        subscribeAppsRequest(row)
                                    },
                                    name: "Subscribe Apps"
                                },
                                {
                                    // IF: loginUser?.userType === 0 || loginUser?.userType === 3,
                                    icon: <WhatsApp size={14} />,
                                    onClick: () => {
                                        // childLoginButton(row)
                                        // setRegisterUserId(row)
                                        // setShowRegisterModal(true)
                                        // subscribeAppsRequest(row)
                                        setRowId(row)
                                        setEcommerceModal(true)
                                    },
                                    name: "Whatsapp Ecommerce "
                                },
                                {
                                    // IF: loginUser?.userType === 0 || loginUser?.userType === 3,
                                    icon: <Call size={14} />,
                                    onClick: () => {
                                        setRowId(row)
                                        setCallingModal(true)
                                    },
                                    name: "Whatsapp Calling "
                                },
                                {
                                    IF: row?.marketing_messages_lite_api_status !== 'ONBOARDED',
                                    icon: <FactCheckIcon size={14} />,
                                    onClick: () => {
                                        waMarketingLiteApiStatus({
                                            id: row?.id,
                                            success: (data) => {
                                                if (data?.marketing_messages_lite_api_status === 'ELIGIBLE') {
                                                    // Update row locally to show the next button
                                                    // Since we can't easily update the row object in the array without a redux dispatch or full reload, 
                                                    // we'll try to trigger a reload or use a local state map if possible. 
                                                    // But for simplicity/robustness, we can just reload the data or force a re-render.
                                                    // However, the requirement says "when ... is ELIGIBLE then show a button".
                                                    // The simplest way is to check the status, show a success toast, and then maybe we can immediately call the next API if that was the flow? 
                                                    // No, "show a button send response to mm lite". 
                                                    // Implementation: Trigger a re-fetch to update the row data if the backend stores this status. 
                                                    // If backend doesn't store this status on the main config object, we'll need a local state.
                                                    // Let's assume for now we can update the specific row in the local data to include this status.

                                                    // const updatedData = config?.data.map(item => {
                                                    //     if (item.id === row.id) {
                                                    //         return { ...item, marketing_messages_lite_api_status: data?.marketing_messages_lite_api_status }
                                                    //     }
                                                    //     return item
                                                    // })
                                                    // We can't easily update redux state from here without an action. 
                                                    // So we will just use a temporary state or rely on the backend to return it if we reload.
                                                    // BUT, for now let's just use a window alert or similar if we can't persist it easily, 
                                                    // OR, better, let's assume the user can click checks status, and if eligible, 
                                                    // we display the second button immediately in this dropdown? 
                                                    // Dropdown usually closes on click. 
                                                    // So user has to open it again. We need to save this eligibility.

                                                    // Let's use a local Set or Map for eligible IDs to show the button.
                                                    // setEligibleForMmLite(prev => ({ ...prev, [row.id]: true }))
                                                }
                                                // toast.success(data?.message) // handled by api wrapper if showSuccessToast is true
                                                preload()
                                            }
                                        })
                                    },
                                    name: "Check Lite Status"
                                },
                                {
                                    IF: row?.marketing_messages_lite_api_status === 'ELIGIBLE' && (!row?.is_mm_lite_request_sent), // Only show if eligible and request not sent
                                    icon: <VerifiedIcon size={14} />,
                                    onClick: () => {
                                        onboardPartnersToMmLite({
                                            id: row?.id,
                                            success: (data) => {
                                                // toast.success(data?.message)
                                                preload()
                                            }
                                        })
                                    },
                                    name: "Send Response to MM Lite"
                                }
                                // {
                                //     icon: <Token size={14} />,
                                //     onClick: () => {

                                //         debugTokenWA(row)
                                //     },
                                //     name: "Debug Token"
                                // }

                            ]
                            }
                        />
                        <ButtonGroup>

                            <UncontrolledTooltip target="verify">Quality Check <br />

                                Last Quality Checked: {row?.last_quality_checked}</UncontrolledTooltip>
                            <Button.Ripple size="sm" color={"success"} onClick={() => { phoneNumber(row) }} id="verify"  > <FactCheckIcon fontSize='inherit' /></Button.Ripple>


                            <Show IF={row?.code_verification_status !== 'VERIFIED'}>
                                {/* <UncontrolledTooltip target="verified">Phone Number Verification</UncontrolledTooltip>
                            <Button.Ripple size="sm" color={"info"} onClick={() => { phoneNumberRequest(row) }} id="verified"> <PhoneAndroidIcon fontSize='inherit' /></Button.Ripple> */}
                                {/* <ConfirmPhoneNumber
                                    item={row}
                                    eventId={`stop-campaign1-${row?.id}`}
                                    title={`Stop  ${row?.campaign} ?`}
                                    color='text-warning'
                                    onClickYes={() => startStopCamp(row?.id)}
                                    text={'no-text'}
                                    onSuccessEvent={(item) => { preload(); log('stop') }}
                                    onFailedEvent={((item) => { })}
                                    className="dropdown-item"
                                    id={`grid-delete-${row?.id}`}>
                                    <Trash size={15} /> <span className='ms-1 align-middle'>Stop</span>
                                </ConfirmPhoneNumber> */}
                                <UncontrolledTooltip target="verified">Phone Number Verification</UncontrolledTooltip>
                                <Button.Ripple
                                    size="sm"
                                    color={"info"}
                                    onClick={() => {
                                        setVerificationModalItem(row)
                                        setShowVerificationModal(true)
                                    }}
                                    id="verified"
                                >
                                    <PhoneAndroidIcon fontSize='inherit' />
                                </Button.Ripple>
                            </Show>

                            <Show IF={Permissions?.whatsappConfigView}>
                                <UncontrolledTooltip placement='top' id='view' target='view'>
                                    View
                                </UncontrolledTooltip>
                                <ViewConfigInModal Component={Button.Ripple} size="sm" color={"success"} edit={row} id="view"> <Eye size={15} /> </ViewConfigInModal>
                            </Show>

                            <Show IF={Permissions?.whatsappConfigView}>
                                {/* <UncontrolledTooltip placement='top' id='view' target='view'>
                                View
                            </UncontrolledTooltip> */}
                                {/* <ViewDlr Component={Button.Ripple} size="sm" color={"success"} edit={row} id="view"> <Eye size={15} /></ViewDlr> */}
                            </Show>
                            {/* <UncontrolledTooltip placement='top' id='edit' target='view'>
                            edit
                        </UncontrolledTooltip> */}
                            <Show IF={Permissions?.whatsappConfigEdit}>
                                <UncontrolledTooltip placement='top' id='view' target='edit'>
                                    Edit
                                </UncontrolledTooltip>
                                <WhatsappTemplatePull Component={Button.Ripple} size="sm" color={"secondary"} edit={row} id="edit"> <Edit size={15} /> </WhatsappTemplatePull>
                            </Show>


                            <Show IF={Permissions?.whatsappConfigDelete}>

                                <ConfirmAlert
                                    title={`Delete ${row?.sender_number} ?`}
                                    color='text-warning'
                                    onClickYes={() => deleteWhatsappConfig({ id: row?.id, loading: setLoading, success: e => { setDeletedId(row?.id); setDeleted(e) }, error: setFailed })}
                                    // onClickYes={() => deletePrimaryRoute({ id: row?.id, loading: setLoading, success: setDeleted, error: setFailed })}
                                    onSuccess={deleted}
                                    onFailed={failed}

                                    onClose={(e) => {
                                        if (e) {
                                            dispatch(whatsappConfigDelete(deletedId))
                                        }
                                        setDeleted(null)
                                        setFailed(null)
                                    }}

                                    className="waves-effect btn btn-danger btn-sm"
                                    style={{ cursor: 'pointer' }}
                                    id={`grid-delete-${row?.id}`}>

                                    <Trash2 size={15} style={{ cursor: 'pointer' }} />
                                </ConfirmAlert>

                            </Show>
                        </ButtonGroup>

                    </>
                )
            }
        }
    ]

    const CustomPagination = () => {
        const count = Math.ceil(config?.total / config?.per_page)
        return (
            <ReactPaginate
                initialPage={config?.current_page - 1}
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
            <VerificationModal
                isOpen={showVerificationModal}
                toggle={() => setShowVerificationModal(!showVerificationModal)}
                onSMS={payload => {
                    waPhoneNumberRequest({
                        id: payload?.id,
                        otp_method: payload?.otp_method,
                        language: payload?.language,
                        success: (e) => {
                            setShowModal(true)
                            setConfigData(payload?.id)
                        }
                    })
                }}
                onVoice={payload => {
                    waPhoneNumberRequest({
                        id: payload?.id,
                        otp_method: payload?.otp_method,
                        language: payload?.language,
                        success: (e) => {
                            setShowModal(true)
                            setConfigData(payload?.id)
                        }
                    })
                }}
                item={verificationModalItem}
                // setShowModal={setShowModal}
                setConfigData={setConfigData}
            />

            <CheckPhoneStatus Component={Button.Ripple} showModal={showModal} edit={configData} setConfigData={setConfigData} preload={preload} setShowModal={() => setShowModal(false)} noView />
            <WhatsappPhoneNumberRegister Component={Button.Ripple} color={"secondary"} showModal={showRegisterModal} edit={registerUserId} preload={preload} setShowModal={() => setShowRegisterModal(false)} noView />
            <WhatsappEcommerce Component={Button.Ripple} color={"secondary"} showModal={ecommerceModal} edit={rowId} preload={preload} setShowModal={() => setEcommerceModal(false)} noView />
            <WhatsappCallingModal Component={Button.Ripple} color={"secondary"} showModal={callingModal} edit={rowId} preload={preload} setShowModal={() => setCallingModal(false)} noView />

            <Header icon={""} title={"Whatsapp Configuration"}>
                <ButtonGroup>

                    {/* <Show IF={user?.userType === 1 || user?.userType === 2}  > */}
                    {/* <Show IF={Permissions?.dltAction}  > */}
                    {/* <Button.Ripple size="sm" color="primary" onClick={() => handleImport()} outline>
                                <Download size="14" />    Import DLT Template
                            </Button.Ripple> */}
                    {/* </Show> */}
                    <Show IF={Permissions?.whatsappConfigCreate}>
                        <WhatsappTemplatePull Component={Button.Ripple} size="sm" color={"primary"}><Plus size="14" />Add Whatsapp</WhatsappTemplatePull>
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
                                columns={configColumn}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                sortIcon={<ChevronDown size={10} />}
                                paginationComponent={CustomPagination}
                                data={config?.data}
                                onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div>
                </>
                }

            </Card>

            <ConfigFilter show={showFilter} filterData={filterData} setFilterData={e => {
                setCurrentPage(1)
                setFilterData(e)
            }} handleFilterModal={() => { setShowFilter(false) }} />

        </>
    )
}

export default Configuration
