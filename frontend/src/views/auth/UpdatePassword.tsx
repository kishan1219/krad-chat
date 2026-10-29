// @ts-nocheck
// ** React Imports
import { Link, useNavigate, useParams } from 'react-router-dom'

// ** Custom Hooks
import { useSkin } from '@hooks/useSkin'

// ** Icons Imports
import { ChevronLeft } from 'react-feather'

// ** Custom Components

// ** Reactstrap Imports
import { CardText, CardTitle, Col, Form, Row } from 'reactstrap'

// ** Styles
import '@styles/react/pages/page-authentication.scss'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import authLogo from '../../assets/images/logo/platform.svg'

import { checkPassword, isObjEmpty } from '../../utility/Utils'
import { resetPassword } from '../../utility/apis/authentication'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'

const ResetPasswordCover = () => {
    // ** Hooks
    const token = useParams()
    const { formState: { errors }, handleSubmit, control, watch, setError } = useForm()
    const { skin } = useSkin()
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const onSubmit = (formData) => {
        if (isObjEmpty(errors)) {
            resetPassword({
                formData: { ...formData, ...token },
                loading: setLoading,
                error: (e) => {
                    setError("password", { message: e?.data?.payload?.email[0] ?? 'djkdsl' })
                },
                success : (e) => {
                    navigate("/authentication")
            
                }
            })
        }
    }

    const illustration = skin === 'dark' ? 'reset-password-v2-dark.svg' : 'reset-password-v2.svg'
    const sourceModule = require(`@src/assets/images/pages/${illustration}`)
    const source = sourceModule?.default || sourceModule

    return (
        <div className='auth-wrapper auth-cover'>
            <Row className='auth-inner m-0'>
                <Link className='brand-logo' to='/authentication' onClick={e => e.preventDefault()}>
                    <img
                        style={{ width: 250, height: 100 }}
                        className='img-fluid'
                        src={authLogo}
                        onError={e => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = authLogo
                        }}
                    />
                </Link>
                <Col className='d-none d-lg-flex align-items-center p-5' lg='8' sm='12'>
                    <div className='w-100 d-lg-flex align-items-center justify-content-center px-5'>
                        <img className='img-fluid' src={source} alt='Login Cover' />
                    </div>
                </Col>
                <Col className='d-flex align-items-center auth-bg px-2 p-lg-5' lg='4' sm='12'>
                    <Col className='px-xl-2 mx-auto' sm='8' md='6' lg='12'>
                        <CardTitle tag='h2' className='fw-bold mb-1'>
                            Reset Password 🔒
                        </CardTitle>
                        <CardText className='mb-2'>Your new password must be different from previously used passwords</CardText>

                        <Form className='auth-reset-password-form mt-2' onSubmit={handleSubmit(onSubmit)}>

                            <FormGroupCustom
                                type={"password"}
                                name={"password"}
                                errors={errors}
                                label = "Password"
                                control={control}
                                message={"Password Must Be of 8 Character including atleast a Uppercase Letter, a Lowercase, a Number & a Special Character"}

                                className='mb-1'
                                rules={{ required: true, validate: checkPassword }}

                            />
                            <FormGroupCustom
                                type={"password"}
                                name={"password_confirmation"}
                                errors={errors}
                                control={control}
                                label= "Confirm Password"
                                message= "please enter password more than 6 character"
                                className='mb-2'
                                rules={{
                                    required: true,
                                    // pattern: Patterns.Password,
                                    validate: (value) => value === watch("password")
                                }}
                            />
                            <LoadingButton loading={loading} color='primary' type="submit" block>
                              Set New Password
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
}

export default ResetPasswordCover
