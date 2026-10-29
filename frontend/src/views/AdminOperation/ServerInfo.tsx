// @ts-nocheck
import Dns from '@mui/icons-material/Dns'
import React, { useCallback, useEffect, useState } from 'react'
import { set, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody, Col, Form, Label, Row } from 'reactstrap'
import Hide from '../../utility/Hide'
import { createAsyncSelectMultiOptions, createAsyncSelectMultiUserOptions, createAsyncSelectOptions, getUserData } from '../../utility/Utils'
import { pushServerInfo } from '../../utility/apis/adminOperation'
import { loadDlt } from '../../utility/apis/dlt'
import { loadNotificationTemp } from '../../utility/apis/notificationTemplate'
import { loadUserChild } from '../../utility/apis/userManagement'
import { isValid, isValidArray, log } from '../../utility/helpers/common'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import httpConfig from '../../utility/http/httpConfig'
import ApiEndpoints from '../../utility/http/ApiEndpoints'
import useUser from '../../utility/hooks/useUser'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document'
import Show from '../../utility/Show'
import dlt from '../../redux/reducers/dlt'

const ServerInfo = () => {

    const [loading, setLoading] = useState(false)
    const [sender, setSender] = useState(null)
    const [template, setTemplate] = useState(null)
    const [dltMessage, setDltMessage] = useState(null)
    const [notification, setNotification] = useState(null)
    const [mail_body, setMail_body] = useState(null)
    const [notification_body, setNotification_body] = useState(null)
    const [mailSubject, setMailSubject] = useState(null)
    const [notificationSubject, setNotificationSubject] = useState(null)
    const form = useForm()
    const users = useUser()
    const [notificationBody, setNotificationBody] = useState(null)
    const [resetIt, setResetIt] = useState(new Date())
    const [body, setBody] = useState(null)
    const [user, setUser] = useState(null)
    const [message, setMessage] = useState(null)
    const { formState: { errors }, handleSubmit, control, setValue: setVB, reset, setValue, watch, getValues, setError } = form

    const isfDisabled = () => {
        let re = false
        if (watch("dlt_template_id")) {
            re = true
        } else if (watch("notification_template_id")) {
            re = true
        }
        return !re

    }

    const notiTemp = async (search, loadedOptions, { page }) => {

        const res = await loadNotificationTemp({
            async: true,
            page,
            perPage: 25,
            jsonData: { notification_for: search }
        })
        return createAsyncSelectMultiOptions(res, page, "notification_for", null, setNotification)

    }
    const listDltTemplate = async (search, loadedOptions, { page }) => {

        const res = await loadDlt({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectMultiOptions(res, page, "xName", null, setTemplate)

    }

    const API_URL = httpConfig.baseUrl
    const UPLOAD_ENDPOINT = ApiEndpoints.uploadFiles

    const uploadAdapter = useCallback((loader) => {
        const Token = getUserData()?.access_token
        // console.log(user)
        return {
            upload: () => {
                return new Promise((resolve, reject) => {
                    const body = new FormData()
                    loader.file.then((file) => {
                        body.append("file", file)
                        // let headers = new Headers();
                        // headers.append("Origin", "http://localhost:3000");
                        fetch(`${API_URL}${UPLOAD_ENDPOINT}`, {
                            method: "post",
                            body,
                            headers: {
                                Authorization: `Bearer ${Token}`
                            }
                            // mode: "no-cors"
                        })
                            .then((res) => res.json())
                            .then((res) => {
                                resolve({
                                    default: `${httpConfig.baseUrl2}${res.data?.file_name}`
                                })
                            })
                            .catch((err) => {
                                reject(err)
                            })
                    })
                })
            }
        }
    }, [users])

    function uploadPlugin(editor) {
        editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
            return uploadAdapter(loader)
        }
    }

    useEffect(() => {
        setVB('mail_body', mail_body)
    }, [mail_body])

    // useEffect(() => {
    //     setVB('notification_body', notification_body)
    // }, [notification_body])


    const navigate = useNavigate()

    const listUser = async (search, loadedOptions, { page }) => {

        const res = await loadUserChild({
            async: true,
            page,
            perPage: 10,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUser)

    }


    const submitHandlerForNotification = (data) => {
        pushServerInfo({
            jsonData: {
                ...data,
                notification_template_id: watch("notification_template_id")?.id

            },
            loading: setLoading,
            success: (e) => {
                navigate('/server-info')
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
        // log(data)
    }
    const submitHandler = (data) => {
        pushServerInfo({
            jsonData: {
                ...data,
                // notification_template_id: watch("notification_template_id")?.id
                // dlt_message:  isValid(dltMessage) ?  dltMessage : data?.dlt_message,
                dlt_message: data?.dlt_message ? data?.dlt_message : dltMessage,
                dlt_template_id: data?.dlt_template_id?.id
            },
            loading: setLoading,
            success: (e) => {
                navigate('/server-info')
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
        // log(data)
    }

    return (
        <>
            <Header title={"Send Notification"} icon={<Dns />} />
            {/* <div className='d-flex justify-content-center'> */}
            <Row>
                <Col md="6">
                    <Card>

                        <CardBody>
                            <Form onSubmit={handleSubmit(submitHandlerForNotification)}>
                                <Row>
                                    <Col md="12">

                                        <FormGroupCustom
                                            async
                                            loadOptions={notiTemp}
                                            label={"Notification"}
                                            type={"select"}
                                            control={control}
                                            name="notification_template_id"
                                            isClearable
                                            onChangeValueSelect={(e) => { setMail_body(e?.mail_body); setNotificationBody(e?.notification_body); setNotificationSubject(e?.notification_subject); setMailSubject(e?.mail_subject); setMessage(e?.message); setBody(e?.mail_body) }}
                                            className={`mb-1 ${isValid(watch('dlt_template_id')) ? "pe-none" : ""}`}
                                            errors={errors}
                                            options={notification}
                                            rules={{ required: false }}

                                        />
                                    </Col>
                                    <Show IF={isValid(body)}>
                                        <Col md="12">
                                            <FormGroupCustom
                                            key={`${body}-dswqedsfwdrfsdf-${watch("notification_template_id")}`}
                                                label={"Mail Subject"}
                                                type={"text"}
                                                control={control}
                                                value={mailSubject}
                                                name="mail_subject"
                                                disabled={isValid(watch('dlt_template_id'))}
                                                className='mb-1'
                                                rules={{ required: true }}
                                                errors={errors}
                                            />

                                        </Col>

                                        <Col md="12">
                                            <Label>Mail Body</Label>
                                            <CKEditor
                                                onReady={editor => {
                                                    // console.log('Editor is ready to use!', editor)

                                                    // Insert the toolbar before the editable area.
                                                    editor.ui.getEditableElement().parentElement.insertBefore(
                                                        editor.ui.view.toolbar.element,
                                                        editor.ui.getEditableElement()
                                                    )

                                                    // this.editor = editor
                                                }}
                                                onError={(error, { willEditorRestart }) => {
                                                    // If the editor is restarted, the toolbar element will be created once again.
                                                    // The `onReady` callback will be called again and the new toolbar will be added.
                                                    // This is why you need to remove the older toolbar.
                                                    // if (willEditorRestart) {
                                                    //     this.editor.ui.view.toolbar.element.remove();
                                                    // }
                                                }}
                                                onChange={(event, editor) => {
                                                    const data = editor.getData()
                                                    setMail_body(data)
                                                }}
                                                // className='border-bottom'
                                                editor={DecoupledEditor}
                                                value={mail_body}
                                                className={`mb-1 ${isValid(watch('dlt_template_id')) ? "pe-none" : ""}`}
                                                key={resetIt}
                                                config={{
                                                    extraPlugins: [uploadPlugin]
                                                }}
                                                data={isValid(mail_body) ? mail_body : ''}
                                            // data="<p>Hello from CKEditor 5's decoupled editor!</p>"
                                            // config={ /* the editor configuration */}
                                            />
                                        </Col>
                                    </Show>
                                    <Show IF={isValid(notificationBody)}>
                                        <Col md="12">
                                            <FormGroupCustom
                                            key={`${notificationBody}-dsefsdsfwdfsdsvrfsdf-${watch("notification_template_id")}`}
                                                label={"Notification Subject"}
                                                type={"text"}
                                                control={control}
                                                value={notificationSubject}
                                                name="notification_subject"
                                                disabled={isValid(watch('dlt_template_id'))}
                                                className='mb-1'
                                                rules={{ required: true }}
                                                errors={errors}
                                            />

                                        </Col>
                                        <Col md="12">
                                            <FormGroupCustom
                                            key={`${notificationBody}-testq-${watch("notification_template_id")}`}
                                                label={"Notification Body"}
                                                type={"textarea"}
                                                control={control}
                                                value={notificationBody}
                                                name="notification_body"
                                                disabled={isValid(watch('dlt_template_id'))}
                                                className='mb-1 rows-6'
                                                rules={{ required: true }}
                                                errors={errors}
                                            />

                                        </Col>

                                        {/* <Col md="12">
                                            <Label>Notification Body</Label>
                                            <CKEditor
                                                onReady={editor => {
                                                  
                                                    editor.ui.getEditableElement().parentElement.insertBefore(
                                                        editor.ui.view.toolbar.element,
                                                        editor.ui.getEditableElement()
                                                    )

                                                    
                                                }}
                                                onError={(error, { willEditorRestart }) => {
                                                 
                                                }}
                                                onChange={(event, editor) => {
                                                    const data = editor.getData()

                                                    setNotification_body(data)
                                                }}
                                              
                                                editor={DecoupledEditor}
                                                className={`mb-1 ${isValid(watch('dlt_template_id')) ? "pe-none" : ""}`}
                                                key={resetIt}
                                                config={{
                                                    extraPlugins: [uploadPlugin]
                                                }}
                                                data={isValid(notificationBody) ? notificationBody : ""}
                                            
                                            />
                                        </Col> */}
                                    </Show>

                                    <Hide IF={watch("for_user") === 1}>
                                        <Col md="12">

                                            <FormGroupCustom
                                                async
                                                isMulti
                                                loadOptions={listUser}
                                                type={"select"}
                                                control={control}
                                                name="user_id"
                                                className={`mb-1 ${isValid(watch('dlt_template_id')) ? "pe-none" : ""}`}
                                                isClearable
                                                // className='mb-1'
                                                label="User "
                                                errors={errors}
                                                options={user}
                                                rules={{ required: false }}

                                            />
                                        </Col>
                                    </Hide>
                                </Row>
                                <Row>
                                    <Col md="6">

                                        <FormGroupCustom

                                            type={"checkbox"}
                                            control={control}
                                            errors={errors}
                                            name="for_user"
                                            // isClearable
                                            // className='mb-1'
                                            className={`mb-1 ${isValid(watch('dlt_template_id')) ? "pe-none" : ""}`}
                                            label="Send Notification to all Users"
                                            // options={user}
                                            rules={{ required: false }}

                                        />
                                    </Col>
                                </Row>
                                {/* <Col md = "3"> */}

                                {/* </Col> */}


                                <Row>
                                    <Col md="2">
                                        <LoadingButton disabled={isValid(watch('dlt_template_id'))} loading={loading} type='submit' color='primary' className="mt-1">
                                            Save
                                        </LoadingButton>
                                    </Col>
                                </Row>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
                <Col md="6">
                    <Card>

                        <CardBody>
                            <Form onSubmit={handleSubmit(submitHandler)}>
                                <Row>

                                    <Col md="12">

                                        <FormGroupCustom
                                            async
                                            loadOptions={listDltTemplate}
                                            label={"Dlt Template Id"}
                                            type={"select"}
                                            control={control}
                                            isClearable
                                            disabled={isValid(watch('notification_template_id'))}
                                            name="dlt_template_id"
                                            // isClearable
                                            // matchWith={"id"}
                                            className={`mb-1 ${isValid(watch('notification_template_id')) ? "pe-none" : ""}`}
                                            onChangeValue={(e) => { setDltMessage(e?.dlt_message) }}
                                            errors={errors}
                                            options={template}
                                            rules={{ required: false }}

                                        />
                                    </Col>
                                    <Col md="12">

                                        <FormGroupCustom
                                            key={`${dltMessage}-dsefsdsfwdrfsdf-${watch("dlt_template_id")}`}
                                            label={"Message"}
                                            type={"textarea"}
                                            disabled={isValid(watch('notification_template_id'))}
                                            control={control}
                                            value={dltMessage}
                                            name="dlt_message"
                                            className='mb-1 rows-6'
                                            style={{ minHeight: 100 }}
                                        // rules={{ required: true }}
                                        // errors={errors}
                                        />
                                    </Col>
                                    <Hide IF={watch("for_user") === 1}>
                                        <Col md="12">

                                            <FormGroupCustom
                                                async
                                                isMulti
                                                loadOptions={listUser}
                                                type={"select"}
                                                control={control}
                                                name="user_id"
                                                className={`mb-1 ${isValid(watch('notification_template_id')) ? "pe-none" : ""}`}
                                                isClearable
                                                // className='mb-1'
                                                label="User "
                                                errors={errors}
                                                options={user}
                                                rules={{ required: false }}

                                            />
                                        </Col>
                                    </Hide>
                                </Row>
                                
                                <Row>
                                    <Col md="6">

                                        <FormGroupCustom

                                            type={"checkbox"}
                                            control={control}
                                            errors={errors}
                                            name="for_user"
                                            // isClearable
                                            className={`mb-1 ${isValid(watch('notification_template_id')) ? "pe-none" : ""}`}
                                            label="Send Notification to all Users"
                                            // options={user}
                                            rules={{ required: false }}

                                        />
                                    </Col>
                                </Row>
                                {/* <Col md = "3"> */}

                                {/* </Col> */}


                                <Row>
                                    <Col md="2">
                                        <LoadingButton disabled={isValid(watch('notification_template_id'))} loading={loading} type='submit' color='primary' className="mt-1">
                                            Save
                                        </LoadingButton>
                                    </Col>
                                </Row>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
                
            </Row>

            {/* </div> */}

        </>
    )
}

export default ServerInfo
