// @ts-nocheck
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { CardBody, Col, Row } from 'reactstrap'
import { replyCreditRequest } from '../../utility/apis/creditRequest'
import FormGroupCustom from '../components/formGroupCustom'
import CenteredModal from '../components/modal/CenteredModal'

export default function ReplyCreditRequest({ edit = null, preload, noView = false, modal = false, setModal = () => { }, showModal = false, setShowModal = () => { }, Component = "span", children = null, ...rest }) {

    const [open, setOpen] = useState(false)
    const [primary, setPrimary] = useState(null)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])

    const dispatch = useDispatch()
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form


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
        replyCreditRequest({
            credit_request_id: edit?.id,
            jsonData: {
                credit_request_id: edit?.id,
                ...data
            },
            loading: setLoading,
            dispatch,
            success: (e) => {
                handleClose()
                preload()
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
                disableSave={loading}
                handleSave={handleSubmit(handleSave)}
                title="Reply">
                <form>
                    <CardBody>
                        <Row>
                            <Col md="12">
                            <FormGroupCustom
                                    type={"textarea"}
                                    control={control}
                                    name="request_reply"
                                    className='mb-1'
                                    label="Request Reply"
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
