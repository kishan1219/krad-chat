// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { CardBody, Col, Row } from 'reactstrap'
import { isValidArray } from '../../utility/helpers/common'
import { waPhoneNumberRegister, waPhoneNumberVerified } from '../../utility/apis/whatsappConfig'
import CenteredModal from '../components/modal/CenteredModal'
import FormGroupCustom from '../components/formGroupCustom'


export default function WhatsappPhoneNumberRegister({ edit = null, preload, noView = false,  modal = false, setModal = () => { }, Component = "span", showModal = false, setShowModal = () => { }, children = null, ...rest }) {
    const [open, setOpen] = useState(false)
    const [code, setCode] = useState(null)
    const loginUser = useSelector(state => state.auth.userData)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const [getConfigID, setConfigID] = useState(null)
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
        setShowModal(false)

    }

    useEffect(() => {
        if (showModal) handleShow()
    }, [showModal])

    const handleSave = (data) => {

        waPhoneNumberRegister({
            id: edit?.id,
            jsonData: {
                ...data,
                user_id:edit?.user_id
            },
            loading: setLoading,
            // dispatch,
            success: (e) => {
                 handleClose()
                preload()
                // setConfigData(null)
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
                // modalClass="modal-lg"
                handleSave={handleSubmit(handleSave)}
                disableSave={loading}
                title={'Whatsapp Phone Registration'}>
                <form>
                    <CardBody>
                        <Row>

                            <Col md="12" xs="12" >
                                <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="set_otp_for_register_business_ph_number"
                                    placeholder={"Enter any 6 digit OTP code for register business mobile number"}
                                    className='mb-1'
                                    message={"Enter any 6 digit OTP code for register business mobile number"}
                                    label="Code"
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
