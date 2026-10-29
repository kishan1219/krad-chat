// @ts-nocheck

import { useEffect, useRef, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Form, Input, Label, Row } from 'reactstrap'
import { handleLogin } from '../../../redux/authentication'
import Hide from '../../../utility/Hide'
import Show from '../../../utility/Show'
import { appSettingForAdmin, appSettingUpdate, editProfile } from '../../../utility/apis/appSetting'
import { uploadFiles } from '../../../utility/apis/common'
import { isValid, isValidArray } from '../../../utility/helpers/common'
import useUser from '../../../utility/hooks/useUser'
import httpConfig from '../../../utility/http/httpConfig'
import LoadingButton from '../../components/buttons/LoadingButton'
import FormGroupCustom from '../../components/formGroupCustom'
// import FormGroupCustom from '../../components/formGroupCustom'
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import { getUserData } from '../../../utility/Utils'
import ApiEndpoints from '../../../utility/http/ApiEndpoints'

const placeholder = "data:image/jpeg;base64,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"
const Profile = ({ activeTab }) => {
    const [loading, setLoading] = useState(false)
    const user = useSelector(state => state.auth.userData)
    const [file, setFile] = useState(null)

    const [avatar, setAvatar] = useState(placeholder)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, setError, watch, getValues } = form
    // const imgAvatar = info?.app_name
    const [progress, setProgress] = useState(0)
    const [uploaded, setUploaded] = useState(null)
    const [controller, setController] = useState(new AbortController())
    const userT = useUser()


    const dispatch = useDispatch()

    const [info, setInfo] = useState(null)
    const getInfo = () => {
        appSettingForAdmin({
            // perPage: 1000,
            loading: setLoading,
            dispatch,
            success: (e) => {
                setInfo(e?.data)
            }
        })
    }

    useEffect(() => {

        getInfo()

    }, [])


    const ref = useRef(null)


    const csvRef = useRef()

    const handleForce = (data, fileInfo) => {
        setFile(fileInfo)
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
    }, [user])

    function uploadPlugin(editor) {
        editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
            return uploadAdapter(loader)
        }
    }

    const onSubmit = (data, file) => {
        // log(new Date())
        if (user?.userType === 0) {
            appSettingUpdate({
                jsonData: {
                    ...userT,
                    ...data,
                    app_logo: file
                },
                loading: setLoading,
                dispatch,
                success: (d) => {
                    // log(d)
                    const x = {
                        ...userT,
                        ...d?.data
                    }
                    getInfo()
                    dispatch(handleLogin(x))
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
            editProfile({
                jsonData: {
                    ...userT,
                    ...data,
                    companyLogo: file
                },
                loading: setLoading,
                dispatch,
                success: (d) => {
                    // log("edot", d)
                    const x = {
                        ...userT,
                        ...d?.data
                    }
                    dispatch(handleLogin(x))
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

    const handleUpload = (e) => {

        uploadFiles({
            success: (d) => {
                setUploaded(d?.data)
                onSubmit(e, d?.data?.file_name)
            },
            loading: setLoading,
            controller,
            formData: { is_multiple: 0, file: csvRef.current?.files[0] }
        })
    }
    const onChange = e => {
        const reader = new FileReader(),
            files = e.target.files
        reader.onload = function () {
            setAvatar(reader.result)
        }
        reader.readAsDataURL(files[0])
    }

    useEffect(() => {
        // if (isValid(user?.companyLogo)) {
        if (user?.userType === 0 || user?.userType === 3) {
            setAvatar(httpConfig?.baseUrl2 + info?.app_logo)
            setValue("app_logo", info?.app_logo)

        } else {
            setAvatar(httpConfig?.baseUrl2 + user?.companyLogo)
            setValue("companyLogo", user?.companyLogo)

        }
        // }
    }, [user, info])

    useEffect(() => {
        if (isValid(info)) {
            setValue("contact_address", info?.contact_address)
        }
    }, [info])
    const uploadAndSave = (e) => {
        e.preventDefault()
        handleSubmit(e => {
            if (isValidArray(csvRef.current?.files)) {
                handleUpload(e)
            } else {
                onSubmit(e, (user?.userType === 0 || user?.userType === 3 ? info?.app_logo : user?.companyLogo))
            }
        })()
    }

    // log("logo", httpConfig?.baseUrl2 + user?.companyLogo)
    if (isValid(info)) {
        return (
            <>

                <Card>
                    <CardHeader className='border-bottom'>
                        <CardTitle tag='h4'>Profile Update</CardTitle>
                    </CardHeader>
                    <CardBody className='py-2 my-25'>

                        <Form onSubmit={uploadAndSave}>

                            <div className='d-flex'>
                                <div className='me-25'>
                                    {/* src={signature_path ?? (profile?.data?.company?.app_setting?.signature_path ? defaultHttpConfig.mediaUrl + profile?.data?.company?.app_setting?.signature_path : null) ?? ""} */}
                                    <img className='rounded me-50'
                                        // src={avatar ?? (user?.companyLogo ? httpConfig?.baseUrl2 + user?.companyLogo : null) ?? "https://via.placeholder.com/200"}
                                        src={avatar ? avatar : "https://via.placeholder.com/200"}
                                        alt='Generic placeholder image' height='100' width='100' />
                                </div>

                                <div className='d-flex align-items-end mt-75 ms-1'>
                                    <div>
                                        <Button tag={Label} className='mb-75 me-75' size='sm' color='primary'>
                                            Select

                                            <Input innerRef={csvRef} type='file' name={user?.userType === 0 || user?.userType === 3 ? 'app_logo' : 'comapnyLogo'} onChange={onChange} hidden accept='image/*' />
                                        </Button>

                                        <p className='mb-0'>Allowed JPG, GIF or PNG. Max size of 800kB</p>
                                    </div>
                                </div>

                            </div>

                            <Row className='align-items-start gy-2 mt-1'>

                                <Show IF={user?.userType === 0}>
                                    <Col md="4">
                                        <FormGroupCustom
                                            type={"text"}
                                            control={control}
                                            name="app_name"
                                            value={info?.app_name}
                                            className='mb-1'
                                            label="App Name"
                                            errors={errors}
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    <Col md="4">
                                        <FormGroupCustom
                                            type={"email"}
                                            control={control}
                                            name="contact_email"
                                            value={info?.contact_email}
                                            className='mb-1'
                                            label="Contact Email"
                                            errors={errors}
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    <Col md="4">

                                        <FormGroupCustom
                                            type={"number"}
                                            control={control}
                                            name="contact_number"
                                            value={info?.contact_number}
                                            // message={"Locktimeout should be between 10 to 120 minutes"}
                                            className='mb-1'
                                            label="Contact Number"
                                            errors={errors}
                                            rules={{ required: true, min: 0, minLength: 10, maxLength: 12 }}
                                        />
                                    </Col>

                                    <Col md="4">
                                        <FormGroupCustom
                                            type={"number"}
                                            control={control}
                                            name="tax_percentage"
                                            value={info?.tax_percentage}
                                            className='mb-1'
                                            label="Tax Percentage"
                                            errors={errors}
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    <Col md="8">
                                        <FormGroupCustom
                                            type={"textarea"}
                                            control={control}
                                            name="contact_address"
                                            width="400px"
                                            value={info?.contact_address}
                                            className='mb-1'
                                            label="Address"
                                            errors={errors}
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    <Col md="12">
                                        <FormGroupCustom
                                            type={"textarea"}
                                            control={control}
                                            name="g_key"
                                            width="400px"
                                            value={info?.g_key}
                                            className='mb-1'
                                            label="Google Key"
                                            errors={errors}
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    <Col md="12">
                                        <FormGroupCustom
                                            type={"textarea"}
                                            control={control}
                                            name="g_secret"
                                            width="400px"
                                            value={info?.g_secret}
                                            className='mb-1'
                                            label="Google Secret"
                                            errors={errors}
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    <Col md="12">
                                        <Label>
                                            Terms and Conditions
                                        </Label>
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
                                                setValue('terms_and_conditions', data)

                                            }}
                                            // className='border-bottom'
                                            editor={DecoupledEditor}
                                            value={info?.terms_and_conditions}
                                            className={`mb-1`}

                                            config={{
                                                extraPlugins: [uploadPlugin]
                                            }}
                                            data={isValid(info?.terms_and_conditions) ? info?.terms_and_conditions : ''}
                                        // data="<p>Hello from CKEditor 5's decoupled editor!</p>"
                                        // config={ /* the editor configuration */}
                                        />
                                    </Col>
                                    <Col md="12">
                                        <Label>
                                            Privacy Policy
                                        </Label>
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
                                                setValue('privacy_policy', data)

                                            }}
                                            // className='border-bottom'
                                            editor={DecoupledEditor}
                                            value={info?.privacy_policy}
                                            className={`mb-1`}

                                            config={{
                                                extraPlugins: [uploadPlugin]
                                            }}
                                            data={isValid(info?.privacy_policy) ? info?.privacy_policy : ''}
                                        // data="<p>Hello from CKEditor 5's decoupled editor!</p>"
                                        // config={ /* the editor configuration */}
                                        />
                                    </Col>
                                    <Col md="12">
                                        <Label>
                                            Cookies Protection
                                        </Label>
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
                                                setValue('cookies_protection', data)

                                            }}
                                            // className='border-bottom'
                                            editor={DecoupledEditor}
                                            value={info?.cookies_protection}
                                            className={`mb-1`}

                                            config={{
                                                extraPlugins: [uploadPlugin]
                                            }}
                                            data={isValid(info?.cookies_protection) ? info?.cookies_protection : ''}
                                        // data="<p>Hello from CKEditor 5's decoupled editor!</p>"
                                        // config={ /* the editor configuration */}
                                        />
                                    </Col>
                                    <Col md="12">
                                        <Label>
                                            Cookies Disclaimer
                                        </Label>
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
                                                setValue('cookies_disclaimer', data)

                                            }}
                                            // className='border-bottom'
                                            editor={DecoupledEditor}
                                            value={info?.cookies_disclaimer}
                                            className={`mb-1`}

                                            config={{
                                                extraPlugins: [uploadPlugin]
                                            }}
                                            data={isValid(info?.cookies_disclaimer) ? info?.cookies_disclaimer : ''}
                                        // data="<p>Hello from CKEditor 5's decoupled editor!</p>"
                                        // config={ /* the editor configuration */}
                                        />
                                    </Col>
                                </Show>

                                <Hide IF={user?.userType === 0}>

                                    <Col md="4">
                                        <FormGroupCustom
                                            type={"text"}
                                            control={control}
                                            name="name"
                                            value={user?.name}
                                            className='mb-1'
                                            label="Name"
                                            errors={errors}
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    <Col md="4">
                                        <FormGroupCustom
                                            type={"number"}
                                            control={control}
                                            name="mobile"
                                            value={user?.mobile}
                                            className='mb-1'
                                            label="Mobile No."
                                            errors={errors}
                                            rules={{ required: true, min: 0, minLength: 10, maxLength: 12 }}
                                        />
                                    </Col>
                                    <Col md="4">
                                        <FormGroupCustom
                                            type={"text"}
                                            control={control}
                                            name="companyName"
                                            value={user?.companyName}
                                            className='mb-1'
                                            label="Company Name"
                                            errors={errors}
                                            rules={{ required: false }}
                                        />
                                    </Col>
                                    <Col md="8">
                                        <FormGroupCustom
                                            type={"text"}
                                            control={control}
                                            name="address"
                                            value={user?.address}
                                            className='mb-1'
                                            label="Address"
                                            errors={errors}
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    <Col md="4">
                                        <FormGroupCustom
                                            type={"text"}
                                            control={control}
                                            name="city"
                                            value={user?.city}
                                            className='mb-1'
                                            label="City"
                                            errors={errors}
                                            rules={{ required: false }}
                                        />
                                    </Col>
                                    <Col md="4">
                                        <FormGroupCustom
                                            type={"number"}
                                            control={control}
                                            name="zipCode"
                                            value={user?.zipCode}
                                            className='mb-1'
                                            label="ZipCode"
                                            errors={errors}
                                            rules={{ required: true, minLength: 6, maxLength: 6 }}
                                        />
                                    </Col>
                                    <Col md="4">
                                        <FormGroupCustom
                                            type={"text"}
                                            control={control}
                                            name="websiteUrl"
                                            value={user?.websiteUrl}
                                            className='mb-1'
                                            label="Website"
                                            errors={errors}
                                            rules={{ required: false }}
                                        />
                                    </Col>
                                    <Col md="4">
                                        <FormGroupCustom
                                            type={"text"}
                                            control={control}
                                            name="designation"
                                            value={user?.designation}
                                            className='mb-1'
                                            label="Designation"
                                            errors={errors}
                                            rules={{ required: false }}
                                        />
                                    </Col>
                                    <Col md="4">
                                        <FormGroupCustom
                                            type={"number"}
                                            control={control}
                                            name="locktimeout"
                                            value={user?.locktimeout}
                                            message={"Locktimeout should be between 10 to 120 minutes"}
                                            className='mb-1'
                                            label="Locktimeout"
                                            errors={errors}
                                            rules={{ required: true, min: 10, max: 120 }}
                                        />
                                    </Col>

                                </Hide>
                            </Row>
                            <Col className='mt-2' sm='12'>
                                <LoadingButton loading={loading} type='submit' className='me-1' color='primary'>
                                    Save changes
                                </LoadingButton>

                            </Col>

                        </Form>
                    </CardBody>
                </Card>

            </>
        )
    } else {
        return null
    }
}

export default Profile
