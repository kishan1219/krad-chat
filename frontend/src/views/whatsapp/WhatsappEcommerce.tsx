// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { isValid, isValidArray } from '../../utility/helpers/common'
import { CardBody, Col, Row } from 'reactstrap'
import FormGroupCustom from '../components/formGroupCustom'
import { createConstSelectOptions, makeSelectValues } from '../../utility/Utils'
import { trueFalse, trueOrFalse } from '../../utility/Const'
import { waEcommerceSetting } from '../../utility/apis/whatsappConfig'
import { useDispatch } from 'react-redux'
import CenteredModal from '../components/modal/CenteredModal'

export default function WhatsappEcommerce({ edit = null, preload, noView = false, modal = false, setModal = () => { }, Component = "span", showModal = false, setShowModal = () => { }, children = null, ...rest }) {
    const [open, setOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const form = useForm()
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues, setError } = form
    const handleShow = () => {
        reset()
        setOpen(!open)
        setModal(!open)
        if (edit === null) setEditData(null)

    }

    console.log("edit", edit)
    const handleClose = (from = null) => {
        handleShow()
        setShowModal(false)

    }

    useEffect(() => {
        if (showModal) handleShow()
    }, [showModal])


    // useEffect(() => {
    //     if (edit) {
    //         setValue('is_cart_enabled', makeSelectValues(createConstSelectOptions(trueOrFalse), edit.is_cart_enabled))
    //         setValue('is_catalog_visible', makeSelectValues(createConstSelectOptions(trueFalse), edit.is_catalog_visible))
    //     }
    // }, [edit])


    const handleSave = (data) => {
        waEcommerceSetting({
            wa_configuration_id: edit?.id,
            jsonData: {
                ...data,
                user_id: edit?.user_id
            },
            loading: setLoading,
            dispatch,
            success: (e) => {
                // setStep(3)
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
                modalClass="modal-md"
                handleSave={handleSubmit(handleSave)}
                disableSave={loading}
                title={"Whatsapp E-commerce"}

            >
                <form>
                    <CardBody>
                        <Row>
                            <Col md="12" xs="12" >
                                <FormGroupCustom
                                    type={"select"}
                                    control={control}
                                    name="is_catalog_visible"
                                    className='mb-1'
                                    value={watch("is_catalog_visible") ?? edit?.is_catalog_visible}
                                    message={"You can now enable or disable catalog"}
                                    isClearable
                                    label="Enable Catalog"
                                    errors={errors}
                                    options={createConstSelectOptions(trueFalse)}
                                    rules={{ required: true }}

                                />
                            </Col>
                            <Col md="12" xs="12" >
                                <FormGroupCustom
                                    key={`${edit?.id ?? "is_cart_enabled"}`}
                                    type={"select"}
                                    control={control}
                                    name="is_cart_enabled"
                                    isClearable
                                    label="Enable Cart"
                                    className='mb-1'
                                    errors={errors}
                                    value={watch("is_cart_enabled") ?? edit?.is_cart_enabled}
                                    message={"You can now enable or disable cart"}
                                    options={createConstSelectOptions(trueFalse)}
                                    rules={{ required: true }}

                                />
                            </Col>
                          
                        </Row>

                    </CardBody >
                </form >
            </CenteredModal >
        </>
    )
}
