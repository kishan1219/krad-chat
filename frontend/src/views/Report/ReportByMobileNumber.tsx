// @ts-nocheck

import { ThemeColors } from '@src/utility/context/ThemeColors'
import classNames from 'classnames'
import React, { forwardRef, useContext, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, RefreshCcw, Sliders } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Button, ButtonGroup, Card, Col, Form, Input, Row, UncontrolledTooltip } from 'reactstrap'
import { startOrStopCampaign } from '../../utility/apis/campaign'
import { exportByID, reportByNumber } from '../../utility/apis/report'
import { loadUser, loadUserChild } from '../../utility/apis/userManagement'
import { isValid, log } from '../../utility/helpers/common'
import Hide from '../../utility/Hide'
import httpConfig from '../../utility/http/httpConfig'
import { createAsyncSelectMultiUserOptions, createAsyncSelectOptions, createSelectOptions, formatDate, minusDay } from '../../utility/Utils'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import Shimmer from '../components/shimmers/Shimmer'
import ExportByMobile from './ExportByMobile'
import ExportBySender from './ExportBySender'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import LoadingButton from '../components/buttons/LoadingButton'
import Show from '../../utility/Show'


const ReportByMobileNumber = () => {
    const { colors } = useContext(ThemeColors)
    const reportList = useSelector(a => a.report.report)
    const loginUser = useSelector(state => state.auth.userData)
    const [message, setMessage] = useState(null)
    const [campaign, setCampaign] = useState(null)
    const [loading, setLoading] = useState(false)

    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
    const [page, setPage] = useState(1)
    const [editId, setEditId] = useState(null)
    const [show, setShow] = useState(false)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form
    const [perPage, setPerPage] = useState(15)
    const [rowsSelected, setRowsSelected] = useState([])
    const [importModal, setImportModal] = useState(false)
    const [editData, setEditData] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [detailModal, setDetailModal] = useState(false)
    const [senderID, setSenderID] = useState(false)
    const [mobile, setMobile] = useState(false)
    const [user, setUser] = useState(null)
    const [resetIt, setResetIt] = useState(new Date())
    const [edit, setEdit] = useState(null)
    const [filterData, setFilterData] = useState({
        per_page_record: 15,
        user_id: ""
    })
    const [reload, setReload] = useState(false)

    const handleSender = () => setSenderID(!senderID)
    const handleMobile = () => setMobile(!mobile)

    const dispatch = useDispatch()

    const preload = () => {
        // if (isValid(filterData?.user_id) && isValid(filterData?.mobile)) {
        reportByNumber({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            // success: (e) => {
            //     setMessage(e)
            // },
            success: setMessage,
            loading: setLoading,
            jsonData: filterData
        })

    }


    const loadUserData = async (search, loadedOptions, { page }) => {

        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUser)
    }

    useEffect(() => {
        if (isValid(watch("mobile")) && isValid(watch("from_date")) && isValid(watch("to_date"))) {
            preload()
        }
    }, [filterData])

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        reportByNumber({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            // dispatch,
            success: setMessage,
            loading: setLoading
        })
    }

    const handleReload = () => {
        preload()
    }

    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])

    const ExpandableTable = ({ data }) => {
        return (
            <div className='expandable-content p-2 border-bottom'>

                <b className='text-primary'> Message:</b>  {data?.message}
            </div>
        )
    }

    const startStopCamp = (row) => {
        startOrStopCampaign({
            jsonData: {

                send_sms_id: row

            }
        })
    }

    const submitFilter = (d) => {
        setFilterData({
            ...d,
            user_id: loginUser?.userType === 2 ? loginUser?.id : d?.user_id
            // filterData
        })
        // console.log(d)

    }
    
    const exportReportById = (row) => {
        exportByID({
            jsonData: {

                send_sms_id: row

            },
            success: (e) => {

                window.open(httpConfig?.baseUrl2 + e?.data?.file_path, "_blank")
            }
        })
    }

    const campaignListing = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "Name",
            selector: r => r.name,
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Mobile",
            selector: r => r.mobile,
            sortable: true,
            minWidth: '170px'
        },

        {
            name: "Message",
            cell: (row, index) => {
                return (<span className='text-wrap'>{row.message}</span>)
            },
            sortable: true,
            minWidth: '400px'
        },
        {
            name: "Dlt Template ID",
            selector: r => r.dlt_template_id,
            sortable: true,
            minWidth: '190px'
        },
        {
            name: "User Credit",
            selector: r => r.use_credit,
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Stats/Code",
            selector: (row) => (<>{row?.stat}/{row?.err}</>),
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Submit Date",
            selector: r => r.submit_date,
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Completed Date",
            selector: r => r.done_date,
            sortable: true,
            minWidth: '180px'
        }

    ]

    const CustomPagination = () => {
        const count = Math.ceil(message?.data?.total / message?.data?.per_page)
        return (
            <ReactPaginate
                initialPage={message?.data?.current_page - 1}
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

            <Header icon={""} title="Report By Mobile Number" >
                {/* Tooltips */}


                <Hide IF={loginUser?.account_type === 2}>

                    <ButtonGroup color='primary' className='me-25'>
                        <Button.Ripple size="sm" color="primary" id="filter" onClick={() => handleSender()}>
                            <Sliders size="14" /> Export By Sender ID
                        </Button.Ripple>
                    </ButtonGroup>
                </Hide>
                <ButtonGroup color='info' className='me-25'>
                    <Button.Ripple size="sm" color="dark" id="filter" onClick={() => handleMobile()}>
                        <Sliders size="14" /> Export By Mobile Number
                    </Button.Ripple>
                </ButtonGroup>
                <ButtonGroup>
                    <UncontrolledTooltip target="reload">Reset Field</UncontrolledTooltip>
                    <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { setFilterData({}); setReload(true); setResetIt(new Date()); reset() }} >
                        <RefreshCcw size="14" />
                    </Button.Ripple>
                </ButtonGroup>
            </Header>
            <Card>
                <Form onSubmit={handleSubmit(submitFilter)}>
                    <Row className='justify-content-start mx-0 mb-1'>
                        <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                            <FormGroupCustom
                                key={resetIt}
                                noLabel
                                control={control}
                                type={"text"}
                                errors={errors}
                                name={"mobile"}
                                placeholder="Enter Mobile Number"
                                isClearable
                                className='mb-1'
                                // loadOptions={loadUser}
                                // options={user}
                                label="User"
                                minLength="10"
                                maxLength="10"
                                rules={{ required: true, minLength: 10, maxLength: 10 }}

                            />

                        </Col>
                        <Hide IF={loginUser?.userType === 2}>

                            <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                                <FormGroupCustom
                                    key={resetIt}
                                    noLabel
                                    async
                                    setValue={setValue}
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    placeholder="Select User"
                                    name={"user_id"}
                                    isClearable
                                    className='mb-1'
                                    loadOptions={loadUserData}
                                    options={user}
                                    label="User"
                                    rules={{ required: true }}

                                />
                            </Col>
                        </Hide>
                        <Show IF={loginUser?.userType === 2}>
                            <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>

                                <Input
                                    type='text'
                                    value={loginUser?.name}
                                    disabled
                                    className="mb-1"
                                />
                            </Col>

                        </Show>
                        <Col className='d-flex align-items-center justify-content-start mt-1' md='2' sm='12'>
                            <FormGroupCustom
                                key={resetIt}
                                noLabel
                                defaultOptions
                                control={control}
                                name={"from_date"}
                                options={{
                                    minDate: formatDate(new Date(
                                        minusDay(
                                            new Date(), 30
                                        )
                                    ))
                                }}
                                type={"date"}
                                errors={errors}
                                label={"From"}
                                dateFormat={"YYYY-MM-DD"}
                                setValue={setValue}
                                className="mb-1"
                                rules={{ required: true }}


                            />
                        </Col>
                        <Col className='d-flex align-items-center justify-content-start mt-1' md='2' sm='12'>
                            <FormGroupCustom
                                key={resetIt}
                                noLabel
                                defaultOptions
                                control={control}
                                name={"to_date"}
                                type={"date"}
                                errors={errors}

                                options={{
                                    // enableTime: true,
                                    minDate: watch("from_date")
                                }}
                                label={"To"}
                                dateFormat={"YYYY-MM-DD"}
                                setValue={setValue}
                                isClearable
                                className="mb-1"
                                rules={{ required: true }}

                            />

                        </Col>
                        <Col className='d-flex align-items-center justify-content-center ' md='2' sm='12'>
                            <LoadingButton loading={loading} type='submit' className='btn-icon' color='primary' block>
                                <span className='align-middle ms-25'>Search</span>
                            </LoadingButton>
                        </Col>
                    </Row>

                </Form>
            </Card>
            <Card className='mt-2'>

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
                                // expandableRows
                                // expandOnRowClicked
                                columns={campaignListing}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                selectableRowsComponent={BootstrapCheckbox}
                                sortIcon={<ChevronDown size={10} />}
                                // expandableRowsComponent={ExpandableTable}
                                paginationComponent={CustomPagination}
                                data={message?.data?.data}
                            // onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div>
                </>}

            </Card>
            <ExportBySender
                handleSender={handleSender}
                setSenderID={setSenderID}
                senderID={senderID}
            />
            <ExportByMobile
                handleMobile={handleMobile}
                setMobile={setMobile}
                mobile={mobile}
            />
        </>
    )
}

export default ReportByMobileNumber
