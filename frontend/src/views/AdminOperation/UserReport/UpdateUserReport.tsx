// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { CardBody, Col, Input, Label, Row } from 'reactstrap'
import { createAsyncSelectMultiUserOptions, createAsyncSelectOptions, createConstSelectOptions } from '../../../utility/Utils'
import { loadUserChild } from '../../../utility/apis/userManagement'
import { loadGroup } from '../../../utility/apis/templateGroup'
import { createUserReport, updateUserReport } from '../../../utility/apis/userWiseReport'
import { isValid, isValidArray, log } from '../../../utility/helpers/common'
import CenteredModal from '../../components/modal/CenteredModal'
import FormGroupCustom from '../../components/formGroupCustom'
import { Months, getUserMonthlyReportMessageType, getYearList, getYears } from '../../../utility/Const'
import Hide from '../../../utility/Hide'


export default function UpdateUserReport({ edit = null, noView = false, modal = false, setModal = () => { }, showModal = false, setShowModal = () => { }, Component = "span", children = null, ...rest }) {
    const [open, setOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [loadRoles, setLoadRoles] = useState(false)
    const dispatch = useDispatch()
    const [group, setGroup] = useState(null)
    const [user, setUser] = useState(null)
    const [role, setRole] = useState(null)
    const form = useForm()

    const loginUser = useSelector(state => state?.auth?.userData)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError, getValues } = form


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


    const listGroup = async (search, loadedOptions, { page }) => {
        // if (user_id)
        const res = await loadGroup({
            async: true,
            page,
            perPage: 25,
            // dispatch,
            jsonData: { search }
        })
        return createAsyncSelectOptions(res, page, "group_name", "group_name", setGroup)
    }

    const handleShow = () => {
        reset()
        setOpen(!open)
        setModal(!open)
        if (edit === null) setEditData(null)

    }

    const handleClose = (from = null) => {
        handleShow()
    }

    const sms_count_failed = Number(watch('sms_count_failed'))
    const sms_count_rejected = Number(watch('sms_count_rejected'))
    const sms_count_delivered = Number(watch('sms_count_delivered'))
    const sms_count_invalid = Number(watch('sms_count_invalid'))

    const total = sms_count_failed + sms_count_rejected + sms_count_delivered + sms_count_invalid

    // also do it for mobile count
    const mobile_count_failed = Number(watch('mobile_count_failed'))
    const mobile_count_rejected = Number(watch('mobile_count_rejected'))
    const mobile_count_delivered = Number(watch('mobile_count_delivered'))
    const mobile_count_invalid = Number(watch('mobile_count_invalid'))

    const mobile_total = mobile_count_failed + mobile_count_rejected + mobile_count_delivered + mobile_count_invalid

    const handleSave = (data) => {
        if (edit?.id) {
            updateUserReport({
                id: edit?.id,
                jsonData: {
                    ...data,
                    user_id: loginUser?.userType === 1 || loginUser?.userType === 2 ? loginUser?.id : data?.user_id,
                    sms_count_submission: total,
                    mobile_count_submission: mobile_total

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
            createUserReport({
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
                modalClass="modal-lg"
                handleSave={handleSubmit(handleSave)}
                disableSave={loading}
                title={isValid(edit?.id) ? 'Edit User Monthly Report' : 'Create User Monthly Report'}>
                <form>
                    <CardBody>
                        <Row>
                            <Hide IF={loginUser?.userType === 1 || loginUser?.userType === 2}>
                                <Col md="6">
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
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    async
                                    type={"select"}
                                    control={control}
                                    name="group_name"
                                    isClearable
                                    defaultOptions
                                    value={edit?.group_name}
                                    loadOptions={listGroup}
                                    className='mb-1'
                                    label="Template Group"
                                    errors={errors}
                                    options={group}
                                    rules={{ required: false }}

                                />
                            </Col>
                            {/* <p>{totalSMS}</p> */}
                            <Col md="6" xs="12" >

                                <FormGroupCustom
                                    type={"select"}
                                    control={control}
                                    name="month"
                                    value={edit?.month}
                                    isClearable
                                    className='mb-1'
                                    label="Month"
                                    errors={errors}
                                    // label={FM("vacation-trip")}

                                    options={createConstSelectOptions(Months)}
                                    rules={{ required: true }}

                                />
                            </Col>

                            <Col md="6" xs="12" >

                                <FormGroupCustom
                                    type={"select"}
                                    control={control}
                                    name="year"
                                    value={edit?.year}
                                    isClearable
                                    className='mb-1'
                                    label="Year"
                                    errors={errors}
                                    // label={FM("vacation-trip")}

                                    options={getYearList()}
                                    rules={{ required: true }}

                                />
                            </Col>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"select"}
                                    control={control}
                                    name="message_type"
                                    value={edit?.message_type}
                                    isClearable
                                    className='mb-1'

                                    label="Message Type"
                                    errors={errors}
                                    // label={FM("vacation-trip")}

                                    options={createConstSelectOptions(getUserMonthlyReportMessageType)}
                                    rules={{ required: true }}

                                />
                            </Col>

                            <Col md="12" className='mt-1 mb-1'>
                                <h3 className='fw-bolder'>SMS Count</h3>
                            </Col>

                            <Col md="6" xs="12" >


                                {/* <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="sms_count_submission"
                                    value={total}
                                    disabled
                                    label="Total Submission"
                                    errors={errors}
                                    className='mb-1'
                                    rules={{ required: true }}

                                /> */}
                                <Label className=''>Total Submission</Label>
                                <Input
                                    type="number"
                                    label="Total Submission"
                                    name='sms_count_submission'
                                    value={total}
                                    disabled
                                    control={control}
                                    errors={errors}
                                    className='mb-2'
                                />
                            </Col>

                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="sms_count_delivered"
                                    value={edit?.sms_count_delivered}
                                    label="Total Delivered"
                                    className='mb-1'
                                    errors={errors}
                                    rules={{ required: true }}

                                />
                            </Col>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="sms_count_failed"
                                    className='mb-1'
                                    value={edit?.sms_count_failed}
                                    label="Total Failed"
                                    errors={errors}
                                    rules={{ required: true }}

                                />
                            </Col>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="sms_count_rejected"
                                    className='mb-1'
                                    value={edit?.sms_count_rejected}
                                    label="Total Rejected"
                                    errors={errors}
                                    rules={{ required: true }}

                                />
                            </Col>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="sms_count_invalid"
                                    className='mb-1'
                                    value={edit?.sms_count_invalid}
                                    label="Total Invalid"
                                    errors={errors}
                                    rules={{ required: true }}

                                />
                            </Col>
                            <Col md="12" className='mt-1 mb-1'>
                                <h3 className='fw-bolder'>Mobile Count</h3>
                            </Col>

                            <Col md="6" xs="12" >
                                {/* <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="mobile_count_submission"
                                    disabled
                                    value={edit?.mobile_count_submission}
                                    label="Total Submission"
                                    errors={errors}
                                    className='mb-1'
                                    rules={{ required: true }}

                                /> */}
                                <Label className=''>Total Submission</Label>
                                <Input
                                    type="number"
                                    label="Total Submission"
                                    name='mobile_count_submission'
                                    value={mobile_total}
                                    disabled
                                    control={control}
                                    errors={errors}
                                    className='mb-2'
                                />
                            </Col>

                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="mobile_count_delivered"
                                    value={edit?.mobile_count_delivered}
                                    label="Total Delivered"
                                    className='mb-1'
                                    errors={errors}
                                    rules={{ required: true }}

                                />
                            </Col>

                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="mobile_count_failed"
                                    className='mb-1'
                                    value={edit?.mobile_count_failed}
                                    label="Total Failed"
                                    errors={errors}
                                    rules={{ required: true }}

                                />
                            </Col>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="mobile_count_rejected"
                                    className='mb-1'
                                    value={edit?.mobile_count_rejected}
                                    label="Total Rejected"
                                    errors={errors}
                                    rules={{ required: true }}

                                />
                            </Col>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="mobile_count_invalid"
                                    className='mb-1'
                                    value={edit?.mobile_count_invalid}
                                    label="Total Invalid"
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
