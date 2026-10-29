// @ts-nocheck
import { ThumbDown, ThumbUp } from '@mui/icons-material'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
// import Rating from 'react-rating'
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import { useRTL } from '@hooks/useRTL'
import Rating from '@mui/material/Rating'
import Typography from '@mui/material/Typography'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import { ArrowLeft } from 'react-feather'
import ScrollBar from 'react-perfect-scrollbar'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, ButtonGroup, Card, CardHeader, Col, Form, Label, Row } from 'reactstrap'
import { integrateResponse } from '../../../utility/Const'
import Show from '../../../utility/Show'
import { createAsyncSelectMultiUserOptions, createConstSelectOptions, getUserData } from '../../../utility/Utils'
import { addTwoWaySMS, editTwoWay, readTwoWay } from '../../../utility/apis/TwoWaySMS'
import { loadUser } from '../../../utility/apis/userManagement'
import { isValid, isValidArray, log } from '../../../utility/helpers/common'
import useUser from '../../../utility/hooks/useUser'
import ApiEndpoints from '../../../utility/http/ApiEndpoints'
import httpConfig from '../../../utility/http/httpConfig'
import LoadingButton from '../../components/buttons/LoadingButton'
import FormGroupCustom from '../../components/formGroupCustom'
import BsTooltip from '../../components/tooltip'


const AddTwoWaySMS = () => {
    const params = useParams()
    const ids = params?.id
    const [title, setTitle] = useState(null)
    const [content, setContent] = useState(null)
    const user = useUser()
    // Form Validation
    const [isRtl] = useRTL()

    const loginUser = useSelector(state => state.auth.userData)
    const { register, formState: { errors }, handleSubmit, control, setValue: setVB, getValues, watch, reset, setError } = useForm()
    const themeColors = useContext(ThemeColors)
    const [count, setCount] = useState(null)
    const [hover, setHover] = useState(-1)
    const [values, setValues] = useState(0)
    const [photo123, setphoto123] = useState(null)
    const [resetIt, setResetIt] = useState(new Date())
    const [loading, setLoading] = useState(false)
    const [editor123, setEditor123] = useState(null)
    const [screen, setScreen] = useState(1)
    const navigate = useNavigate()
    const [details, setDetails] = useState(null)
    const [userList, setUserList] = useState(null)

    const handleInputChange = (event) => {
        if (isValidArray(event.target.files)) {
            setphoto123(URL.createObjectURL(event.target.files[0]))
        }
    }

    // log(ids)

    const loadDetails = () => {
        if (isValid(ids)) {
            readTwoWay({
                id: ids,
                loading: setLoading,
                success: (e) => {
                    setDetails(e)
                }
            })
        }
    }

    useEffect(() => {
        if (isValid(ids)) {
            loadDetails()
        }

    }, [ids])

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

    useEffect(() => {
        if (ids) {
            setVB('content', content)
            setVB('title', details?.title)
            setTitle(details?.title)
            setVB('content_expired', details?.content_expired)
            setVB('bg_color', details?.bg_color)
            setVB('take_response', details?.take_response)
            setVB('response_mob_num', details?.response_mob_num)
        }
    }, [details?.content, details?.title, details?.content_expired, details?.bg_color, details?.take_response])

    useEffect(() => {
        setVB('content', content)
    }, [content])

    const labels = {
        0: <img className='img-fluid' src={require('../../../assets/images/emots/feedback.png').default} />,
        1: <img className='img-fluid' src={require('../../../assets/images/emots/angry.png').default} />,
        2: <img className='img-fluid' src={require('../../../assets/images/emots/sad.png').default} />,
        3: <img className='img-fluid' src={require('../../../assets/images/emots/smile.png').default} />,
        4: <img className='img-fluid' src={require('../../../assets/images/emots/happy.png').default} />,
        5: <img className='img-fluid' src={require('../../../assets/images/emots/superstar.png').default} />
    }
    const prev = <div class="col-md-12" id="view-content">
        <strong>Lorem Ipsum</strong> is simply dummy text of the printing and typesetting industry.
        <br />
        <ol>
            <li>What is Lorem Ipsum?</li>
            <li>Why do we use it?<br /></li>
            <li>Where does it come from?<br /></li>
            <li>Where can I get some?</li>
        </ol>
        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
    </div>
    const listUser = async (search, loadedOptions, { page }) => {

        const res = await loadUser({
            async: true,
            page,
            perPage: 10,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUserList)

    }
    const onSubmit = (data) => {
        if (isValid(ids)) {
            editTwoWay({
                id: ids,
                jsonData: {

                    ...data,
                    created_by: user?.id,
                    is_web_temp: 1
                },
                loading: setLoading,
                success: () => {
                    navigate(-1)
                    // setResetIt(new Date())
                    // reset()


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
            addTwoWaySMS({
                jsonData: {
                    ...data,
                    created_by: user?.id,
                    is_web_temp: 1
                },
                loading: setLoading,
                success: () => {

                    setResetIt(new Date()); reset()
                    navigate(-1)

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

    const viewTitle = () => {
        if (isValid(ids)) {
            return watch("title")
        } else {
            return title ?? 'Lorem Ipsum'
        }
    }

    // log(details?.take_response, "ytasskjf")
    return (
        <>
            <Row className='mb-3'>
                <Col md="6" lg="6">
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Card>
                            <CardHeader className='border-bottom'>
                                <h3>Add Two Way SMS</h3>
                                <div className='d-flex justify-content-end'>
                                    <BsTooltip title={'Go Back'}>
                                        <Button.Ripple size="sm" color="primary" outline onClick={() => { navigate(-1) }}>
                                            <ArrowLeft size={18} />
                                        </Button.Ripple>
                                    </BsTooltip>
                                </div>
                            </CardHeader>
                            <Row className='p-2'>
                                <Show IF={loginUser?.userType === 0 || loginUser?.userType === 3}>
                                    <Col md="12">
                                        <FormGroupCustom

                                            // defaultOptions
                                            async
                                            control={control}
                                            type={"select"}
                                            errors={errors}
                                            name={"user_id"}
                                            isClearable
                                            placeholder="Select User"
                                            className='mb-1'

                                            loadOptions={listUser}
                                            options={userList}
                                            label="User"
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                </Show>
                                <Col md="12">

                                    <FormGroupCustom
                                        label={"Title"}
                                        type={"text"}
                                        control={control}
                                        name="title"
                                        key={resetIt}
                                        className='mb-1'
                                        errors={errors}
                                        rules={{ required: true }}
                                        value={details?.title}
                                        onChangeValue={(e) => { log(e); setTitle(e) }}
                                    />
                                </Col>
                                <Col md="12">

                                    <FormGroupCustom
                                        label={"Content Expired"}
                                        type={"date"}
                                        control={control}
                                        name="content_expired"
                                        options={{

                                            minDate: Date.now()
                                        }}
                                        value={details?.content_expired}
                                        className='mb-1'
                                        key={resetIt}
                                        errors={errors}
                                        rules={{ required: true }}
                                    />
                                </Col>
                                <Col md="12">

                                    <FormGroupCustom
                                        name={'bg_color'}
                                        type={"color"}
                                        label={'Choose Color'}
                                        // key={resetIt}
                                        value={details?.bg_color}
                                        className='mb-2'
                                        control={control}
                                        rules={{ required: false }}
                                    />
                                 
                                </Col>
                                <Col md="12" style={{
                                    minHeight: 250
                                }}>

                                    {/* <FormGroupCustom
                                    name={'content_body'}
                                    type={watch('content_type')?.value === 1 ? 'textarea' : 'editor'}
                                    label={'Content Body'}
                                    className='mb-2'
                                    control={control}
                                    onChangeValue={(e) => { setContent(e) }}
                                    rules={{ required: true }}
                                /> */}
                                    {/* <CKEditor
                                    editor={ClassicEditor}
                                    onChange={(event, editor) => {
                                        const data = editor.getData()
                                        setContent(data)
                                    }}
                                    name={'content_body'}
                                // height="400px"
                                /> */}
                                    {/* <div className='border'> */}
                                    <Label>Content Body</Label>
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
                                            setContent(data)
                                        }}
                                        // className='border-bottom'
                                        editor={DecoupledEditor}
                                        value={details?.content}
                                        key={resetIt}
                                        config={{
                                            extraPlugins: [uploadPlugin]
                                        }}
                                        data={details?.content}
                                    // data="<p>Hello from CKEditor 5's decoupled editor!</p>"
                                    // config={ /* the editor configuration */}
                                    />
                                    {/* </div> */}

                                </Col>

                                <Col md="12" className='mt-1'>

                                    <FormGroupCustom
                                        // defaultOptions
                                        name={'take_response'}
                                        type={"select"}
                                        label={'Integrate form for response?'}
                                        className='mb-1'
                                        // key={resetIt}
                                        value={details?.take_response}
                                        control={control}
                                        rules={{ required: true }}
                                        options={createConstSelectOptions(integrateResponse)}
                                    />

                                </Col>
                                {/* <Col md="12">

                                    <FormGroupCustom
                                        name={'response_mob_num'}
                                        type={"number"}
                                        value={details?.response_mob_num}
                                        label={'Enter mobile number for get form response'}
                                        className='mb-2'
                                        control={control}
                                        key={resetIt}
                                        rules={{ required: true, minLength: 10 }}
                                    />
                                </Col> */}

                                <div className='text-center mt-2
                                '>

                                    {/* <Button.Ripple color="primary" size="lg" type="submit" rounded>
                                        Save
                                    </Button.Ripple> */}
                                    <LoadingButton type='submit' loading={loading} color='primary' className="mt-1">
                                        Save
                                    </LoadingButton>
                                </div>
                            </Row>
                        </Card>
                    </Form>
                </Col>
                <Col md="6" lg="6">
                    <ButtonGroup>
                        <Button.Ripple color="primary" size="md" rounded outline={screen !== 1} onClick={() => { setScreen(1) }} active={screen === 1}>
                            Samsung Galaxy
                        </Button.Ripple>
                        {/* <Button.Ripple color="primary" size="md" rounded outline={screen !== 2} onClick={() => { setScreen(2) }} active={screen === 2}>
                            iPhone
                        </Button.Ripple> */}
                        <Button.Ripple color="primary" size="md" rounded outline={screen !== 3} onClick={() => { setScreen(3) }} active={screen === 3}>
                            Tab
                        </Button.Ripple>
                        <Button.Ripple color="primary" size="md" rounded outline={screen !== 4} onClick={() => { setScreen(4) }} active={screen === 4}>
                            iPhone 10
                        </Button.Ripple>
                    </ButtonGroup>

                    <Show IF={screen === 1}>

                        <div className='mobile'>
                            <div className='mobile-phone'>
                                <div className='brove'>
                                    <span className='speaker'>
                                    </span>
                                </div>
                                <div className='screen' style={{ wordBreak: 'break-word', background: watch('bg_color') }}>
                                    <ScrollBar className='p-1'>
                                        <div className='mt-2 d-flex justify-content-center border-bottom p-1 ' style={{ textAlign: 'center', minHeight: "70px" }}>
                                            <h2>{title ?? 'Lorem Ipsum'}</h2>
                                            {/* <h2> {viewTitle()}</h2> */}
                                        </div>
                                        <div className='mt-2 border-bottom p-1' style={{ minHeight: "80px" }}>
                                            {/* {content} */}

                                            {!content ? prev : <div className='ck-content'
                                                dangerouslySetInnerHTML={{ __html: content }}
                                            />}
                                        </div>

                                        <Show IF={watch("take_response") === 1}>
                                            <div className='mt-2 border-bottom p-1' style={{ minHeight: "80px" }}>
                                                <Show IF={watch("take_response") === 1}>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <h3 className='fw-bold'>
                                                            Are you satisfied with the quality of our services?
                                                        </h3>
                                                        <div className='d-flex justify-content-between'>
                                                            <Button.Ripple outline>
                                                                <ThumbUp className='text-success' /> <span className='ml-2 fw-bold'>Like</span>
                                                            </Button.Ripple>
                                                            <Button.Ripple outline>
                                                                <ThumbDown className='text-danger' /> <span className='ml-2 fw-bold'>DisLike</span>
                                                            </Button.Ripple>
                                                        </div>

                                                    </div>
                                                </Show>
                                                {/* <Rating
                                        direction={isRtl ? 'rtl' : 'ltr'}
                                        initialRating={0}
                                        emptySymbol={<Star size={32} fill='#babfc7' stroke='#babfc7' />}
                                        fullSymbol={<Star size={32} fill={themeColors.colors.warning.main} stroke={themeColors.colors.warning.main} />}
                                    /> */}


                                            </div>
                                        </Show>
                                        <Show IF={watch("take_response") === 3}>
                                            <div className='mt-2 text-center'>
                                                {values !== null && <Typography style={{ textAlign: 'center' }}>{labels[hover !== -1 ? hover : values]}</Typography>}
                                                <Rating
                                                    value={values}
                                                    precision={1}
                                                    initialRating={0}
                                                    name='hover-feedback'
                                                    // sx={{ mr: 4 }}
                                                    size='large'
                                                    // className=''
                                                    onChange={(event, newValue) => setValues(newValue ?? 0)}
                                                    onChangeActive={(event, newHover) => setHover(newHover ?? 0)}
                                                />
                                                <div className='text-center'>
                                                    <Button.Ripple color="primary" size="md" rounded>
                                                        Submit
                                                    </Button.Ripple>
                                                </div>
                                            </div>
                                        </Show>
                                        <Show IF={watch("take_response") === 2}>
                                            <div className='mt-2' style={{ textAlign: 'center' }}>
                                                <h4 className='fw-bolder'>Share your contact information with us!</h4>
                                                <Row className='mt-1'>
                                                    <Col md="12">

                                                        <FormGroupCustom
                                                            name={'name'}
                                                            type={"text"}
                                                            label={'Enter your name'}
                                                            className='mb-2 pe-none'
                                                            control={control}
                                                            rules={{ required: false }}
                                                        />

                                                    </Col>
                                                    <Col md="12">

                                                        <FormGroupCustom
                                                            name={'email'}
                                                            type={"email"}
                                                            label={'Enter your email'}
                                                            className='mb-2 pe-none'
                                                            control={control}
                                                            rules={{ required: false }}
                                                        />
                                                    </Col>
                                                    <Col md="12">

                                                        <FormGroupCustom
                                                            name={'subject'}
                                                            type={"text"}
                                                            label={'Enter your subject'}
                                                            className='mb-2 pe-none'
                                                            control={control}
                                                            rules={{ required: false }}
                                                        />
                                                    </Col>
                                                    <Col md="12">

                                                        <FormGroupCustom
                                                            name={'comment'}
                                                            type={"textarea"}
                                                            label={'Enter your comment'}
                                                            className='mb-2 pe-none'
                                                            control={control}
                                                            rules={{ required: false }}
                                                        />
                                                    </Col>
                                                    <div className='text-center'>
                                                        <Button.Ripple color="primary" size="md" rounded>
                                                            Save
                                                        </Button.Ripple>
                                                    </div>


                                                </Row>
                                            </div>
                                        </Show>
                                    </ScrollBar>
                                </div>
                            </div>
                        </div>
                    </Show>
                    <Show IF={screen === 2}>
                        <div class="iphone">
                            <div class="iphone-top">
                                <span class="camera"></span>
                                <span class="sensor"></span>
                                <span class="speakers"></span>
                            </div>
                            <div class="top-bar"></div>
                            <div class="iphone-screen" style={{ wordBreak: 'break-word', background: watch('bg_color') }}>
                                <ScrollBar className='p-1'>
                                    <div className='mt-2 d-flex justify-content-center border-bottom p-1 ' style={{ textAlign: 'center', minHeight: "70px" }}>
                                        <h2>{title ?? 'Lorem Ipsum'}</h2>
                                    </div>
                                    <div className='mt-2 border-bottom p-1 ck-content' style={{ minHeight: "80px" }}>
                                        {/* {content} */}

                                        {!content ? prev : <div
                                            dangerouslySetInnerHTML={{ __html: content }}
                                        />}
                                    </div>


                                    <Show IF={watch("take_response") === 1}>
                                        <div className='mt-2 border-bottom p-1' style={{ minHeight: "80px" }}>
                                            <Show IF={watch("take_response") === 1}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <h3 className='fw-bold'>
                                                        Are you satisfied with the quality of our services?
                                                    </h3>
                                                    <div className='d-flex justify-content-between'>
                                                        <Button.Ripple outline>
                                                            <ThumbUp className='text-success' /> <span className='ml-2 fw-bold'>Like</span>
                                                        </Button.Ripple>
                                                        <Button.Ripple outline>
                                                            <ThumbDown className='text-danger' /> <span className='ml-2 fw-bold'>DisLike</span>
                                                        </Button.Ripple>
                                                    </div>

                                                </div>
                                            </Show>
                                            {/* <Rating
                                        direction={isRtl ? 'rtl' : 'ltr'}
                                        initialRating={0}
                                        emptySymbol={<Star size={32} fill='#babfc7' stroke='#babfc7' />}
                                        fullSymbol={<Star size={32} fill={themeColors.colors.warning.main} stroke={themeColors.colors.warning.main} />}
                                    /> */}


                                        </div>
                                    </Show>
                                    <Show IF={watch("take_response") === 3}>
                                        <div className='mt-2 text-center'>
                                            {values !== null && <Typography style={{ textAlign: 'center' }}>{labels[hover !== -1 ? hover : values]}</Typography>}
                                            <Rating
                                                value={values}
                                                precision={1}
                                                initialRating={0}
                                                name='hover-feedback'
                                                // sx={{ mr: 4 }}
                                                size='large'
                                                // className=''
                                                onChange={(event, newValue) => setValues(newValue ?? 0)}
                                                onChangeActive={(event, newHover) => setHover(newHover ?? 0)}
                                            />
                                            <div className='text-center'>
                                                <Button.Ripple color="primary" size="md" rounded>
                                                    Submit
                                                </Button.Ripple>
                                            </div>
                                        </div>
                                    </Show>
                                    <Show IF={watch("take_response") === 2}>
                                        <div className='mt-2' style={{ textAlign: 'center' }}>
                                            <h4 className='fw-bolder'>Share your contact information with us!</h4>
                                            <Row className='mt-1'>
                                                <Col md="12">

                                                    <FormGroupCustom
                                                        name={'name'}
                                                        type={"text"}
                                                        label={'Enter your name'}
                                                        className='mb-2 pe-none'
                                                        control={control}
                                                        rules={{ required: true }}
                                                    />
                                                </Col>
                                                <Col md="12">

                                                    <FormGroupCustom
                                                        name={'email'}
                                                        type={"email"}
                                                        label={'Enter your email'}
                                                        className='mb-2 pe-none'
                                                        control={control}
                                                        rules={{ required: true }}
                                                    />
                                                </Col>
                                                <Col md="12">

                                                    <FormGroupCustom
                                                        name={'subject'}
                                                        type={"text"}
                                                        label={'Enter your subject'}
                                                        className='mb-2 pe-none'
                                                        control={control}
                                                        rules={{ required: true }}
                                                    />
                                                </Col>
                                                <Col md="12">

                                                    <FormGroupCustom
                                                        name={'comment'}
                                                        type={"textarea"}
                                                        label={'Enter your comment'}
                                                        className='mb-2 pe-none'
                                                        control={control}
                                                        rules={{ required: true }}
                                                    />
                                                </Col>
                                                <div className='text-center'>
                                                    <Button.Ripple color="primary" size="md" rounded>
                                                        Submit
                                                    </Button.Ripple>
                                                </div>


                                            </Row>
                                        </div>
                                    </Show>
                                </ScrollBar>
                            </div>
                            <div class="buttons">
                                <span class="on-off"></span>
                                <span class="sleep"></span>
                                <span class="up"></span>
                                <span class="down"></span>
                            </div>
                            <div class="bottom-bar"></div>
                            <div class="iphone-bottom">
                                <span></span>
                            </div>
                        </div>

                    </Show>
                    <Show IF={screen === 3}>
                        <div class="container mt-2">
                            <div class="row">
                                <div id="module">
                                    <div class="screens content-fluid screen-off" style={{ wordBreak: 'break-word', background: watch('bg_color') }}>
                                        <ScrollBar className='p-1'>
                                            <div className='mt-2 d-flex justify-content-center border-bottom p-1 ' style={{ textAlign: 'center', minHeight: "70px" }}>
                                                <h2>{title ?? 'Lorem Ipsum'}</h2>
                                            </div>
                                            <div className='mt-2 border-bottom p-1' style={{ minHeight: "80px" }}>
                                                {/* {content} */}

                                                {!content ? prev : <div className='ck-content'
                                                    dangerouslySetInnerHTML={{ __html: content }}
                                                />}
                                            </div>


                                            <Show IF={watch("take_response") === 1}>
                                                <div className='mt-2 border-bottom p-1' style={{ minHeight: "80px" }}>
                                                    <Show IF={watch("take_response") === 1}>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <h3 className='fw-bold'>
                                                                Are you satisfied with the quality of our services?
                                                            </h3>
                                                            <div className='d-flex justify-content-between'>
                                                                <Button.Ripple outline>
                                                                    <ThumbUp className='text-success' /> <span className='ml-2 fw-bold'>Like</span>
                                                                </Button.Ripple>
                                                                <Button.Ripple outline>
                                                                    <ThumbDown className='text-danger' /> <span className='ml-2 fw-bold'>DisLike</span>
                                                                </Button.Ripple>
                                                            </div>

                                                        </div>
                                                    </Show>
                                                    {/* <Rating
                                        direction={isRtl ? 'rtl' : 'ltr'}
                                        initialRating={0}
                                        emptySymbol={<Star size={32} fill='#babfc7' stroke='#babfc7' />}
                                        fullSymbol={<Star size={32} fill={themeColors.colors.warning.main} stroke={themeColors.colors.warning.main} />}
                                    /> */}


                                                </div>
                                            </Show>
                                            <Show IF={watch("take_response") === 3}>
                                                <div className='mt-2 text-center'>
                                                    {values !== null && <Typography style={{ textAlign: 'center' }}>{labels[hover !== -1 ? hover : values]}</Typography>}
                                                    <Rating
                                                        value={values}
                                                        precision={1}
                                                        initialRating={0}
                                                        name='hover-feedback'
                                                        // sx={{ mr: 4 }}
                                                        size='large'
                                                        // className=''
                                                        onChange={(event, newValue) => setValues(newValue ?? 0)}
                                                        onChangeActive={(event, newHover) => setHover(newHover ?? 0)}
                                                    />
                                                    <div className='text-center'>
                                                        <Button.Ripple color="primary" size="md" rounded>
                                                            Submit
                                                        </Button.Ripple>
                                                    </div>
                                                </div>
                                            </Show>
                                            <Show IF={watch("take_response") === 2}>
                                                <div className='mt-2' style={{ textAlign: 'center' }}>
                                                    <h4 className='fw-bolder'>Share your contact information with us!</h4>
                                                    <Row className='mt-1'>
                                                        <Col md="12">

                                                            <FormGroupCustom
                                                                name={'name'}
                                                                type={"text"}
                                                                label={'Enter your name'}
                                                                className='mb-2 pe-none'
                                                                control={control}
                                                                rules={{ required: true }}
                                                            />
                                                        </Col>
                                                        <Col md="12">

                                                            <FormGroupCustom
                                                                name={'email'}
                                                                type={"email"}
                                                                label={'Enter your email'}
                                                                className='mb-2 pe-none'
                                                                control={control}
                                                                rules={{ required: true }}
                                                            />
                                                        </Col>
                                                        <Col md="12">

                                                            <FormGroupCustom
                                                                name={'subject'}
                                                                type={"text"}
                                                                label={'Enter your subject'}
                                                                className='mb-2 pe-none'
                                                                control={control}
                                                                rules={{ required: true }}
                                                            />
                                                        </Col>
                                                        <Col md="12">

                                                            <FormGroupCustom
                                                                name={'comment'}
                                                                type={"textarea"}
                                                                label={'Enter your comment'}
                                                                className='mb-2 pe-none'
                                                                control={control}
                                                                rules={{ required: true }}
                                                            />
                                                        </Col>
                                                        <div className='text-center'>
                                                            <Button.Ripple color="primary" size="md" rounded>
                                                                Save
                                                            </Button.Ripple>
                                                        </div>


                                                    </Row>
                                                </div>
                                            </Show>
                                        </ScrollBar>
                                    </div>
                                    <div id="bottom" class="content-fluid">
                                        <div class="power text-center"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Show>
                    <Show IF={screen === 4}>
                        <div class="iphone-xt">
                            <div className='screen' style={{ wordBreak: 'break-word', background: watch('bg_color') }}>
                                <ScrollBar className='p-1'>
                                    <div className='mt-2 d-flex justify-content-center border-bottom p-1 ' style={{ textAlign: 'center', minHeight: "70px" }}>
                                        <h2>{title ?? 'Lorem Ipsum'}</h2>
                                    </div>
                                    <div className='mt-2 border-bottom p-1' style={{ minHeight: "80px" }}>
                                        {/* {content} */}

                                        {!content ? prev : <div className='ck-content'
                                            dangerouslySetInnerHTML={{ __html: content }}
                                        />}
                                    </div>


                                    <Show IF={watch("take_response") === 1}>
                                        <div className='mt-2 border-bottom p-1' style={{ minHeight: "80px" }}>
                                            <Show IF={watch("take_response") === 1}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <h3 className='fw-bold'>
                                                        Are you satisfied with the quality of our services?
                                                    </h3>
                                                    <div className='d-flex justify-content-between'>
                                                        <Button.Ripple outline>
                                                            <ThumbUp className='text-success' /> <span className='ml-2 fw-bold'>Like</span>
                                                        </Button.Ripple>
                                                        <Button.Ripple outline>
                                                            <ThumbDown className='text-danger' /> <span className='ml-2 fw-bold'>DisLike</span>
                                                        </Button.Ripple>
                                                    </div>

                                                </div>
                                            </Show>
                                            {/* <Rating
                                        direction={isRtl ? 'rtl' : 'ltr'}
                                        initialRating={0}
                                        emptySymbol={<Star size={32} fill='#babfc7' stroke='#babfc7' />}
                                        fullSymbol={<Star size={32} fill={themeColors.colors.warning.main} stroke={themeColors.colors.warning.main} />}
                                    /> */}


                                        </div>
                                    </Show>
                                    <Show IF={watch("take_response") === 3}>
                                        <div className='mt-2 text-center'>
                                            {values !== null && <Typography style={{ textAlign: 'center' }}>{labels[hover !== -1 ? hover : values]}</Typography>}
                                            <Rating
                                                value={values}
                                                precision={1}
                                                initialRating={0}
                                                name='hover-feedback'
                                                // sx={{ mr: 4 }}
                                                size='large'
                                                // className=''
                                                onChange={(event, newValue) => setValues(newValue ?? 0)}
                                                onChangeActive={(event, newHover) => setHover(newHover ?? 0)}
                                            />
                                            <div className='text-center'>
                                                <Button.Ripple color="primary" size="md" rounded>
                                                    Submit
                                                </Button.Ripple>
                                            </div>
                                        </div>
                                    </Show>
                                    <Show IF={watch("take_response") === 2}>
                                        <div className='mt-2' style={{ textAlign: 'center' }}>
                                            <h4 className='fw-bolder'>Share your contact information with us!</h4>
                                            <Row className='mt-1'>
                                                <Col md="12">

                                                    <FormGroupCustom
                                                        name={'name'}
                                                        type={"text"}
                                                        label={'Enter your name'}
                                                        className='mb-2 pe-none'
                                                        control={control}
                                                        rules={{ required: true }}
                                                    />
                                                </Col>
                                                <Col md="12">

                                                    <FormGroupCustom
                                                        name={'email'}
                                                        type={"email"}
                                                        label={'Enter your email'}
                                                        className='mb-2 pe-none'
                                                        control={control}
                                                        rules={{ required: true }}
                                                    />
                                                </Col>
                                                <Col md="12">

                                                    <FormGroupCustom
                                                        name={'subject'}
                                                        type={"text"}
                                                        label={'Enter your subject'}
                                                        className='mb-2 pe-none'
                                                        control={control}
                                                        rules={{ required: true }}
                                                    />
                                                </Col>
                                                <Col md="12">

                                                    <FormGroupCustom
                                                        name={'comment'}
                                                        type={"textarea"}
                                                        label={'Enter your comment'}
                                                        className='mb-2 pe-none'
                                                        control={control}
                                                        rules={{ required: true }}
                                                    />
                                                </Col>
                                                <div className='text-center'>
                                                    <Button.Ripple color="primary" size="md" rounded>
                                                        Save
                                                    </Button.Ripple>
                                                </div>


                                            </Row>
                                        </div>
                                    </Show>
                                </ScrollBar>
                            </div>
                        </div>
                    </Show>
                </Col>
            </Row>
            {/* <div className='mt-2 border-bottom p-1' style={{ minHeight: "80px" }}> */}
            {/* <Show IF={watch("doc_type") === "1"}> */}
            {/* <img src={photo123} controls alt="Image_Photo" className='img-fluid' width="300" height="200" /> */}
            {/* </Show> */}
            {/* <Show IF={watch("doc_type") === "2"}> */}
            {/* <audio controls key={photo123}> */}

            {/* <source src={photo123} type="audio/mpeg" /> */}
            {/* Your browser does not support the audio element. */}
            {/* </audio> */}
            {/* </Show> */}
            {/* <Show IF={watch("doc_type") === "3"}> */}
            {/* <video src={photo123} controls alt="Image_Photo" className='img-fluid' width="300" height="200" /> */}
            {/* </Show> */}
            {/* <Show IF={watch("doc_type") === "4" || watch("doc_type") === "4"}> */}
            {/* <iframe
                        width="auto"
                        height="200"
                        src={watch('url')}
                        frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe> */}
            {/* </Show> */}
            {/* <audio src={photo123} controls alt="Image_Photo" className='img-fluid' width="300" height="200" /> */}

            {/* </div> */}
        </>
    )
}

export default AddTwoWaySMS
