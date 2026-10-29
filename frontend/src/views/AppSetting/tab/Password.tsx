// @ts-nocheck
import React, { Fragment, useState } from 'react'
// import { useForm } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { Card, CardBody, CardHeader, CardTitle, Col, Form, FormGroup, Row } from 'reactstrap'
import * as yup from 'yup'
import { checkPassword } from '../../../utility/Utils'
import { profileChangePassword, updateSelfPassword } from '../../../utility/apis/appSetting'
import LoadingButton from '../../components/buttons/LoadingButton'
import FormGroupCustom from '../../components/formGroupCustom'

const showErrors = (field, valueLen, min) => {
    if (valueLen === 0) {
        return `${field} field is required`
    } else if (valueLen > 0 && valueLen < min) {
        return `${field} must be at least ${min} characters`
    } else {
        return ''
    }
}


const defaultValues = {
    newPassword: '',
    currentPassword: '',
    password_confirmation: ''
}


const Password = () => {
    const [loading, setLoading] = useState(false)
    const { formState: { errors }, handleSubmit, control, watch, setError } = useForm()

    // const user = useSelector(state => state.auth.userData)
    const user = useSelector(state => state.auth.userData)


    const SignupSchema = yup.object().shape({
        old_password: yup
            .string()
            .min(6, obj => showErrors('Current Password', obj.value.length, obj.min))
            .required(),
        password: yup
            .string()
            .min(6, obj => showErrors('New Password', obj.value.length, obj.min))
            .required(),
        password_confirmation: yup
            .string()
            .min(6, obj => showErrors('Retype New Password', obj.value.length, obj.min))
            .required()
            .oneOf([yup.ref(`password_confirmation`), null], 'Passwords must match')
    })


    const onSubmit = (data) => {
        if (user?.userType === 0) {
            profileChangePassword({
                jsonData: {
                    ...data
                },
                loading: setLoading,
                success: (d) => {
                    // reset()
                }

            })
        } else {
            updateSelfPassword({
                jsonData: {
                    ...data
                },
                loading: setLoading,
                success: (d) => {
                    // reset()
                }

            })
        }
    }

    return (
        <Fragment>
            <Card>
                <CardHeader className='border-bottom'>
                    <CardTitle tag='h4'>Change Password</CardTitle>
                </CardHeader>
                <CardBody className='pt-1'>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <FormGroup>
                            <Row>
                                <Col md="4">

                                    <FormGroupCustom
                                        type={"password"}
                                        name={"old_password"}
                                        errors={errors}
                                        label="Old Password"
                                        control={control}
                                        message={"Password Must Be of 8 Character including atleast a Uppercase Letter, a Lowercase, a Number & a Special Character"}

                                        className='mb-1'
                                      
                                        rules={{ required: true, validate: checkPassword }}

                                    />
                                </Col>

                                <Col md="4">

                                    <FormGroupCustom
                                        type={"password"}
                                        name={"password"}
                                        errors={errors}
                                        label="Password"
                                        control={control}
                                        message={"Password Must Be of 8 Character including atleast a Uppercase Letter, a Lowercase, a Number & a Special Character"}

                                        className='mb-1'
                                       
                                        rules={{ required: true, validate: checkPassword }}

                                    />
                                </Col>
                                <Col md="4">
                                 
                                    <FormGroupCustom
                                        type={"password"}
                                        name={"password_confirmation"}
                                        errors={errors}
                                        control={control}
                                        // minLength="6"
                                        label="Confirm Password"
                                        message={"Password Must Be of 8 Character including atleast a Uppercase Letter, a Lowercase, a Number & a Special Character"}

                                        className='mb-2'
                                        rules={{

                                            required: true,
                                            // pattern: Patterns.Password,
                                            validate: (value) => value === watch("password")
                                        }}
                                    />

                                </Col>
                                <Col xs={12} className="mt-2">
                                    <p className='fw-bolder'>Password requirements:</p>
                                    <ul className='ps-1 ms-25'>
                                        <li className='mb-50'>Minimum 8 characters long - the more, the better</li>
                                        <li className='mb-50'>Please don't use space</li>
                                        <li className='mb-50'>Password Must Be of 8 Character including atleast a Uppercase Letter, a Lowercase, a Number & a Special Character</li>
                                        {/* <li>At least one number, symbol, or whitespace character</li> */}
                                    </ul>
                                </Col>
                                <Col className='mt-1' sm='12'>
                                    <LoadingButton loading={loading} type='submit' className='me-1' color='primary'>
                                        Save changes
                                    </LoadingButton>
                                </Col>
                            </Row>
                        </FormGroup>
                    </Form>
                </CardBody>
            </Card>
        </Fragment>
    )
}

export default Password
