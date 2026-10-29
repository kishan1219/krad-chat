// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { CardBody, Col, Row } from 'reactstrap'
import { checkPassword } from '../../../utility/Utils'
import { resetPasswordByUser } from '../../../utility/apis/userManagement'
import { isValidArray } from '../../../utility/helpers/common'
import FormGroupCustom from '../../components/formGroupCustom'
import CenteredModal from '../../components/modal/CenteredModal'

export default function ResetUserPassword({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", showModal = false, setShowModal = () => { }, children = null, ...rest }) {

    const [open, setOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])
    const dispatch = useDispatch()
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError, getValues } = form
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
        resetPasswordByUser({
            jsonData: {
                ...data,
                user_id: edit?.id
            },
            loading: setLoading,
            success: () => {
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
                disableSave={loading}
                handleSave={handleSubmit(handleSave)}
                title={`Change Password  (${edit?.name})`}>
                <form>
                    <CardBody>

                        <Row>

                            <Col md="12">
                                <FormGroupCustom
                                    type={"password"}
                                    control={control}
                                    name="password"
                                    message={"Password Must Be of 8 Character including atleast a Uppercase Letter, a Lowercase, a Number & a Special Character"}
                                    // value={edit?.route_name}
                                    className='mb-1'
                                    label="New Password"
                                    errors={errors}
                                    rules={{ required: true, validate: checkPassword }}
                                />
                            </Col>
                            <Col md="12">
                                <FormGroupCustom
                                    type={"password"}
                                    control={control}
                                    message={"Password Must Be of 8 Character including atleast a Uppercase Letter, a Lowercase, a Number & a Special Character"}
                                    name="password_confirmation"
                                    // value={edit?.route_name}
                                    className='mb-1'
                                    label="Confirm Password"
                                    errors={errors}
                                    rules={{ required: true, validate : checkPassword }}
                                />
                            </Col>
                        </Row>

                    </CardBody>
                </form>
            </CenteredModal>
        </>
    )
}
