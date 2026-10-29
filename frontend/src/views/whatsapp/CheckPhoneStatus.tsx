// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { CardBody, Col, Row } from 'reactstrap'
import { isValidArray } from '../../utility/helpers/common'
import { waPhoneNumberVerified } from '../../utility/apis/whatsappConfig'
import CenteredModal from '../components/modal/CenteredModal'
import FormGroupCustom from '../components/formGroupCustom'


export default function CheckPhoneStatus({ edit = null, preload, noView = false, modal = false, setModal = () => { }, Component = "span", setConfigData = () => {}, showModal = false, setShowModal = () => { }, children = null, ...rest }) {
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
        setOpen(true)      // Always open
        setModal(true)
        if (edit === null) setEditData(null)
    }

    const handleClose = (from = null) => {
        setOpen(false)     // Always close
        setModal(false)
        setShowModal(false)
    }

    useEffect(() => {
        if (showModal) handleShow()
    }, [showModal])

    const handleSave = (data) => {

        waPhoneNumberVerified({
            id: edit,
            jsonData: {
                ...data
            },
            loading: setLoading,
            dispatch,
            success: (e) => {
                setOpen(false)
                setShowModal(false)
                setConfigData(null)
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
                title={'Whatsapp Code Verification'}>
                <form>
                    <CardBody>
                        <Row>

                            <Col md="12" xs="12" >
                                <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="code"
                                    placeholder={"Enter Code"}
                                    className='mb-1'
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
