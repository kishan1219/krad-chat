// @ts-nocheck
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardBody, Col, Form, FormGroup, Row } from 'reactstrap'
import { profileChangePassword } from '../../utility/apis/appSetting'
import FormGroupCustom from '../components/formGroupCustom'

const ChangePassword = () => {
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form
    const [loading, setLoading] = useState(false)

    const submitHandler = (data) => {
        profileChangePassword({
            jsonData: {
                ...data
            },
            loading: setLoading,
            success: () => {

            }
        })

    }


    return (
        <>
            <Card>
                <CardBody>
                    <Form onSubmit={handleSubmit(submitHandler)}>
                        <FormGroup>
                            <Row>
                                <Col md="12">
                                    <FormGroupCustom
                                        type={"password"}
                                        control={control}
                                        name="old_password"
                                        className='mb-1'
                                        label="Old Password"
                                        errors={errors}
                                    />
                                </Col>
                                <Col md="12">
                                    <FormGroupCustom
                                        type={"password"}
                                        control={control}
                                        name="password"
                                        className='mb-1'
                                        label="New Password"
                                        errors={errors}
                                    />
                                </Col>
                            </Row>
                        </FormGroup>
                    </Form>
                </CardBody>
            </Card>
        </>
    )
}

export default ChangePassword
