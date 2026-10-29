// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Card, Col, Form, Row, Table } from 'reactstrap'
import { ConversationGranularity, Granularity, Metrics } from '../../utility/Const'
import Hide from '../../utility/Hide'
import { createAsyncSelectMultiUserOptions, createAsyncSelectMultiWaTempNameAndIdOptions, createAsyncSelectMultiWaTempOptions, createConstSelectOptions } from '../../utility/Utils'
import { loadCountry } from '../../utility/apis/countryCrud'
import { loadUserChild } from '../../utility/apis/userManagement'
import { whatsappAnalytics, whatsappTemplateAnalytics } from '../../utility/apis/whatsappConfig'
import { isValid, isValidArray, log } from '../../utility/helpers/common'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import Shimmer from '../components/shimmers/Shimmer'
import Show from '../../utility/Show'
import { loadWhatsappTemplate } from '../../utility/apis/whatsappTemplate'

const WhatsappTemplateAnalytics = () => {
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form
    const [user, setUser] = useState(null)
    const [resetIt, setResetIt] = useState(new Date())
    const [phoneNumber, setPhoneNumber] = useState('')
    const [error, setError] = useState(false)
    const [filterData, setFilterData] = useState({
        per_page_record: 15,
        user_id: ""
    })
    const [reload, setReload] = useState(false)
    const [country, setCountry] = useState(null)
    const [loading, setLoading] = useState(false)
    const [analytics, setAnalytics] = useState(null)
    const dispatch = useDispatch()
    const [template, setTemplate] = useState(null)
    const loginUser = useSelector(state => state.auth.userData)
    const [setAfter, getAfter] = useState(null)
    const [setBefore, getBefore] = useState(null)


    const preload = () => {
        whatsappTemplateAnalytics({
            dispatch,
            error: (e) => {
            },
            success: (e) => {
                setAnalytics(e)

            },
            loading: setLoading,
            jsonData: {

                ...filterData
            }
        })
    }

    useEffect(() => {
        if (isValid(watch('from_date')) && isValid(watch('to_date')) && isValidArray(watch('template_ids')) && isValid(watch('granularity'))) {
            preload()
        }
    }, [filterData])

    const loadUserData = async (search, loadedOptions, { page }) => {

        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUser)
    }
    const loadTemplateData = async (search, loadedOptions, { page }) => {

        const res = await loadWhatsappTemplate({
            async: true,
            page,
            perPage: 25,
            jsonData: { user_id: loginUser?.userType === 2 || loginUser?.userType === 1 ? loginUser?.id : watch('user_id'), search }
        })
        return createAsyncSelectMultiWaTempNameAndIdOptions(res, page, "xName", "wa_template_id", setTemplate)
    }
    const loadUserCountry = async (search, loadedOptions, { page }) => {

        const res = await loadCountry({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "name", "id", setCountry)
    }

    // const handleChange = (e) => {
    //     let value = e.target.value

    //     // Remove any non-numeric characters and add commas after every 10 digits (if needed)
    //     value = value.replace(/\D/g, '') // Only allow digits

    //     if (value.length > 0) {
    //         // Format input to add commas after every 10 digits
    //         const formattedValue = value.replace(/(\d{10})(?=\d)/g, '$1,')
    //         setPhoneNumber(formattedValue)
    //     } else {
    //         setPhoneNumber(value)
    //     }
    // }
    // log('phoneNumber', phoneNumber)

    const handleChange = (e) => {
        const value = e.target.value
        setPhoneNumber(value)
        // setError(/^[0 - 9,]*$/.test(value))
        setError(!/^[0-9, ]+$/.test(value))
    }

    const submitFilter = (d) => {
        setFilterData({
            ...d,
            user_id: loginUser?.userType === 2 ? loginUser?.id : d?.user_id,
            after: setAfter


            // filterData
        })
        log(d)

    }
    const submitFilter1 = (d) => {
        setFilterData({
            ...d,
            user_id: loginUser?.userType === 2 ? loginUser?.id : watch('user_id'),
            after: setAfter,
            from_date: watch('from_date'),
            to_date: watch('to_date'),
            granularity: watch('granularity'),
            template_ids: watch('template_ids'),
            metric_types: watch('metric_types'),

            success: () => {
                getAfter(null)
            }


            // filterData
        })
        log(d)

    }
    const submitFilter2 = (d) => {
        setFilterData({
            ...d,
            user_id: loginUser?.userType === 2 ? loginUser?.id : watch('user_id'),
            before: setBefore,
            from_date: watch('from_date'),
            to_date: watch('to_date'),
            granularity: watch('granularity'),
            template_ids: watch('template_ids'),
            metric_types: watch('metric_types'),

            success: () => {
                getAfter(null)
            }


            // filterData
        })
        log(d)

    }


    const AnalyticsTable = () => {
        return (
            // <div className="p-4 bg-gray-100 rounded-lg shadow-md">
            //     <h2 className="text-xl font-bold mb-2">Analytics</h2>
            //     <p><strong>Phone Number:</strong> {analytics?.data?.analytics.phone_numbers}</p>
            //     {/* <p><strong>Granularity:</strong> {analytics?.data?.analytics.granularity}</p> */}
            //     <Table striped responsive className='summary_report'>
            //         <thead>
            //             <tr className="bg-gray-200">
            //                 <th className="border border-gray-300 p-2">Start Date (UTC)</th>
            //                 <th className="border border-gray-300 p-2">End Date (UTC)</th>
            //                 <th className="border border-gray-300 p-2">Sent Messages</th>
            //                 <th className="border border-gray-300 p-2">Delivered Messages</th>
            //             </tr>
            //         </thead>
            //         <tbody>
            //             {analytics?.data?.analytics.data_points.map((point, index) => (
            //                 <tr key={index} className="text-center border border-gray-300">
            //                     <td className="border border-gray-300 p-2">{new Date(point.start * 1000).toISOString().split('T')[0]}</td>
            //                     <td className="border border-gray-300 p-2">{new Date(point.end * 1000).toISOString().split('T')[0]}</td>
            //                     <td className="border border-gray-300 p-2">{point.sent}</td>
            //                     <td className="border border-gray-300 p-2">{point.delivered}</td>
            //                 </tr>
            //             ))}
            //         </tbody>
            //     </Table>
            // </div>

            <div className="p-4 bg-gray-100 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-2">Template Analytics</h2>
                {analytics?.data?.template_analytics?.data.map((item, index) => (
                    <div key={index} className="mb-4">
                        <p><strong>Granularity:</strong> {item.granularity}</p>
                        <p><strong>Product Type:</strong> {item.product_type}</p>
                        <Table striped responsive className='summary_report'>
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border border-gray-300 p-2">Template ID</th>
                                    <th className="border border-gray-300 p-2">Start Date (UTC)</th>
                                    <th className="border border-gray-300 p-2">End Date (UTC)</th>
                                    <th className="border border-gray-300 p-2">Cost Types</th>
                                </tr>
                            </thead>
                            <tbody>
                                {item.data_points.map((point, idx) => (
                                    <tr key={idx} className="text-center border border-gray-300">
                                        <td className="border border-gray-300 p-2">{point.template_id}</td>
                                        <td className="border border-gray-300 p-2">{new Date(point.start * 1000).toISOString().split('T')[0]}</td>
                                        <td className="border border-gray-300 p-2">{new Date(point.end * 1000).toISOString().split('T')[0]}</td>
                                        <td className="border border-gray-300 p-2">
                                            {/* {point.cost.map((c, i) => (
                                                <span key={i} className="block">{c.type}</span>
                                            ))} */}
                                            {point.cost.map(c => c.type).join(", ")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                ))}
                <div className="d-flex justify-content-center space-between mb-2">
                    <Button color="primary" className="mt-2 mr-2" type="submit" onClick={() => { getBefore(analytics?.data?.template_analytics?.paging?.cursors?.before); submitFilter2() }} >Previous</Button>  &nbsp;&nbsp;&nbsp;&nbsp;
                    <Button color="secondary" className="mt-2 ml-2" type="submit" onClick={() => { getAfter(analytics?.data?.template_analytics?.paging?.cursors?.after); submitFilter1() }}>Next</Button>
                </div>
            </div>
        )
    }

    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])
    return (
        <>
            <Header icon={""} title="Whatsapp Template Analytics Report" ></Header>
            {/* <Form onSubmit={handleSubmit(submitFilter)}>

            </Form> */}
            <Card>
                <Form onSubmit={handleSubmit(submitFilter)}>
                    <Row className='justify-content-start mx-0'>
                        <Hide IF={loginUser?.userType === 1 || loginUser?.userType === 2}>
                            <Col className=' mt-1' md='4' sm='12'>

                                <FormGroupCustom
                                    key={resetIt}
                                    // noLabel
                                    async
                                    setValue={setValue}
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    placeholder="Select User"
                                    name={"user_id"}
                                    value={watch('user_id')}
                                    isClearable
                                    className='mb-1'
                                    loadOptions={loadUserData}
                                    options={user}
                                    label="User"
                                    rules={{ required: true }}

                                />

                            </Col>

                        </Hide>


                        <Col className='mt-1' md='4' sm='12'>
                            <FormGroupCustom
                                key={resetIt}
                                // noLabel
                                defaultOptions
                                control={control}
                                name={"from_date"}
                                // options={{
                                //     minDate: formatDate(new Date(
                                //         minusDay(
                                //             new Date(), 30
                                //         )
                                //     ))
                                // }}
                                type={"date"}
                                errors={errors}
                                label={"From"}
                                dateFormat={"YYYY-MM-DD"}
                                setValue={setValue}
                                className="mb-1"
                                rules={{ required: true }}


                            />
                        </Col>
                        <Col className='mt-1' md='4' sm='12'>
                            <FormGroupCustom
                                key={resetIt}
                                // noLabel
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
                        <Col className='mt-1' md='4' sm='12'>
                            <FormGroupCustom
                                control={control}
                                type={"select"}
                                errors={errors}
                                name={"granularity"}
                                // defaultValue={ParameterFormat[0]}
                                isClearable
                                className='mb-1'
                                options={createConstSelectOptions(ConversationGranularity)}
                                label="Granularity"
                                // noLabel
                                rules={{ required: true }}
                            />
                        </Col>
                        <Col className='mt-1' md='4' sm='12'>
                            <FormGroupCustom
                                key={`qfwqopfsdfs${watch('user_id')}-kmlkm`}
                               
                                // noLabel
                                async
                                isMulti
                                setValue={setValue}
                                control={control}
                                type={"select"}
                                errors={errors}
                                placeholder="Template Name"
                                name={"template_ids"}
                                isClearable
                                className='mb-1'
                                loadOptions={loadTemplateData}
                                options={template}
                                label="Template Name"
                                rules={{ required: true }}
                            />
                        </Col>
                        <Col className='mt-1' md='4' sm='12'>
                            <FormGroupCustom
                                key={resetIt}
                                isMulti
                                control={control}
                                type={"select"}
                                errors={errors}
                                name={"metric_types"}
                                // defaultValue={ParameterFormat[0]}
                                isClearable
                                className='mb-1'
                                options={createConstSelectOptions(Metrics)}
                                label="Metrics Type"
                                // noLabel
                                rules={{ required: false }}
                            />
                        </Col>

                    </Row>
                    <div className='d-flex justify-content-center space-between mb-2'>
                        <Button color="primary" className="mt-2 mr-2" type="submit">Submit</Button>  &nbsp;&nbsp;&nbsp;&nbsp;
                        <Button color="secondary" className="mt-2 ml-2" type="submit" onClick={() => { setResetIt(new Date()); reset() }}>Reset</Button>
                    </div>
                </Form>
            </Card>

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

                <Show IF={isValid(analytics)}>

                    <div className='card-datatable app-user-list table-responsive'>
                        <Card>
                            <div className='react-dataTable'>
                                {AnalyticsTable()}
                            </div>
                        </Card>
                    </div>
                </Show>
                {/* <Show IF={!isValid(analytics?.data?.analytics)}>
                    <div className='card-datatable app-user-list table-responsive'>
                        <Card>
                            <div className='react-dataTable'>
                                <div className='d-flex justify-content-center'>
                                    <h3>No Data Found</h3>
                                </div>
                            </div>
                        </Card>
                    </div>
                </Show> */}
            </>}


        </>
    )
}


export default WhatsappTemplateAnalytics
