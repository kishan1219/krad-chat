// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { CardBody, Col, Row } from 'reactstrap'
import { Users, Briefcase, CheckSquare, UploadCloud } from 'react-feather'
import { createUserType, forResellerUserType } from '../../utility/Const'
import Hide from '../../utility/Hide'
import Show from '../../utility/Show'
import { addUser, editUser } from '../../utility/apis/userManagement'
import { isValid, isValidArray } from '../../utility/helpers/common'
import httpConfig from '../../utility/http/httpConfig'
import DropZone from '../components/fileUploader'
import FormGroupCustom from '../components/formGroupCustom'
import CenteredModal from '../components/modal/CenteredModal'

export default function AddUser({
    edit = null,
    noView = false,
    modal = false,
    setModal = () => { },
    showModal = false,
    setShowModal = () => { },
    Component = "span",
    children = null,
    ...rest
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const form = useForm({
        defaultValues: {
            userType: 2,
            allow_chat_reply: true,
            allow_broadcast: true,
            allow_to_add_webhook: true,
            allow_detail_report: true,
            locktimeout: 30
        }
    })
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError } = form

    const loginUser = useSelector(state => state.auth.userData)

    const handleShow = () => {
        reset({
            userType: edit?.userType ?? 2,
            name: edit?.name || '',
            email: edit?.email || '',
            username: edit?.username || '',
            mobile: edit?.mobile || '',
            companyName: edit?.companyName || '',
            designation: edit?.designation || '',
            city: edit?.city || '',
            locktimeout: edit?.locktimeout || 30,
            allow_chat_reply: true,
            allow_broadcast: true,
            allow_to_add_webhook: edit?.allow_to_add_webhook === 1,
            allow_detail_report: edit?.allow_detail_report === 1,
            companyLogo: edit?.companyLogo || ''
        })
        setOpen(!open)
        setModal(!open)
    }

    const handleClose = () => {
        setOpen(false)
        setModal(false)
        setShowModal(false)
    }

    useEffect(() => {
        if (showModal) handleShow()
    }, [showModal])

    const handleSave = (data) => {
        const mappedRole = Number(data?.userType) === 1
            ? 'reseller'
            : (Number(data?.userType) === 0 ? 'admin' : (Number(data?.userType) === 3 ? 'viewer' : 'operator'))

        const payload = {
            ...data,
            name: data?.name || data?.username || 'Team Member',
            username: data?.username || data?.email,
            email: data?.email,
            password: data?.password,
            userType: Number(data?.userType || 2),
            role: mappedRole,
            mobile: data?.mobile || '',
            companyName: data?.companyName || '',
            designation: data?.designation || '',
            city: data?.city || '',
            locktimeout: data?.locktimeout ? String(data?.locktimeout) : "30",
            allow_to_add_webhook: data?.allow_to_add_webhook ? 1 : 2,
            allow_detail_report: data?.allow_detail_report ? 1 : 2,
            allow_chat_reply: data?.allow_chat_reply ? 1 : 2
        }

        if (edit?.id) {
            editUser({
                id: edit?.id,
                jsonData: payload,
                dispatch,
                loading: setLoading,
                success: () => handleClose(),
                errors: (e) => {
                    const d = e?.data?.data
                    for (const key in d) {
                        if (Object.hasOwnProperty.call(d, key)) {
                            if (isValidArray(d[key])) {
                                const message = d[key]?.map(a => `${a} \n`).join('')
                                setError(key, { message, type: "validate" })
                            }
                        }
                    }
                }
            })
        } else {
            addUser({
                jsonData: payload,
                loading: setLoading,
                dispatch,
                success: () => handleClose(),
                errors: (e) => {
                    const d = e?.data?.data
                    for (const key in d) {
                        if (Object.hasOwnProperty.call(d, key)) {
                            if (isValidArray(d[key])) {
                                const message = d[key]?.map(a => `${a} \n`).join('')
                                setError(key, { message, type: "validate" })
                            }
                        }
                    }
                }
            })
        }
    }

    const roleOptions = [
        { label: "Client (WhatsApp Business Account)", value: 2 },
        { label: "Team Agent / Operator (Live Chat & Campaigns)", value: 3 },
        { label: "Reseller Partner (Multi-Client Manager)", value: 1 }
    ]

    return (
        <>
            {!noView ? <Component role="button" onClick={handleShow} {...rest}>{children}</Component> : null}
            <CenteredModal
                loading={loading}
                open={open}
                scrollControl={true}
                handleModal={handleClose}
                modalClass="modal-lg"
                disableSave={loading}
                handleSave={handleSubmit(handleSave)}
                title={isValid(edit) ? `Edit User: ${edit?.name}` : "Add Team Member / Client"}
            >
                <form onSubmit={handleSubmit(handleSave)}>
                    <CardBody className='p-3'>
                        {/* Subheader info card */}
                        <div className='p-2 mb-3 rounded' style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                            <h6 className='fw-bolder mb-25' style={{ color: '#059669' }}>
                                WhatsApp Cloud Platform User Setup
                            </h6>
                            <p className='small text-muted mb-0'>
                                Assign credentials and operational permissions for agents handling customer conversations, broadcasts, and automations.
                            </p>
                        </div>

                        {/* Section 1: Account Credentials */}
                        <div className='d-flex align-items-center mb-2 pb-1 border-bottom'>
                            <div className='avatar bg-light-primary rounded me-1 p-50'>
                                <Users size={18} className='text-primary' />
                            </div>
                            <div>
                                <h5 className='mb-0 fw-bolder text-dark'>Account Credentials &amp; Role</h5>
                                <small className='text-muted'>Define user role, login identity, and authentication details</small>
                            </div>
                        </div>

                        <Row className='gy-1 mb-3'>
                            <Col md="6" xs="12">
                                <FormGroupCustom
                                    type={"select"}
                                    control={control}
                                    name="userType"
                                    value={watch("userType") ?? 2}
                                    isDisabled={isValid(edit)}
                                    label="Account Role *"
                                    errors={errors}
                                    options={roleOptions}
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md="6" xs="12">
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="name"
                                    value={edit?.name}
                                    label="Full Name *"
                                    placeholder="e.g. Rahul Sharma"
                                    rules={{ required: true }}
                                    errors={errors}
                                />
                            </Col>
                            <Col md="6" xs="12">
                                <FormGroupCustom
                                    type={"email"}
                                    control={control}
                                    name="email"
                                    value={edit?.email}
                                    label="Work Email *"
                                    placeholder="agent@company.com"
                                    errors={errors}
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Hide IF={edit}>
                                <Col md="6" xs="12">
                                    <FormGroupCustom
                                        type={"password"}
                                        control={control}
                                        name="password"
                                        label="Login Password *"
                                        placeholder="Min. 6 characters"
                                        errors={errors}
                                        rules={{ required: !edit, minLength: 6 }}
                                    />
                                </Col>
                            </Hide>
                        </Row>

                        {/* Section 2: Contact & Business Profile */}
                        <div className='d-flex align-items-center mb-2 pb-1 border-bottom'>
                            <div className='avatar bg-light-success rounded me-1 p-50'>
                                <Briefcase size={18} className='text-success' />
                            </div>
                            <div>
                                <h5 className='mb-0 fw-bolder text-dark'>Business &amp; Contact Information</h5>
                                <small className='text-muted'>Organization identity and communication parameters</small>
                            </div>
                        </div>

                        <Row className='gy-1 mb-3'>
                            <Col md="6" xs="12">
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="mobile"
                                    value={edit?.mobile}
                                    label="Mobile / WhatsApp Number *"
                                    placeholder="+91 9876543210"
                                    rules={{ required: true }}
                                    errors={errors}
                                />
                            </Col>
                            <Col md="6" xs="12">
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="companyName"
                                    value={edit?.companyName}
                                    label="Company / Brand Name"
                                    placeholder="e.g. KRAD Technologies"
                                    errors={errors}
                                />
                            </Col>
                            <Col md="6" xs="12">
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="designation"
                                    value={edit?.designation}
                                    label="Designation / Role Title"
                                    placeholder="e.g. Customer Support Lead"
                                    errors={errors}
                                />
                            </Col>
                            <Col md="6" xs="12">
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="city"
                                    value={edit?.city}
                                    label="City / Headquarters"
                                    placeholder="e.g. Mumbai"
                                    errors={errors}
                                />
                            </Col>
                        </Row>

                        {/* Section 3: Feature Permissions */}
                        <div className='d-flex align-items-center mb-2 pb-1 border-bottom'>
                            <div className='avatar bg-light-info rounded me-1 p-50'>
                                <CheckSquare size={18} className='text-info' />
                            </div>
                            <div>
                                <h5 className='mb-0 fw-bolder text-dark'>Operational Permissions</h5>
                                <small className='text-muted'>Enable or restrict platform access privileges</small>
                            </div>
                        </div>

                        <Row className='gy-2 mb-3'>
                            <Col md="6" xs="12">
                                <div className='d-flex align-items-center justify-content-between p-2 border rounded' style={{ background: '#f8fafc' }}>
                                    <div className='pe-1'>
                                        <div className='fw-bold text-dark' style={{ fontSize: '0.92rem' }}>Live Chat Responses</div>
                                        <small className='text-muted'>Reply to inbound WhatsApp messages in Shared Team Inbox</small>
                                    </div>
                                    <FormGroupCustom
                                        noLabel
                                        type={"checkbox"}
                                        control={control}
                                        name="allow_chat_reply"
                                        defaultChecked={true}
                                    />
                                </div>
                            </Col>
                            <Col md="6" xs="12">
                                <div className='d-flex align-items-center justify-content-between p-2 border rounded' style={{ background: '#f8fafc' }}>
                                    <div className='pe-1'>
                                        <div className='fw-bold text-dark' style={{ fontSize: '0.92rem' }}>Broadcast &amp; Campaigns</div>
                                        <small className='text-muted'>Send bulk WhatsApp template campaigns to opt-in contacts</small>
                                    </div>
                                    <FormGroupCustom
                                        noLabel
                                        type={"checkbox"}
                                        control={control}
                                        name="allow_broadcast"
                                        defaultChecked={true}
                                    />
                                </div>
                            </Col>
                            <Col md="6" xs="12">
                                <div className='d-flex align-items-center justify-content-between p-2 border rounded' style={{ background: '#f8fafc' }}>
                                    <div className='pe-1'>
                                        <div className='fw-bold text-dark' style={{ fontSize: '0.92rem' }}>Webhook Integrations</div>
                                        <small className='text-muted'>Register external callback URLs for real-time delivery events</small>
                                    </div>
                                    <FormGroupCustom
                                        noLabel
                                        type={"checkbox"}
                                        control={control}
                                        name="allow_to_add_webhook"
                                        defaultChecked={true}
                                    />
                                </div>
                            </Col>
                            <Col md="6" xs="12">
                                <div className='d-flex align-items-center justify-content-between p-2 border rounded' style={{ background: '#f8fafc' }}>
                                    <div className='pe-1'>
                                        <div className='fw-bold text-dark' style={{ fontSize: '0.92rem' }}>Analytics &amp; Detailed Reports</div>
                                        <small className='text-muted'>Export delivery receipts, message logs &amp; performance metrics</small>
                                    </div>
                                    <FormGroupCustom
                                        noLabel
                                        type={"checkbox"}
                                        control={control}
                                        name="allow_detail_report"
                                        defaultChecked={true}
                                    />
                                </div>
                            </Col>
                        </Row>

                        {/* Section 4: Brand Avatar / Company Logo */}
                        <div className='d-flex align-items-center mb-2 pb-1 border-bottom'>
                            <div className='avatar bg-light-secondary rounded me-1 p-50'>
                                <UploadCloud size={18} className='text-secondary' />
                            </div>
                            <div>
                                <h5 className='mb-0 fw-bolder text-dark'>Profile Avatar / Company Logo</h5>
                                <small className='text-muted'>Upload brand avatar for WhatsApp profile display</small>
                            </div>
                        </div>

                        <Row>
                            <Col md="12">
                                <FormGroupCustom
                                    noLabel
                                    name={"companyLogo"}
                                    type={"hidden"}
                                    errors={errors}
                                    control={control}
                                    rules={{ required: false }}
                                />
                                <DropZone
                                    value={isValid(edit?.companyLogo) ? `${httpConfig.baseUrl2}${edit?.companyLogo}` : null}
                                    name={edit?.companyLogo}
                                    accept="image/png, image/jpeg, image/webp"
                                    onSuccess={e => setValue("companyLogo", e[0]?.file_name)}
                                />
                            </Col>
                        </Row>
                    </CardBody>
                </form>
            </CenteredModal>
        </>
    )
}
