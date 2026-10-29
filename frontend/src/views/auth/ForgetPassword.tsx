// @ts-nocheck
// ** React Imports
import { Link, Navigate, useNavigate } from 'react-router-dom'

// ** Reactstrap Imports
import { CardText, CardTitle, Col, Form, Row } from 'reactstrap'

// ** Utils
import { isUserLoggedIn } from '@utils'

// ** Custom Hooks
import { useSkin } from '@hooks/useSkin'

// ** Icons Imports
import { ChevronLeft } from 'react-feather'

// ** Styles
import '@styles/react/pages/page-authentication.scss'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import authLogo from '../../assets/images/logo/platform.svg'

import { isObjEmpty } from '../../utility/Utils'
import { forgotPassword } from '../../utility/apis/authentication'
import { log } from '../../utility/helpers/common'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'

const ForgotPassword = () => {
    // ** Hooks
    const { skin } = useSkin()
    const { formState: { errors }, handleSubmit, control, setError } = useForm()
    const [loading, setLoading] = useState(false)

    const illustration = skin === 'dark' ? 'forgot-password-v2-dark.svg' : 'forgot-password-v2.svg'
    const sourceModule = require(`@src/assets/images/pages/${illustration}`)
    const source = sourceModule?.default || sourceModule

    const navigate = useNavigate()

    const onSubmit = (data) => {
        // log("formDat", data)
        if (isObjEmpty(errors)) {
            forgotPassword({
                formData: {

                    ...data
                },

                success: (e) => {
                    navigate("/authentication")

                },
                loading: setLoading
            })
        }
    }
    if (!isUserLoggedIn()) {
        return (
            <div className='auth-wrapper auth-cover'>
                <Row className='auth-inner m-0'>
                    <Link className='brand-logo' to='/authentication' onClick={e => e.preventDefault()}>
                        <h2 className='brand-text text-primary ms-1'>
                            <img
                                style={{ width: 250, height: 100 }}
                                className='img-fluid'
                                src={authLogo}
                                onError={e => {
                                    e.currentTarget.onerror = null
                                    e.currentTarget.src = authLogo
                                }}
                            />
                            {/* {themeConfig.app.appName} */}
                        </h2>
                    </Link>
                    <Col className='d-none d-lg-flex align-items-center p-5' lg='8' sm='12'>
                        <div className='w-100 d-lg-flex align-items-center justify-content-center px-5'>
                            <img className='img-fluid' src={source} alt='Login Cover' />
                        </div>
                    </Col>
                    <Col className='d-flex align-items-center auth-bg px-2 p-lg-5' lg='4' sm='12'>
                        <Col className='px-xl-2 mx-auto' sm='8' md='6' lg='12'>
                            <CardTitle tag='h2' className='fw-bold mb-1'>
                                Forgot Password? 🔒
                            </CardTitle>
                            <CardText className='mb-2'>
                                Enter your email and we'll send you instructions to reset your password
                            </CardText>
                            {/* <Form className='auth-forgot-password-form mt-2' onSubmit={onSubmit()}> */}
                            <Form onSubmit={handleSubmit(onSubmit)}>
                                <div className='mb-1'>
                                    <FormGroupCustom
                                        type={"email"}
                                        name="email"
                                        label={"Email"}
                                        control={control}
                                        errors={errors}
                                        placeholder="Enter Your Email ID"
                                        className='mb-1'
                                        rules={{ required: true }}
                                        feedback="please enter a valid email "
                                    />
                                </div>
                                <LoadingButton loading={loading} color='primary' type="submit" block>
                                    Send Reset Link
                                </LoadingButton>
                            </Form>
                            <p className='text-center mt-2'>
                                <Link to='/authentication'>
                                    <ChevronLeft className='rotate-rtl me-25' size={14} />
                                    <span className='align-middle'>Back to login</span>
                                </Link>
                            </p>
                        </Col>
                    </Col>
                </Row>
            </div>
        )
    } else {
        return <Navigate to='/' />
    }
}

export default ForgotPassword
