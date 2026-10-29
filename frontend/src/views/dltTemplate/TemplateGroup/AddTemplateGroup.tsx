// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { CardBody, Col, Row } from 'reactstrap'
import { loadUserChild } from '../../../utility/apis/userManagement'
import { createAsyncSelectMultiUserOptions } from '../../../utility/Utils'
import { addGroup, editGroup } from '../../../utility/apis/templateGroup'
import { isValidArray } from '../../../utility/helpers/common'
import CenteredModal from '../../components/modal/CenteredModal'
import FormGroupCustom from '../../components/formGroupCustom'
import Hide from '../../../utility/Hide'

export default function AddTemplateGroup({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", children = null, ...rest }) {

    const [open, setOpen] = useState(false)
    const [primary, setPrimary] = useState(null)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const loginUser = useSelector(state => state?.auth?.userData)
    const [user, setUser] = useState([])

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
            jsonData: { search, is_visible_dlt_template_group: 1 }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUser)

    }


    const handleSave = (data) => {
        if (edit?.id) {
            editGroup({
                id: edit?.id,
                jsonData: {
                    ...data,
                    user_id: loginUser?.userType === 1 || loginUser?.userType === 2 ? loginUser?.id : data?.user_id
                    // is_retry_applicable: data?.is_retry_applicable === 1 ? 1 : 0,
                    // is_refund_applicable: data?.is_refund_applicable === 1 ? 1 : 0
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
            addGroup({
                jsonData: {
                    ...data,
                    user_id: loginUser?.userType === 1 || loginUser?.userType === 2 ? loginUser?.id : data?.user_id             

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
    }
    return (
        <>
            {!noView ? <Component role="button" onClick={handleShow} {...rest}>{children}</Component> : null}
            <CenteredModal
                loading={loading}
                open={open}
                scrollControl={false}
                handleModal={handleClose}
                modalClass="modal-md"
                handleSave={handleSubmit(handleSave)}
                disableSave={loading}
                title="Add Template Group">
                <form>
                    <CardBody>
                        <Row>
                            <Hide IF={loginUser?.userType === 1 || loginUser?.userType === 2}>
                            <Col md="12">
                                <FormGroupCustom
                                    async
                                    type={"select"}
                                    control={control}
                                    name="user_id"
                                    isClearable
                                    defaultOptions
                                    value={edit?.user_id}
                                    loadOptions={listUser}
                                    className='mb-1'
                                    label="User"
                                    errors={errors}
                                    options={user}
                                    rules={{ required: true }}

                                />
                            </Col>
                            </Hide>
                            <Col md="12" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="group_name"
                                    value={edit?.group_name}
                                    className='mb-1'
                                    label="Template Group Name"
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
