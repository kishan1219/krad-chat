// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Badge, CardBody, Col, Label, Row } from 'reactstrap'
import { loadUserChild } from '../../utility/apis/userManagement'
import { createAsyncSelectMultiUserOptions } from '../../utility/Utils'
import { addWhatsappConfig, editWhatsappConfig } from '../../utility/apis/whatsappConfig'
import { isValid, isValidArray } from '../../utility/helpers/common'
import CenteredModal from '../components/modal/CenteredModal'
import Show from '../../utility/Show'
import Hide from '../../utility/Hide'
import FormGroupCustom from '../components/formGroupCustom'
import base64 from 'base-64'
import { Check, X } from 'react-feather'


export default function ViewConfigInModal({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", children = null, ...rest }) {

    const [open, setOpen] = useState(false)
    const [primary, setPrimary] = useState(null)
    const loginUser = useSelector(state => state.auth.userData)
    const [editData, setEditData] = useState(edit)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])
    const [dex, setDex] = useState(null)
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


    const verificationColor = (row) => {
        const status = (row?.quality_rating || 'RED').toLowerCase()
        return <span style={{ height: 10, width: 50, backgroundColor: status, display: 'inline-block', borderRadius: 8 }}></span>
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
                // handleSave={handleSubmit(handleSave)}
                disableSave={loading}
                hideSave
                disableFooter
                title={'View Configuration'}>
                <form>
                    <CardBody>
                        <Row className='align-items-start gy-2'>
                            <Col md="12" className={"border-bottom"}>

                                <Label>Basic Info</Label>
                            </Col>
                            <Col md="6">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Name
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {editData?.name ?? 'N/A'}
                                </p>
                            </Col>
                            <Col md="6">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Business Category
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {editData?.business_category ?? 'N/A'}
                                </p>
                            </Col>
                            <Col md="12" className={"border-bottom mt-2 "}>

                                <Label>WABA Number Settings</Label>
                            </Col>
                            <Col md="4">
                                <p className='mb-0 text-dark fw-bolder'>
                                    WABA Id
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {editData?.waba_id ?? 'N/A'}
                                </p>
                            </Col>
                            <Col md="4">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Verified Name
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {editData?.verified_name ?? 'N/A'}
                                </p>
                            </Col>
                            <Col md="4">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Sender Number
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {editData?.sender_number ?? 'N/A'}
                                </p>
                            </Col>
                            <Col md="4">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Business Account Id
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {editData?.business_account_id ?? 'N/A'}
                                </p>
                            </Col>
                            <Col md="4">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Display Phone Number
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {editData?.display_phone_number ?? 'N/A'}
                                </p>
                            </Col>
                            <Col md="4">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Status
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {editData?.wa_status ?? 'N/A'}
                                </p>
                            </Col>
                            <Col md="4">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Quality
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {verificationColor(editData)}
                                </p>
                            </Col>

                            <Col md="4">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Message Limit
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {editData?.messsage_limit ?? 'N/A'}
                                </p>
                            </Col>
                            <Col md="4">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Code Verification Status
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {editData?.code_verification_status ?? 'N/A'}
                                </p>
                            </Col>

                            
                            <Col md="6">
                                <p className='mb-0 text-dark fw-bolder'>
                                    WA Business Page
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {editData?.wa_business_page ?? 'N/A'}
                                </p>
                            </Col>
                            <Col md="6">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Marketing Messages Lite API Status
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {editData?.marketing_messages_lite_api_status ?? 'N/A'}
                                </p>
                            </Col>

                            <Col md="12" className={"border-bottom mt-2 "}>
                                <Label className={""}>WhatsApp Ecommerce</Label>
                            </Col>

                            <Col md="6">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Cart Enabled
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {editData?.is_cart_enabled ? <Check className='text-success' /> : <X className='text-danger' />}
                                </p>
                            </Col>
                            <Col md="6">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Catalog Visible
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {editData?.is_catalog_visible ? <Check className='text-success' /> : <X className='text-danger' />}
                                </p>
                            </Col>


                            <Col md="12" className={"border-bottom mt-2 "}>
                                <Label className={""}>Privacy Settings</Label>
                            </Col>
                            <Col md="4">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Auto Response Enabled?
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {editData?.enable_auto_response ? "Yes" : 'No'}
                                </p>
                            </Col>
                            <Col md="4">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Privacy Read Receipt
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {editData?.privacy_read_receipt ? "Yes" : 'No'}
                                </p>
                            </Col>
                            <Col md="4">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Privacy Deregister Mobile
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {editData?.privacy_deregister_mobile ? "Yes" : 'No'}
                                </p>
                            </Col>
                            <Col md="12">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Auto Response Message
                                </p>
                                <p className='mb-0 fw-bold text-secondary' style={{ whiteSpace: "pre-wrap" }}>
                                    {editData?.auto_response_message ?? 'N/A'}
                                </p>
                            </Col>
                           
                        </Row>
                    </CardBody>
                </form>
            </CenteredModal>
        </>
    )
}
