// @ts-nocheck
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button, ButtonGroup, CardBody, Col, Row } from 'reactstrap'
import Show from '../../utility/Show'
import { createAsyncSelectConfigOptions, createAsyncSelectMultiUserOptions } from '../../utility/Utils'
import { loadUserChild } from '../../utility/apis/userManagement'
import { loadWhatsappConfig } from '../../utility/apis/whatsappConfig'
import { whatsappTemplatePull, whatsappTemplatePullAll } from '../../utility/apis/whatsappTemplate'
import { isValidArray, log } from '../../utility/helpers/common'
import FormGroupCustom from '../components/formGroupCustom'
import CenteredModal from '../components/modal/CenteredModal'
import Hide from '../../utility/Hide'
import toast from 'react-hot-toast'
import { Permissions } from '../../utility/Permissions'

export default function WhatsappTemplatePull({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", children = null, preload, ...rest }) {

    const [open, setOpen] = useState(false)
    const [primary, setPrimary] = useState(null)
    const loginUser = useSelector(state => state.auth.userData)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])
    const [language, setLanguage] = useState(null)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    // const form = useForm()
    const [messageType, setMessageType] = useState(1)
    const [rSelected, setRSelected] = useState(1)
    const [loadUser, setLoadUser] = useState(false)
    const [loadConfig, setLoadConfig] = useState(false)
    // const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues, setError } = form

    const { handleSubmit, control, reset, setValue, watch, getValues, setError, formState: { errors } } = useForm({
        defaultValues: {
            wa_template_name: edit?.wa_template_name || "",
            wa_template_id: edit?.wa_template_id || ""
        }
    })
    const handleShow = () => {
        reset()
        setOpen(!open)
        setModal(!open)
        if (edit === null) setEditData(null)

    }
    const handleClose = (from = null) => {
        handleShow()
    }


    const handleSave = (data) => {

        if (rSelected === 1) {


            whatsappTemplatePull({
                jsonData: {
                    ...data,
                    user_id: loginUser?.userType === 0 || loginUser?.userType === 3 ? data?.user_id : loginUser?.id
                },
                loading: setLoading,
                dispatch,
                success: (e) => {
                    handleClose()
                    preload()
                    // <Redirect
                    //     to={{
                    //         pathname: "/whatsapp-custom-template",
                    //         state: { data  }
                    //     }}
                    // />
                    //                 navigate(
                    //                     'thepath',
                    //                     {
                    //                         state: {
                    //                             //...values
                    //                         }
                    //                     }
                    // })
                    // navigate('/whatsapp-custom-template', { state: { data } })
                },
                errors: (e) => {
                    log("error", e)
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
            whatsappTemplatePullAll({
                jsonData: {
                    ...data,
                    user_id: loginUser?.userType === 0 || loginUser?.userType === 3 ? data?.user_id : loginUser?.id
                },
                loading: setLoading,
                dispatch,
                success: (e) => {
                    handleClose()
                    preload()
                    // <Redirect
                    //     to={{
                    //         pathname: "/whatsapp-custom-template",
                    //         state: { data  }
                    //     }}
                    // />
                    //                 navigate(
                    //                     'thepath',
                    //                     {
                    //                         state: {
                    //                             //...values
                    //                         }
                    //                     }
                    // })
                    // navigate('/whatsapp-custom-template', { state: { data } })
                },
                errors: (e) => {
                    log("error", e)
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

    const listUser = async (search, loadedOptions, { page }) => {
        // if (user_id)
        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            // dispatch,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setLoadUser)

    }

    const listWhatsappConfig = async (search, loadedOptions, { page }) => {

        const res = await loadWhatsappConfig({
            async: true,
            page,
            perPage: 25,
            // dispatch,
            jsonData: { user_id: user?.userType === 2 || user?.userType === 1 ? user?.id : watch('user_id') }
        })
        return createAsyncSelectConfigOptions(res, page, "xName", "id", setLoadConfig)


    }

    const showToast = () => {
        toast.info('When selecting "Pull all templates," all existing templates will be deleted and new ones will be fetched from the server.')
    }

    const templateName = watch("wa_template_name")
    const templateId = watch("wa_template_id")
    return (
        <>
            {!noView ? <Component role="button" onClick={handleShow} {...rest}>{children}</Component> : null}
            <CenteredModal
                loading={loading}
                open={open}
                scrollControl={false}
                handleModal={handleClose}
                // modalClass="modal-lg"
                hideSave
                extraButtons={<>
                    <Button color="primary" type="submit" onClick={handleSubmit(handleSave)}>Pull</Button>
                </>
                }

                handleSave={handleSubmit(handleSave)}
                disableSave={loading}
                title="Whatsapp Template Pull">
                <form>
                    <CardBody>
                        <Row>
                            <Show IF={Permissions?.whatsappTemplateCreate}>
                                <ButtonGroup className='mb-1'>
                                    <Button block outline={rSelected !== 1} color='primary' lg={6} md={12} onClick={() => { setRSelected(1); setMessageType(1) }} active={rSelected === 1}>
                                        Pull Particular Template
                                    </Button>
                                    <Button block outline={rSelected !== 2} color='primary' lg={6} md={12} onClick={() => { setRSelected(2); setMessageType(2); setValue(""); toast('When selecting "Pull all templates," all existing templates will be deleted and new ones will be fetched from the whatsapp panel.', { icon: '👏' }) }} active={rSelected === 2}>
                                        Pull All Template
                                    </Button>

                                </ButtonGroup>
                            </Show>
                            <Show IF={loginUser?.userType === 0 || loginUser?.userType === 3}>

                                <Col md="12">
                                    <FormGroupCustom
                                        // key={`sfsdfsdfs${edit?.user_id}-kmlkm`}
                                        async
                                        type={"select"}
                                        control={control}
                                        name="user_id"
                                        isClearable
                                        defaultOptions
                                        // onChangeValue={(e) => { setGetSender(e?.id) }}
                                        value={edit?.user_id}
                                        loadOptions={listUser}
                                        className='mb-1'
                                        label="User"

                                        errors={errors}
                                        options={user}
                                        rules={{ required: true }}

                                    />
                                </Col>

                            </Show>

                            <Col className='d-grid mb-1 mb-lg-0' md={12}>
                                <FormGroupCustom
                                    key={`qfopfsdfs${watch('user_id')}-kmlkm`}
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
                                    label="Configuration"

                                    errors={errors}
                                    options={loadConfig}
                                    rules={{ required: true }}

                                />
                            </Col>
                            <Hide IF={rSelected === 2}>
                                <Col md="12" xs="12" >
                                    <FormGroupCustom
                                        type={"text"}
                                        control={control}
                                        name="wa_template_name"
                                        value={edit?.wa_template_name}
                                        className='mb-1'
                                        label="Whatsapp Template Name"
                                        errors={errors}
                                        rules={{
                                            validate: (value) => (value || templateId ? true : "Either Template Name or Template ID is required")
                                        }}
                                    />
                                </Col>
                            </Hide>

                            <Hide IF={rSelected === 2}>
                                <Col md="12" xs="12" >
                                    <FormGroupCustom
                                        type={"number"}
                                        control={control}
                                        name="wa_template_id"
                                        value={edit?.wa_template_id}
                                        className='mb-1'
                                        label="Whatsapp Template Id"
                                        errors={errors}
                                        rules={{
                                            validate: (value) => (value || templateName ? true : "Either Template Name or Template ID is required")
                                        }}
                                    />
                                </Col>
                            </Hide>
                        </Row>
                    </CardBody>
                </form>
            </CenteredModal>
        </>
    )
}
