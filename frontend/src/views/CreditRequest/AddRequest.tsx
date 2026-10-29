// @ts-nocheck
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { CardBody, Col, Row } from 'reactstrap'
import { actionFor } from '../../utility/Const'
import { createConstSelectOptions } from '../../utility/Utils'
import { addCreditRequest } from '../../utility/apis/creditRequest'
import { isValidArray } from '../../utility/helpers/common'
import FormGroupCustom from '../components/formGroupCustom'
import CenteredModal from '../components/modal/CenteredModal'

export default function AddRequest({ edit = null, noView = false, modal = false, setModal = () => { }, showModal = false, setShowModal = () => { }, Component = "span", children = null, ...rest }) {

    const [open, setOpen] = useState(false)
    const [primary, setPrimary] = useState(null)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])

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

    const handleSave = (data) => {
        addCreditRequest({
            jsonData: {
                ...data
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
                disableSave = {loading}
                title="Add Credit Request">
                <form>
                    <CardBody>
                        <Row>
                            <Col md="6">
                            <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="credit_request"
                                    className='mb-1'
                                    label="Credit Request"
                                    errors={errors}
                                    min = "1"
                                    rules={{ required: true, min : 1 }}
                                />
                            </Col>
                            <Col md = "6">
                            <FormGroupCustom
                                        // noLabel
                                        // noGroup
                                        type={"select"}
                                        control={control}
                                        name="route_type"
                                        // value={edit?.userType}
                                        isClearable
                                        className='mb-1'
                                        label="Route Type "
                                        errors={errors}
                                        options={createConstSelectOptions(actionFor)}
                                        rules={{ required: true }}

                                    />
                            </Col>
                            <Col md="12">
                            <FormGroupCustom
                                    type={"textarea"}
                                    control={control}
                                    name="comment"
                                    className='mb-1'
                                    label="Comment"
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
