// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardBody, Col, Form, Input, Row } from 'reactstrap'
import Hide from '../../utility/Hide'
import Show from '../../utility/Show'
import { createAsyncSelectMultiUserOptions, createAsyncSelectOptions, formatDate, minusDay } from '../../utility/Utils'
import { getOverview } from '../../utility/apis/adminOperation'
import { loadSenderIds } from '../../utility/apis/senderIds'
import { loadUserChild } from '../../utility/apis/userManagement'
import { formatIndianNumber, isValid, isValidArray, log } from '../../utility/helpers/common'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import Shimmer from '../components/shimmers/Shimmer'
import LoadingButton from '../components/buttons/LoadingButton'

const Overview = () => {

    const overviewList = useSelector(a => a.adminOps.adminOperation)
    const loginUser = useSelector(state => state.auth.userData)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(null)
    const dispatch = useDispatch()
    const form = useForm()
    const [sender, setSender] = useState(null)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form
    const [filterData, setFilterData] = useState({
        // per_page_record: 15,
        // user_id: ""
    })
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage, setRowsPerPage] = useState("2")
    const [resetIt, setResetIt] = useState(new Date())

    // const listUser = () => {
    //     loadUser({
    //         perPage: 21,
    //         loading: setLoading,
    //         dispatch,
    //         success: (e) => {
    //             setUser(createSelectOptions(e?.data?.data, "name", "id"))
    //         }
    //     })
    // }

    const listUser = async (search, loadedOptions, { page }) => {

        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUser)

    }

    const listSenderID = async (search, loadedOptions, { page }) => {

        const res = await loadSenderIds({
            async: true,
            page,
            perPage: 100,
            jsonData: { user_id: watch("user_id") }
        })
        return createAsyncSelectOptions(res, page, "sender_id", null, setSender)

    }

    const preload = () => {
        if (isValid(filterData?.user_id) && isValid(filterData?.sender_id?.sender_id)) {
            getOverview({
                page: currentPage,
                perPage: rowsPerPage,
                dispatch,
                success: (e) => {
                    // setMessage(e)
                    // setResetIt(new Date()); reset() 
                },
                loading: setLoading,
                jsonData: {
                    ...filterData,
                    user_id: loginUser?.userType === 2 ? loginUser?.id : filterData?.user_id,
                    sender_id: filterData?.sender_id?.sender_id
                }
            })
        }

    }


    useEffect(() => {
        // if (isValid(watch("user_id")) && isValid(watch("sender_id")?.sender_id)) {

        preload()
        // }
    }, [filterData])

    const submitFilter = (d) => {
        setFilterData({
            ...d,
            user_id: loginUser?.userType === 2 ? loginUser?.id : d?.user_id
            // sender_id: d?.sender_id?.sender_id
            // filterData
        })
        // console.log(d)

    }

    log("overviewList", overviewList?.data)

    const renderStats = () => {
        const re = []
        let totalCredit = 0
        let totalStatCount = 0
        overviewList?.data[0]?.queue?.stat.map((item, index) => {
            totalCredit += parseInt(item?.used_credit)
            totalStatCount += parseInt(item?.stat_wise_count)
            re.push(
                <>
                    <CardBody className=' border-top'>
                        <Row className='align-items-center'>
                            <Col md="4">
                                <p className='mb-0 text-dark fw-bolder'>
                                    {item?.stat}
                                  
                                </p>
                                <p className='mb-0 fw-bold text-secondary text-truncate' >
                                    Stat
                                </p>
                            </Col>
                            <Col md="4">
                                <p className='mb-0 text-dark fw-bolder'>
                                  
                                    {isValid(item?.stat_wise_count) ? formatIndianNumber(parseInt(item?.stat_wise_count)) : 0}
                                </p>
                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                    Stat Count
                                </p>
                            </Col>
                            <Col md="4">
                                <p className='mb-0 text-dark fw-bolder'>
                                  
                                    {isValid(item?.used_credit) ? formatIndianNumber(parseInt(item?.used_credit)) : 0}
                                </p>
                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                    User Credit
                                </p>
                            </Col>
                            {/* Add all stat count*/}


                        </Row>
                    </CardBody>
                </>
            )
        })

        re.push(
            <>
                <CardBody className=' border-top bg-grey' style={{ backgroundColor: '#ff9b36 ' }}>
                    <Row className='align-items-center'>
                        <Col md="4">
                            <p className='mb-0 text-white fw-bolder'>
                                Total 
                            </p>
                            {/* <p className='mb-0 fw-bold text-secondary text-truncate' >
                                Total Credit
                            </p> */}
                        </Col>
                        <Col md="4">
                            <p className='mb-0 text-white fw-bolder '>
                                {isValid(totalStatCount) ? formatIndianNumber(parseInt(totalStatCount)) : 0}
                               
                            </p>
                           
                        </Col>
                        <Col md="4">
                            <p className='mb-0 text-white fw-bolder '>
                                {isValid(totalCredit) ? formatIndianNumber(parseInt(totalCredit)) : 0}
                               
                            </p>
                           
                        </Col>
                    </Row>
                </CardBody>
            </>
        )

        return re
    }
    const renderHistory = () => {
        const re = []
        let totalCredit = 0
        let totalStatCount = 0
        overviewList?.data[0]?.history?.stat.map((item, index) => {
            totalCredit += parseInt(item?.used_credit)
            totalStatCount += parseInt(item?.stat_wise_count)
            re.push(
                <>
                    <CardBody className=' border-top'>
                        <Row className='align-items-center'>
                            <Col md="4">
                                <p className='mb-0 text-dark fw-bolder'>
                                    {item?.stat}
                                </p>
                                <p className='mb-0 fw-bold text-secondary text-truncate' >
                                    Stat
                                </p>
                            </Col>
                            <Col md="4">
                                <p className='mb-0 text-dark fw-bolder'>
                                    {isValid(item?.stat_wise_count) ? formatIndianNumber(parseInt(item?.stat_wise_count)) : 0}
                                </p>
                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                    Stat Count
                                </p>
                            </Col>
                            <Col md="4">
                                <p className='mb-0 text-dark fw-bolder'>
                                    {isValid(item?.used_credit) ? formatIndianNumber(parseInt(item?.used_credit)) : 0}
                                </p>
                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                    User Credit
                                </p>
                            </Col>
                            {/* Add all stat count*/}


                        </Row>
                    </CardBody>
                </>
            )
        })

        re.push(
            <>
                <CardBody className=' border-top text-primary' style={{ backgroundColor: '#ff9b36 '}}>
                    <Row className='align-items-center'>
                        <Col md="4">
                            <p className='mb-0 text-white fw-bolder'>
                                Total 
                            </p>
                            {/* <p className='mb-0 fw-bold text-secondary text-truncate' >
                                Total Credit
                            </p> */}
                        </Col>
                        <Col md="4">
                            <p className='mb-0 text-white fw-bolder '>
                                {isValid(totalStatCount) ? formatIndianNumber(parseInt(totalStatCount)) : 0}
                            </p>
                           
                        </Col>
                        <Col md="4">
                            <p className='mb-0 text-white fw-bolder '>
                                {isValid(totalCredit) ? formatIndianNumber(parseInt(totalCredit)) : 0}
                            </p>
                            
                        </Col>
                    </Row>
                </CardBody>
            </>
        )

        return re
    }

    return (
        <>
            <Header icon={""} title="Overview" >
            </Header>
            <Card>
                <Form onSubmit={handleSubmit(submitFilter)}>
                    <Row className='justify-content-start mx-0 mb-1'>

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

                                    loadOptions={listUser}
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
                        <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                            <FormGroupCustom
                                // key={resetIt}
                                noLabel
                                key={`${watch('user_id')}-fsdfdffsfsd}-${resetIt}`}
                                async
                                setValue={setValue}
                                control={control}
                                type={"select"}
                                errors={errors}
                                placeholder="Select Sender ID"
                                name={"sender_id"}
                                isClearable
                                className='mb-1'

                                loadOptions={listSenderID}
                                options={sender}
                                label="Sender ID"
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
            {/* <div>
                <Row className='justify-content-end mx-0'>
                    <Col className='d-flex align-items-center justify-content-start mt-1' md='6' sm='12'>
                        <Header title={"Overview"} />
                    </Col>
                    <Form onSubmit={handleSubmit(submitFilter)}>
                    <Col className='d-flex align-items-center justify-content-end mt-1' md='3' sm='12' style={{ zIndex: 999999 }}>

                        <FormGroupCustom
                            // key={`sfsdfsdfs${edit?.user_id}-kmlkm`}
                            noLabel
                            async
                            key={resetIt}
                            type={"select"}
                            control={control}
                            name="user_id"
                            isClearable
                            defaultOptions
                            // onChangeValue={(e) => { setGetSender(e?.id) }}
                            // value={edit?.user_id}
                            loadOptions={listUser}
                            className='mb-1'
                            label="User"

                            errors={errors}
                            options={user}
                            rules={{ required: false }}

                        />
                    </Col>
                    <Col className='d-flex align-items-center justify-content-end mt-1' md='3' sm='12' style={{ zIndex: 999999 }}>

                        <FormGroupCustom
                            noLabel
                            async
                            // key={resetIt}
                            key={`${watch('user_id')}-fsdfdffsfsd}-${resetIt}`}
                            isClearable
                            type={"select"}
                            control={control}
                            name={"sender_id"}
                            loadOptions={listSenderID}
                            matchWith={"sender_id"}
                            defaultOptions
                            placeholder={"Select Sender ID"}
                            className='mb-1'
                            label="Manage Sender ID "
                            errors={errors}

                            options={sender}
                            rules={{ required: false }}

                        />
                    </Col>
                    <Col className='d-flex align-items-center justify-content-center ' md='2' sm='12'>
                        <LoadingButton loading={loading} type='submit' className='btn-icon' color='primary' block>
                            <span className='align-middle ms-25'>Search</span>
                        </LoadingButton>
                    </Col>
                    </Form>
                </Row>
            </div> */}

            <Show IF={isValidArray(overviewList?.data)}>
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
                    <Row>
                        <Col md="6">
                            <Card className="animate__animated animate__fade">
                                <CardBody>
                                    <Row noGutters className='align-items-center'>

                                        <Col xs="12" className='d-flex align-items-center '>
                                            <div className='w-100'>
                                                <h5 className='mb-3px fw-bolder text-primary text-truncate'>
                                                    <span className='position-relative'>
                                                        Today's Overview
                                                    </span>
                                                </h5>
                                            </div>
                                        </Col>
                                    </Row>
                                </CardBody>

                                {isValidArray(overviewList?.data[0]?.queue?.stat) ? renderStats() : <>

                                    <CardBody className=' border-top'>
                                        <Row className='align-items-center'>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Invalid
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate' >
                                                    Stat
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    Stat Count
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    User Credit
                                                </p>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                    <CardBody className=' border-top'>
                                        <Row className='align-items-center'>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Pending
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate' >
                                                    Stat
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    Stat Count
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    User Credit
                                                </p>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                    <CardBody className=' border-top'>
                                        <Row className='align-items-center'>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Black
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate' >
                                                    Stat
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    Stat Count
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    User Credit
                                                </p>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                    <CardBody className=' border-top'>
                                        <Row className='align-items-center'>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Accepted
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate' >
                                                    Stat
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    Stat Count
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    User Credit
                                                </p>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                    <CardBody className=' border-top'>
                                        <Row className='align-items-center'>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Delivered
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate' >
                                                    Stat
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    Stat Count
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    User Credit
                                                </p>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                    <CardBody className=' border-top'>
                                        <Row className='align-items-center'>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Expired
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate' >
                                                    Stat
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    Stat Count
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    User Credit
                                                </p>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                    <CardBody className=' border-top'>
                                        <Row className='align-items-center'>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Reject
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate' >
                                                    Stat
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    Stat Count
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    User Credit
                                                </p>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                    <CardBody className=' border-top'>
                                        <Row className='align-items-center'>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Rejected
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate' >
                                                    Stat
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    Stat Count
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    User Credit
                                                </p>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                    <CardBody className=' border-top'>
                                        <Row className='align-items-center'>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Undelivered
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate' >
                                                    Stat
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    Stat Count
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    User Credit
                                                </p>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                    <CardBody className=' border-top'>
                                        <Row className='align-items-center'>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Unknown
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate' >
                                                    Stat
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    Stat Count
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    User Credit
                                                </p>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                </>}
                            </Card>
                        </Col>
                        <Col md="6">

                            <Card className="animate__animated animate__fade">
                                <CardBody>
                                    <Row noGutters className='align-items-center'>

                                        <Col xs="12" className='d-flex align-items-center '>
                                            <div className='w-100'>
                                                <h5 className='mb-3px fw-bolder text-primary text-truncate'>
                                                    <span className='position-relative'>
                                                        Till {formatDate(minusDay(new Date(), 1), 'YYYY-MM-DD')}
                                                    </span>
                                                </h5>
                                            </div>
                                        </Col>
                                    </Row>
                                </CardBody>

                                    {isValidArray(overviewList?.data[0]?.history?.stat) ? renderHistory() : <>
                                    <CardBody className=' border-top'>
                                        <Row className='align-items-center'>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Invalid
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate' >
                                                    Stat
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    Stat Count
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    User Credit
                                                </p>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                    <CardBody className=' border-top'>
                                        <Row className='align-items-center'>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Pending
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate' >
                                                    Stat
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    Stat Count
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    User Credit
                                                </p>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                    <CardBody className=' border-top'>
                                        <Row className='align-items-center'>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Black
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate' >
                                                    Stat
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    Stat Count
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    User Credit
                                                </p>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                    <CardBody className=' border-top'>
                                        <Row className='align-items-center'>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Accepted
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate' >
                                                    Stat
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    Stat Count
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    User Credit
                                                </p>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                    <CardBody className=' border-top'>
                                        <Row className='align-items-center'>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Delivered
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate' >
                                                    Stat
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    Stat Count
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    User Credit
                                                </p>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                    <CardBody className=' border-top'>
                                        <Row className='align-items-center'>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Expired
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate' >
                                                    Stat
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    Stat Count
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    User Credit
                                                </p>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                    <CardBody className=' border-top'>
                                        <Row className='align-items-center'>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Reject
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate' >
                                                    Stat
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    Stat Count
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    User Credit
                                                </p>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                    <CardBody className=' border-top'>
                                        <Row className='align-items-center'>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Rejected
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate' >
                                                    Stat
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    Stat Count
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    User Credit
                                                </p>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                    <CardBody className=' border-top'>
                                        <Row className='align-items-center'>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Undelivered
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate' >
                                                    Stat
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    Stat Count
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    User Credit
                                                </p>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                    <CardBody className=' border-top'>
                                        <Row className='align-items-center'>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    Unknown
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate' >
                                                    Stat
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    Stat Count
                                                </p>
                                            </Col>
                                            <Col md="4">
                                                <p className='mb-0 text-dark fw-bolder'>
                                                    0
                                                </p>
                                                <p className='mb-0 fw-bold text-secondary text-truncate'>
                                                    User Credit
                                                </p>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                </>}
                            </Card>
                        </Col>
                    </Row>
                </>
                }

            </Show>
            <Hide IF={watch("user_id") && watch("sender_id")}>
                <Row className='' style={{ height: "70vh" }}>
                    <Col md="12" className='d-flex align-items-center justify-content-center h-100'>
                        <div>
                            <div className='h2 text-dark fw-bolder'>
                                Please Select User and Sender ID to continue
                            </div>
                            {/* <div className='p'>
                                {FM("module-inactive-text")}
                            </div> */}
                        </div>
                    </Col>
                </Row>
            </Hide>

        </>
    )
}

export default Overview
