// @ts-nocheck
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { Alert, Card, CardBody, CardHeader, CardTitle, Col, Form, FormGroup, Row } from 'reactstrap'
import { Check, Lock, Shield } from 'react-feather'
import { checkPassword, SuccessToast, ErrorToast } from '../../../utility/Utils'
import { profileChangePassword, updateSelfPassword } from '../../../utility/apis/appSetting'
import LoadingButton from '../../components/buttons/LoadingButton'
import FormGroupCustom from '../../components/formGroupCustom'

const Password = () => {
    const [loading, setLoading] = useState(false)
    const { formState: { errors }, handleSubmit, control, watch, reset } = useForm()
    const user = useSelector(state => state.auth.userData)

    const onSubmit = (data) => {
        const payload = { ...data }
        const apiCall = user?.userType === 0 ? profileChangePassword : updateSelfPassword

        apiCall({
            jsonData: payload,
            loading: setLoading,
            success: () => {
                reset({
                    old_password: '',
                    password: '',
                    password_confirmation: ''
                })
                SuccessToast('Password updated successfully!')
            },
            errors: (err) => {
                ErrorToast(err?.message || 'Failed to update password. Please check your current password.')
            }
        })
    }

    return (
        <Card className='border-0 shadow-sm'>
            <CardHeader className='border-bottom py-2 bg-light-primary bg-opacity-10 d-flex justify-content-between align-items-center'>
                <div className='d-flex align-items-center gap-2'>
                    <div className='p-1 rounded-circle bg-primary bg-opacity-10 text-primary'>
                        <Lock size={20} />
                    </div>
                    <div>
                        <CardTitle tag='h4' className='mb-0 fw-bolder text-dark'>Password & Authentication Security</CardTitle>
                        <small className='text-muted'>Update your master password to protect your account against unauthorized access</small>
                    </div>
                </div>
            </CardHeader>

            <CardBody className='p-3'>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Row className='gy-3'>
                        <Col md={4} sm={12}>
                            <FormGroupCustom
                                type='password'
                                name='old_password'
                                errors={errors}
                                label='Current Password'
                                control={control}
                                message='Enter your existing active password'
                                className='mb-1'
                                rules={{ required: true }}
                            />
                        </Col>

                        <Col md={4} sm={12}>
                            <FormGroupCustom
                                type='password'
                                name='password'
                                errors={errors}
                                label='New Password'
                                control={control}
                                message='Min 8 chars, 1 uppercase, 1 lowercase, 1 number & 1 special character'
                                className='mb-1'
                                rules={{ required: true, validate: checkPassword }}
                            />
                        </Col>

                        <Col md={4} sm={12}>
                            <FormGroupCustom
                                type='password'
                                name='password_confirmation'
                                errors={errors}
                                control={control}
                                label='Confirm New Password'
                                message='Must match the new password above'
                                className='mb-1'
                                rules={{
                                    required: true,
                                    validate: (value) => value === watch('password') || 'Passwords do not match'
                                }}
                            />
                        </Col>

                        <Col xs={12}>
                            <Alert color='light-primary' className='p-2 mb-2'>
                                <div className='d-flex align-items-center gap-2 mb-1'>
                                    <Shield size={16} className='text-primary' />
                                    <strong className='text-dark small'>Password Security Standards:</strong>
                                </div>
                                <ul className='small text-muted ps-3 mb-0' style={{ lineHeight: '1.6' }}>
                                    <li>At least 8 characters in length (longer is stronger)</li>
                                    <li>Must contain at least one uppercase letter (A-Z) and one lowercase letter (a-z)</li>
                                    <li>Must include at least one numerical digit (0-9) and one special symbol (@, #, $, %, etc.)</li>
                                    <li>Avoid spaces or predictable sequences</li>
                                </ul>
                            </Alert>
                        </Col>

                        <Col xs={12}>
                            <LoadingButton loading={loading} type='submit' color='primary' className='px-3 shadow-sm'>
                                Update Password
                            </LoadingButton>
                        </Col>
                    </Row>
                </Form>
            </CardBody>
        </Card>
    )
}

export default Password
