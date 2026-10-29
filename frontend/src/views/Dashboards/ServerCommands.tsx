// @ts-nocheck
import React, { useState } from 'react'
import Header from '../components/header'
import { serverCommands } from '../../utility/apis/dashboard'
import { useForm } from 'react-hook-form'
import FormGroupCustom from '../components/formGroupCustom'
import LoadingButton from '../components/buttons/LoadingButton'
import { ArrowLeft, Lock, Search } from 'react-feather'
import { Card, CardBody, CardText, CardTitle, Col, Form, Input, Label, Row } from 'reactstrap'
import { isValid, log } from '../../utility/helpers/common'
import { data } from 'jquery'
import hljs from 'highlight.js'
import Show from '../../utility/Show'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import httpConfig from '../../utility/http/httpConfig'
import ApiEndpoints from '../../utility/http/ApiEndpoints'
import { handleLogout, handleRemoveOtp } from '../../redux/authentication'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import '@styles/react/pages/page-authentication.scss'
import InputPasswordToggle from '@components/input-password-toggle'

const correctPassword = 'A$hok3005'

const maxFailedAttempts = 3

const ServerCommands = () => {
    const [commands, setCommands] = useState(null)
    const [loading, setLoading] = useState(false)
    const form = useForm()
    const navigate = useNavigate()
    const [resetIt, setResetIt] = useState(new Date())
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues, setError } = form

    const [password, setPassword] = useState('')

    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const dispatch = useDispatch()
    const [failedAttempts, setFailedAttempts] = useState(0)

    const handlePasswordChange = (event) => {
        setPassword(event.target.value)
    }

    const loadLogout = (e) => {
        // e.preventDefault()
        axios
            .post(`${httpConfig.baseUrl}${ApiEndpoints.logout}`)
            .then((res) => {
                setLoading(false)

                dispatch(handleLogout())
                dispatch(handleRemoveOtp())
                localStorage.removeItem('access_token')
                // dispatch(handle)
                window.location.href = '/authentication'
            })
            .catch((err) => {
                setError(err?.response?.data?.message)
            })
    }
    // Event handler for form submission
    const handleSubmit1 = (event) => {
        event.preventDefault()
        // Check if the entered password matches the correct password
        if (password === correctPassword) {
            setIsAuthenticated(true)
        } else {
            // Increment the number of failed attempts
            setFailedAttempts(failedAttempts + 1)

            toast.error('Incorrect password. Please try again.')
            setPassword('')

            // Check if the number of failed attempts exceeds the threshold
            if (failedAttempts + 1 >= maxFailedAttempts) {
                // Perform logout action (you can implement your own logout logic here)

                toast.error('You have exceeded the maximum number of failed attempts. Logging you out.')
                // For example, you could redirect the user to the login page or clear authentication state
                setIsAuthenticated(false)
                setFailedAttempts(0)
                loadLogout()
            }
        }
    }

    const handleSave = (data) => {
        serverCommands({
            jsonData: {
                ...data
            },
            loading: setLoading,
            success: (res) => {
                // log(res, "dsfskjdfsfkjl")
                setCommands(res)
            }
        })
    }

    const highlightedCode = (text, lang) => hljs.highlight(
        `${text}`,
        { language: lang }
    ).value

    // log(commands, "commands")
    return (
        <>

            <Header icon={<ArrowLeft onClick={() => { navigate(-1) }} style={{ cursor: "pointer" }} />} title={"Server Commands"} />
            {!isAuthenticated ? (
                // Render the password form if not authenticated

                <Row className={"justify-content-center"}>
                    <Col md="4" sm="12">
                        <Card className='mb-0'>
                            <CardBody>

                                <CardTitle tag='h2' className='fw-bolder mb-1'>
                                    Server Commands
                                </CardTitle>
                                <CardText className='mb-75'>
                                    This page contains confidential information. Please enter the password to proceed.

                                </CardText>
                                {/* <CardText className='fw-bolder mb-2'>******0789</CardText> */}
                                <form onSubmit={handleSubmit1}>

                                    <div className=''>

                                        <Row className="">
                                            <Col md="12" sm="12">
                                      
                                                <FormGroupCustom
                                                    autoFocus
                                                    type='password'
                                                    name='password'
                                                    label={"Password"}
                                                    feedback="please enter a valid password"
                                                    placeholder="Enter Password"
                                                    className='mb-1'
                                                    errors={errors}
                                                    control={control}
                                                    onKeyUp={handlePasswordChange}
                                                    rules={{ required: true }}
                                                />
                                            </Col>

                                        </Row>


                                    </div>
                                    <LoadingButton loading={loading} type='submit' color='primary' block>
                                        Unlock
                                    </LoadingButton>

                                </form>

                            </CardBody>

                        </Card>

                    </Col>
                </Row>

            ) : (
                // Render the protected content if authenticated
                <>
                    <Row>
                        <Col md="12">
                            <Form onSubmit={handleSubmit(handleSave)}>
                                <FormGroupCustom
                                    key={resetIt}
                                    name={"command"}
                                    type={"text"}
                                    errors={errors}
                                    label="Server Command"
                                    noLabel
                                    setValue={setValue}
                                    className="mb-2"
                                    control={control}
                                    append={
                                        <>
                                            <LoadingButton
                                                loading={loading}
                                                className="btn btn-primary"
                                                color="primary"
                                                type="submit"
                                                size="sm"
                                            >
                                                <Search size={15} />
                                            </LoadingButton>
                                        </>
                                    }
                                />
                            </Form>
                        </Col>
                    </Row>

                    <Show IF={isValid(commands)}>
                        <span className='hljs'>
                            <pre>{commands?.map(d => <p style={{ whiteSpace: 'break-spaces' }} dangerouslySetInnerHTML={{ __html: highlightedCode(d, 'shell') }} />)}</pre>

                        </span>
                    </Show>
                </>
            )}

        </>
    )
}

export default ServerCommands
