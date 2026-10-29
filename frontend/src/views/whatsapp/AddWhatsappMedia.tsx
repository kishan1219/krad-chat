// @ts-nocheck
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { loadUserChild } from '../../utility/apis/userManagement'
import { createAsyncSelectConfigOptions, createAsyncSelectMultiUserOptions, createConstSelectOptions } from '../../utility/Utils'
import { isValid, isValidArray } from '../../utility/helpers/common'
import { addWhatsappMedia } from '../../utility/apis/whatsappMedia'
import CenteredModal from '../components/modal/CenteredModal'
import { uploadFrom, whatsappFileType } from '../../utility/Const'
import { CardBody, Col, Row } from 'reactstrap'
import FormGroupCustom from '../components/formGroupCustom'
import Hide from '../../utility/Hide'
import Show from '../../utility/Show'
import { loadWhatsappConfig } from '../../utility/apis/whatsappConfig'

export default function AddWhatsappMedia({ edit = null, noView = false, modal = false, setModal = () => { }, preload, Component = "span", children = null, ...rest }) {

    const [open, setOpen] = useState(false)
    const [primary, setPrimary] = useState(null)
    const loginUser = useSelector(state => state.auth.userData)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])
    const mediaRef = useRef()
    const [waConfigDetails, setWaConfigDetails] = useState(null)

    const [avatar, setAvatar] = useState('')
    const [dex, setDex] = useState(null)
    const dispatch = useDispatch()
    const form = useForm()
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

    const loadWaConfigOptions = async (search, loadedOptions, { page }) => {
        // if (user_id)
        const res = await loadWhatsappConfig({
            async: true,
            page,
            perPage: 25,
            // dispatch,
            // jsonData: { search }
            jsonData: { user_id: loginUser?.userType === 2 || loginUser?.userType === 1 ? loginUser?.id : watch('user_id'), search }

        })
        return createAsyncSelectConfigOptions(res, page, "xName", null, setWaConfigDetails)

    }


    const onChange = e => {
        const reader = new FileReader(), files = e.target.files
        if (isValidArray(files)) {
            reader.onload = function () {
                setAvatar(reader.result)
            }
            reader.readAsDataURL(files[0])
        }
    }

    const handleSave = (data) => {

        
        addWhatsappMedia({
            formData: {
                ...data,
                user_id: loginUser?.userType === 2 || loginUser?.userType === 1 ? loginUser?.id : data?.user_id,
                file: mediaRef.current?.files[0],
                configuration_id: watch('configuration_id')?.id
                // file_caption: watch('upload_type') === 'file_url' ? data?.file_caption : ""
            },
            loading: setLoading,
            dispatch,
            success: (e) => {
                handleClose()
                preload()
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

    const labelName = () => {
        if (watch('file_type') === "image") {
            return "Title"
        } else if (watch('file_type') === "document") {
            return "File Name"
        } else {
            return "File Caption"
        }
    }

    return (
        <>
            {!noView ? <Component role="button" onClick={handleShow} {...rest}>{children}</Component> : null}
            <CenteredModal
                loading={loading}
                open={open}
                scrollControl={false}
                handleModal={handleClose}
                // modalClass="modal-lg"
                handleSave={handleSubmit(handleSave)}
                disableSave={loading}
                title={'Upload Whatsapp File'}>
                <form>
                    <CardBody>
                        <Row>

                            <Hide IF={loginUser?.userType === 2 || loginUser?.userType === 1}>

                                <Col md="6">
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

                            <Show IF={loginUser?.userType === 2 || loginUser?.userType === 1}>
                                <Col md="6" xs="12" >
                                    <FormGroupCustom
                                        type={"text"}
                                        control={control}
                                        name="name"
                                        value={loginUser?.name}
                                        className='mb-1 pe-none'
                                        label={"Name"}
                                        disabled
                                    />
                                </Col>
                            </Show>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    // defaultOptions
                                    key={`qf36o2pfsdfs${watch('user_id')}-kmlkm`}
                                    async
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"configuration_id"}
                                    isClearable
                                    className='mb-1'
                                    loadOptions={loadWaConfigOptions}
                                    // value={loadUserOther}
                                    // onChangeValue={(e) => { setGetTemplate(e?.id); setTrans(e?.transaction_credit); setPro(e?.promotional_credit); setGetMessageType(e?.is_unicode); setTwo(e?.two_waysms_credit); setVoice(e?.voice_sms_credit); setGroup(e?.id) }}
                                    // onChangeValue={(e) => { setGroup(e?.id); setUserData(e); setWhatsappAmount(e?.wa_amount) }}
                                    options={waConfigDetails}
                                    label="Whatsapp Configuration"
                                    rules={{ required: false }}
                                />
                            </Col>

                            <Col md="6">
                                <FormGroupCustom
                                    type={"select"}
                                    control={control}
                                    name="file_type"
                                    isClearable
                                    className="mb-1"
                                    label={"File Type"}
                                    errors={errors}
                                    options={createConstSelectOptions(whatsappFileType)}
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md="6">
                                <FormGroupCustom
                                    type={"select"}
                                    control={control}
                                    name="upload_type"
                                    isClearable
                                    className="mb-1"
                                    label={"Upload From"}
                                    errors={errors}
                                    options={createConstSelectOptions(uploadFrom)}
                                    rules={{ required: true }}
                                />
                            </Col>

                            <Show IF={watch('upload_type') === "file_url"}>
                                <Col md="6" xs="12" >
                                    <FormGroupCustom
                                        type={"text"}
                                        control={control}
                                        name="file_url"
                                        className='mb-1'
                                        label={"File URL"}
                                        errors={errors}
                                    />
                                </Col>
                            </Show>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="file_caption"
                                    className='mb-1 '
                                    label={labelName()}
                                    errors={errors}
                                />
                            </Col>
                            <Show IF={watch('upload_type') === "local"}>
                                <Col md="12" xs="12" >
                                    <FormGroupCustom
                                        type={"file"}
                                        innerRef={mediaRef}
                                        control={control}
                                        name="file"
                                        className='mb-1 '
                                        label={"File Upload"}
                                        errors={errors}
                                        onChange={onChange}
                                    />
                                </Col>
                            </Show>
                        </Row>
                    </CardBody>
                </form>
            </CenteredModal>
        </>
    )
}
