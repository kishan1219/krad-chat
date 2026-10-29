// @ts-nocheck
import Avatar from '@components/avatar'
import React, { useEffect, useState } from 'react'
import * as Icon from 'react-feather'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'reactstrap'
import { rescheduleType } from '../../utility/Const'
import Show from '../../utility/Show'
import { createConstSelectOptions } from '../../utility/Utils'
import { repushCampaign } from '../../utility/apis/campaign'
import FormGroupCustom from '../components/formGroupCustom'
import CenteredModal from '../components/modal/CenteredModal'
import { isValidArray } from '../../utility/helpers/common'

export default function ResendCampaign({ edit = null, preload, noView = false, modal = false, setModal = () => { }, Component = "span", showModal = false, setShowModal = () => { }, children = null, ...rest }) {
    const [open, setOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const users = useSelector(state => state.auth.userData)
    const dispatch = useDispatch()
    const form = useForm()
    const [id, setId] = useState(null)

    const [user, setUser] = useState(null)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues, setError } = form


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
        setId(edit?.id)
    }, [edit])

    useEffect(() => {
        if (showModal) handleShow()
    }, [showModal])

    const handleSave = (data) => {
        repushCampaign({
            id: edit?.id,
            jsonData: {
                ...data,
                send_sms_id: edit?.id
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
                title="Restart Campaign">
                <form>
                    <CardBody>
                        <Row>
                            <Col lg={12}>
                                <Row>

                                    <Card className='card-transaction p-0 m-0'>

                                        <CardHeader className='border-bottom '>
                                            <div className='d-flex justify-content-between'>
                                                <CardTitle tag='h6'>Template Name :-  {edit?.dlt_template?.template_name} ({edit?.dlt_template?.dlt_template_id}) </CardTitle>
                                            </div>
                                        </CardHeader>

                                        <CardBody className='p-1'>
                                            <p className='' style={{ fontSize: 13, lineHeight: '30px' }}>  {edit?.message} </p>
                                        </CardBody>
                                        <CardHeader className='border-top '>
                                            <CardTitle tag='h4'>Transactions</CardTitle>
                                        </CardHeader>
                                        <CardBody className='p-1'>
                                            <div className='transaction-item'>
                                                <div className='d-flex'>
                                                    <Avatar className='rounded' color={"primary"} icon={<Icon.User size={18} />} style={{ marginRight: "10px" }} />
                                                    <div className='ml-2'>
                                                        <h6 className='transaction-title'>Contact</h6>
                                                        <small> Total no. of Contact </small>
                                                    </div>
                                                </div>
                                                <div className='fw-bolder'> {edit?.total_contacts} </div>
                                            </div>
                                            <div className='transaction-item'>
                                                <div className='d-flex'>
                                                    <Avatar className='rounded' color={"primary"} icon={<Icon.CreditCard size={18} />} style={{ marginRight: "10px" }} />
                                                    <div>
                                                        <h6 className='transaction-title'>Credit</h6>
                                                        <small> Total no. of Credit Deducted </small>
                                                    </div>
                                                </div>
                                                <div className='fw-bolder'> {edit?.total_credit_deduct} </div>
                                            </div>
                                            <div className='transaction-item'>
                                                <div className='d-flex'>
                                                    <Avatar className='rounded' color={"primary"} icon={<Icon.StopCircle size={18} />} style={{ marginRight: "10px" }} />
                                                    <div>
                                                        <h6 className='transaction-title'>Block</h6>
                                                        <small> Total no. of Block Contact </small>
                                                    </div>
                                                </div>
                                                <div className='fw-bolder'> {edit?.total_block_number} </div>
                                            </div>
                                            <div className='transaction-item'>
                                                <div className='d-flex'>
                                                    <Avatar className='rounded' color={"primary"} icon={<Icon.Send size={18} />} style={{ marginRight: "10px" }} />
                                                    <div>
                                                        <h6 className='transaction-title'>Delivery</h6>
                                                        <small> Total no. of Delivery </small>
                                                    </div>
                                                </div>
                                                <div className='fw-bolder'> {edit?.total_delivered} </div>
                                            </div>
                                            <div className='transaction-item mb-1'>
                                                <div className='d-flex'>
                                                    <Avatar className='rounded' color={"primary"} icon={<Icon.PhoneOff size={18} />} style={{ marginRight: "10px" }} />
                                                    <div>
                                                        <h6 className='transaction-title'>Failed</h6>
                                                        <small> Total no. of Failed </small>
                                                    </div>
                                                </div>
                                                <div className='fw-bolder'> {edit?.total_failed} </div>
                                            </div>
                                        </CardBody>
                                        <CardBody className='mt-1 mb-3'>
                                            <Row>
                                                <Col md="6">
                                                    <FormGroupCustom
                                                        type={"select"}
                                                        control={control}
                                                        className='mb-1'
                                                        name="reschedule_type"

                                                        label="Reschedule Type"
                                                        errors={errors}
                                                        options={createConstSelectOptions(rescheduleType)}
                                                        rules={{ required: true }}

                                                    />
                                                </Col>
                                                <Col md="6">
                                                    <FormGroupCustom
                                                        name={"campaign_send_date_time"}
                                                        type={"date"}
                                                        errors={errors}
                                                        label={"Date & Time"}
                                                        options={{
                                                            enableTime: true,
                                                            minDate: Date.now()
                                                        }}
                                                        dateFormat={"YYYY-MM-DD HH:mm:ss"}
                                                        setValue={setValue}
                                                        className="mb-2"
                                                        control={control}
                                                        rules={{ required: false }}

                                                    />

                                                </Col>
                                                <Show IF={users?.sp_operation === 1} >
                                                    <Col md="6">
                                                        <FormGroupCustom
                                                            type={"number"}
                                                            control={control}
                                                            name="ratio_set"
                                                            className='mb-1'
                                                            label="Ratio Set"
                                                            errors={errors}
                                                            rules={{ required: false }}

                                                        />

                                                    </Col>
                                                </Show>

                                                <Show IF={users?.sp_operation === 1} >
                                                    <Col md="6">
                                                        <FormGroupCustom
                                                            type={"number"}
                                                            control={control}
                                                            name="failed_ratio"
                                                            className='mb-1'
                                                            label="Failed Ratio"
                                                            errors={errors}
                                                            rules={{ required: false }}
                                                        />
                                                    </Col>
                                                </Show>
                                            </Row>
                                        </CardBody>
                                    </Card>
                                </Row>
                            </Col>

                        </Row>
                    </CardBody>
                </form>
            </CenteredModal>

        </>
    )
}
