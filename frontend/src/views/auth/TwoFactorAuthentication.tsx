// @ts-nocheck
// ** React Imports
import { useNavigate } from 'react-router-dom'

// ** Reactstrap Imports
import { Card, CardBody, CardText, CardTitle, Col, Form, Row } from 'reactstrap'
// ** Styles
import { AbilityContext } from '@src/utility/context/Can'
import '@styles/react/pages/page-authentication.scss'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { isObjEmpty } from '../../utility/Utils'
import { resendOtp, verifyOtp } from '../../utility/apis/authentication'
import { isValidArray, log } from '../../utility/helpers/common'
import { useSkin } from '../../utility/hooks/useSkin'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'

const TwoFactorAuthentication = () => {
    const { skin } = useSkin()
    const dispatch = useDispatch()
    const ability = useContext(AbilityContext)
    const [loading, setLoading] = useState(false)
    const { control, handleSubmit, formState: { errors }, register, setError } = useForm()
    const navigate = useNavigate()
    const [disable, setDisable] = useState(true)
    const forOtp = useSelector(state => state.auth?.otpData)
    const storage = localStorage.getItem('disable')

    const onSubmit = (data) => {
        if (isObjEmpty(errors)) {
            verifyOtp({
                // formData,
                jsonData: {
                    ...data,
                    // remember_this_device_for_15_days: 0,
                    token_id: forOtp?.token_id
                },
                loading: setLoading,
                dispatch,
                ability,
                redirect: true,
                success: (e) => {
                    localStorage.removeItem("disable")
                },
                errors: (e) => {
                    const d = e?.data?.data
                    for (const key in d) {
                        if (Object.hasOwnProperty.call(d, key)) {
                            if (isValidArray(d[key])) {
                                const message = d[key]?.map(a => `${a} \n`)
                                setError(key, { message, type: "validate" })
                            }
                        }
                    }

                }

                // navigate
            })
            // log(data)

        }
    }

    // log(storage, "storage")

    const hideShow = () => {
        localStorage.removeItem("disable")
    }

    // log(forOtp?.token_id, "token_id 1")

    const resendOt = (jsonData, data) => {
        log(forOtp?.token_id, "token_id")
        resendOtp({
            jsonData: {
                ...data,
                // remember_this_device_for_15_days: 0,
                token_id: forOtp?.token_id
            },
            loading: setLoading,
            success: (e) => {

            },
            errors: (e) => {
                const d = e?.data?.data
                for (const key in d) {
                    if (Object.hasOwnProperty.call(d, key)) {
                        if (isValidArray(d[key])) {
                            const message = d[key]?.map(a => `${a} \n`)
                            setError(key, { message, type: "validate" })
                        }
                    }
                }

            }
        })

    }


    useEffect(() => {
        const l = setInterval(() => {
            setDisable(false)
            localStorage.setItem('disable', false)

        }, 60000)
        return () => {
            clearInterval(l)
        }

    }, [disable])


    const showResendOtp = (storage) => {
        if (storage === true) {
            return (
                <p className='text-center mt-2 '>
                    <span>Didn’t get the code?</span>{' '}
                    <a onClick={() => { resendOt(); hideShow() }} className='text-primary' >
                        Resend
                    </a>{' '}

                </p>
            )
        }
    }

    // }

    // <button disabled={disabled} />
    return (
        <div className='auth-wrapper auth-basic px-2'>
            <div className='auth-inner my-2'>
                <Card className='mb-0'>
                    <CardBody>

                        <CardTitle tag='h2' className='fw-bolder mb-1'>
                            Two Step Verification 💬
                        </CardTitle>
                        <CardText className='mb-75'>
                            We sent a verification code to your mobile number. Please enter the code from the mobile in the field below.
                        </CardText>
                        {/* <CardText className='fw-bolder mb-2'>******0789</CardText> */}
                        <Form className='mt-2' onSubmit={handleSubmit(onSubmit)}>
                            <h6>Type your 6 digit security code</h6>
                            <div className='auth-input-wrapper d-flex align-items-center justify-content-between'>

                                <Row>
                                    <Col md="12" sm="12">
                                        <FormGroupCustom
                                            noLabel
                                            type={"number"}
                                            control={control}
                                            name="otp"
                                            placeholder="Enter OTP"
                                            className='mb-1'
                                            // label="Header ID"
                                            errors={errors}
                                            rules={{ required: true, minLength: 6, maxLength: 6 }}
                                        />
                                    </Col>
                                    <Col md="12" sm="12">
                                        <FormGroupCustom
                                            // noLabel
                                            type={"checkbox"}
                                            control={control}
                                            name="remember_this_device_for_15_days"
                                            label="Remember This Device For 15 Days"
                                            className='mb-1'
                                            // label="Header ID"
                                            errors={errors}
                                            rules={{ required: false }}
                                        />
                                    </Col>
                                </Row>


                            </div>
                            <LoadingButton loading={loading} type='submit' color='primary' block>
                                Submit
                            </LoadingButton>
                            {storage ? <p className='text-center mt-2 '>
                                <span>Didn’t get the code?</span>{' '}
                                <a onClick={() => { resendOt(); hideShow() }} className='text-primary' >
                                    Resend
                                </a>{' '}

                            </p> : ""}
                        </Form>

                    </CardBody>
                    {showResendOtp(storage)}
                </Card>
            </div>
        </div >
    )
}

export default TwoFactorAuthentication
