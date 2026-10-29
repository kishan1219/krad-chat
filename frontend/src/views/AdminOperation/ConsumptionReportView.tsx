// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { RefreshCcw } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Button, ButtonGroup, Card, Col, Form, Row, Table, UncontrolledTooltip } from 'reactstrap'
import { createAsyncSelectOptions, formatDate, minusDay } from '../../utility/Utils'
import { consumptionReportView } from '../../utility/apis/adminOperation'
import { loadUserChild } from '../../utility/apis/userManagement'
import { formatIndianNumber, isValid, log } from '../../utility/helpers/common'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import Shimmer from '../components/shimmers/Shimmer'
import { useSelector } from 'react-redux'
import Hide from '../../utility/Hide'
import Show from '../../utility/Show'

const ConsumptionReportView = () => {
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
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(null)
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
    const loginUser = useSelector(state => state.auth.userData)
    const [filterData, setFilterData] = useState({
        per_page_records: 15,
        from_date: '',
        to_date: '',
        user_id: ''
    })
    const [reload, setReload] = useState(false)
    const [resetIt, setResetIt] = useState(new Date())
    const [view, setView] = useState()
    const listUser = async (search, loadedOptions, { page }) => {

        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectOptions(res, page, "name", "id", setUser)

    }

    const preload = () => {
        if (isValid(filterData?.user_id)) {
            consumptionReportView({
                perPage: 1000,
                success: (e) => {
                    setView(e)
                },
                loading: setLoading,
                jsonData: {
                    ...filterData,
                    user_id: filterData?.user_id,
                    // user_id: [loginUser?.userType === 2 ? loginUser?.id : filterData?.user_id],
                    from_date: watch("from_date"),
                    to_date: watch("to_date"),
                    type: 2

                }
            })
        }
    }

    // log(view, "view")
    useEffect(() => {

        preload()
    }, [filterData])

    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])

    const submitFilter = (d) => {
        setFilterData({
            ...d,
            user_id: loginUser?.userType === 2 ? loginUser?.id : d?.user_id

        })

    }

    const reportColumn = [
        // {
        //     name: "#",
        //     selector: (row, i) => (row.id ? (i + 1) : null),
        //     maxWidth: "10px"

        // },
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "Date",
            selector: r => r.send_date,
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Total Credit",
            selector: r => r.total_credit,
            sortable: true,
            minWidth: '180px'
        },
        {
            name: "Total Submission",
            selector: (row) => (row?.total_submission),
            sortable: true,
            minWidth: '215px'
        },
        {
            name: "Total Delivered",
            selector: (row) => (row?.total_delivered),
            sortable: true,
            minWidth: '260px'
        },


        {
            name: "Total Pending",
            selector: (row) => (row?.total_pending),
            sortable: true,
            minWidth: '215px'
        },
        {
            name: "Total Invalid",
            selector: (row) => (row?.total_invalid),
            sortable: true,
            minWidth: '260px'
        },
        {
            name: "Total Expired",
            selector: (row) => (row?.total_expired),
            sortable: true,
            minWidth: '260px'
        },
        {
            name: "Total Failed",
            selector: (row) => (row?.total_failed),
            sortable: true,
            minWidth: '260px'
        },
        {
            name: "Total Rejected",
            selector: (row) => (row?.total_reject),
            sortable: true,
            minWidth: '260px'
        }

    ]

    return (
        <>
            <Header icon={""} title={"User Wise Consumption Report"} >
                <ButtonGroup>
                    <UncontrolledTooltip target="reload">refresh data</UncontrolledTooltip>
                    <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { setFilterData({}); setReload(true); setResetIt(new Date()); reset() }} >
                        <RefreshCcw size="14" />
                    </Button.Ripple>
                </ButtonGroup>
            </Header>

            <Card>
                <Form onSubmit={handleSubmit(submitFilter)}>
                    <Row className='justify-content-start mx-0'>
                        <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                            <FormGroupCustom
                                key={resetIt}
                                noLabel
                                async
                                setValue={setValue}
                                control={control}
                                type={"select"}
                                errors={errors}
                                name={"user_id"}
                                isClearable
                                className='mb-1'
                                loadOptions={listUser}
                                options={user}
                                label="User"
                                rules={{ required: true }}

                            />
                        </Col>

                        <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                            <FormGroupCustom
                                key={resetIt}
                                noLabel
                                defaultOptions
                                control={control}
                                name={"from_date"}
                                type={"date"}
                                options={{
                                    minDate: formatDate(new Date(
                                        minusDay(
                                            new Date(), 30
                                        )
                                    ))
                                }}
                                errors={errors}
                                label={"From"}
                                dateFormat={"YYYY-MM-DD"}
                                setValue={setValue}
                                className="mb-1"
                                rules={{ required: true }}

                            />
                        </Col>
                        <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
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
                        <Col className='d-flex align-items-center justify-content-end' md='3' sm='12'>
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

                    {/* <Show IF={isValid(view)}> */}
                    <Show IF={isValid(view)}>
                        <Table striped responsive>
                            <thead>

                                <tr>
                                    <th scope='col' className='text-nowrap'>
                                        #
                                    </th>
                                    <th scope='col' className='text-nowrap'>
                                        Date
                                    </th>
                                    <th scope='col' className='text-nowrap'>
                                        Total Credit
                                    </th>
                                    <th scope='col' className='text-nowrap'>
                                        Total Submission
                                    </th>
                                    <th scope='col' className='text-nowrap'>
                                        Total Delivered
                                    </th>
                                    <th scope='col' className='text-nowrap'>
                                        Total Pending
                                    </th>
                                    <th scope='col' className='text-nowrap'>
                                        Total Invalid
                                    </th>
                                    <th scope='col' className='text-nowrap'>
                                        Total Expired
                                    </th>
                                    <th scope='col' className='text-nowrap'>
                                        Total Failed
                                    </th>
                                    <th scope='col' className='text-nowrap'>
                                        Total Rejected
                                    </th>
                                </tr>
                            </thead>                            

                            {view?.map((item, index) => {
                                return (

                                    <>
                                        <tbody>
                                            <tr>
                                                <td className='text-nowrap' > {index + 1} </td>
                                                <td className='text-nowrap'> {item?.send_date}</td>
                                                <td className='text-nowrap'> {isValid(item?.total_credit) ? formatIndianNumber(parseInt(item?.total_credit)) : 'N/A'}</td>
                                                <td className='text-nowrap'> {isValid(item?.total_submission) ? formatIndianNumber(parseInt(item?.total_submission)) : 'N/A'}</td>
                                                <td className='text-nowrap'> {isValid(item?.total_delivered) ? formatIndianNumber(parseInt(item?.total_delivered)) : 'N/A'}</td>
                                                <td className='text-nowrap'> {isValid(item?.total_pending) ? formatIndianNumber(parseInt(item?.total_pending)) : 'N/A'}</td>
                                                <td className='text-nowrap'> {isValid(item?.total_invalid) ? formatIndianNumber(parseInt(item?.total_invalid)) : 'N/A'}</td>
                                                <td className='text-nowrap'> {isValid(item?.total_expired) ? formatIndianNumber(parseInt(item?.total_expired)) : 'N/A'}</td>
                                                <td className='text-nowrap'> {isValid(item?.total_failed) ? formatIndianNumber(parseInt(item?.total_failed)) : 'N/A'}</td>
                                                <td className='text-nowrap'> {isValid(item?.total_reject) ? formatIndianNumber(parseInt(item?.total_reject)) : 'N/A'}</td>
                                            </tr>
                                        </tbody>
                                    </>
                                )
                            })}

                        </Table>
                    </Show>
                    {/* </Show> */}
                </>
                }
            </Card>
        </>
    )
}

export default ConsumptionReportView
