// @ts-nocheck
import React, { forwardRef, useEffect, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, Plus } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardBody, CardHeader, CardTitle, Col, Form, Input, Label, Row } from 'reactstrap'
import { addCreditLoad, userCreditLoad } from '../../../utility/apis/userCredit'
import { loadUser, loadUserChild } from '../../../utility/apis/userManagement'
import { actionFor, creditType } from '../../../utility/Const'
import Hide from '../../../utility/Hide'
import { Permissions } from '../../../utility/Permissions'
import Show from '../../../utility/Show'
import { createAsyncSelectOptions, createConstSelectOptions } from '../../../utility/Utils'
import LoadingButton from '../../components/buttons/LoadingButton'
import FormGroupCustom from '../../components/formGroupCustom'
import Shimmer from '../../components/shimmers/Shimmer'

const Credit = ({ activeTab, edit }) => {

    const loginUser = useSelector(state => state.auth.userData)
    const form = useForm()
    const ref = useRef()
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const [user, setUser] = useState(null)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form
    const [rowsSelected, setRowsSelected] = useState([])
    const [currentPage, setCurrentPage] = useState("1")
    const [reload, setReload] = useState(false)
    const [rowsPerPage] = useState("15")
    const [resetIt, setResetIt] = useState(new Date())
    const [credit, setCredit] = useState(null)
    const [filterData, setFilterData] = useState({
        per_page_record: 15,
        user_id: edit?.id
    })
    const [userDetails, setUserDetails] = useState(null)
    // const user = useSelector(state => state.auth.userData)

    // sub  Category Options
    const listUser = async (search, loadedOptions, { page }) => {

        const res = await loadUser({
            async: true,
            page,
            perPage: 25,
            jsonData: { name: search }
        })
        return createAsyncSelectOptions(res, page, "name", "id", setUser)

    }

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

    const loadUserOther = () => {
        loadUserChild({
            perPage: 1000,
            jsonData: {
                search: edit?.email
            },
            loading: setLoading,
            // dispatch,
            success: (e) => {
                setUserDetails(e)

            }
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
                user_id: edit?.id,
                rate: watch("action_for") === "5" ? "0" : data?.rate
            },
            loading: setLoading,
            success: () => {
                preload()
                setResetIt(new Date()); reset()
                loadUserOther()
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
            maxWidth: "10px"
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
                if (row?.action_for === "5") { return 'Whatsapp' }
            },
            sortable: true,
            maxWidth: '125px'
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
            maxWidth: '160px'
        },
        {
            name: "Old Balance",
            selector: r => r.old_balance,
            sortable: true,
            maxWidth: '160px'
        },
        {
            name: "Difference",
            selector: (row) => (row.balance_difference),
            sortable: true,
            maxWidth: '140px'
        },
        // {
        //     name: "Credit To",
        //     selector: (row) => (row.user?.name),
        //     sortable: true,
        //     maxWidth: '140px'
        // },
        {
            name: "Credit By",
            selector: (row) => (row.created_by?.name),
            sortable: true,
            maxWidth: '140px'
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
            <Card>
                <Row>

                    <Hide IF={loginUser?.id === edit?.id}>
                        <Show IF={Permissions?.userCreditAdd}>

                            <Hide IF={loginUser?.userType === 2}>
                                <Col md="3" sm="12" className='extra-md' >
                                    <CardBody className='border'>
                                        {/* <Card className='p-2'> */}
                                        <Row>

                                            <Form ref={ref} onSubmit={handleSubmit(onSubmit)}>
                                                <Row>

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
                                                    <Show IF={watch("action_for") === "1"}>
                                                        <Col md="12">
                                                            <Label>Balance Difference</Label>
                                                            <p className=''>{userDetails?.data?.data.map((item) => {
                                                                return (
                                                                    <>
                                                                        <Show IF={watch("credit_type") === "1"}>
                                                                            {item?.transaction_credit < 0 ? item?.transaction_credit - (-watch("balance")) : item?.transaction_credit + Number(watch("balance"))}
                                                                        </Show>
                                                                        <Show IF={watch("credit_type") === "2"}>
                                                                            {item?.transaction_credit < 0 ? item?.transaction_credit - (watch("balance")) : item?.transaction_credit - Number(watch("balance"))}
                                                                        </Show>
                                                                    </>
                                                                )
                                                            })}</p>
                                                        </Col>
                                                    </Show>
                                                    
                                                    <Show IF={watch("action_for") === "1"}>
                                                        <Col md="12">
                                                            <Label>Balance Difference</Label>
                                                            <p className=''>{userDetails?.data?.data.map((item) => {
                                                                return (
                                                                    <>
                                                                        <Show IF={watch("credit_type") === "1"}>
                                                                            {item?.transaction_credit < 0 ? item?.transaction_credit - (-watch("balance")) : item?.transaction_credit + Number(watch("balance"))}
                                                                        </Show>
                                                                        <Show IF={watch("credit_type") === "2"}>
                                                                            {item?.transaction_credit < 0 ? item?.transaction_credit - (watch("balance")) : item?.transaction_credit - Number(watch("balance"))}
                                                                        </Show>
                                                                    </>
                                                                )
                                                            })}</p>
                                                        </Col>
                                                    </Show>
                                                    <Show IF={watch("action_for") === "2"}>
                                                        <Col md="12">
                                                            <Label>Balance Difference</Label>
                                                            <p className=''>{userDetails?.data?.data.map((item) => {
                                                                return (
                                                                    <>
                                                                        <Show IF={watch("credit_type") === "1"}>
                                                                            {item?.promotional_credit < 0 ? item?.promotional_credit - (-watch("balance")) : item?.promotional_credit + Number(watch("balance"))}
                                                                        </Show>
                                                                        <Show IF={watch("credit_type") === "2"}>
                                                                            {item?.promotional_credit < 0 ? item?.promotional_credit - (watch("balance")) : item?.promotional_credit - Number(watch("balance"))}
                                                                        </Show>
                                                                    </>
                                                                )
                                                            })}</p>
                                                        </Col>
                                                    </Show>
                                                    <Show IF={watch("action_for") === "3"}>
                                                        <Col md="12">
                                                            <Label>Balance Difference</Label>
                                                            <p className=''>{userDetails?.data?.data.map((item) => {
                                                                return (
                                                                    <>
                                                                        <Show IF={watch("credit_type") === "1"}>
                                                                            {item?.two_waysms_credit < 0 ? item?.two_waysms_credit - (-watch("balance")) : item?.two_waysms_credit + Number(watch("balance"))}
                                                                        </Show>
                                                                        <Show IF={watch("credit_type") === "2"}>
                                                                            {item?.two_waysms_credit < 0 ? item?.two_waysms_credit - (watch("balance")) : item?.two_waysms_credit - Number(watch("balance"))}
                                                                        </Show>
                                                                    </>
                                                                )
                                                            })}</p>
                                                        </Col>
                                                    </Show>
                                                    <Show IF={watch("action_for") === "4"}>
                                                        <Col md="12">
                                                            <Label>Balance Difference</Label>
                                                            <p className=''>{userDetails?.data?.data.map((item) => {
                                                                return (
                                                                    <>
                                                                        <Show IF={watch("credit_type") === "1"}>
                                                                            {item?.voice_sms_credit < 0 ? item?.voice_sms_credit - (-watch("balance")) : item?.voice_sms_credit + Number(watch("balance"))}
                                                                        </Show>
                                                                        <Show IF={watch("credit_type") === "2"}>
                                                                            {item?.voice_sms_credit < 0 ? item?.voice_sms_credit - (watch("balance")) : item?.voice_sms_credit - Number(watch("balance"))}
                                                                        </Show>
                                                                    </>
                                                                )
                                                            })}</p>
                                                        </Col>
                                                    </Show>

                                                    <Hide IF={watch("action_for") === "5"}>
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
                                                    </Hide>

                                                </Row>
                                                <Col md="12">
                                                    <LoadingButton loading={loading} type='submit' className='btn-icon mt-2 round' color='primary' block>
                                                        <Plus size={14} />
                                                        <span className='align-middle ms-25'>Add Credit</span>
                                                    </LoadingButton>

                                                </Col>
                                            </Form>
                                        </Row>
                                    </CardBody>
                                </Col>
                            </Hide>
                        </Show>
                    </Hide>
                    <Col md={loginUser?.userType === 2 ? "12" : "9"} className='extra-md' sm={loginUser?.userType === 2 ? "12" : "12"}>
                        <CardBody className='border'>
                            {/* <Card className='p-2'> */}
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
                            </>}
                        </CardBody>
                    </Col>
                </Row>
            </Card>
        </>
    )
}

export default Credit
