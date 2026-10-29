// @ts-nocheck
import React, { forwardRef, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, RefreshCcw } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Card, Col, Form, Input, Row, UncontrolledTooltip } from 'reactstrap'
import { actionFor } from '../../utility/Const'
import { createConstSelectOptions } from '../../utility/Utils'
import { userWiseCredit } from '../../utility/apis/userManagement'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import Shimmer from '../components/shimmers/Shimmer'
import { formatIndianNumber, isValid } from '../../utility/helpers/common'

const UserWiseCreditReport = () => {
    const usersCredit = useSelector(a => a.user.user)
    const [loading, setLoading] = useState(false)
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
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
    const [filterData, setFilterData] = useState({
        per_page_record: 15
    })
    const [reload, setReload] = useState(false)
    const [resetIt, setResetIt] = useState(new Date())


    const dispatch = useDispatch()

    const preload = (data) => {
        userWiseCredit({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: (e) => {
                // setSender(e)
            },
            loading: setLoading,
            jsonData: {
                ...filterData,
                search: filterData?.search,
                less_than_balance: filterData?.less_than_balance,
                route_type: filterData?.route_type
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
        userWiseCredit({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            dispatch,
            loading: setLoading
        })
    }

    const submitFilter = (d) => {
        setFilterData({
            ...d
            // filterData
        })
        // console.log(d)

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
            name: "Name",
            selector: r => r.name,
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Email",
            selector: r => r.email,
            sortable: true,
            minWidth: '180px'
        },
        {
            name: "Transactional",

            selector: (row) => (isValid(row?.transaction_credit) ? formatIndianNumber(parseInt(row?.transaction_credit)) : 0),
            sortable: true,
            minWidth: '215px'
        },
        {
            name: "Promotional",
            selector: (row) => (isValid(row?.promotional_credit) ? formatIndianNumber(parseInt(row?.promotional_credit)) : 0),
            sortable: true,
            minWidth: '260px'
        },

        {
            name: "Two Way",
            selector: (row) => (isValid(row?.two_waysms_credit) ? formatIndianNumber(parseInt(row?.two_waysms_credit)) : 0),
            sortable: true,
            minWidth: '215px'
        },
        {
            name: "Voice",
            selector: (row) => (isValid(row?.voice_sms_credit) ? formatIndianNumber(parseInt(row?.voice_sms_credit)) : 0),

            sortable: true,
            minWidth: '260px'
        }

    ]

    const CustomPagination = () => {
        const count = Math.ceil(usersCredit?.total / usersCredit?.per_page)
        return (
            <ReactPaginate
                initialPage={usersCredit?.current_page - 1}
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
            <Header icon={""} title={"User Wise Credit Report"}>
                <UncontrolledTooltip target="reload">Refresh Data</UncontrolledTooltip>
                <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { setFilterData({}); setReload(true); setResetIt(new Date()); reset() }} >
                    <RefreshCcw size="14" />
                </Button.Ripple>
            </Header>
            <Card>
                <Form onSubmit={handleSubmit(submitFilter)}>

                    <Row className='justify-content-start mx-0'>
                        <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                            <FormGroupCustom
                                key={resetIt}
                                noLabel
                                defaultOptions
                                control={control}
                                type={"select"}
                                errors={errors}
                                name={"route_type"}
                                // isMulti
                                isClearable

                                className='mb-1'
                                // loadOptions={loadUser}
                                // options={user}
                                options={createConstSelectOptions(actionFor)}
                                placeholder="Select Route Type"
                                label="Route Type"
                                rules={{ required: false }}
                            />
                        </Col>
                        <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                            <FormGroupCustom
                                key={resetIt}
                                name={"less_than_balance"}
                                type={"text"}
                                errors={errors}
                                label="Balance"
                                noLabel
                                placeholder="Less than balance"
                                // dateFormat={"YYYY-MM-DD"}

                                className='mb-1'
                                setValue={setValue}
                                // className="mb-2"
                                control={control}
                            />
                        </Col>
                        <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                            <FormGroupCustom
                                key={resetIt}
                                name={"search"}
                                type={"text"}
                                errors={errors}
                                label="Search"
                                noLabel
                                // dateFormat={"YYYY-MM-DD"}

                                className='mb-1'
                                setValue={setValue}
                                // className="mb-2"
                                control={control}
                            />
                        </Col>
                        <Col className='d-flex align-items-center justify-content-center ' md='2' sm='12'>
                            <LoadingButton loading={loading} type='submit' className='btn-icon' color='primary' block>
                                <span className='align-middle ms-25'>Search</span>
                            </LoadingButton>
                        </Col>
                    </Row>
                </Form>

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
                                //   selectableRows
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
                                data={usersCredit?.data}
                            //   onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div>
                </>
                }
            </Card>
        </>
    )
}

export default UserWiseCreditReport
