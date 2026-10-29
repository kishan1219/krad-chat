import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertTriangle, ArrowLeft, CheckCircle, Mail, Send, Star } from 'react-feather'
import { Button, Card, CardBody, CardTitle, Form, FormFeedback, FormText, Input, InputGroup, InputGroupText, Label, Spinner } from 'reactstrap'
import authLogo from '../../assets/images/logo/krad-logo-dark.svg'

import { isUserLoggedIn } from '../../utility/Utils'
import { forgotPassword } from '../../utility/apis/authentication'
import './login-modern.scss'

interface ForgotFormValues {
    email: string
}

const ForgetPasswordModern = () => {
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [message, setMessage] = useState('')
    const [errorText, setErrorText] = useState('')

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ForgotFormValues>({
        defaultValues: { email: '' }
    })

    const onSubmit = (values: ForgotFormValues) => {
        setErrorText('')
        setMessage('')
        forgotPassword({
            formData: values,
            loading: setLoading,
            success: (response: any) => {
                setSent(true)
                setMessage(response?.message || 'Reset instructions sent successfully.')
            },
            error: (err: any) => {
                setErrorText(err?.data?.message || 'Unable to send reset link. Please try again.')
            }
        })
    }

    if (isUserLoggedIn()) {
        return <Navigate to='/' />
    }

    return (
        <div className='modern-login-wrapper'>
            <div className='modern-login-grid'>
                <section className='modern-login-hero'>
                    <div className='hero-brand'>
                        <img
                            src={authLogo}
                            alt='Messaging'
                            className='hero-logo'
                            onError={(event) => {
                                event.currentTarget.onerror = null
                                event.currentTarget.src = authLogo
                            }}
                        />
                    </div>
                </section>

                <section className='modern-login-panel'>
                    <Card className='modern-login-card border-0'>
                        <CardBody>
                            {!sent ? (
                                <>
                                    <div className='panel-header'>
                                        <div className='panel-pill'>
                                            <Star size={14} />
                                            <span>Password Recovery</span>
                                        </div>
                                        <CardTitle tag='h2'>Forgot your password?</CardTitle>
                                        <FormText className='text-muted'>
                                            Enter your account email and we'll send reset instructions.
                                        </FormText>
                                    </div>

                                    <Form className='modern-login-form' onSubmit={handleSubmit(onSubmit)}>
                                        <div className='field-block'>
                                            <Label for='forgot-email-modern'>Email</Label>
                                            <InputGroup>
                                                <InputGroupText>
                                                    <Mail size={15} />
                                                </InputGroupText>
                                                <Input
                                                    id='forgot-email-modern'
                                                    type='email'
                                                    placeholder='name@company.com'
                                                    invalid={Boolean(errors.email)}
                                                    {...register('email', {
                                                        required: 'Email is required',
                                                        pattern: {
                                                            value: /\S+@\S+\.\S+/,
                                                            message: 'Please enter a valid email address'
                                                        }
                                                    })}
                                                />
                                            </InputGroup>
                                            {errors.email ? <FormFeedback className='d-block'>{errors.email.message}</FormFeedback> : null}
                                        </div>

                                        {errorText ? (
                                            <div className='error-strip'>
                                                <AlertTriangle size={15} />
                                                <span>{errorText}</span>
                                            </div>
                                        ) : null}

                                        <Button color='primary' block className='modern-login-btn' disabled={loading}>
                                            {loading ? <Spinner size='sm' /> : <Send size={15} />}
                                            <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
                                        </Button>
                                    </Form>
                                </>
                            ) : (
                                <div className='text-center py-2'>
                                    <div
                                        className='d-inline-flex align-items-center justify-content-center mb-1'
                                        style={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: 999,
                                            background: '#dcfce7',
                                            color: '#166534'
                                        }}
                                    >
                                        <CheckCircle size={34} />
                                    </div>
                                    <h3>Check your inbox</h3>
                                    <p className='text-muted mb-0'>{message}</p>
                                </div>
                            )}

                            <p className='register-note'>
                                <Link to='/authentication-modern'>
                                    <ArrowLeft size={14} className='me-25' />
                                    <span>Back to modern login</span>
                                </Link>
                            </p>
                        </CardBody>
                    </Card>
                </section>
            </div>
        </div>
    )
}

export default ForgetPasswordModern
