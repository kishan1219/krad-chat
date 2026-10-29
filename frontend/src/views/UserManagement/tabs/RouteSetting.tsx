// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Plus } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Form, Row, Table } from 'reactstrap'
import { assignRoute } from '../../../utility/apis/adminOperation'
import { loadSecondaryRoute } from '../../../utility/apis/seconday'
import { readUser } from '../../../utility/apis/userManagement'
import { log } from '../../../utility/helpers/common'
import { createSelectOptions } from '../../../utility/Utils'
import LoadingButton from '../../components/buttons/LoadingButton'
import FormGroupCustom from '../../components/formGroupCustom'

const RouteSetting = ({ edit, activeTab }) => {

    const form = useForm()
    const [loading, setLoading] = useState(false)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form
    const dispatch = useDispatch()
    const [secondary, setSecondary] = useState(null)
    const [sec, setSec] = useState(null)
    const [resetIt, setResetIt] = useState(new Date())
    const [editData, setEditData] = useState(null)
    const [user, setUser] = useState(null)
    const [prop, setProp] = useState(null)
    const [voice, setVoice] = useState(null)
    const [two, setTwo] = useState(null)
    const [filterData, setFilterData] = useState({
        per_page_record: 100,
        status: 1
    })
    const listSecondary = () => {
        loadSecondaryRoute({
            
            loading: setLoading,
            dispatch,
            success: (e) => {
                setSecondary(createSelectOptions(e?.data?.data, "sec_route_name", "id"))
                setSec(e)
            },
            jsonData: filterData
        })
    }

    const getUserDetails = () => {
        readUser({
            id: edit?.id,
            loading: setLoading,
            success: (e) => {
                // setSecondary(createSelectOptions(e?.data?.data, "sec_route_name", "id"))
                setUser(e)
                setValue('promotional_route', e?.promotional_route)
                setValue('voice_sms_route', e?.voice_sms_route)
                setValue('transaction_route', e?.transaction_route)
                setValue('two_waysms_route', e?.two_waysms_route)
                setValue('otp_route', e?.otp_route)
            }
        })
    }
    // log("sfsdfsdf", sec)

    useEffect(() => {
        if (activeTab === '8') {
            listSecondary()
            getUserDetails()
        }
    }, [activeTab])

    const onSubmit = (data) => {

        assignRoute({
            jsonData: {
                ...data,
                user_id: edit?.id
            },
            dispatch,
            loading: setLoading,

            success: (e) => {
                setResetIt(new Date()); reset()
                getUserDetails()
            }
        })
    }

    // log(user, "usersfs")
    return (
        <>
            <Card>
                <Row>
                    <Col col="6" >

                        <CardBody className='border'>
                            <h4 className='fw-bolder text-primary'>
                                {edit?.name}'s Route Setting
                            </h4>

                            <hr />
                            <Row className='mt-1  mb-0'>
                                <Form onSubmit={handleSubmit(onSubmit)}>

                                    <Col md="12">
                                        <FormGroupCustom
                                            key={resetIt}

                                            defaultOptions
                                            control={control}
                                            type={"select"}
                                            errors={errors}
                                            name={"promotional_route"}
                                            isClearable
                                            value={user?.promotional_route}
                                            placeholder="Select Promotional Route"
                                            className='mb-1'
                                            loadOptions={listSecondary}
                                            options={secondary}
                                            label="Promotional Route"
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    <Col md="12">
                                        <FormGroupCustom
                                            key={resetIt}
                                            defaultOptions
                                            control={control}
                                            type={"select"}
                                            errors={errors}
                                            name={"transaction_route"}
                                            isClearable
                                            value={user?.transaction_route}
                                            placeholder="Select Transaction Route"
                                            className='mb-1'
                                            loadOptions={listSecondary}
                                            options={secondary}
                                            label="Transaction Route"
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    <Col md="12">
                                        <FormGroupCustom
                                            defaultOptions
                                            control={control}
                                            type={"select"}
                                            errors={errors}
                                            value={user?.two_waysms_route}
                                            name={"two_waysms_route"}
                                            isClearable
                                            className='mb-1'
                                            loadOptions={listSecondary}
                                            options={secondary}
                                            label="Two Way Sms Route"
                                            rules={{ required: false }}
                                            key={resetIt}
                                        />
                                    </Col>
                                    <Col md="12">
                                        <FormGroupCustom
                                            key={resetIt}
                                            defaultOptions
                                            control={control}
                                            type={"select"}
                                            errors={errors}
                                            name={"voice_sms_route"}
                                            isClearable
                                            value={user?.voice_sms_route}
                                            className='mb-1'
                                            loadOptions={listSecondary}
                                            options={secondary}
                                            label="Voice Sms Route"
                                            rules={{ required: false }}
                                        // key={resetIt - `sfsdfsdfs${user?.voice_sms_route}-kmlskm`}
                                        />
                                    </Col>
                                    <Col md="12">
                                        <FormGroupCustom
                                            key={resetIt}
                                            defaultOptions
                                            control={control}
                                            type={"select"}
                                            errors={errors}
                                            name={"otp_route"}
                                            isClearable
                                            value={user?.otp_route}
                                            className='mb-1'
                                            loadOptions={listSecondary}
                                            options={secondary}
                                            label="OTP Route"
                                            rules={{ required: false }}
                                        // key={resetIt - `sfsdfsdfs${user?.voice_sms_route}-kmlskm`}
                                        />
                                    </Col>
                                    <Col className='mt-2' sm='4'>
                                        <LoadingButton loading={loading} type='submit' className='btn-icon mt-2 round' color='primary' block>
                                            <Plus size={14} />
                                            <span className='align-middle ms-25'>Set Route</span>
                                        </LoadingButton>

                                    </Col>
                                </Form>
                            </Row>


                        </CardBody>
                    </Col>

                    <Col col="6">
                        <CardBody className='border'>
                            <h4 className='fw-bolder text-primary'>
                                SMPP Secondary Route
                            </h4>

                            <hr />
                            <Table striped responsive>

                                <thead>

                                    <tr>
                                        <th scope='col' className='text-nowrap'>
                                            #
                                        </th>
                                        <th scope='col' className='text-nowrap'>
                                            Secondary Route
                                        </th>
                                    </tr>
                                </thead>
                                {sec?.data?.data?.map((item, index) => {
                                    return (

                                        <>
                                            <tbody>
                                                <tr>
                                                    <td className='text-nowrap' > {index + 1} </td>
                                                    <td className='text-nowrap'> {item?.sec_route_name}</td>
                                                </tr>
                                            </tbody>
                                        </>
                                    )
                                })}
                            </Table>

                        </CardBody>
                    </Col>
                </Row>
            </Card>

        </>
    )
}

export default RouteSetting
