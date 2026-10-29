// @ts-nocheck
import base64 from 'base-64'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Button, ButtonGroup, CardBody, Col, Row } from 'reactstrap'
import { loadBusinessCategory, loadUserChild, waFlowSignup } from '../../utility/apis/userManagement'
import { addWhatsappConfig, editWhatsappConfig } from '../../utility/apis/whatsappConfig'
import { isValid, isValidArray } from '../../utility/helpers/common'
import Hide from '../../utility/Hide'
import Show from '../../utility/Show'
import { createAsyncSelectMultiUserOptions } from '../../utility/Utils'
import FormGroupCustom from '../components/formGroupCustom'
import CenteredModal from '../components/modal/CenteredModal'
import LoadingButton from '../components/buttons/LoadingButton'
import toast from 'react-hot-toast'


export default function AddWhatsappConfig({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", children = null, ...rest }) {

    const [open, setOpen] = useState(false)
    const [primary, setPrimary] = useState(null)
    const loginUser = useSelector(state => state.auth.userData)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])
    const [businessCategory, setBusinessCategory] = useState([])
    const [dex, setDex] = useState(null)
    const dispatch = useDispatch()
    const form = useForm()
    const [step, setStep] = useState(edit ? 2 : 1)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues, setError } = form
    const [isLoggedin, setIsLoggedin] = useState(false)

    const fbLoginCallback = (response) => {
        if (response.authResponse) {
            const code = response.authResponse.code
            // The returned code must be transmitted to your backend first and then
            // perform a server-to-server call from there to our servers for an access token.

            waFlowSignup({
                jsonData: {
                    code,
                    status: response?.status
                },
                success: (e) => {
                    toast.success("Successfully connected to Facebook")
                }
            })
        }

    }


    const onLoginClick = () => {
        if (!process.env.REACT_APP_META_APP_ID || !process.env.REACT_APP_META_CONFIG_ID || !process.env.REACT_APP_META_GRAPH_VERSION || !window.FB) { toast.error('WhatsApp onboarding is not configured yet.'); return }
        window.FB.login(fbLoginCallback, {
            config_id: process.env.REACT_APP_META_CONFIG_ID, // configuration ID goes here
            response_type: 'code', // must be set to 'code' for System User access token
            override_default_response_type: true, // when true, any response types passed in the "response_type" will take precedence over the default types
            extras: {
                setup: {},
                featureType: '',
                sessionInfoVersion: '2'
            }
        })
    }

    useEffect(() => {

        const event = (event) => {
            if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") {
                return
            }
            try {
                const data = JSON.parse(event.data)
                if (data.type === 'WA_EMBEDDED_SIGNUP') {
                    // if user finishes the Embedded Signup flow
                    if (data.event === 'FINISH') {
                        const { phone_number_id, waba_id } = data.data
                        console.log("Phone number ID ", phone_number_id, " WhatsApp business account ID ", waba_id)
                        // if user cancels the Embedded Signup flow
                    } else if (data.event === 'CANCEL') {
                        const { current_step } = data.data
                        console.warn("Cancel at ", current_step)
                        // if user reports an error during the Embedded Signup flow
                    } else if (data.event === 'ERROR') {
                        const { error_message } = data.data
                        console.error("error ", error_message)
                    }
                }
                console.log(JSON.stringify(data, null, 2))
            } catch {
                console.log('Non JSON Responses', event.data)
            }
        }

        window.addEventListener('message', event)

        window.fbAsyncInit = function () {
            if (!process.env.REACT_APP_META_APP_ID || !process.env.REACT_APP_META_GRAPH_VERSION) return
            // eslint-disable-next-line no-undef
            FB.init({
                appId: process.env.REACT_APP_META_APP_ID,
                autoLogAppEvents: true,
                xfbml: true,
                version: process.env.REACT_APP_META_GRAPH_VERSION
            })
        };

        // Load the JavaScript SDK asynchronously
        (function (d, s, id) {
            const fjs = d.getElementsByTagName(s)[0]
            if (d.getElementById(id)) return
            const js = d.createElement(s)
            js.id = id
            js.src = "https://connect.facebook.net/en_US/sdk.js"
            fjs.parentNode.insertBefore(js, fjs)
        }(document, 'script', 'facebook-jssdk'))

        // remove event listener on unmount
        return () => {
            window.removeEventListener('message', event)
        }
    }, [])

    const handleShow = () => {
        reset()

        setOpen(!open)
        setModal(!open)
        if (edit === null) setEditData(null)
        if (isValid(edit)) {
            setStep(2)
        } else {
            setStep(1)
        }

    }
    const handleClose = (from = null) => {
        handleShow()
    }


    const listUser = async (search, loadedOptions, { page }) => {
        // if (user_id)
        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            // dispatch,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUser)

    }

    const listBusinessType = () => {
        // if (user_id)
        loadBusinessCategory({
            async: false,
            success: e => {
                const data = e.data

                console.log("data", data)

                // array from object
                const array = Object.keys(data).map(key => ({
                    label: data[key],
                    value: data[key]
                }))


                setBusinessCategory(array)
            }

        })
    }

    const handleSave = (data) => {
        if (edit?.id) {
            editWhatsappConfig({
                id: edit?.id,
                jsonData: {
                    ...data,
                    user_id: edit?.user_id
                    // is_retry_applicable: data?.is_retry_applicable === 1 ? 1 : 0,
                    // is_refund_applicable: data?.is_refund_applicable === 1 ? 1 : 0
                },
                dispatch,
                loading: setLoading,
                success: (d) => {
                    handleClose()
                    setStep(2)
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
        } else {
            addWhatsappConfig({
                jsonData: {
                    ...data,
                    user_id: loginUser?.userType === 2 || loginUser?.userType === 1 ? loginUser?.id : data?.user_id
                },
                loading: setLoading,
                dispatch,
                success: (e) => {
                    setStep(3)
                    // handleClose()
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
    }

    // useEffect(() => {
    //     setTimeout(() => {
    //         setValue('user_id', edit?.user_id)
    //     }, 10000)
    // }, [edit])

    const code = (edit) => {
        if (edit?.access_token) {
            const dex = base64.decode(edit?.access_token)

            return dex
        }
        return null
    }

    // // decode edit access token
    // const code = (edit) => {
    //     if (edit?.access_token) {
    //         const dex = base64.decode(edit?.access_token)
    //         setDex(dex)
    //         return dex
    //     }
    //     return null
    // }

    useEffect(() => {
        listBusinessType()
    }, [])

    return (
        <>
            {!noView ? <Component role="button" onClick={handleShow} {...rest}>{children}</Component> : null}
            <CenteredModal
                loading={loading}
                open={open}
                scrollControl={false}
                handleModal={handleClose}
                modalClass="modal-lg"
                handleSave={handleSubmit(handleSave)}
                disableSave={loading}
                title={isValid(edit) ? 'Edit Configuration' : 'Add Configuration'}
                extraButtons={isValid(edit) ? <>
                    <LoadingButton loading={loading} color='primary' style={{ textTransform: "capitalize" }}
                        onClick={() => {
                            onLoginClick()
                        }}
                    >
                        {
                            "Reconnect Facebook"
                        }
                    </LoadingButton>
                </> : null}
                footerComponent={!isValid(edit) ? <>
                    <div className=''>
                        <ButtonGroup className="btn-block">
                            <Button.Ripple color='secondary' outline style={{ textTransform: "capitalize" }}
                                onClick={() => {
                                    step === 2 ? setStep(1) : step === 3 ? setStep(2) : handleClose()
                                }}
                            >
                                {
                                    step === 1 ? "Close" : "Back"
                                }
                            </Button.Ripple>

                            <LoadingButton loading={loading} color='primary' style={{ textTransform: "capitalize" }}
                                onClick={() => {
                                    step === 1 ? setStep(2) : step === 2 ? handleSubmit(handleSave)() : onLoginClick()
                                }}
                            >
                                {
                                    step === 1 ? "Next" : step === 2 ? "Save & Continue" : " Continue with Facebook"
                                }
                            </LoadingButton>

                        </ButtonGroup>
                    </div>
                </> : undefined}
            >
                <form>
                    <CardBody>
                        {
                            step === 1 ? <>
                                <div>
                                    <h2>Get started with WhatsApp’s Business API</h2>
                                    <p>
                                        WhatsApp is one of the most popular communication applications in the world. WhatsApp is a Facebook company and requires a Facebook account and Facebook Business Manager to set up.
                                    </p>

                                    <p>
                                        <strong>What you will Need :-</strong>
                                    </p>
                                    <ol type="1">
                                        <li>Access to Facebook Business Manager</li>
                                        <li>A viable Phone Number for WhatsApp</li>
                                        <li>Your business’s legal address and details</li>
                                        <li>Verify your Facebook Business</li>
                                        <li>Please ensure you have full access to the WhatsApp Business account</li>
                                        <li>Please ensure the ID that is being used belongs to the business that you manage</li>
                                        <li>Please ensure the FB user ID has access to manage the WhatsApp account templates, phone numbers, generate QR code</li>
                                    </ol>
                                    <p>
                                        <strong>Create your WhatsApp Business Account</strong></p>
                                    <p>To continue you need to access your Facebook business account, as well as.</p>
                                    <ol type="1">
                                        <li>Your company’s legal name and address</li>
                                        <li>A display name and short description</li>
                                        <li>A phone number you have access to, own by your business. Don’t have one? Contact Support</li>
                                    </ol>
                                </div>

                            </> : step === 2 ? <>
                                <Row>
                                    <Hide IF={isValid(edit)}>
                                        <Hide IF={loginUser?.userType === 2 || loginUser?.userType === 1}>

                                            <Col md="12">
                                                <FormGroupCustom
                                                    // key={`sfsfdgdfsdfs${edit?.user_id}-${watch('user_id')}-kmlkdfgm`}
                                                    async
                                                    type={"select"}
                                                    control={control}
                                                    name="user_id"
                                                    isClearable
                                                    defaultOptions
                                                    // onChangeValue={(e) => { setGetSender(e?.id) }}
                                                    value={watch('user_id')}
                                                    loadOptions={listUser}
                                                    className='mb-1'
                                                    label="User"
                                                    errors={errors}
                                                    options={user}
                                                    rules={{ required: true }}
                                                />
                                            </Col>

                                        </Hide>
                                    </Hide>
                                    <Show IF={isValid(edit) || loginUser?.userType === 2 || loginUser?.userType === 1}>
                                        <Col
                                            md={edit ? 4 : 6}

                                            xs="12" >
                                            <FormGroupCustom
                                                type={"text"}
                                                control={control}
                                                name="name"
                                                value={edit?.name ?? loginUser?.name}
                                                className='mb-1 pe-none'
                                                label={"Name"}
                                                disabled
                                            />
                                        </Col>

                                    </Show>
                                    <Col
                                        md={edit ? 4 : 6}
                                        xs="12" >
                                        <FormGroupCustom
                                            type={"number"}
                                            control={control}
                                            name="sender_number"
                                            value={edit?.sender_number}
                                            className='mb-1'
                                            label="Sender Number"
                                            errors={errors}
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    <Col
                                        md={edit ? 4 : 6}
                                        xs="12" >
                                        <FormGroupCustom
                                            type={"number"}
                                            control={control}
                                            name="business_account_id"
                                            value={edit?.business_account_id}
                                            className='mb-1'
                                            label="Business Account Id"
                                            errors={errors}
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    <Col md="6" xs="12" >
                                        <FormGroupCustom
                                            type={"number"}
                                            control={control}
                                            name="facebook_app_id"
                                            value={edit?.app_id}
                                            className='mb-1'
                                            label="Facebook App Id"
                                            errors={errors}
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    <Col md="6" xs="12" >
                                        <FormGroupCustom
                                            type={"text"}
                                            control={control}
                                            name="facebook_app_version"
                                            value={edit?.app_version ?? 'v17.0'}
                                            className='mb-1'
                                            placeholder={'v17.0'}
                                            // disabled
                                            label="Facebook App Version"
                                            errors={errors}
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    {/* Select */}
                                    <Col md="6" xs="12" >
                                        <FormGroupCustom
                                            type={"select"}
                                            control={control}
                                            name="business_category"
                                            value={edit?.business_category ?? ''}
                                            className='mb-1'
                                            placeholder={'Enter Business Category'}
                                            // disabled
                                            label="Business Category"
                                            errors={errors}
                                            rules={{ required: true }}
                                            options={businessCategory}
                                        />
                                    </Col>
                                    <Col md="6" xs="12" >
                                        <FormGroupCustom
                                            type={"text"}
                                            control={control}
                                            name="wa_business_page"
                                            value={edit?.wa_business_page ?? ''}
                                            className='mb-1'
                                            placeholder={'Enter Business Page'}
                                            // disabled
                                            label="Business Page"
                                            errors={errors}
                                            rules={{ required: false }}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="4" xs="12" className={"pt-1"} >
                                        <FormGroupCustom
                                            type={"checkbox"}
                                            control={control}
                                            name="privacy_read_receipt"
                                            value={edit?.privacy_read_receipt ?? ''}
                                            className='mb-1'
                                            placeholder={'Privacy Read Receipt'}
                                            // disabled
                                            label="Privacy Read Receipt"
                                            errors={errors}
                                            rules={{ required: false }}
                                        />
                                    </Col>
                                    <Col md="4" xs="12" className={"pt-1"}  >
                                        <FormGroupCustom
                                            type={"checkbox"}
                                            control={control}
                                            name="privacy_deregister_mobile"
                                            value={edit?.privacy_deregister_mobile ?? ''}
                                            className='mb-1'
                                            placeholder={'Privacy Deregister Mobile'}
                                            // disabled
                                            label="Privacy Deregister Mobile"
                                            errors={errors}
                                            rules={{ required: false }}
                                        />
                                    </Col>
                                    <Col md="4" xs="12" className={"pt-1"} >
                                        <FormGroupCustom
                                            type={"checkbox"}
                                            control={control}
                                            name="enable_auto_response"
                                            value={edit?.enable_auto_response ?? ''}
                                            className='mb-1'
                                            placeholder={'Enable Auto Response'}
                                            // disabled
                                            label="Enable Auto Response"
                                            errors={errors}
                                            rules={{ required: false }}
                                        />
                                    </Col>
                                    <Show IF={watch('enable_auto_response') === 1 || edit?.enable_auto_response === 1} >
                                        <Col md="12" xs="12" >
                                            <FormGroupCustom
                                                type={"textarea"}
                                                control={control}
                                                name="auto_response_message"
                                                value={edit?.auto_response_message ?? ''}
                                                className='mb-1'
                                                placeholder={'Auto Response Message'}
                                                // disabled
                                                label="Auto Response Message"
                                                errors={errors}
                                                rules={{ required: watch('enable_auto_response') === 1 }}
                                            />
                                        </Col>
                                    </Show>
                                    <Col md="12" xs="12" >
                                        <FormGroupCustom
                                            type={"textarea"}
                                            control={control}
                                            name="access_token"
                                            value={code(edit)}
                                            width={400}
                                            className='mb-1'
                                            label="Access Token"
                                            errors={errors}
                                            rules={{ required: true }}
                                        />
                                    </Col>

                                </Row>
                            </> : <>
                                <Row>
                                    <Col md="8">
                                        <div>
                                            <h2>
                                                <strong>Create your WhatsApp Business Account</strong></h2>
                                            <p>To continue you need to access your Facebook business account, as well as.</p>
                                            <ol type="1">
                                                <li>Your company’s legal name and address</li>
                                                <li>A display name and short description</li>
                                                <li>A phone number you have access to, own by your business. <br />
                                                    Don’t have one? <a target='_blank' href="https://www.whatsapp.com/contact">Contact Support</a></li>
                                            </ol>
                                        </div>
                                    </Col>
                                    <Col md="4">
                                        <img style={{
                                            height: 450
                                        }} src={require('../../assets/images/logo/Brand.png').default} alt="whatsapp-business-account" />
                                    </Col>
                                </Row>

                            </>
                        }

                    </CardBody >
                </form >
            </CenteredModal >
        </>
    )
}
