// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { CardBody, Col, Row } from 'reactstrap'
import { addSenderIds, editSenderIds } from '../../utility/apis/senderIds'
import { loadUser, loadUserChild } from '../../utility/apis/userManagement'
import { senderIdMessageType } from '../../utility/Const'
import { isValid, isValidArray, log } from '../../utility/helpers/common'
import Hide from '../../utility/Hide'
import Show from '../../utility/Show'
import { createAsyncSelectMultiUserOptions, createAsyncSelectOptions, createConstSelectOptions, createSelectOptions } from '../../utility/Utils'
import FormGroupCustom from '../components/formGroupCustom'
import CenteredModal from '../components/modal/CenteredModal'

export default function AddSenderID({ edit = null, noView = false, modal = false, preload, setModal = () => { }, Component = "span", children = null, ...rest }) {

    const [open, setOpen] = useState(false)
    const loginUser = useSelector(state => state.auth.userData)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])
    const dispatch = useDispatch()
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues, setError } = form

    const users = useSelector(state => state.auth.userData)

    const handleShow = () => {
        reset()
        setOpen(!open)
        setModal(!open)
        if (edit === null) setEditData(null)

    }
    const handleClose = (from = null) => {
        handleShow()
    }

    // log(users)


    const listUser = async (search, loadedOptions, { page }) => {

        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUser)

    }


    const handleSave = (data) => {
        if (edit?.id) {
            editSenderIds({
                id: edit?.id,
                // user_id: users?.id,
                jsonData: {
                    ...data,
                    user_id: loginUser?.userType === 2 ? loginUser?.id : edit?.user_id
                },
                dispatch,
                loading: setLoading,
                success: (d) => {
                    handleClose()
                    // preload()
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
            addSenderIds({
                jsonData: {
                    ...data,
                    user_id: loginUser?.userType === 2 ? loginUser?.id : data?.user_id
                    // if (loginUser?.userType === 0 || loginUser?.userType === 3 ) {

                    // }
                    // user_id: users?.id
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
    }

    return (
        <>
            {!noView ? <Component role="button" onClick={handleShow} {...rest}>{children}</Component> : null}
            <CenteredModal
                loading={loading}
                open={open}
                scrollControl={false}
                handleModal={handleClose}
                modalClass="modal-lg"
                disableSave={loading}
                handleSave={handleSubmit(handleSave)}
                title={isValid(edit) ? 'Edit Sender ID' : 'Add Sender ID'}>
                <form>
                    <CardBody>
                        <Row>
                            <Hide IF={loginUser?.userType === 2}>
                                <Hide IF={isValid(edit)}>
                                    <Col md="6">
                                        <FormGroupCustom
                                            async
                                            loadOptions={listUser}
                                            type={"select"}
                                            control={control}
                                            name="user_id"
                                            isClearable
                                            value={edit?.user_id}
                                            defaultOptions
                                            className='mb-1'
                                            label="User"
                                            // onChangeValue={(e) => { setGetSender(e?.id) }}
                                            errors={errors}
                                            options={user}
                                            rules={{ required: true }}

                                        />
                                    </Col>
                                </Hide>
                            </Hide>
                            <Show IF={isValid(edit)}>
                                <Col md="6">
                                    <FormGroupCustom
                                        // key={`${sender}-dsfsdf`}
                                        type={"text"}
                                        control={control}
                                        name="fgdfg"
                                        disabled
                                        value={edit?.user?.name}
                                        className='mb-1 pe-none'
                                        label="User Name"
                                        errors={errors}
                                    // rules={{ required: true }}

                                    />

                                </Col>
                            </Show>
                            <Col md="6">
                                <FormGroupCustom
                                    type={"select"}
                                    control={control}
                                    name="sender_id_type"
                                    isClearable
                                    value={edit?.sender_id_type}
                                    className="mb-1"
                                    label={"Message Type"}
                                    errors={errors}
                                    options={createConstSelectOptions(senderIdMessageType)}
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="company_name"
                                    value={edit?.company_name}
                                    className='mb-1'
                                    label="Company Name"
                                    errors={errors}
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="entity_id"
                                    value={edit?.entity_id}
                                    className='mb-1'
                                    label="Entity ID"
                                    errors={errors}
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="sender_id"
                                    value={edit?.sender_id}
                                    className='mb-1'
                                    label="Sender ID"
                                    errors={errors}
                                    rules={{ required: true, minLength: 6 }}
                                />
                            </Col>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="header_id"
                                    value={edit?.header_id}
                                    className='mb-1'
                                    label="Header ID"
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
