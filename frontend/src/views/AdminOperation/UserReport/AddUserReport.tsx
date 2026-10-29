// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { set, useFieldArray, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Button, CardBody, Col, Input, Label, Row } from 'reactstrap'
import { createAsyncSelectMultiUserOptions, createAsyncSelectOptions, createConstSelectOptions } from '../../../utility/Utils'
import { loadUserChild } from '../../../utility/apis/userManagement'
import { loadGroup } from '../../../utility/apis/templateGroup'
import { createUserReport, updateUserReport } from '../../../utility/apis/userWiseReport'
import { isValid, isValidArray, log } from '../../../utility/helpers/common'
import CenteredModal from '../../components/modal/CenteredModal'
import FormGroupCustom from '../../components/formGroupCustom'
import { Months, getUserMonthlyReportMessageType, getYearList, getYears } from '../../../utility/Const'
import Hide from '../../../utility/Hide'
import { use } from 'i18next'
import { Permissions } from '../../../utility/Permissions'
import Show from '../../../utility/Show'

export default function AddUserReport({ edit = null, noView = false, modal = false, setModal = () => { }, preload, showModal = false, setShowModal = () => { }, Component = "span", children = null, ...rest }) {
    const [open, setOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [loadRoles, setLoadRoles] = useState(false)
    const dispatch = useDispatch()
    const [group, setGroup] = useState(null)
    const [user, setUser] = useState(null)
    const [role, setRole] = useState(null)
    const form = useForm()

    const canViewTemplate = Permissions?.dltIsVisible
    const loginUser = useSelector(state => state?.auth?.userData)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError, getValues } = form

    const { fields: custom, append: customAppend, prepend: customPrepend, remove: customRemove, swap: customSwap, move: customMove, insert: customInsert } = useFieldArray({
        control: form.control, // control props comes from useForm (optional: if you are using FormContext)
        name: "submissions" // unique name for your Field Array,
    })

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


    // const listGroup = async (search, loadedOptions, { page }) => {
    //     // if (user_id)
    //     const res = await loadGroup({
    //         async: true,
    //         page,
    //         perPage: 25,
    //         // dispatch,
    //         jsonData: { search }
    //     })
    //     return createAsyncSelectOptions(res, page, "group_name", "group_name", setGroup)
    // }

    const listGroup = () => {
        loadGroup({
            loading: setLoading,
            dispatch,
            jsonData: { user_id: loginUser?.userType === 1 || loginUser?.userType === 2 ? loginUser?.id : watch('user_id') },
            success: (e) => {
                customRemove()
                setGroup(e)
                if (isValidArray(e?.data)) {
                    for (let i = 0; i < e?.data?.length; i++) {
                        const element = e?.data[i]
                        log(element, 'element')
                        customAppend({
                            group_id: element?.id,
                            group_name: element?.group_name,
                            sms_count_submission: "",
                            sms_count_delivered: "",
                            sms_count_failed: "",
                            sms_count_rejected: "",
                            sms_count_invalid: "",
                            mobile_count_submission: "",
                            mobile_count_delivered: "",
                            mobile_count_failed: "",
                            mobile_count_rejected: "",
                            mobile_count_invalid: ""
                        })
                    }
                } else {
                    customAppend({
                        group_id: null,
                        group_name: "",
                        sms_count_submission: "",
                        sms_count_delivered: "",
                        sms_count_failed: "",
                        sms_count_rejected: "",
                        sms_count_invalid: "",
                        mobile_count_submission: "",
                        mobile_count_delivered: "",
                        mobile_count_failed: "",
                        mobile_count_rejected: "",
                        mobile_count_invalid: ""

                    })

                }
            }
        })
    }
    useEffect(() => {
        if (open && (watch('user_id') || loginUser?.userType === 1 || loginUser?.userType === 2)) {
            listGroup()
        }
    }, [open, watch('user_id')])

    const handleShow = () => {
        reset()
        setOpen(!open)
        setModal(!open)
        if (edit === null) setEditData(null)

    }

    const handleClose = (from = null) => {
        handleShow()
        customRemove()
    }

    const handleSave = (data) => {
        const submissions = data?.submissions?.map((e, i) => {
            return {
                ...e,
                sms_count_submission: parseInt(e?.sms_count_delivered) + parseInt(e?.sms_count_failed) + parseInt(e?.sms_count_rejected) + parseInt(e?.sms_count_invalid),
                mobile_count_submission: parseInt(e?.mobile_count_delivered) + parseInt(e?.mobile_count_failed) + parseInt(e?.mobile_count_rejected) + parseInt(e?.mobile_count_invalid)
            }
        })

        if (edit?.id) {

            updateUserReport({
                id: edit?.id,
                jsonData: {
                    ...data,
                    user_id: loginUser?.userType === 1 || loginUser?.userType === 2 ? loginUser?.id : data?.user_id,
                    submissions
                },
                dispatch,
                loading: setLoading,
                success: (d) => {
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
        } else {
            createUserReport({
                jsonData: {
                    ...data,
                    user_id: loginUser?.userType === 1 || loginUser?.userType === 2 ? loginUser?.id : data?.user_id,
                    submissions
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
    log(group, 'teaea')
    log(watch('totalSubmission'), 'totalSubmission')


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
                                <Col md="4">
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

                            <Col md="4" xs="12" >

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

                            <Col md="4" xs="12" >

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
                            <Col md="4" xs="12" >

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
                        </Row>

                        <div className=''>
                            {custom?.map((c, i) => {
                                const totalSubmission = (
                                    (parseInt(watch(`submissions[${i}].sms_count_invalid`)) || 0) +
                                    (parseInt(watch(`submissions[${i}].sms_count_rejected`)) || 0) +
                                    (parseInt(watch(`submissions[${i}].sms_count_failed`)) || 0) +
                                    (parseInt(watch(`submissions[${i}].sms_count_delivered`)) || 0)
                                    // (parseInt(watch(`submissions[${i}].sms_count_submission`)) || 0)
                                )
                                const totalMobileSubmission = (
                                    (parseInt(watch(`submissions[${i}].mobile_count_rejected`)) || 0) +
                                    (parseInt(watch(`submissions[${i}].mobile_count_invalid`)) || 0) +
                                    (parseInt(watch(`submissions[${i}].mobile_count_failed`)) || 0) +
                                    (parseInt(watch(`submissions[${i}].mobile_count_delivered`)) || 0)
                                )
                                return (
                                    <>
                                        <h3 className='fw-bolder mt-1'>  {c?.group_name} </h3>

                                        <Row key={c.id} className='mt-1 mb-1 p-1 border-bottom'>
                                            <Col md='12' className='mt-1'>
                                                <p className='fw-bolder'>SMS Count</p>
                                            </Col>
                                            <Col md="4" className='d-none'>
                                                <FormGroupCustom
                                                    label="Group Name"
                                                    name={`submissions[${i}].group_name`}
                                                    disabled
                                                    type="text"
                                                    // className='pe-none'
                                                    value={c?.group_name}
                                                    control={control}
                                                    errors={errors}
                                                    className='mb-2 pe-none'
                                                />
                                            </Col>

                                            <Col md="4">
                                                <FormGroupCustom
                                                    label="Total Delivered"
                                                    name={`submissions[${i}].sms_count_delivered`}
                                                    type="number"
                                                    value={c?.total_delivered}
                                                    control={control}
                                                    errors={errors}
                                                    className='mb-2'
                                                />
                                            </Col>
                                            <Col md="4">
                                                <FormGroupCustom
                                                    label="Total Failed"
                                                    name={`submissions[${i}].sms_count_failed`}
                                                    type="number"
                                                    // value={c?.total_failed}
                                                    control={control}
                                                    errors={errors}
                                                    className='mb-2'
                                                />
                                            </Col>

                                            <Col md="4">
                                                <FormGroupCustom
                                                    label="Total Rejected"
                                                    name={`submissions[${i}].sms_count_rejected`}
                                                    type="number"
                                                    // value={c?.total_invalid}
                                                    control={control}
                                                    errors={errors}
                                                    className='mb-2'
                                                />
                                            </Col>
                                            <Col md="4">
                                                <FormGroupCustom
                                                    label="Total Invalid"
                                                    name={`submissions[${i}].sms_count_invalid`}
                                                    type="number"
                                                    // value={c?.total_invalid}
                                                    control={control}
                                                    errors={errors}
                                                    className='mb-2'
                                                />
                                            </Col>

                                            <Col md="4">
                                                <FormGroupCustom
                                                    key={totalSubmission}
                                                    label="Total Submission"
                                                    name={`submissions[${i}].sms_count_submission`}
                                                    type="hidden"
                                                    value={totalSubmission}
                                                    disabled
                                                    noLabel
                                                    noGroup
                                                    control={control}
                                                    errors={errors}
                                                    className='mb-2'
                                                />
                                                <Label className=''>Total Submission</Label>
                                                <Input
                                                    type="number"
                                                    label="Total Submission"
                                                    name={`submissions[${i}].sms_count_submission`}
                                                    value={totalSubmission}
                                                    disabled
                                                    control={control}
                                                    errors={errors}
                                                    className='mb-2'
                                                />
                                            </Col>


                                            <Col md='12' className='mt-1'>
                                                <p className='fw-bolder'>Mobile No Count</p>
                                            </Col>

                                            <Col md="4" className='d-none'>
                                                <FormGroupCustom
                                                    label="Group Name"
                                                    name={`submissions[${i}].group_name`}
                                                    disabled
                                                    type="text"
                                                    // className='pe-none'
                                                    value={c?.group_name}
                                                    control={control}
                                                    errors={errors}
                                                    className='mb-2 pe-none'
                                                />
                                            </Col>

                                            <Col md="4">
                                                <FormGroupCustom
                                                    label="Total Delivered"
                                                    name={`submissions[${i}].mobile_count_delivered`}
                                                    type="number"
                                                    value={c?.total_delivered}
                                                    control={control}
                                                    errors={errors}
                                                    className='mb-2'
                                                />
                                            </Col>

                                            <Col md="4">
                                                <FormGroupCustom
                                                    label="Total Failed"
                                                    name={`submissions[${i}].mobile_count_failed`}
                                                    type="number"
                                                    // value={c?.total_failed}
                                                    control={control}
                                                    errors={errors}
                                                    className='mb-2'
                                                />
                                            </Col>

                                            <Col md="4">
                                                <FormGroupCustom
                                                    label="Total Rejected"
                                                    name={`submissions[${i}].mobile_count_rejected`}
                                                    type="number"
                                                    // value={c?.total_invalid}
                                                    control={control}
                                                    errors={errors}
                                                    className='mb-2'
                                                />
                                            </Col>
                                            <Col md="4">
                                                <FormGroupCustom
                                                    label="Total Invalid"
                                                    name={`submissions[${i}].mobile_count_invalid`}
                                                    type="number"
                                                    // value={c?.total_invalid}
                                                    control={control}
                                                    errors={errors}
                                                    className='mb-2'
                                                />
                                            </Col>

                                            <Col md="4">
                                                <FormGroupCustom
                                                    key={totalMobileSubmission}
                                                    label="Total Submission"
                                                    name={`submissions[${i}].mobile_count_submission`}
                                                    type="hidden"
                                                    value={totalMobileSubmission}
                                                    disabled
                                                    noLabel
                                                    noGroup
                                                    control={control}
                                                    errors={errors}
                                                    className='mb-2'
                                                />
                                                <Label className=''>Total Submission</Label>
                                                <Input
                                                    type="number"
                                                    label="Total Submission"
                                                    name={`submissions[${i}].mobile_count_submission`}
                                                    value={totalMobileSubmission}
                                                    disabled
                                                    control={control}
                                                    errors={errors}
                                                    className='mb-2'
                                                />
                                            </Col>

                                        </Row>

                                    </>)
                            })}
                        </div>
                        {/* <div className='text-center'>
                            <Button color="primary" onClick={() => customAppend({
                                group_id: null,
                                group_name: "",
                                total_delivered: "",
                                total_failed: "",
                                total_invalid: "",
                                total_rejected: ""
                            })}>Add Group</Button>
                        </div> */}


                        {/* <Show IF={group?.length > 0 }>
                            hii
                        </Show> */}

                    </CardBody>
                </form>
            </CenteredModal>
        </>
    )


}
