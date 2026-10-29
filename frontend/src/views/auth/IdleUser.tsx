// @ts-nocheck
// ** React Imports
import { Link, useNavigate } from 'react-router-dom'

// ** Icons Imports

// ** Custom Components

// ** Reactstrap Imports
import { Card, CardBody, CardText, CardTitle, Form, Label } from 'reactstrap'

// ** Styles
import { AbilityContext } from '@src/utility/context/Can'
import '@styles/react/pages/page-authentication.scss'
import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { getPath } from '../../router/RouteHelper'
import { isObjEmpty } from '../../utility/Utils'
import { login } from '../../utility/apis/authentication'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'

const IdleUser = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const ability = useContext(AbilityContext)
    const [loading, setLoading] = useState(false)
    const { control, handleSubmit, formState: { errors }, register, setError } = useForm()

    const onSubmit = (formData) => {
        if (isObjEmpty(errors)) {
            login({
                formData,
                redirect: true,
                error: e => {
                },
                loading: setLoading,
                dispatch,
                ability
                // navigate

            })
        }
    }
    return (
        <div className='auth-wrapper auth-basic px-2'>
            <div className='auth-inner my-2'>
                <Card className='mb-0'>
                    <CardBody>
                        
                        <CardTitle tag='h4' className='mb-1'>
                            Welcome to Messaging! 👋
                        </CardTitle>
                        <CardText className='mb-2'>Please log-in to your account and start the adventure</CardText>
                        <Form className='auth-login-form mt-2' onSubmit={handleSubmit(onSubmit)}>
                            <FormGroupCustom
                                autoFocus
                                type='text'
                                label={"Email"}
                                name='email'
                                feedback="please enter a valid email"
                                className='mb-1'
                                errors={errors}
                                control={control}
                                rules={{
                                    required: true
                                }}
                            />
                            <div className='d-flex justify-content-between'>
                                <Label className='form-label' for='login-password'>
                                    Password
                                </Label>

                                <Link to={getPath("forgotPassword")}>
                                    <small>forgot password</small>
                                </Link>
                            </div>

                            <FormGroupCustom
                                noLabel
                                type='password'
                                name='password'
                                className='mb-1'
                                errors={errors}
                                control={control}
                                rules={{ required: true }}
                            />

                            <LoadingButton loading={loading} type='submit' color='primary' block>
                                Log In
                            </LoadingButton>
                        </Form>
                      
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}

export default IdleUser
