// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Card, Col, Form, Row, Table } from 'reactstrap'
import { createAsyncSelectMultiUserOptions, createConstSelectOptions, formatDate, minusDay } from '../../utility/Utils'
import { loadUserChild } from '../../utility/apis/userManagement'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { ConversationCategories, ConversationDirections, ConversationGranularity, ConversationTypes, Dimensions, Granularity, whatsAppLanguages } from '../../utility/Const'
import { whatsappConversationAnalytics } from '../../utility/apis/whatsappConfig'
import { isValid } from '../../utility/helpers/common'
import Shimmer from '../components/shimmers/Shimmer'
import Header from '../components/header'
import FormGroupCustom from '../components/formGroupCustom'
import { loadCountry } from '../../utility/apis/countryCrud'

const WhatsappConversationAnalytics = () => {
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form
    const [user, setUser] = useState(null)
    const [conversation, setConversation] = useState(null)
    const [filterData, setFilterData] = useState({
        per_page_record: 15,
        user_id: ""
    })
    const loginUser = useSelector(state => state.auth.userData)
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [reload, setReload] = useState(false)
    const [resetIt, setResetIt] = useState(new Date())
    const [error, setError] = useState(false)
    const [country, setCountry] = useState(null)
    const loadUserData = async (search, loadedOptions, { page }) => {

        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUser)
    }

    const submitFilter = (d) => {
        setFilterData({
            ...d,
            user_id: loginUser?.userType === 2 ? loginUser?.id : d?.user_id,
            country_codes: [d?.country_code],
            phone_number: [d?.phone_number]


            // filterData
        })
        // console.log(d)

    }

    const loadUserCountry = async (search, loadedOptions, { page }) => {

        const res = await loadCountry({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "name", "currency_code", setCountry)
    }

    const preload = () => {
        whatsappConversationAnalytics({
            dispatch,
            error: (e) => {
            },
            success: (e) => {
                setConversation(e)

            },
            loading: setLoading,
            jsonData: {

                ...filterData
            }
        })
    }

    useEffect(() => {
        if (isValid(watch('from_date')) && isValid(watch('to_date'))
            && isValid(watch('phone_numbers')) && isValid(watch('country_codes')) && isValid(watch('granularity') && isValid(watch('conversation_categories')) && isValid(watch('conversation_directions')) && isValid(watch('dimensions')) && isValid(watch('conversation_types')

            ))) {
            preload()
        }
    }, [filterData])
    const AnalyticsTable = () => {
        return (
            <div className="p-4 bg-gray-100 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-2">Conversation Analytics</h2>
                <p><strong>Phone Number:</strong> {conversation?.data?.analytics?.phone_numbers}</p>
                {/* <p><strong>Granularity:</strong> {analytics?.data?.analytics.granularity}</p> */}
                <Table striped responsive className='summary_report'>
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 p-2">Start Date (UTC)</th>
                            <th className="border border-gray-300 p-2">End Date (UTC)</th>
                            <th className="border border-gray-300 p-2">Conversation</th>
                            <th className="border border-gray-300 p-2">Phone Number</th>
                            <th className="border border-gray-300 p-2">Country</th>
                            <th className="border border-gray-300 p-2">Conversation Type</th>
                            <th className="border border-gray-300 p-2">Conversation Direction</th>
                            <th className="border border-gray-300 p-2">Conversation Category</th>
                            <th className="border border-gray-300 p-2">Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        {conversation?.data?.analytics.data_points.map((point, index) => (
                            <tr key={index} className="text-center border border-gray-300">
                                <td className="border border-gray-300 p-2">{new Date(point.start * 1000).toISOString().split('T')[0]}</td>
                                <td className="border border-gray-300 p-2">{new Date(point.end * 1000).toISOString().split('T')[0]}</td>
                                <td className="border border-gray-300 p-2">{point.conversation}</td>
                                <td className="border border-gray-300 p-2">{point.phone_number}</td>
                                <td className="border border-gray-300 p-2">{point.country}</td>
                                <td className="border border-gray-300 p-2">{point.conversation_type}</td>
                                <td className="border border-gray-300 p-2">{point.conversation_direction}</td>
                                <td className="border border-gray-300 p-2">{point.conversation_category}</td>
                                <td className="border border-gray-300 p-2">{point.cost}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        )
    }

    return (
        <>
            <Header icon={""} title="Whatsapp Analytics Report" ></Header>
            {/* <Form onSubmit={handleSubmit(submitFilter)}>

            </Form> */}
            <Card>
                <Form onSubmit={handleSubmit(submitFilter)}>
                    <Row className='justify-content-start mx-0'>

                        <Col className=' mt-1' md='3' sm='12'>

                            <FormGroupCustom
                                key={resetIt}

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
                        <Col className='mt-1' md='3' sm='12'>
                            <FormGroupCustom
                                key={resetIt}
                                // onChange={handleChange}

                                control={control}
                                type={"text"}

                                errors={errors}
                                name={"phone_numbers"}
                                placeholder="Enter Phone Number"
                                className='mb-1'
                                label={"Phone Number"}
                                rules={{ required: true }}

                            />
                            {error && <p style={{ color: "red" }}>Please enter numbers only</p>}
                        </Col>
                        <Col className=' mt-1' md='3' sm='12'>
                            <FormGroupCustom
                                key={resetIt}

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
                        <Col className=' mt-1' md='3' sm='12'>
                            <FormGroupCustom
                                key={resetIt}

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
                        <Col className=' mt-1' md='3' sm='12'>
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
                        <Col className='mt-1' md='3' sm='12'>
                            <FormGroupCustom
                                key={resetIt}
                                // noLabel
                                async
                                isMulti
                                setValue={setValue}
                                control={control}
                                type={"select"}
                                errors={errors}
                                placeholder="Country Codes"
                                name={"country_codes"}
                                isClearable
                                className='mb-1'
                                loadOptions={loadUserCountry}
                                options={country}
                                label="Country Codes"
                                rules={{ required: true }}
                            />
                        </Col>

                        <Col className=' mt-1' md='3' sm='12'>
                            <FormGroupCustom
                                isMulti
                                control={control}
                                type={"select"}
                                errors={errors}
                                name={"conversation_categories"}
                                // defaultValue={ParameterFormat[0]}
                                isClearable
                                className='mb-1'
                                options={createConstSelectOptions(ConversationCategories)}
                                label="Conversation Categories"
                                // noLabel
                                rules={{ required: true }}
                            />
                        </Col>
                        <Col className=' mt-1' md='3' sm='12'>
                            <FormGroupCustom
                                isMulti
                                control={control}
                                type={"select"}
                                errors={errors}
                                name={"conversation_directions"}
                                // defaultValue={ParameterFormat[0]}
                                isClearable
                                className='mb-1'
                                options={createConstSelectOptions(ConversationDirections)}
                                label="Conversation Directions"
                                // noLabel
                                rules={{ required: true }}
                            />
                        </Col>
                        <Col className=' mt-1' md='3' sm='12'>
                            <FormGroupCustom
                                isMulti
                                control={control}
                                type={"select"}
                                errors={errors}
                                name={"dimensions"}
                                // defaultValue={ParameterFormat[0]}
                                isClearable
                                className='mb-1'
                                options={createConstSelectOptions(Dimensions)}
                                label="Dimensions"
                                // noLabel
                                rules={{ required: true }}
                            />
                        </Col>
                        <Col className=' mt-1' md='3' sm='12'>
                            <FormGroupCustom
                                isMulti
                                control={control}
                                type={"select"}
                                errors={errors}
                                name={"conversation_types"}
                                // defaultValue={ParameterFormat[0]}
                                isClearable
                                className='mb-1'
                                options={createConstSelectOptions(ConversationTypes)}
                                label="Conversation Types"
                                // noLabel
                                rules={{ required: true }}
                            />
                        </Col>
                        {/* <Col className='mt-1 mb-2' md='6' sm='12' style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <Button color="primary" className="mt-2 mr-2" type="submit">Submit</Button>
                            <Button color="primary" className="mt-2 ml-2" type="submit" onClick={() => { setResetIt(new Date()); reset() }}>Reset</Button>
                            
                        </Col> */}

                    </Row>
                    <div className='d-flex justify-content-center mb-2'>
                        <Button color="primary" className="mt-2 mr-2" type="submit">Submit</Button> &nbsp;&nbsp;&nbsp;&nbsp;
                        <Button color="secondary" className="mt-2 ml-4" type="submit" onClick={() => { setResetIt(new Date()); reset() }}>Reset</Button>
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


                <div className='card-datatable app-user-list table-responsive'>
                    <Card>
                        <div className='react-dataTable'>
                            {AnalyticsTable()}
                        </div>
                    </Card>
                </div>
            </>}

        </>
    )
}


export default WhatsappConversationAnalytics
