// @ts-nocheck
import { log } from '../../utility/helpers/common'
import React, { forwardRef, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, RefreshCcw } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Button, ButtonGroup, Card, CardBody, Col, Input, ListGroup, ListGroupItem, Modal, ModalBody, ModalHeader, Row, UncontrolledTooltip } from 'reactstrap'
import Show from '../../utility/Show'
import { createAsyncSelectMultiUserOptions, formatDate, truncateText } from '../../utility/Utils'
import { loadUserChild, loginLogView } from '../../utility/apis/userManagement'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import Shimmer from '../components/shimmers/Shimmer'

const LoginLog = () => {
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
    const [open, setOpen] = useState(false)
    const [details, setDetails] = useState(null)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError, getValues } = form
    const [rowsSelected, setRowsSelected] = useState([])
    const [filterData, setFilterData] = useState({
        per_page_record: 15
    })
    const user = useSelector(state => state.user.user)
    const [users, setUsers] = useState(null)
    const dispatch = useDispatch()
    const [reload, setReload] = useState(false)
    const loginUser = useSelector(state => state.auth.userData)

    const preload = (data) => {
        loginLogView({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: (e) => {
                // setSender(e)
            },
            loading: setLoading,
            jsonData: {
                ...filterData,
                user_id: filterData?.user_id
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
        loginLogView({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            dispatch,
            loading: setLoading
        })
    }
    const loadUserData = async (search, loadedOptions, { page }) => {

        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUsers)

    }

    const handleReload = () => {
        preload()
    }

    // const handleModal = () => {
    //     setOpen(!open)
    // }

    // create a modal 


    const logColumn = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "User Name",
            selector: (row) => (<> <span className='text-primary' onClick={() => { setOpen(!open); setDetails(row?.complete_info) }} style={{ cursor: 'pointer' }} >{row?.user?.name}</span> </>),
            sortable: true,
            minWidth: '190px'
        },
        {
            name: "IP Address",
            selector: (row) => (row?.ip_address),
            sortable: true,
            minWidth: '190px'
        },
        {
            name: "Date & Time",
            selector: (row) => (formatDate(row?.created_at, "DD-MM-YYYY hh:mm:ss")),
            sortable: true,
            minWidth: '190px'
        },
        {
            name: "City Name",
            selector: (row) => (row?.complete_info?.cityName),
            sortable: true,
            minWidth: '190px'
        },
        {
            name: "Latitude",
            selector: (row) => (row?.complete_info?.latitude),
            sortable: true,
            minWidth: '190px'
        },
        {
            name: "Longitude",
            selector: (row) => (row?.complete_info?.longitude),
            sortable: true,
            minWidth: '190px'
        }


    ]

    const CustomPagination = () => {
        const count = Math.ceil(user?.total / user?.per_page)
        return (
            <ReactPaginate
                initialPage={user?.current_page - 1}
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
            <Header icon={""} title={"Login Log List"}>
                <ButtonGroup>

                    <UncontrolledTooltip target="reload">refresh data</UncontrolledTooltip>

                    <Button.Ripple size="sm" color="secondary" id="reload" onClick={handleReload}>
                        <RefreshCcw size="14" />
                    </Button.Ripple>
                </ButtonGroup>
            </Header>
            <Card>
                <Show IF={loginUser?.userType === 0 || loginUser?.userType === 3}>
                    <Row className='justify-content-end mx-0'>
                        <Col className='d-flex align-items-center justify-content-end mt-1' md='3' sm='12'>
                            <FormGroupCustom
                                async
                                setValue={setValue}
                                noLabel
                                // defaultOptions
                                control={control}
                                type={"select"}
                                errors={errors}
                                name={"user_id"}
                                // isMulti
                                isClearable
                                loadOptions={loadUserData}
                                placeholder="User Wise Login Report"
                                onChangeValue={(v) => {
                                    // log(v)
                                    setFilterData({
                                        ...filterData,
                                        user_id: v
                                    })
                                }}
                                className='mb-1'
                                // loadOptions={loadUser}
                                options={users}
                                label="User"
                                rules={{ required: true }}
                            />
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
                                // selectableRows
                                pagination
                                paginationServer
                                className='react-dataTable'
                                columns={logColumn}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                selectableRowsComponent={BootstrapCheckbox}
                                sortIcon={<ChevronDown size={10} />}
                                paginationComponent={CustomPagination}
                                data={user?.data}
                            />
                        </div>
                    </div>
                </>
                }
                {/* <Row>
                    <Col md="5">
                        <AddSenderIDAction edit handleReportChange={handleReportChange} rowsSelected={rowsSelected} preload={preload} />
                    </Col>
                </Row> */}
            </Card>
            <Modal isOpen={open} toggle={() => setOpen(!open)} className='modal-dialog-centered' size="lg">
                <ModalHeader toggle={() => setOpen(!open)}>Login User Details</ModalHeader>
                <ModalBody>
                    <div>
                        <CardBody className='p-1'>
                            <Row>
                                <Col sm='12' md='6'>

                                    <ListGroup className='ml-2 py-2'>
                                        <ListGroupItem className='d-flex justify-content-between align-items-center'>
                                            {/* <p>{edit?.log_name}</p> */}
                                            <span className='fw-bolder'> City Name :</span>
                                            <span className='fw-bolder'>{truncateText(details?.cityName, 30 ?? 'N/A')}</span>
                                            {/* <p>{details?.properties?.attributes}</p> */}
                                        </ListGroupItem>
                                        <ListGroupItem className='d-flex justify-content-between align-items-center'>
                                            {/* <p>{details?.log_name}</p> */}
                                            <span className='fw-bolder'> Country Code :</span>
                                            <span className='fw-bolder'>{details?.countryCode ?? 'N/A'}</span>
                                            {/* <p>{details?.properties?.attributes}</p> */}
                                        </ListGroupItem>
                                        <ListGroupItem className='d-flex justify-content-between align-items-center'>
                                            <span className='fw-bolder'>Country Name:</span>
                                            <span className='fw-bolder'>{details?.countryName ?? 'N/A'}</span>
                                        </ListGroupItem>
                                        <ListGroupItem className='d-flex justify-content-between align-items-center'>
                                            <span className='fw-bolder'>Area Code:</span>
                                            <span className='fw-bolder'>{details?.areaCode ?? 'N/A'}</span>
                                        </ListGroupItem>
                                        <ListGroupItem className='d-flex justify-content-between align-items-center'>
                                            <span className='fw-bolder'>Postal Code:</span>
                                            <span className='fw-bolder'>{details?.postalCode ?? 'N/A'}</span>
                                        </ListGroupItem>
                                        <ListGroupItem className='d-flex justify-content-between align-items-center'>
                                            <span className='fw-bolder'>Region Code:</span>
                                            <span className='fw-bolder'>{details?.regionCode ?? 'N/A'}</span>
                                        </ListGroupItem>
                                        <ListGroupItem className='d-flex justify-content-between align-items-center'>
                                            <span className='fw-bolder'>Zipcode:</span>
                                            <span className='fw-bolder'>{details?.zipCode ?? 'N/A'}</span>
                                        </ListGroupItem>
                                    </ListGroup>
                                </Col>
                                <Col sm='12' md='6'>
                                    <ListGroup className='mr-2 py-2'>
                                        <ListGroupItem className='d-flex justify-content-between align-items-center'>
                                            <span className='fw-bolder'>IP :</span>
                                            <span className='fw-bolder'>{details?.ip ?? 'N/A'}</span>
                                        </ListGroupItem>
                                        <ListGroupItem className='d-flex justify-content-between align-items-center'>
                                            <span className='fw-bolder'>Iso Code :</span>
                                            <span className='fw-bolder'>{details?.isoCode ?? 'N/A'}</span>
                                        </ListGroupItem>
                                        <ListGroupItem className='d-flex justify-content-between align-items-center'>
                                            <span className='fw-bolder'>Latitude :</span>
                                            <span className='fw-bolder'>{details?.latitude ?? 'N/A'}</span>
                                        </ListGroupItem>
                                        <ListGroupItem className='d-flex justify-content-between align-items-center'>
                                            <span className='fw-bolder'>Longitude :</span>
                                            <span className='fw-bolder'>{details?.longitude ?? 'N/A'}</span>
                                        </ListGroupItem>
                                        <ListGroupItem className='d-flex justify-content-between align-items-center'>
                                            <span className='fw-bolder'>Metro Code :</span>
                                            <span className='fw-bolder'>{details?.metroCode ?? 'N/A'}</span>
                                        </ListGroupItem>
                                        <ListGroupItem className='d-flex justify-content-between align-items-center'>
                                            <span className='fw-bolder'>Region Name :</span>
                                            <span className='fw-bolder'>{details?.regionName ?? 'N/A'}</span>
                                        </ListGroupItem>
                                        <ListGroupItem className='d-flex justify-content-between align-items-center'>
                                            <span className='fw-bolder'>Time Zone :</span>
                                            <span className='fw-bolder'>{details?.timezone ?? 'N/A'}</span>
                                        </ListGroupItem>
                                    </ListGroup>
                                </Col>
                            </Row>

                        </CardBody>
                    </div>
                </ModalBody>
            </Modal>
        </>
    )
}

export default LoginLog
