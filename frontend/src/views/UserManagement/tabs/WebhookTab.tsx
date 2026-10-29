// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react'
import { Plus } from 'react-feather'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardBody, Col, Form, Row, Table } from 'reactstrap'
import { getWebhookEvents, getWebhookInfo, setWebhookUrl } from '../../../utility/apis/userManagement'
import { log } from '../../../utility/helpers/common'
import LoadingButton from '../../components/buttons/LoadingButton'
import FormGroupCustom from '../../components/formGroupCustom'

const FormCheckboxGroupCustom = ({
    control,
    name,
    type,
    label,
    value,
    errors,
    rules,
    placeholder,
    message,
    className
}) => {
    if (type === 'checkbox') {
        return (
            <div className={`form-check ${className}`}>
                <Controller
                    name={name}
                    control={control}
                    defaultValue={[]} // Add default value
                    render={({ field }) => (
                        <>
                            <input
                                type="checkbox"
                                className="form-check-input"
                                checked={field.value?.includes(value)}
                                onChange={(e) => {
                                    const newValue = e.target.checked ? [...(field.value || []), value] : field.value?.filter(v => v !== value)
                                    field.onChange(newValue)
                                }}
                                id={`checkbox-${value}`}
                            />
                            <label className="form-check-label" htmlFor={`checkbox-${value}`}>
                                {label}
                            </label>
                        </>
                    )}
                />
                {errors?.[name] && (
                    <div className="text-danger">{errors[name].message}</div>
                )}
            </div>
        )
    }

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field }) => (
                <div className={`form-group ${className}`}>
                    <label>{label}</label>
                    <input
                        {...field}
                        type={type}
                        className="form-control"
                        placeholder={placeholder}
                    />
                    {message && <small className="text-muted">{message}</small>}
                    {errors?.[name] && (
                        <div className="text-danger">{errors[name].message}</div>
                    )}
                </div>
            )}
        />
    )
}
// const FormCheckboxGroupCustom = ({
//     control,
//     name,
//     type,
//     label,
//     value,
//     errors,
//     rules,
//     placeholder,
//     message,
//     className
// }) => {
//     if (type === 'checkbox') {
//         return (
//             <div className={`form-check ${className}`}>
//                 <Controller
//                     name={name}
//                     control={control}
//                     render={({ field }) => (
//                         <>
//                             <input
//                                 type="checkbox"
//                                 className="form-check-input"
//                                 checked={field.value?.includes(value)}
//                                 onChange={(e) => {
//                                     const newValue = e.target.checked ? [...(field.value || []), value] : field.value?.filter(v => v !== value)
//                                     field.onChange(newValue)
//                                 }}
//                                 id={`checkbox-${value}`}
//                             />
//                             <label className="form-check-label" htmlFor={`checkbox-${value}`}>
//                                 {label}
//                             </label>
//                         </>
//                     )}
//                 />
//                 {errors?.[name] && (
//                     <div className="text-danger">{errors[name].message}</div>
//                 )}
//             </div>
//         )
//     }

//     return (
//         <Controller
//             name={name}
//             control={control}
//             rules={rules}
//             render={({ field }) => (
//                 <div className={`form-group ${className}`}>
//                     <label>{label}</label>
//                     <input
//                         {...field}
//                         type={type}
//                         className="form-control"
//                         placeholder={placeholder}
//                     />
//                     {message && <small className="text-muted">{message}</small>}
//                     {errors?.[name] && (
//                         <div className="text-danger">{errors[name].message}</div>
//                     )}
//                 </div>
//             )}
//         />
//     )
// }
const WebhookTab = ({ activeTab, edit }) => {
    const loginUser = useSelector(state => state.auth.userData)
    // const form = useForm()
    const ref = useRef()
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const [webhookInfo, setWebhookInfo] = useState(null)

    // const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues, defa } = form
    const { control, handleSubmit, formState: { errors }, reset, setValue, watch, getValues } = useForm({
        defaultValues: {
            webhook_url: '',
            webhook_signing_key: '',
            // events: [],
            events: webhookInfo?.subscribe_webhook_events?.map(e => e.webhook_event_name) || [],

            user_id: edit?.id || ''
        }
    })
    const [url, setUrl] = useState("")
    const [error, setError] = useState(false)
    const [resetIt, setResetIt] = useState(new Date())
    const [loadingData, setLoadingData] = useState(false)
    const [webhookEvents, setWebhookEvents] = useState(null)

    const handleChange = (e) => {
        const value = e.target.value
        setUrl(value)
        setError(!/^https:\/\/[^\s/$.?#].[^\s]*$/.test(value))
    }

    // const preloadWebHook = async (search, loadedOptions, { page }) => {

    //     const res = await getWebhookEvents({
    //         async: true,
    //         page,
    //         perPage: 25,
    //         jsonData: { event_name: search }
    //     })
    //     return createAsyncSelectOptions(res, page, "event_name", "event_name", setWebhookEvents)

    // }

    // const preloadWebHook = () => {
    //     setLoadingData(true)
    //     getWebhookEvents({
    //         async: true,
    //         success: (res) => {
    //             setWebhookEvents(res)
    //             setLoadingData(false)
    //         }
    //     })
    // }

    const preloadWebHook = () => {
        getWebhookEvents({
            loading: setLoading,
            success: (e) => {
                setWebhookEvents(e?.data)
                setLoadingData(false)
            }
        })
    }

    const preloadWebHookInfo = () => {
        getWebhookInfo({
            id: edit?.id,
            loading: setLoading,
            success: (e) => {
                setWebhookInfo(e)
                setLoading(false)
            }
        })
    }


    useEffect(() => {
        if (activeTab === "10" && edit?.allow_to_add_webhook === 1) {

            preloadWebHook()
            preloadWebHookInfo()
        }
    }, [activeTab])


    const onSubmit = (data) => {
        setWebhookUrl({
            dispatch,
            jsonData: {
                ...data,
                user_id: edit?.id


            },
            loading: setLoading,
            success: () => {
                // preload()
                setResetIt(new Date()); reset()
                preloadWebHookInfo()

            }
        })
    }


    useEffect(() => {
        if (activeTab === "10" && edit?.allow_to_add_webhook === 1) {
            // listUser()

        }
    }, [activeTab])

    log(webhookEvents, 'webhookInfo')


    const handleChangeEvent = () => {
        const selectedEvents = webhookEvents?.data?.filter(item => item?.event_name === getValues("events"))?.map(item => item?.event_name)
        setValue("events", selectedEvents)

    }

    useEffect(() => {
        if (webhookInfo) {
            reset({
                events: webhookInfo.subscribe_webhook_events.map(e => e.webhook_event_name)
            })
        }
    }, [webhookInfo, reset])

    useEffect(() => {
        if (webhookInfo) {
            setValue("webhook_url", webhookInfo?.webhook_callback_url)
            setValue("webhook_signing_key", webhookInfo?.webhook_signing_key)
        }
    }, [webhookInfo, setValue])

    return (
        <>
            <Card>
                <Row>
                    <Col md="3" sm="12" className='extra-md' >
                        <CardBody className='border'>
                            <Row>
                                <Form ref={ref} onSubmit={handleSubmit(onSubmit)}>
                                    <Col md="12">
                                        <FormGroupCustom
                                            key={resetIt}
                                            control={control}
                                            type={"text"}
                                            name={"webhook_url"}
                                            // onChange={handleChange}
                                            placeholder="Webhook URL"
                                            label="Webhook URL"
                                            setValue={webhookInfo?.webhook_callback_url}
                                            value={webhookInfo?.webhook_callback_url}
                                            error={errors?.webhook_url}
                                            message={'Only add Https URL,  Example: https://example.com, Also it only accept 1 webhook url at a time'}
                                            rules={{ required: true }}
                                            className='mb-1'
                                        />
                                        {error && <p style={{ color: "red" }}>Invalid URL. Must start with https://</p>}
                                    </Col>
                                    <Col md="12">
                                        <FormGroupCustom
                                            key={`${resetIt}-232`}
                                            control={control}
                                            type={"text"}
                                            name={"webhook_signing_key"}
                                            value={webhookInfo?.webhook_signing_key}
                                            placeholder="Webhook Signing Key"
                                            label="Webhook Signing Key"
                                            error={errors?.webhook_url}

                                            rules={{ required: false }}
                                            className='mb-1'
                                        />
                                        {/* {error && <p style={{ color: "red" }}>Invalid URL. Must start with https://</p>} */}
                                    </Col>


                                    <Col md="12">

                                        {/* {webhookEvents?.data?.map((item) => (

                                            <>
                                                {webhookInfo?.subscribe_webhook_events?.map((event) => {
                                            <div key={item.id}>
                                                <Col md="12" className="mb-1">
                                                    <FormCheckboxGroupCustom
                                                        control={control}
                                                        type="checkbox"
                                                        name="events"
                                                        value={event.event_name}
                                                        label={item.event_name}
                                                        errors={errors}
                                                    />
                                                </Col>
                                            </div>
})}
                                            </>
                                        ))} */}
                                        {/* {webhookEvents?.data?.map((eventType) => (
                                            <Col md="12" className="mb-1" key={eventType.id}>
                                                <FormCheckboxGroupCustom
                                                    control={control}
                                                    type="checkbox"
                                                    name="events"
                                                    value={eventType.event_name}
                                                    label={eventType.event_name}
                                                    checked={webhookInfo?.subscribe_webhook_events?.some(
                                                        e => e.webhook_event_name === eventType.event_name
                                                    )}
                                                    errors={errors}
                                                />
                                            </Col>
                                        ))} */}

                                        {webhookEvents?.data?.map((eventType) => {
                                            const isChecked = webhookInfo?.subscribe_webhook_events?.some(
                                                e => e.webhook_event_name === eventType.event_name
                                            )

                                            return (
                                                <Col md="12" className="mb-1" key={eventType.id}>
                                                    <FormCheckboxGroupCustom
                                                        control={control}
                                                        type="checkbox"
                                                        name="events"
                                                        value={eventType.event_name}
                                                        label={eventType.event_name}
                                                        errors={errors}
                                                    />
                                                </Col>
                                            )
                                        })}
                                    </Col>
                                    <Col md="12">
                                        <LoadingButton loading={loading} type='submit' className='btn-icon mt-2 round' color='primary' block>
                                            <Plus size={14} />
                                            <span className='align-middle ms-25'>Add Webhook</span>
                                        </LoadingButton>
                                    </Col>
                                </Form>
                            </Row>
                        </CardBody>
                    </Col>
                    <Col md="9" className='extra-md' >
                        <CardBody className={'border'}>
                            <Table striped bordered responsive>
                                <thead>
                                    <tr>

                                        <th>Event Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {webhookInfo?.subscribe_webhook_events.map((event) => (
                                        <tr key={event.id}>
                                            {/* <td>{event.id}</td>
                                            <td>{event.user_id}</td> */}
                                            <td>{event.webhook_event_name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </CardBody>
                    </Col>
                </Row>
            </Card>
        </>
    )
}

export default WebhookTab
