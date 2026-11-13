// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { CardBody, Col, Row, Badge, Button } from 'reactstrap'
import { Users, Briefcase, CheckSquare, UploadCloud, Shield, Check, Lock, MapPin, Globe } from 'react-feather'
import { AuthorityType, createUserType, forResellerUserType } from '../../utility/Const'
import Hide from '../../utility/Hide'
import Show from '../../utility/Show'
import { createConstSelectOptions } from '../../utility/Utils'
import { addUser, editUser } from '../../utility/apis/userManagement'
import { isValid, isValidArray } from '../../utility/helpers/common'
import httpConfig from '../../utility/http/httpConfig'
import DropZone from '../components/fileUploader'
import FormGroupCustom from '../components/formGroupCustom'
import CenteredModal from '../components/modal/CenteredModal'

const PERMISSION_GROUPS = [
    {
        category: "Live Chat & Inbox",
        items: [
            { id: "chat:reply", label: "Live Chat Reply", desc: "Reply to inbound WhatsApp customer messages" }
        ]
    },
    {
        category: "Broadcasts & Messages",
        items: [
            { id: "campaign:create", label: "Create Broadcasts", desc: "Launch bulk WhatsApp campaigns" },
            { id: "campaign:cancel", label: "Cancel Broadcasts", desc: "Pause or cancel scheduled broadcasts" }
        ]
    },
    {
        category: "Contacts & Audience",
        items: [
            { id: "contacts:read", label: "View Contacts", desc: "Browse contact groups & subscribers" },
            { id: "contacts:write", label: "Manage Contacts", desc: "Upload, import, and delete contacts" }
        ]
    },
    {
        category: "WhatsApp Templates",
        items: [
            { id: "templates:read", label: "View Templates", desc: "View approved WhatsApp templates" },
            { id: "templates:write", label: "Create Templates", desc: "Create and submit templates to Meta" }
        ]
    },
    {
        category: "Team & Administration",
        items: [
            { id: "users:read", label: "View Users", desc: "View child accounts and team members" },
            { id: "users:write", label: "Manage Users", desc: "Create, edit, and delete child accounts" },
            { id: "billing:transfer", label: "Transfer Credits", desc: "Allocate credits to managed accounts" },
            { id: "admin:write", label: "System & Webhooks", desc: "Configure Cloud API, webhooks & security" }
        ]
    }
]

const DEFAULT_PERMISSIONS_BY_ROLE = {
    0: ['campaign:create', 'campaign:cancel', 'chat:reply', 'contacts:read', 'contacts:write', 'templates:read', 'templates:write', 'users:read', 'users:write', 'billing:transfer', 'admin:write'],
    1: ['campaign:create', 'campaign:cancel', 'chat:reply', 'contacts:read', 'contacts:write', 'templates:read', 'users:read', 'users:write', 'billing:transfer'],
    2: ['campaign:create', 'chat:reply', 'contacts:read', 'contacts:write', 'templates:read'],
    3: ['chat:reply', 'contacts:read', 'templates:read']
}

export const OPERATION_PROFILES = [
    {
        label: "Live Chat Support Agent (Shared Team Inbox)",
        value: "chat_agent",
        permissions: ['chat:reply', 'contacts:read', 'templates:read']
    },
    {
        label: "Campaign & Broadcast Specialist (Bulk Messaging)",
        value: "campaign_manager",
        permissions: ['campaign:create', 'campaign:cancel', 'contacts:read', 'contacts:write', 'templates:read']
    },
    {
        label: "Audience & Contacts Manager",
        value: "contacts_manager",
        permissions: ['contacts:read', 'contacts:write', 'templates:read']
    },
    {
        label: "Template & Content Author",
        value: "template_author",
        permissions: ['templates:read', 'templates:write', 'contacts:read']
    },
    {
        label: "Reseller Partner Manager (Multi-Account & Billing)",
        value: "reseller",
        permissions: ['campaign:create', 'campaign:cancel', 'chat:reply', 'contacts:read', 'contacts:write', 'templates:read', 'users:read', 'users:write', 'billing:transfer']
    },
    {
        label: "Full Administrator (All Capabilities)",
        value: "admin",
        permissions: ['campaign:create', 'campaign:cancel', 'chat:reply', 'contacts:read', 'contacts:write', 'templates:read', 'templates:write', 'users:read', 'users:write', 'billing:transfer', 'admin:write']
    },
    {
        label: "Custom Configuration (Select Below)",
        value: "custom",
        permissions: []
    }
]

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
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
    const [selectedProfile, setSelectedProfile] = useState<string>("custom")
    const dispatch = useDispatch()
    const loginUser = useSelector(state => state.auth.userData)

    const form = useForm({
        defaultValues: {
            userType: 2,
            name: '',
            email: '',
            username: '',
            password: '',
            mobile: '',
            address: '',
            city: '',
            zipcode: '',
            companyName: '',
            websiteUrl: '',
            designation: '',
            authority_type: 1,
            locktimeout: 30,
            allow_to_add_webhook: false,
            allow_detail_report: true,
            is_visible_dlt_template_group: false,
            companyLogo: ''
        }
    })

    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError } = form
    const currentUserType = watch("userType")

    // Sync default permissions when role changes
    const handleRoleChange = (roleVal: number) => {
        const numericRole = Number(roleVal)
        const defaults = DEFAULT_PERMISSIONS_BY_ROLE[numericRole] || DEFAULT_PERMISSIONS_BY_ROLE[2]
        setSelectedPermissions(defaults)
        const matched = OPERATION_PROFILES.find(p => p.value !== "custom" && p.permissions.length === defaults.length && p.permissions.every(x => defaults.includes(x)))
        setSelectedProfile(matched ? matched.value : "custom")
    }

    const handleOperationProfileChange = (profileVal: string) => {
        setSelectedProfile(profileVal)
        const matched = OPERATION_PROFILES.find(p => p.value === profileVal)
        if (matched && matched.value !== "custom") {
            setSelectedPermissions(matched.permissions)
        }
    }

    const togglePermission = (permId: string) => {
        setSelectedProfile("custom")
        setSelectedPermissions(prev =>
            prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
        )
    }

    const handleSelectAllPermissions = () => {
        setSelectedProfile("admin")
        const all = PERMISSION_GROUPS.flatMap(g => g.items.map(i => i.id))
        setSelectedPermissions(all)
    }

    const handleClearAllPermissions = () => {
        setSelectedProfile("custom")
        setSelectedPermissions([])
    }

    const handleShow = () => {
        const initialRole = edit?.userType ?? 2
        let initialPerms: string[] = []

        if (edit?.permissions && Array.isArray(edit.permissions)) {
            initialPerms = edit.permissions.map(p => typeof p === 'string' ? p : p.name)
        } else {
            initialPerms = DEFAULT_PERMISSIONS_BY_ROLE[initialRole] || DEFAULT_PERMISSIONS_BY_ROLE[2]
        }
        setSelectedPermissions(initialPerms)
        const matched = OPERATION_PROFILES.find(p => p.value !== "custom" && p.permissions.length === initialPerms.length && p.permissions.every(x => initialPerms.includes(x)))
        setSelectedProfile(matched ? matched.value : "custom")

        reset({
            userType: initialRole,
            name: edit?.name || '',
            email: edit?.email || '',
            username: edit?.username || edit?.user_name || '',
            password: '',
            mobile: edit?.mobile || '',
            address: edit?.address || '',
            city: edit?.city || '',
            zipcode: edit?.zipcode || edit?.zipCode || '',
            companyName: edit?.companyName || edit?.company_name || '',
            websiteUrl: edit?.websiteUrl || edit?.website_url || '',
            designation: edit?.designation || '',
            authority_type: edit?.authority_type || edit?.authorityType || 1,
            locktimeout: edit?.locktimeout || 30,
            allow_to_add_webhook: edit?.allow_to_add_webhook === 1 || edit?.is_add_webhook === true,
            allow_detail_report: edit?.allow_detail_report === 1 || edit?.is_detail_report === true,
            is_visible_dlt_template_group: edit?.is_visible_dlt_template_group === 1 || edit?.is_visible_dlt_template_group === true,
            companyLogo: edit?.companyLogo || edit?.company_logo || ''
        })
        setOpen(true)
        setModal(true)
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
        const numType = Number(data?.userType ?? 2)
        let mappedRole = 'operator'
        if (numType === 0) mappedRole = 'admin'
        else if (numType === 1) mappedRole = 'reseller'
        else if (numType === 2) mappedRole = 'operator' // Client uses operator backend role
        else if (numType === 3) mappedRole = 'viewer'   // Employee / Viewer

        const payload = {
            ...data,
            name: String(data?.name || '').trim(),
            email: String(data?.email || '').trim().toLowerCase(),
            username: String(data?.username || '').trim(),
            user_name: String(data?.username || '').trim(),
            password: data?.password,
            userType: numType,
            role: mappedRole,
            mobile: String(data?.mobile || '').trim(),
            address: String(data?.address || '').trim(),
            city: String(data?.city || '').trim(),
            zipcode: String(data?.zipcode || '').trim(),
            companyName: String(data?.companyName || '').trim(),
            company_name: String(data?.companyName || '').trim(),
            websiteUrl: String(data?.websiteUrl || '').trim(),
            website_url: String(data?.websiteUrl || '').trim(),
            designation: String(data?.designation || '').trim(),
            authority_type: Number(data?.authority_type || 1),
            authorityType: Number(data?.authority_type || 1),
            locktimeout: Number(data?.locktimeout || 30),
            allow_to_add_webhook: data?.allow_to_add_webhook ? 1 : 2,
            is_add_webhook: Boolean(data?.allow_to_add_webhook),
            allow_detail_report: data?.allow_detail_report ? 1 : 2,
            is_detail_report: Boolean(data?.allow_detail_report),
            is_visible_dlt_template_group: data?.is_visible_dlt_template_group ? 1 : 2,
            companyLogo: data?.companyLogo || '',
            permissions: selectedPermissions
        }

        const handleApiErrors = (e) => {
            // Map structured Zod / backend validation details directly to form inputs
            const details = e?.data?.details || e?.response?.data?.details
            if (Array.isArray(details)) {
                details.forEach(item => {
                    const field = item?.path?.[0]
                    if (field) {
                        setError(field === 'user_name' ? 'username' : field, {
                            type: 'manual',
                            message: item?.message || 'Invalid value'
                        })
                    }
                })
            }
            const d = e?.data?.data
            if (d && typeof d === 'object') {
                for (const key in d) {
                    if (Object.prototype.hasOwnProperty.call(d, key)) {
                        if (isValidArray(d[key])) {
                            const message = d[key]?.map(a => `${a}`).join(', ')
                            setError(key, { message, type: "validate" })
                        }
                    }
                }
            }
        }

        if (edit?.id) {
            editUser({
                id: edit?.id,
                jsonData: payload,
                dispatch,
                loading: setLoading,
                success: () => handleClose(),
                errors: handleApiErrors
            })
        } else {
            addUser({
                jsonData: payload,
                loading: setLoading,
                dispatch,
                success: () => handleClose(),
                errors: handleApiErrors
            })
        }
    }

    // Role options based on logged-in user authority
    const roleOptions = [
        ...(loginUser?.userType === 0 ? [{ label: "Admin (Full Platform Access)", value: 0 }] : []),
        { label: "Reseller (Multi-Client Manager)", value: 1 },
        { label: "Client (WhatsApp Business Account)", value: 2 },
        { label: "Employee / Operator (Live Chat & Operations)", value: 3 }
    ]

    const authorityOptions = [
        { label: "On Delivered", value: 1 },
        { label: "On Submission", value: 2 }
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
                title={isValid(edit) ? `Edit User: ${edit?.name}` : "Add User"}
            >
                <form onSubmit={handleSubmit(handleSave)}>
                    <CardBody className='p-3'>
                        {/* Section 1: Core Credentials */}
                        <div className='d-flex align-items-center mb-2 pb-1 border-bottom'>
                            <div className='avatar bg-light-primary rounded me-1 p-50'>
                                <Users size={18} className='text-primary' />
                            </div>
                            <div>
                                <h5 className='mb-0 fw-bolder text-dark'>User Credentials &amp; Account Role</h5>
                                <small className='text-muted'>Required fields to establish login identity</small>
                            </div>
                        </div>

                        <Row className='gy-1 mb-3'>
                            <Col md="6" xs="12">
                                <FormGroupCustom
                                    type={"select"}
                                    control={control}
                                    name="userType"
                                    value={watch("userType") ?? 2}
                                    label="User Type *"
                                    errors={errors}
                                    options={roleOptions}
                                    onChangeValueSelect={opt => handleRoleChange(opt?.value)}
                                    rules={{ required: "User Type is required" }}
                                />
                            </Col>
                            <Col md="6" xs="12">
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="name"
                                    value={edit?.name}
                                    label="Name *"
                                    placeholder="Enter full name"
                                    rules={{ required: "Name is required" }}
                                    errors={errors}
                                />
                            </Col>
                            <Col md="6" xs="12">
                                <FormGroupCustom
                                    type={"email"}
                                    control={control}
                                    name="email"
                                    value={edit?.email}
                                    label="Email *"
                                    placeholder="user@example.com"
                                    errors={errors}
                                    rules={{
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Enter a valid email"
                                        }
                                    }}
                                />
                            </Col>
                            <Col md="6" xs="12">
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="username"
                                    value={edit?.username || edit?.user_name}
                                    label="User Name *"
                                    placeholder="Choose unique username"
                                    errors={errors}
                                    rules={{ required: "User Name is required" }}
                                />
                            </Col>
                            <Col md="6" xs="12">
                                <FormGroupCustom
                                    type={"password"}
                                    control={control}
                                    name="password"
                                    label={edit ? "Password (Leave blank to keep unchanged)" : "Password *"}
                                    placeholder="Min. 6 characters"
                                    errors={errors}
                                    rules={{
                                        required: edit ? false : "Password is required",
                                        minLength: { value: 6, message: "Min. 6 characters" }
                                    }}
                                />
                            </Col>
                            <Col md="6" xs="12">
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="mobile"
                                    value={edit?.mobile}
                                    label="Mobile *"
                                    placeholder="+91 9876543210"
                                    rules={{ required: "Mobile number is required" }}
                                    errors={errors}
                                />
                            </Col>
                        </Row>

                        {/* Section 2: Address & Organization Profile */}
                        <div className='d-flex align-items-center mb-2 pb-1 border-bottom'>
                            <div className='avatar bg-light-success rounded me-1 p-50'>
                                <MapPin size={18} className='text-success' />
                            </div>
                            <div>
                                <h5 className='mb-0 fw-bolder text-dark'>Address &amp; Business Information</h5>
                                <small className='text-muted'>Address, organization, and designation details</small>
                            </div>
                        </div>

                        <Row className='gy-1 mb-3'>
                            <Col md="12" xs="12">
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="address"
                                    value={edit?.address}
                                    label="Address *"
                                    placeholder="Enter physical address / premises"
                                    rules={{ required: "Address is required" }}
                                    errors={errors}
                                />
                            </Col>
                            <Col md="6" xs="12">
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="city"
                                    value={edit?.city}
                                    label="City"
                                    placeholder="e.g. Mumbai"
                                    errors={errors}
                                />
                            </Col>
                            <Col md="6" xs="12">
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="zipcode"
                                    value={edit?.zipcode || edit?.zipCode}
                                    label="ZipCode"
                                    placeholder="e.g. 400001"
                                    errors={errors}
                                />
                            </Col>
                            <Col md="6" xs="12">
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="companyName"
                                    value={edit?.companyName || edit?.company_name}
                                    label="Company Name"
                                    placeholder="e.g. KRAD Technologies"
                                    errors={errors}
                                />
                            </Col>
                            <Col md="6" xs="12">
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="websiteUrl"
                                    value={edit?.websiteUrl || edit?.website_url}
                                    label="Website Url"
                                    placeholder="https://example.com"
                                    errors={errors}
                                />
                            </Col>
                            <Col md="6" xs="12">
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="designation"
                                    value={edit?.designation}
                                    label="Designation"
                                    placeholder="e.g. Account Manager"
                                    errors={errors}
                                />
                            </Col>
                            <Col md="6" xs="12">
                                <FormGroupCustom
                                    type={"select"}
                                    control={control}
                                    name="authority_type"
                                    value={watch("authority_type") ?? 1}
                                    label="Authority Type"
                                    options={authorityOptions}
                                    errors={errors}
                                />
                            </Col>
                            <Col md="6" xs="12">
                                <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="locktimeout"
                                    value={watch("locktimeout") ?? 30}
                                    label="Locktimeout (Minutes)"
                                    placeholder="Session lock time (min: 10)"
                                    errors={errors}
                                    rules={{ min: 10, max: 1440 }}
                                />
                            </Col>
                        </Row>

                        {/* Section 3: Feature Toggles */}
                        <div className='d-flex align-items-center mb-2 pb-1 border-bottom'>
                            <div className='avatar bg-light-warning rounded me-1 p-50'>
                                <Globe size={18} className='text-warning' />
                            </div>
                            <div>
                                <h5 className='mb-0 fw-bolder text-dark'>Integration &amp; Reporting Permissions</h5>
                                <small className='text-muted'>Manage webhooks, detail reporting and template group access</small>
                            </div>
                        </div>

                        <Row className='gy-2 mb-3'>
                            <Col md="4" xs="12">
                                <div className='d-flex align-items-center justify-content-between p-2 border rounded' style={{ background: '#f8fafc' }}>
                                    <div className='pe-1'>
                                        <div className='fw-bold text-dark' style={{ fontSize: '0.9rem' }}>Allow To Add Webhook</div>
                                        <small className='text-muted'>Register external callback URLs</small>
                                    </div>
                                    <FormGroupCustom
                                        noLabel
                                        type={"checkbox"}
                                        control={control}
                                        name="allow_to_add_webhook"
                                    />
                                </div>
                            </Col>
                            <Col md="4" xs="12">
                                <div className='d-flex align-items-center justify-content-between p-2 border rounded' style={{ background: '#f8fafc' }}>
                                    <div className='pe-1'>
                                        <div className='fw-bold text-dark' style={{ fontSize: '0.9rem' }}>Allow To Detail Report</div>
                                        <small className='text-muted'>Export logs &amp; message analytics</small>
                                    </div>
                                    <FormGroupCustom
                                        noLabel
                                        type={"checkbox"}
                                        control={control}
                                        name="allow_detail_report"
                                    />
                                </div>
                            </Col>
                            <Col md="4" xs="12">
                                <div className='d-flex align-items-center justify-content-between p-2 border rounded' style={{ background: '#f8fafc' }}>
                                    <div className='pe-1'>
                                        <div className='fw-bold text-dark' style={{ fontSize: '0.9rem' }}>Visible DLT Template Group</div>
                                        <small className='text-muted'>Access template groups</small>
                                    </div>
                                    <FormGroupCustom
                                        noLabel
                                        type={"checkbox"}
                                        control={control}
                                        name="is_visible_dlt_template_group"
                                    />
                                </div>
                            </Col>
                        </Row>

                        {/* Section 4: Operational Permissions Multi-Selector */}
                        <div className='d-flex align-items-center justify-content-between mb-2 pb-1 border-bottom'>
                            <div className='d-flex align-items-center'>
                                <div className='avatar bg-light-info rounded me-1 p-50'>
                                    <Shield size={18} className='text-info' />
                                </div>
                                <div>
                                    <h5 className='mb-0 fw-bolder text-dark'>Operation Permissions</h5>
                                    <small className='text-muted'>Select operational profile dropdown or customize granular capabilities</small>
                                </div>
                            </div>
                            <div className='d-flex gap-1'>
                                <Button.Ripple size='sm' color='flat-primary' onClick={handleSelectAllPermissions} type='button'>
                                    Select All
                                </Button.Ripple>
                                <Button.Ripple size='sm' color='flat-secondary' onClick={handleClearAllPermissions} type='button'>
                                    Clear
                                </Button.Ripple>
                            </div>
                        </div>

                        {/* Operation Permissions Preset Dropdown */}
                        <Row className='mb-3'>
                            <Col md="12">
                                <label className='form-label fw-bold text-dark' style={{ fontSize: '0.88rem' }}>
                                    Operation Permissions Profile <span className='text-danger'>*</span>
                                </label>
                                <select
                                    className='form-select form-control'
                                    value={selectedProfile}
                                    onChange={(e) => handleOperationProfileChange(e.target.value)}
                                    style={{ height: '42px', fontSize: '0.9rem', borderColor: '#cbd5e1' }}
                                >
                                    {OPERATION_PROFILES.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <small className='text-muted mt-25 d-block' style={{ fontSize: '0.78rem' }}>
                                    Selecting a profile instantly assigns recommended operational capabilities. You can further refine individual switches below.
                                </small>
                            </Col>
                        </Row>

                        <div className='mb-3'>
                            {PERMISSION_GROUPS.map((group, gIdx) => (
                                <div key={gIdx} className='mb-2'>
                                    <div className='fw-bold text-muted text-uppercase mb-1' style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                                        {group.category}
                                    </div>
                                    <Row className='g-1'>
                                        {group.items.map(item => {
                                            const isChecked = selectedPermissions.includes(item.id)
                                            return (
                                                <Col md="6" xs="12" key={item.id}>
                                                    <div
                                                        role='button'
                                                        onClick={() => togglePermission(item.id)}
                                                        className={`p-2 border rounded d-flex align-items-start justify-content-between transition-all ${isChecked ? 'border-primary bg-light-primary' : 'bg-white'}`}
                                                        style={{ cursor: 'pointer', minHeight: '68px' }}
                                                    >
                                                        <div className='pe-2'>
                                                            <div className='fw-bolder text-dark d-flex align-items-center gap-1' style={{ fontSize: '0.88rem' }}>
                                                                <span>{item.label}</span>
                                                                {isChecked && <Badge color='primary' pill style={{ fontSize: '0.65rem' }}>Active</Badge>}
                                                            </div>
                                                            <small className='text-muted d-block mt-25' style={{ fontSize: '0.78rem' }}>
                                                                {item.desc}
                                                            </small>
                                                        </div>
                                                        <div className='form-check form-switch'>
                                                            <input
                                                                className='form-check-input'
                                                                type='checkbox'
                                                                checked={isChecked}
                                                                onChange={() => togglePermission(item.id)}
                                                                style={{ cursor: 'pointer' }}
                                                            />
                                                        </div>
                                                    </div>
                                                </Col>
                                            )
                                        })}
                                    </Row>
                                </div>
                            ))}
                        </div>

                        {/* Section 5: Brand Avatar / Company Logo */}
                        <div className='d-flex align-items-center mb-2 pb-1 border-bottom'>
                            <div className='avatar bg-light-secondary rounded me-1 p-50'>
                                <UploadCloud size={18} className='text-secondary' />
                            </div>
                            <div>
                                <h5 className='mb-0 fw-bolder text-dark'>Upload File (Company Logo / Avatar)</h5>
                                <small className='text-muted'>Brand avatar for account display</small>
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
                                    value={isValid(edit?.companyLogo || edit?.company_logo) ? `${httpConfig.baseUrl2}${edit?.companyLogo || edit?.company_logo}` : null}
                                    name={edit?.companyLogo || edit?.company_logo}
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
