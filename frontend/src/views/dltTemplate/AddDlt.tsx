// @ts-nocheck

import React, { useEffect, useState } from 'react'
import { set, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { CardBody, Col, Row } from 'reactstrap'
import { isUnique, status } from '../../utility/Const'
import Hide from '../../utility/Hide'
import Show from '../../utility/Show'
import { createAsyncSelectMultiUserOptions, createAsyncSelectOptions, createConstSelectOptions } from '../../utility/Utils'
import { addDlt, editDlt } from '../../utility/apis/dlt'
import { loadSenderIds } from '../../utility/apis/senderIds'
import { loadUserChild } from '../../utility/apis/userManagement'
import { isValid, isValidArray, log } from '../../utility/helpers/common'
import FormGroupCustom from '../components/formGroupCustom'
import CenteredModal from '../components/modal/CenteredModal'
import { loadGroup } from '../../utility/apis/templateGroup'

export default function AddDlr({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", children = null, ...rest }) {

    const loginUser = useSelector(state => state.auth.userData)
    const [open, setOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const [dlr, setDlr] = useState(null)
    const [loading, setLoading] = useState(false)
    const [getSender, setGetSender] = useState(null)
    const [header, setHeader] = useState(null)
    const [entity, setEntity] = useState(null)
    const [senderID, setSenderID] = useState(null)
    const [getTemplateGroup, setGetTemplateGroup] = useState(null)
    const dispatch = useDispatch()

    const form = useForm({
        defaultValues: {
            entity_id: '',
            header_id: "",
            sender_id: ''
        }
    })

    const [resetIt, setResetIt] = useState(new Date())

    const [user, setUser] = useState(null)
    const [sender, setSender] = useState(null)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues, setError } = form

    const handleShow = () => {
        setOpen(!open)
        setModal(!open)
        if (edit === null) setEditData(null)

    }

    const handleClose = (from = null) => {
        reset()
        handleShow()
        setEntity(null)
        setHeader(null)
        setGetSender(null)
        setGetTemplateGroup(null)
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
        return createAsyncSelectOptions(res, page, "username_name", null, setUser)
    }

    const listGroup = async (search, loadedOptions, { page }) => {
        // if (user_id)
        const res = await loadGroup({
            async: true,
            page,
            perPage: 25,
            // dispatch,
            jsonData: { search }
        })
        return createAsyncSelectOptions(res, page, "group_name", "id", setUser)

    }


    const listSenderID = async (search, loadedOptions, { page }) => {
        if (isValid(watch("user_id")) || loginUser?.userType === 2) {
            const res = await loadSenderIds({
                async: true,
                page,
                perPage: 100,
                jsonData: { sender_id: search, user_id: watch("user_id")?.id ?? loginUser?.id }
            })
            return createAsyncSelectOptions(res, page, "sender_id", null, setSender)
        } else {
            return {
                options: [],
                hasMore: false
            }
        }

    }

    useEffect(() => {
        if (loginUser?.userType === 2) {
            setValue('user_id', loginUser?.id)
        }
    }, [loginUser])

    // const userView = () => {
    // if (loginUser?.userType === 2) {
    //     return  loginUser?.id
    // } else if (isValid(edit)) {
    //     return edit?.user_id
    // }

    const handleSave = (data) => {
        if (edit?.id) {
            editDlt({
                id: edit?.id,
                jsonData: {
                    ...data,
                    user_id: loginUser?.userType === 2 ? loginUser?.id : edit?.user_id,
                    entity_id: entity ?? edit?.entity_id,
                    header_id: header ?? edit?.header_id,
                    sender_id: getSender ?? edit?.sender_id,
                    manage_sender_id: edit?.manage_sender_id

                },
                dispatch,
                loading: setLoading,
                success: (d) => {
                    handleClose()
                    setResetIt(new Date()); reset()


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
            addDlt({
                jsonData: {
                    ...data,
                    user_id: loginUser?.userType === 2 ? loginUser?.id : data?.user_id?.id,
                    entity_id: entity,
                    header_id: header,
                    sender_id: getSender
                },
                loading: setLoading,
                dispatch,
                success: (e) => {
                    handleClose()
                    setResetIt(new Date()); reset()
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
    // log("sdfsdfdsf", edit?.is_unicode)


    useEffect(() => {
        if (isValid(edit)) {
            setValue('user_id', edit?.user_id)
        }
    }, [edit])
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
                title={isValid(edit) ? 'Edit DLT Template' : 'Add DLT Template'}>
                <form>
                    <CardBody>
                        <Row>
                            <Hide IF={loginUser?.userType === 2}>
                                <Hide IF={isValid(edit)}>
                                    <Col md="4">
                                        <FormGroupCustom
                                            async
                                            type={"select"}
                                            control={control}
                                            name="user_id"
                                            isClearable
                                            defaultOptions
                                            // onChangeValue={(e) => { setGetSender(e?.id) }}
                                            value={edit?.user_id}
                                            loadOptions={listUser}
                                            onChangeValueSelect={(e) => {
                                                setGetTemplateGroup(e?.is_visible_dlt_template_group)
                                                log(e, "etstg")
                                            }}
                                            className='mb-1'
                                            label="User"

                                            errors={errors}
                                            options={user}
                                            rules={{ required: true }}

                                        />
                                    </Col>
                                </Hide>
                            </Hide>
                            <Show IF={isValid(edit)}>
                                <Col md="4">
                                    <FormGroupCustom
                                        // key={`${sender}-dsfsdf`}
                                        type={"text"}
                                        control={control}
                                        name="fgdfg"
                                        disabled
                                        value={edit?.name}
                                        className='mb-1 pe-none'
                                        label="User Name"
                                        errors={errors}
                                    // rules={{ required: true }}

                                    />

                                </Col>
                            </Show>
                            <Show IF={isValid(edit)}>
                                <Col md="4">
                                    <FormGroupCustom
                                        // key={`${sender}-dsfsdf`}
                                        type={"text"}
                                        control={control}
                                        name="fgdferteg"
                                        disabled
                                        value={edit?.sender_id}
                                        className='mb-1 pe-none'
                                        label="Manage Sender ID"
                                        errors={errors}
                                    // rules={{ required: true }}
                                    />

                                </Col>
                            </Show>
                            <Hide IF={isValid(edit)}>
                                <Col md="4">
                                    <FormGroupCustom
                                        async
                                        key={`${watch('user_id')?.id}-${loginUser?.id}-fsdfdffsfsd-${edit?.manage_sender_id}`}
                                        isClearable
                                        type={"select"}
                                        control={control}
                                        name="manage_sender_id"
                                        loadOptions={listSenderID}
                                        matchWith={"id"}
                                        defaultOptions
                                        value={edit?.manage_sender_id}
                                        className='mb-1'
                                        label="Manage Sender ID "
                                        errors={errors}
                                        onChangeValueSelect={(e) => {
                                            // log(e, "etstg2")
                                            setGetSender(e?.sender_id)
                                            setHeader(e?.header_id)
                                            setEntity(e?.entity_id)
                                            setValue("manage_sender_id", e?.id)
                                            setValue("entity_id", e?.entity_id)
                                        }}
                                        options={sender}
                                        rules={{ required: true }}

                                    />
                                </Col>
                            </Hide>
                            <Col md="4">
                                <FormGroupCustom
                                    key={`yesy-${entity}-${resetIt}`}
                                    type={"number"}
                                    control={control}
                                    className='mb-1 pe-none'
                                    name="entity_id"
                                    value={entity ?? edit?.entity_id}
                                    isClearable
                                    label="Entry ID"
                                    errors={errors}
                                    rules={{ required: false }}
                                />
                            </Col>
                            <Col md="4">
                                <FormGroupCustom
                                    key={`gdsrsdf-${getSender}-${resetIt}`}
                                    type={"text"}
                                    control={control}
                                    className='mb-1 pe-none'
                                    name="sender_id"
                                    value={getSender ?? edit?.sender_id}
                                    isClearable
                                    label="Sender ID"
                                    errors={errors}
                                    rules={{ required: false }}
                                />
                            </Col>
                            <Col md="4">
                                <FormGroupCustom
                                    key={`fsdfdsfsdfsdf-${header}-${resetIt}`}
                                    type={"number"}
                                    control={control}
                                    className='mb-1 pe-none'
                                    name="header_id"
                                    value={header ?? edit?.header_id}
                                    isClearable
                                    label="Header ID"
                                    errors={errors}
                                    rules={{ required: false }}
                                />
                            </Col>

                            <Col md="4">
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    className='mb-1'
                                    name="template_name"
                                    value={edit?.template_name}
                                    isClearable
                                    label="Template Name"
                                    errors={errors}
                                    rules={{ required: true }}
                                />
                            </Col>

                            <Col md="4">
                                <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    className='mb-1'
                                    name="dlt_template_id"
                                    value={edit?.dlt_template_id}
                                    isClearable
                                    label="Dlt Template ID"
                                    errors={errors}
                                    rules={{ required: true }}
                                />
                            </Col>

                            <Col md="4">

                                <FormGroupCustom
                                    key={`is_unicode${edit?.is_unicode}`}
                                    type={"select"}
                                    control={control}
                                    className='mb-1'

                                    name="is_unicode"
                                    value={String(edit?.is_unicode)}
                                    // isClearable
                                    label="Unicode"
                                    errors={errors}
                                    options={createConstSelectOptions(isUnique)}
                                    rules={{ required: true }}

                                />

                            </Col>
                            <Col md="4">
                                <FormGroupCustom
                                    type={"select"}
                                    control={control}
                                    className='mb-1'
                                    name="status"
                                    value={String(edit?.status)}
                                    // isClearable
                                    label="Status"
                                    errors={errors}
                                    options={createConstSelectOptions(status)}
                                    rules={{ required: true }}
                                />

                            </Col>
                            <Show IF={getTemplateGroup === 1 && isValid(edit?.dlt_template_group_id !== 0)}>
                                <Col md="4">
                                    <FormGroupCustom
                                        // key={`sfsdfsdfs${edit?.user_id}-kmlkm`}
                                        async
                                        type={"select"}
                                        control={control}
                                        name="dlt_template_group_id"
                                        isClearable
                                        defaultOptions
                                        // onChangeValue={(e) => { setGetSender(e?.id) }}
                                        value={edit?.dlt_template_group_id}
                                        loadOptions={listGroup}
                                        className='mb-1'
                                        label="Template Group"

                                        errors={errors}
                                        options={user}
                                        rules={{ required: true }}

                                    />
                                </Col>
                            </Show>
                            <Show IF={isValid(edit?.dlt_template_group_id)}>
                                <Col md="4">
                                    <FormGroupCustom
                                        // key={`sfsdfsdfs${edit?.user_id}-kmlkm`}
                                        async
                                        type={"select"}
                                        control={control}
                                        name="dlt_template_group_id"
                                        isClearable
                                        defaultOptions
                                        // onChangeValue={(e) => { setGetSender(e?.id) }}
                                        value={edit?.dlt_template_group_id}
                                        loadOptions={listGroup}
                                        className='mb-1'
                                        label="Template Group"

                                        errors={errors}
                                        options={user}
                                        rules={{ required: true }}

                                    />
                                </Col>
                            </Show>
                            <Show IF={loginUser?.userType === 2 && loginUser?.is_visible_dlt_template_group === 1}>
                                <Col md="4">
                                    <FormGroupCustom
                                        // key={`sfsdfsdfs${edit?.user_id}-kmlkm`}
                                        async
                                        type={"select"}
                                        control={control}
                                        name="dlt_template_group_id"
                                        isClearable
                                        defaultOptions
                                        // onChangeValue={(e) => { setGetSender(e?.id) }}
                                        value={edit?.dlt_template_group_id}
                                        loadOptions={listGroup}
                                        className='mb-1'
                                        label="Template Group"

                                        errors={errors}
                                        options={user}
                                        rules={{ required: true }}

                                    />
                                </Col>
                            </Show>
                            <Col md="12">
                                <FormGroupCustom
                                    type={"textarea"}
                                    control={control}
                                    className='mb-1'
                                    name="dlt_message"
                                    value={edit?.dlt_message}
                                    // isClearable
                                    style={{ minHeight: 100 }}
                                    label="DLT Message"
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
