// @ts-nocheck
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { CardBody, Col, Label, Row } from 'reactstrap'
import { addApi, editApi } from '../../../utility/apis/api'
import { isValid, isValidArray } from '../../../utility/helpers/common'
import FormGroupCustom from '../../components/formGroupCustom'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document'
import { getUserData } from '../../../utility/Utils'
import httpConfig from '../../../utility/http/httpConfig'
import ApiEndpoints from '../../../utility/http/ApiEndpoints'
import DropZone from '../../components/fileUploader'
import CenteredModal from '../../components/modal/CenteredModal'


export default function AddApi({ edit = null, noView = false, modal = false, preload, setModal = () => { }, Component = "span", children = null, ...rest }) {
    const [open, setOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])
    const dispatch = useDispatch()
    const [resetIt, setResetIt] = useState(new Date())
    const form = useForm({
        defaultValues: {
            api_information: '',
            code_lang: '',
            title: '',
            api_code: '',
            response_description: '',
            api_response: '',
            video_link: '',
            image: ''
        }
    })
    const [api_information, setApi_information] = useState(null)

    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues, setError } = form

    const handleShow = () => {
        reset()
        setOpen(!open)
        setModal(!open)
        if (edit === null) setEditData(null)

    }
    const handleClose = (from = null) => {
        handleShow()
    }

    useEffect(() => {
        if (edit && open) {

            // setValue('api_information', edit?.api_information ?? '')
            setValue('code_lang', edit?.code_lang ?? '')
            setValue('title', edit?.title ?? '')
            setValue('api_code', edit?.api_code ?? '')
            setValue('response_description', edit?.response_description ?? '')
            setValue('api_response', edit?.api_response ?? '')
            setValue('video_link', edit?.video_link ?? '')
            setValue('image', edit?.image ?? '')
            setApi_information(edit?.api_information ?? '')
        }
    }, [edit, open])

    useEffect(() => {
        setValue('api_information', api_information)
    }, [api_information])

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
    const handleSave = (data) => {
        if (edit?.id) {
            editApi({
                id: edit?.id,
                jsonData: {
                    ...data
                    // api_information:
                    // is_retry_applicable: data?.is_retry_applicable === 1 ? 1 : 0,
                    // is_refund_applicable: data?.is_refund_applicable === 1 ? 1 : 0
                },
                dispatch,
                loading: setLoading,
                success: (d) => {
                    handleClose()
                    preload()
                    setApi_information("")
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
            addApi({
                jsonData: {
                    ...data
                },
                loading: setLoading,
                dispatch,
                success: (e) => {
                    handleClose()
                    preload()
                    setApi_information("")
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
    return (
        <>
            {!noView ? <Component role="button" onClick={handleShow} {...rest}>{children}</Component> : null}
            <CenteredModal
                loading={loading}
                open={open}
                disableFooter={false}
                scrollControl={false}
                handleModal={handleClose}
                modalClass="modal-lg"
                handleSave={handleSubmit(handleSave)}
                title="Add Api">
                <>
                    <CardBody className='border-top'>
                        <Row>
                            <Col md="6">
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="code_lang"
                                    value={edit?.code_lang}
                                    className='mb-1'
                                    label={"Code Language"}

                                />
                            </Col>
                            <Col md="6">
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="title"
                                    value={edit?.title}
                                    className='mb-1'
                                    label={"Title"}

                                />
                            </Col>
                            <Col md="12">
                                <Label>API Information</Label>
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
                                        setApi_information(data)
                                    }}
                                    // className='border-bottom'
                                    editor={DecoupledEditor}
                                    data={api_information ?? ''}
                                    key={resetIt}

                                    config={{
                                        extraPlugins: [uploadPlugin]
                                    }}
                                // data={edit?.api_information}
                                // data="<p>Hello from CKEditor 5's decoupled editor!</p>"
                                // config={ /* the editor configuration */}
                                />
                            </Col>
                            <Col md="12">
                                <FormGroupCustom
                                    type={"textarea"}
                                    control={control}
                                    name="api_code"
                                    value={edit?.api_code}
                                    className='mb-1'
                                    label={"Code"}

                                />
                            </Col>
                            <Col md="12">
                                <FormGroupCustom
                                    type={"textarea"}
                                    control={control}
                                    name="response_description"
                                    value={edit?.response_description}
                                    className='mb-1'
                                    label={"Response Description"}

                                />
                            </Col>
                            <Col md="12">
                                <FormGroupCustom
                                    type={"textarea"}
                                    control={control}
                                    name="api_response"
                                    value={edit?.api_response}
                                    className='mb-1'
                                    label={"Response"}

                                />
                            </Col>
                            <Col md="12">
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="video_link"
                                    value={edit?.video_link}
                                    className='mb-1'
                                    label={"Video Link"}

                                />
                            </Col>
                            <Col md="12" >
                                <FormGroupCustom
                                    noLabel
                                    name={"image"}
                                    type={"hidden"}
                                    errors={errors}
                                    control={control}
                                    // accept="image/*"
                                    accept="image/png, image/gif, image/jpeg"
                                    rules={{ required: false }}
                                    values={edit?.image}

                                />
                                <DropZone value={isValid(edit?.image) ? `${httpConfig.baseUrl2}${edit?.image}` : null} name={edit?.image} accept="image/png, image/gif, image/jpeg" onSuccess={e => setValue("image", e[0]?.file_name)} />

                            </Col>

                        </Row>
                    </CardBody>
                </>
            </CenteredModal>
        </>
    )
}
