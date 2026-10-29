// @ts-nocheck
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { loadUserChild } from '../../utility/apis/userManagement'
import { createAsyncSelectConfigOptions, createAsyncSelectMultiUserOptions, createConstSelectOptions } from '../../utility/Utils'
import { isValid, isValidArray } from '../../utility/helpers/common'
import { addWhatsappMedia } from '../../utility/apis/whatsappMedia'
import CenteredModal from '../components/modal/CenteredModal'
import { QrType, uploadFrom, whatsappFileType } from '../../utility/Const'
import { CardBody, Col, Row } from 'reactstrap'
import FormGroupCustom from '../components/formGroupCustom'
import Hide from '../../utility/Hide'
import Show from '../../utility/Show'
import { addWhatsappQr } from '../../utility/apis/waQrApi'
import { loadWhatsappConfig } from '../../utility/apis/whatsappConfig'

export default function AddQrCode({ edit = null, noView = false, modal = false, setModal = () => { }, preload, Component = "span", children = null, ...rest }) {


    const [open, setOpen] = useState(false)
    const [primary, setPrimary] = useState(null)
    const loginUser = useSelector(state => state.auth.userData)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])
    const mediaRef = useRef()
    const [avatar, setAvatar] = useState('')
    const [dex, setDex] = useState(null)
    const [loadConfig, setLoadConfig] = useState(false)

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

    const listWhatsappConfig = async (search, loadedOptions, { page }) => {

        const res = await loadWhatsappConfig({
            async: true,
            page,
            perPage: 25,
            // dispatch,
            jsonData: { user_id: user?.userType === 2 || user?.userType === 1 ? user?.id : watch('user_id'), search }
        })
        return createAsyncSelectConfigOptions(res, page, "xName", "id", setLoadConfig)

    }

    const handleSave = (data) => {

        addWhatsappQr({
            jsonData: {
                ...data,
                user_id: loginUser?.userType === 2 || loginUser?.userType === 1 ? loginUser?.id : data?.user_id
                // file: mediaRef.current?.files[0]
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
                title={'Add Qr Code'}>
                <form>
                    <CardBody>
                        <Row>

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
                                <Col md="12" xs="12" >
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
                            <Col md="12">
                                <FormGroupCustom
                                    key={`qfopfsdfs${watch('user_id')}-kmlrkm`}
                                    async
                                    type={"select"}
                                    control={control}
                                    name="configuration_id"
                                    isClearable
                                    defaultOptions
                                    // onChangeValue={(e) => { setGetSender(e?.id) }}
                                    // value={edit?.user_id}
                                    loadOptions={listWhatsappConfig}
                                    className='mb-1'
                                    label="Whatsapp Configuration"

                                    errors={errors}
                                    options={loadConfig}
                                    rules={{ required: true }}

                                />
                            </Col>
                           
                            <Col md="12">
                                <FormGroupCustom
                                    type={"select"}
                                    control={control}
                                    name="qr_image_format"
                                    isClearable
                                    className="mb-1"
                                    label={"Qr Type"}
                                    errors={errors}
                                    options={createConstSelectOptions(QrType)}
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md="12">
                                <FormGroupCustom
                                    type={"textarea"}
                                    control={control}
                                    name="prefilled_message"
                                    isClearable
                                    className="mb-1"
                                    label={"Prefilled Message"}
                                    errors={errors}
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
