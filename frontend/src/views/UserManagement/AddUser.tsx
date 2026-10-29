// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { CardBody, Col, Row } from 'reactstrap'
import { AuthorityType, accountType, createUserType, forResellerUserType } from '../../utility/Const'
import Hide from '../../utility/Hide'
import Show from '../../utility/Show'
import { checkPassword, createConstSelectOptions, createSelectOptions } from '../../utility/Utils'
import { loadRole } from '../../utility/apis/roleList'
import { addUser, editUser } from '../../utility/apis/userManagement'
import { isValid, isValidArray } from '../../utility/helpers/common'
import httpConfig from '../../utility/http/httpConfig'
import DropZone from '../components/fileUploader'
import FormGroupCustom from '../components/formGroupCustom'
import CenteredModal from '../components/modal/CenteredModal'

export default function AddUser({ edit = null, noView = false, modal = false, setModal = () => { }, showModal = false, setShowModal = () => { }, Component = "span", children = null, ...rest }) {

    const [open, setOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [loadRoles, setLoadRoles] = useState(false)
    const [user, setUser] = useState([])
    const dispatch = useDispatch()
    const [role, setRole] = useState(null)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError, getValues } = form

    const loginUser = useSelector(state => state.auth.userData)

    const listAllRoles = () => {
        loadRole({
            perPage: 1000,
            loading: setLoadRoles,
            dispatch,
            success: (e) => {
                setRole(createSelectOptions(e?.data?.data, "actual_name", "id"))
            }

        })
    }

    useEffect(() => {
        if (open) {
            listAllRoles()
        }
    }, [open])
    const handleShow = () => {
        reset()
        setOpen(!open)
        setModal(!open)
        if (edit === null) setEditData(null)

    }
    const handleClose = (from = null) => {
        handleShow()
        setShowModal(false)
    }
    useEffect(() => {
        if (showModal) handleShow()
    }, [showModal])

    const handleSave = (data) => {
        if (edit?.id) {
            editUser({
                id: edit?.id,
                jsonData: {
                    ...data,
                    is_visible_dlt_template_group: data?.is_visible_dlt_template_group === 1 ? 1 : 2,
                    allow_to_add_webhook: data?.allow_to_add_webhook === 1 ? 1 : 2,
                    allow_detail_report: data?.allow_detail_report === 1 ? 1 : 2
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
            addUser({
                jsonData: {
                    ...data,
                    locktimeout: data?.locktimeout ? data?.locktimeout : "10",
                    is_visible_dlt_template_group: data?.is_visible_dlt_template_group === 1 ? 1 : 2,
                    allow_to_add_webhook: data?.allow_to_add_webhook === 1 ? 1 : 2,
                    allow_detail_report: data?.allow_detail_report === 1 ? 1 : 2

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
                modalClass="modal-xl"
                disableSave={loading}
                handleSave={handleSubmit(handleSave)}
                title={isValid(edit) ? edit?.name : "Add User"}>
                <form>
                    <CardBody>
                        <Row>
                            <Hide IF={loginUser?.userType === 1}>
                                <Col md="3" xs="12" >

                                    <FormGroupCustom
                                        type={"select"}
                                        control={control}
                                        name="userType"
                                        value={edit?.userType}
                                        isClearable
                                        isDisabled={isValid(edit)}
                                        label="User Type"
                                        errors={errors}
                                        // label={FM("vacation-trip")}

                                        options={createConstSelectOptions(createUserType)}
                                        rules={{ required: true }}

                                    />
                                </Col>
                            </Hide>

                            <Show IF={loginUser?.userType === 1}>
                                <Col md="3" xs="12" >

                                    <FormGroupCustom
                                        type={"select"}
                                        control={control}
                                        name="userType"
                                        value={edit?.userType}
                                        isClearable
                                        label="User Type"
                                        isDisabled={isValid(edit)}

                                        errors={errors}
                                        // label={FM("vacation-trip")}
                                        options={createConstSelectOptions(forResellerUserType)}
                                        rules={{ required: true }}

                                    />
                                </Col>
                            </Show>
                            {watch("userType") === 3 ? <Col md="3">

                                <FormGroupCustom

                                    defaultOptions
                                    value={edit?.roles[0]?.id}
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"role_id"}
                                    isClearable
                                    className='mb-1'
                                    isDisabled={isValid(edit)}

                                    loadOptions={listAllRoles}

                                    options={role}

                                    label="Role Type"
                                    rules={{ required: true }}

                                />
                            </Col> : ""}
                            <Col md="3" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="name"
                                    value={edit?.name}
                                    className='mb-1'
                                    label="Name"
                                    rules={{ required: true }}
                                    errors={errors}
                                />
                            </Col>
                            <Col md="3" xs="12" >
                                <FormGroupCustom
                                    type={"email"}
                                    control={control}
                                    name="email"
                                    value={edit?.email}
                                    className='mb-1'
                                    label="Email"
                                    errors={errors}
                                    rules={{ required: true }}

                                />
                            </Col>
                            <Col md="3" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="username"
                                    value={edit?.username}
                                    className='mb-1'
                                    label="User Name"
                                    errors={errors}
                                    rules={{ required: true }}

                                />
                            </Col>
                            <Hide IF={edit} >
                                <Col md="3" xs="12" >
                                    <FormGroupCustom
                                        type={"password"}
                                        control={control}
                                        name="password"
                                        value={edit?.password}
                                        message={"Password Must Be of 8 Character including atleast a Uppercase Letter, a Lowercase, a Number & a Special Character"}
                                        className='mb-1'
                                        minLength="6"
                                        label="Password"
                                        errors={errors}
                                        rules={{ required: true, validate: checkPassword }}

                                    />
                                </Col>
                            </Hide>
                            <Col md="3" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="mobile"
                                    value={edit?.mobile}
                                    className='mb-1'
                                    label="Mobile"
                                    message={"Mobile Number Must Be between 10 to 12 Character"}

                                    rules={{ required: true, minLength: "10", maxLength: "12" }}
                                    errors={errors}
                                />
                            </Col>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="address"
                                    value={edit?.address}
                                    className='mb-1'
                                    label="Address"
                                    errors={errors}
                                    rules={{ required: true }}

                                />
                            </Col>
                            <Col md="3" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="city"
                                    value={edit?.city}
                                    className='mb-1'
                                    label="City"
                                    errors={errors}
                                    rules={{ required: false }}

                                />
                            </Col>
                            <Col md="3" xs="12" >
                                <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="zipCode"
                                    value={edit?.zipCode}
                                    className='mb-1'
                                    label="ZipCode"
                                    errors={errors}
                                    rules={{ required: false, minLength: "6", maxLength: "6" }}

                                />
                            </Col>
                            <Col md="3" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="companyName"
                                    value={edit?.companyName}
                                    className='mb-1'
                                    label="Company Name"
                                    errors={errors}
                                    rules={{ required: false }}

                                />
                            </Col>

                            <Col md="3" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="websiteUrl"
                                    value={edit?.websiteUrl}
                                    className='mb-1'
                                    label="Website Url"
                                    errors={errors}
                                    rules={{ required: false }}

                                />
                            </Col>
                            <Col md="3" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="designation"
                                    value={edit?.designation}
                                    className='mb-1'
                                    label="Designation"
                                    errors={errors}
                                    rules={{ required: false }}

                                />
                            </Col>
                            <Hide IF={loginUser?.userType === 1}>
                                <Col md="3" xs="12" >
                                    <FormGroupCustom
                                        type={"select"}
                                        control={control}
                                        name="authority_type"
                                        value={edit?.authority_type ?? 2}
                                        // defaultOptions = {2}
                                        // value = {"2"}
                                        isClearable
                                        label="Authority Type"
                                        errors={errors}
                                        // label={FM("vacation-trip")}
                                        options={createConstSelectOptions(AuthorityType)}
                                        rules={{ required: false }}

                                    />

                                </Col>
                            </Hide>
                            <Show IF={(loginUser?.userType === 0 || loginUser?.userType === 3) && (watch('userType') === 1 || watch('userType') === 2)}>

                                <Col md="3" xs="12" >

                                    <FormGroupCustom
                                        type={"select"}
                                        control={control}
                                        name="account_type"
                                        value={edit?.account_type}
                                        isClearable
                                        label="Account Type"
                                        // isDisabled={isValid(edit)}

                                        errors={errors}
                                        // label={FM("vacation-trip")}
                                        options={createConstSelectOptions(accountType)}
                                        rules={{ required: true }}

                                    />
                                </Col>
                            </Show>
                            <Col md="3" xs="12" >
                                <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="locktimeout"
                                    value={edit?.locktimeout}
                                    className='mb-1'
                                    message={"Minimum locktimeout is 10 min & max 120"}
                                    label="Locktimeout"
                                    placeholder="Enter time in minutes"
                                    errors={errors}
                                    rules={{ required: false, min: "10" }}


                                />
                            </Col>
                            <Col md="3" xs="12" >
                                <FormGroupCustom
                                    type={"checkbox"}
                                    control={control}
                                    name="is_visible_dlt_template_group"
                                    value={edit?.is_visible_dlt_template_group}
                                    className='mt-2'
                                    // message={"Minimum locktimeout is 10 min & max 120"}
                                    label="Is Visible DLT Template Group"
                                    // placeholder="Enter time in minutes"
                                    errors={errors}
                                    rules={{ required: false }}


                                />
                            </Col>
                            <Col md="3" xs="12" >
                                <FormGroupCustom
                                    type={"checkbox"}
                                    control={control}
                                    name="allow_to_add_webhook"
                                    value={edit?.allow_to_add_webhook}
                                    className='mt-2'
                                    // message={"Minimum locktimeout is 10 min & max 120"}
                                    label="Allow To Add Webhook"
                                    // placeholder="Enter time in minutes"
                                    errors={errors}
                                    rules={{ required: false }}


                                />
                            </Col>
                            <Col md="3" xs="12" >
                                <FormGroupCustom
                                    type={"checkbox"}
                                    control={control}
                                    name="allow_detail_report"
                                    value={edit?.allow_detail_report}
                                    className='mt-2'
                                    // message={"Minimum locktimeout is 10 min & max 120"}
                                    label="Allow To Detail Report"
                                    // placeholder="Enter time in minutes"
                                    errors={errors}
                                    rules={{ required: false }}


                                />
                            </Col>

                            <h4 className="mb-3 mt-2"> Upload File </h4>
                            <Col md="12" >
                                <FormGroupCustom
                                    noLabel
                                    name={"companyLogo"}
                                    type={"hidden"}
                                    errors={errors}
                                    control={control}
                                    // accept="image/*"
                                    accept="image/png, image/gif, image/jpeg"
                                    rules={{ required: false }}
                                    values={edit?.companyLogo}

                                />
                                <DropZone value={isValid(edit?.companyLogo) ? `${httpConfig.baseUrl2}${edit?.companyLogo}` : null} name={edit?.companyLogo} accept="image/png, image/gif, image/jpeg" onSuccess={e => setValue("companyLogo", e[0]?.file_name)} />

                            </Col>
                        </Row>
                    </CardBody>
                </form>
            </CenteredModal>

        </>
    )
}
