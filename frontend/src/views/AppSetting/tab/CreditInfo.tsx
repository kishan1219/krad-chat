// @ts-nocheck
import '@styles/react/libs/tables/react-dataTable-component.scss'
import React, { forwardRef, useEffect, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, Plus } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardHeader, CardTitle, Col, Form, Input, Label, Row } from 'reactstrap'
import { actionFor, creditType } from '../../../utility/Const'
import Hide from '../../../utility/Hide'
import { Permissions } from '../../../utility/Permissions'
import Show from '../../../utility/Show'
import { createAsyncSelectMultiUserOptions, createConstSelectOptions } from '../../../utility/Utils'
import { addCreditLoad, userCreditLoad } from '../../../utility/apis/userCredit'
import { loadUserChild } from '../../../utility/apis/userManagement'
import { log } from '../../../utility/helpers/common'
import LoadingButton from '../../components/buttons/LoadingButton'
import FormGroupCustom from '../../components/formGroupCustom'
import Shimmer from '../../components/shimmers/Shimmer'

const CreditInfo = ({ activeTab }) => {

    const loginUser = useSelector(state => state.auth.userData)
    const form = useForm()
    const ref = useRef()
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const [userID, setUserID] = useState(null)
    const [user, setUser] = useState(null)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form
    const [rowsSelected, setRowsSelected] = useState([])
    const [currentPage, setCurrentPage] = useState("1")
    const [transactional, setTransactional] = useState(null)
    const [promotional, setPromotional] = useState(null)
    const [voice, setVoice] = useState(null)
    const [twoWay, setTwoWay] = useState(null)
    const [reload, setReload] = useState(false)
    const [rowsPerPage] = useState("15")
    const [resetIt, setResetIt] = useState(new Date())
    const [credit, setCredit] = useState(null)
    const [userDetails, setUserDetails] = useState(null)

    const [filterData, setFilterData] = useState({
        per_page_record: 15
    })
    // const user = useSelector(state => state.auth.userData)

    // sub  Category Options
    const listUser = async (search, loadedOptions, { page }) => {

        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", null, setUser)

    }
    const loadUserOther = () => {
        loadUserChild({
            perPage: 1000,
            jsonData: {
                search: userID
            },
            loading: setLoading,
            // dispatch,
            success: (e) => {
                setUserDetails(e)

            }
        })
    }
    // log(userID, "user ID")


    useEffect(() => {
        if (activeTab === "5" && loginUser?.userType !== 2) {
            // listUser()
        }
    }, [activeTab])

    // log(user, "dfsfdsf")
    // log(credit, "credit")

    const preload = () => {
        userCreditLoad({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: (e) => {
                setCredit(e)
            },
            loading: setLoading,
            jsonData: filterData
        })
    }

    useEffect(() => {
        if (activeTab === "5") {
            preload()
            loadUserOther()
        }
    }, [filterData, activeTab])

    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])


    const onSubmit = (data) => {
        addCreditLoad({
            jsonData: {
                ...data,
                // user_id: loginUser?.userType === 0 || loginUser?.userType === 3 ? data?.user_id  : loginUser?.id

                user_id: data?.user_id?.id
            },
            loading: setLoading,
            success: () => {
                preload()
                setResetIt(new Date()); reset()


            }
        })
    }


    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        userCreditLoad({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            success: setCredit,
            loading: setLoading
        })
    }

    const creditColumn = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "5px"
        },
        {
            name: "Type",
            selector: row => {
                if (row?.credit_type === "1") { return 'Credit' }
                if (row?.credit_type === "2") { return 'Debit' }
            },
            sortable: true,
            maxWidth: '10px'
        },
        {
            name: "Route Type",
            selector: row => {
                if (row?.action_for === "1") { return 'Transaction' }
                if (row?.action_for === "2") { return 'Promotional' }
                if (row?.action_for === "3") { return 'Two Way Sms' }
                if (row?.action_for === "4") { return 'Voice' }
            },
            sortable: true,
            maxWidth: '115px'
        },

        {
            name: "Rate",
            selector: r => r.rate,
            sortable: true,
            maxWidth: '10px'
        },
        {
            name: "Current Balance",
            selector: r => r.current_balance,
            sortable: true,
            minWidth: '160px'
        },
        {
            name: "Old Balance",
            selector: r => r.old_balance,
            sortable: true,
            minWidth: '140px'
        },
        {
            name: "Difference",
            selector: (row) => (row.balance_difference),
            sortable: true,
            maxWidth: '140px'
        },
        {
            name: "Credited To",
            selector: (row) => (row.user?.name),
            sortable: true,
            minWidth: '140px'
        },
        {
            name: "Credited By",
            selector: (row) => (row.created_by?.name),
            sortable: true,
            minWidth: '140px'
        }


    ]

    const CustomPagination = () => {
        const count = Math.ceil(credit?.data?.total / credit?.data?.per_page)
        return (
            <ReactPaginate
                initialPage={credit?.data?.current_page - 1}
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
            <Row>
                <Col md={loginUser?.userType === 2 ? "12" : "9"}>
                    <Card className='p-2'>
                        <CardHeader className='border-bottom inline'>
                            <CardTitle className='text-primary' tag='h4'>Credit List</CardTitle>
                        </CardHeader>

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
                                        columns={creditColumn}
                                        noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                            No Record Found
                                        </div>}
                                        selectableRowsComponent={BootstrapCheckbox}
                                        sortIcon={<ChevronDown size={10} />}
                                        paginationComponent={CustomPagination}
                                        data={credit?.data?.data}
                                    // onSelectedRowsChange={handleReportChange}
                                    />
                                </div>
                            </div>
                        </>}
                    </Card>
                </Col>
                <Show IF={Permissions?.userCreditAdd}>
                    <Hide IF={loginUser?.userType === 2}>
                        <Col md="3">
                            <Card className='p-2'>
                                <Row>

                                    <Form ref={ref} onSubmit={handleSubmit(onSubmit)}>
                                        <Row>

                                            {/* <Hide IF= {loginUser?.userType === 1 ||  loginUser?.userType === 2}> */}
                                            <Col md="12">
                                                <FormGroupCustom
                                                    // noLabel
                                                    // noGroup
                                                    key={resetIt}
                                                    async
                                                    // defaultOptions
                                                    loadOptions={listUser}
                                                    type={"select"}
                                                    control={control}
                                                    message="Login User can't be selected"
                                                    name="user_id"
                                                    value={watch('user_id')}
                                                    isClearable
                                                    placeholder="Select User"
                                                    className='mb-1'
                                                    isOptionDisabled={(op, val) => {
                                                        return ((loginUser?.id) === op?.value?.id)
                                                    }}
                                                    onChangeValue={(e) => {
                                                        // log(e, "yes I")
                                                        setTransactional(e?.transaction_credit)
                                                        setPromotional(e?.promotional_credit)
                                                        setVoice(e?.voice_sms_credit)
                                                        setTwoWay(e?.two_waysms_credit)
                                                    }}

                                                    label="User "
                                                    setValue={setValue}
                                                    errors={errors}
                                                    options={user}
                                                    rules={{ required: true }}

                                                />
                                            </Col>
                                            {/* </Hide> */}
                                            <Col md="12">
                                                <FormGroupCustom
                                                    // noLabel
                                                    // noGroup
                                                    type={"select"}
                                                    control={control}
                                                    key={resetIt}


                                                    name="action_for"
                                                    // value={edit?.userType}
                                                    isClearable
                                                    className='mb-1'
                                                    label="Route Type "
                                                    errors={errors}
                                                    options={createConstSelectOptions(actionFor)}
                                                    rules={{ required: true }}

                                                />
                                            </Col>
                                            <Col md="12">
                                                <FormGroupCustom
                                                    // noLabel
                                                    // noGroup
                                                    type={"select"}
                                                    control={control}
                                                    name="credit_type"
                                                    className='mb-1'
                                                    // value={edit?.userType}
                                                    isClearable
                                                    key={resetIt}


                                                    label="Credit Type "
                                                    errors={errors}
                                                    options={createConstSelectOptions(creditType)}
                                                    rules={{ required: true }}

                                                />
                                            </Col>
                                            <Col md="12">
                                                <FormGroupCustom
                                                    // noLabel
                                                    // noGroup
                                                    key={resetIt}
                                                    type={"number"}
                                                    control={control}
                                                    // forceValue
                                                    // onChangeValue={e => {
                                                    //     setValue("balance", e)
                                                    // }}
                                                    className='mb-1'
                                                    name="balance"
                                                    // value={edit?.userType}
                                                    isClearable
                                                    label="Balance "
                                                    errors={errors}
                                                    rules={{ required: true, min: "1" }}
                                                />
                                            </Col>
                                            <Col md="12">
                                                <Show IF={watch("action_for") === "1"}>
                                                    <Col md="12">
                                                        <Label>Balance Difference</Label>
                                                        <Show IF={watch("credit_type") === "1"}>
                                                            <p>{transactional < 0 ? transactional - (-watch("balance")) : transactional + Number(watch("balance"))}</p>
                                                        </Show>
                                                        <Show IF={watch("credit_type") === "2"}>
                                                            <p>{transactional < 0 ? transactional - (watch("balance")) : transactional - Number(watch("balance"))}</p>
                                                        </Show>

                                                    </Col>
                                                </Show>
                                                <Show IF={watch("action_for") === "2"}>
                                                    <Col md="12">
                                                        <Show IF={watch("credit_type") === "1"}>
                                                            <p>{promotional < 0 ? promotional - (-watch("balance")) : promotional + Number(watch("balance"))}</p>
                                                        </Show>
                                                        <Show IF={watch("credit_type") === "2"}>
                                                            <p>{promotional < 0 ? promotional - (watch("balance")) : promotional - Number(watch("balance"))}</p>
                                                        </Show>
                                                    </Col>
                                                </Show>
                                                <Show IF={watch("action_for") === "3"}>
                                                    <Col md="12">
                                                        <Label>Balance Difference</Label>
                                                        <Show IF={watch("credit_type") === "1"}>
                                                            <p> {twoWay < 0 ? twoWay - (-watch("balance")) : twoWay + Number(watch("balance"))}</p>
                                                        </Show>
                                                        <Show IF={watch("credit_type") === "2"}>
                                                            <p> {twoWay < 0 ? twoWay - (watch("balance")) : twoWay - Number(watch("balance"))}</p>
                                                        </Show>
                                                    </Col>
                                                </Show>
                                                <Show IF={watch("action_for") === "4"}>
                                                    <Col md="12">
                                                        <Label>Balance Difference</Label>

                                                        <Show IF={watch("credit_type") === "1"}>
                                                            <p>  {voice < 0 ? voice - (-watch("balance")) : voice + Number(watch("balance"))}</p>
                                                        </Show>
                                                        <Show IF={watch("credit_type") === "2"}>
                                                            <p>  {voice < 0 ? voice - (watch("balance")) : voice - Number(watch("balance"))}</p>
                                                        </Show>
                                                    </Col>
                                                </Show>
                                            </Col>
                                            <Col md="12">
                                                <FormGroupCustom
                                                    // noLabel
                                                    // noGroup
                                                    key={resetIt}
                                                    type={"number"}
                                                    control={control}
                                                    className='mb-1'
                                                    name="rate"
                                                    // value={edit?.userType}
                                                    isClearable
                                                    step="any"
                                                    label="Rate "
                                                    errors={errors}
                                                    rules={{ required: true, min: "0", step: "any" }}
                                                />
                                            </Col>


                                        </Row>
                                        <Col md="12">
                                            <LoadingButton loading={loading} type='submit' className='btn-icon mt-2 round' color='primary' block>
                                                <Plus size={14} />
                                                <span className='align-middle ms-25'>Add Credit</span>
                                            </LoadingButton>

                                        </Col>
                                    </Form>
                                </Row>
                            </Card>
                        </Col>
                    </Hide>
                </Show>
            </Row>

        </>
    )
}

export default CreditInfo
