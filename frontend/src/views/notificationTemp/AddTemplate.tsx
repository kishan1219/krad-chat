// @ts-nocheck
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { CardBody, Col, Label, Row } from 'reactstrap'
import { statusCode, trueFalse } from '../../utility/Const'
import { createConstSelectOptions, getUserData } from '../../utility/Utils'
import { addNotificationTemp, editNotificationTemp, readNotificationTemplate } from '../../utility/apis/notificationTemplate'
import { isValid, isValidArray, log } from '../../utility/helpers/common'
import FormGroupCustom from '../components/formGroupCustom'
import CenteredModal from '../components/modal/CenteredModal'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document'
import useUser from '../../utility/hooks/useUser'
import httpConfig from '../../utility/http/httpConfig'
import ApiEndpoints from '../../utility/http/ApiEndpoints'


export default function AddTemplate({ edit = null, noView = false, modal = false, setModal = () => { }, showModal = false, setShowModal = () => { }, Component = "span", children = null, ...rest }) {

    const [open, setOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    // const [notification_body, setNotification_body] = useState(null)
    const [resetIt, setResetIt] = useState(new Date())
    const [mail_body, setMail_body] = useState(null)
    const user = useUser()
    const form = useForm()
    const [details, setDetails] = useState(null)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues, setValue: setVB, setError } = form
    const [id, setId] = useState(null)

    // const isfDisabled = () => {
    //     let re = false
    //     if (watch("notification" || watch("mail_template_id") || watch("notification_template_id"))) {
    //         re = true
    //     } else if (watch("notification_template_id")) {
    //         re = true
    //     }
    //     return !re

    // }

    useEffect(() => {
        setId(edit?.id)
    }, [edit])


    const handleShow = () => {
        reset()
        setOpen(!open)
        setModal(!open)
        if (edit === null) setEditData(null)

    }
    const handleClose = (from = null) => {
        handleShow()
        setShowModal(false)
    }

    useEffect(() => {
        if (showModal) handleShow()
    }, [showModal])

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
    }, [user])

    function uploadPlugin(editor) {
        editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
            return uploadAdapter(loader)
        }
    }

    const loadDetails = () => {
        if (isValid(edit?.id)) {
            readNotificationTemplate({
                id: edit?.id,
                loading: setLoading,
                success: (e) => {
                    setDetails(e)
                }
            })
        }
    }

    useEffect(() => {
        if (isValid(edit?.id)) {
            loadDetails()
        }

    }, [edit])

    useEffect(() => {
        if (edit) {
            setVB("mail_body", mail_body)
            setVB("notification_for", details?.notification_for)
            setVB("mail_subject", details?.mail_subject)
            setVB("notification_subject", details?.notification_subject)
            setVB("notification_body", details?.notification_body)
            setVB("route_path", details?.route_path)
            setVB("custom_attributes", details?.custom_attributes)
            setVB("save_to_database", details?.save_to_database)
            setVB("status_code", details?.status_code)
        }
    }, [details?.mail_body, details?.notification_for, details?.mail_subject,  details?.notification_subject, details?.notification_body, details?.route_path, details?.custom_attributes, details?.save_to_database, details?.status_code])

    useEffect(() => {
        setVB("mail_body", mail_body)
    }, [mail_body])

    const handleSave = (data) => {
        if (edit?.id) {
            editNotificationTemp({
                id: edit?.id,
                jsonData: {
                    ...data
                },
                dispatch,
                loading: setLoading,
                success: (d) => {
                    handleClose()
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
            addNotificationTemp({
                jsonData: {
                    ...data
                },
                loading: setLoading,
                dispatch,
                success: (e) => {
                    handleClose()
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
        // log(data)
    }

    log(mail_body, "edit?.mail_body")

    return (
        <>
            {!noView ? <Component role="button" onClick={handleShow} {...rest}>{children}</Component> : null}
            <CenteredModal
                loading={loading}
                open={open}
                scrollControl={false}
                // disableSave={true}
                handleModal={handleClose}
                // disableSave={disableButton()}
                modalClass="modal-lg"
                handleSave={handleSubmit(handleSave)}
                title={isValid(edit) ? 'Edit Template' : 'Add Template'}>
                <form>
                    <CardBody>
                        <Row>
                            <Col md="12" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="notification_for"
                                    value={edit?.notification_for}
                                    disabled={isValid(edit)}
                                    className='mb-1'
                                    label="Notification For"
                                    errors={errors}
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md="12" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="mail_subject"
                                    value={edit?.mail_subject}
                                    className='mb-1'
                                    label="Mail Subject"
                                    errors={errors}
                                    rules={{ required: false }}

                                />
                            </Col>
                            <Col md="12" xs="12" >
                                {/* <FormGroupCustom
                                    type={"textarea"}
                                    control={control}
                                    name="mail_body"
                                    value={edit?.mail_body}
                                    message={" Only applicable for Route Path(Link)"}
                                    style={{ minHeight: 100 }}
                                    className='mb-1'
                                    label="Mail Body"
                                    errors={errors}
                                    rules={{ required: true }}

                                /> */}

                                <Label>Mail Body</Label>
                                <CKEditor
                                    // key={`mail_body${details?.mail_body}-resetIt${resetIt}`}
                                    onReady={editor => {

                                        editor.ui.getEditableElement().parentElement.insertBefore(
                                            editor.ui.view.toolbar.element,
                                            editor.ui.getEditableElement()
                                        )

                                        // this.editor = editor
                                    }}
                                    onError={(error, { willEditorRestart }) => {

                                    }}
                                    onChange={(event, editor) => {
                                        const data = editor.getData()
                                        setMail_body(data)
                                      
                                    }}
                                    // className='border-bottom'
                                    editor={DecoupledEditor}
                                    value={details?.mail_body}
                                    key={resetIt}
                                    config={{
                                        extraPlugins: [uploadPlugin]
                                    }}
                                    data={isValid(details?.mail_body) ? details?.mail_body : ""}

                                />
                            </Col>
                            <Col md="12" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="notification_subject"
                                    value={edit?.notification_subject}
                                    className='mb-1'
                                    label="Notification Subject"
                                    errors={errors}
                                    rules={{ required: false }}

                                />
                            </Col>
                            <Col md="12" xs="12" >
                                <FormGroupCustom
                                    type={"textarea"}
                                    control={control}
                                    name="notification_body"
                                    value={edit?.notification_body}
                                    message={"Only applicable for Custom Attribute"}
                                    style={{ minHeight: 100 }}
                                    className='mb-1'
                                    label="Notification Body"
                                    errors={errors}
                                    rules={{ required: false }}

                                />
                                {/* <Label>Notification Body</Label>
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
                                       
                                    }}
                                    onChange={(event, editor) => {
                                        const data = editor.getData()
                                        setNotification_body(data)
                                    }}
                                    // className='border-bottom'
                                    editor={DecoupledEditor}
                                    value={edit?.notification_body}
                                    key={resetIt}
                                    config={{
                                        extraPlugins: [uploadPlugin]
                                    }}
                                    data={edit?.notification_body}
                               
                                /> */}
                            </Col>
                            <Col md="12" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="route_path"
                                    value={edit?.route_path}
                                    message={"Please Enter the Link "}
                                    className='mb-1'
                                    label="Route Path(Link)"
                                    errors={errors}
                                    rules={{ required: false }}

                                />
                            </Col>

                            <Col md="4" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="custom_attributes"
                                    message={"Use {{name}} as a custom attribute"}
                                    value={edit?.custom_attributes}
                                    className='mb-1'
                                    label="Custom Attributes"
                                    errors={errors}
                                    rules={{ required: false }}

                                />
                                <p className='text-primary fw-bolder'> {"{{name}}"}  </p>
                            </Col>

                            <Col md="4" xs="12" >

                                <FormGroupCustom
                                    type={"select"}
                                    key={`save_to_database${edit?.save_to_database}`}
                                    control={control}
                                    name="save_to_database"
                                    // value={edit?.save_to_database}
                                    value={String(edit?.save_to_database)}
                                    isClearable
                                    label="Save To Database?"
                                    errors={errors}
                                    // label={FM("vacation-trip")}
                                    options={createConstSelectOptions(trueFalse)}
                                    rules={{ required: true }}

                                />
                            </Col>
                            <Col md="4" xs="12" >

                                <FormGroupCustom
                                    type={"select"}
                                    control={control}
                                    name="status_code"
                                    value={edit?.status_code}
                                    isClearable
                                    label="Status Code"
                                    errors={errors}
                                    // label={FM("vacation-trip")}
                                    options={createConstSelectOptions(statusCode)}
                                    rules={{ required: true }}

                                />
                            </Col>


                        </Row>
                    </CardBody>
                </form>
            </CenteredModal>
        </>
    )
}
