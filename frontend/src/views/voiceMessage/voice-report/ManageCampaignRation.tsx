// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { CardBody, Col } from 'reactstrap'
import { manageVoiceCampaignStatus } from '../../../utility/apis/voiceSMS'
import { createConstSelectOptions } from '../../../utility/Utils'
import { voiceRatioType } from '../../../utility/Const'
import CenteredModal from '../../components/modal/CenteredModal'
import FormGroupCustom from '../../components/formGroupCustom'

export default function ManageCampaignRatio({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", showModal = false, setShowModal = () => { }, children = null, ...rest }) {
    const [open, setOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const users = useSelector(state => state.auth.userData)
    const dispatch = useDispatch()
    const form = useForm()
    const [id, setId] = useState(null)

    const [user, setUser] = useState(null)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form


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
        manageVoiceCampaignStatus({
            id: edit?.id,
            jsonData: {
                ...data,
                voice_sms_id: edit?.id
            },
            dispatch,
            loading: setLoading,
            success: (d) => {
                handleClose()
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
                title="Manage Campaign Ratio">
                <form>
                    <CardBody>
                        <Col md="12">
                            <FormGroupCustom
                                defaultOptions
                                control={control}
                                type={"select"}
                                errors={errors}
                                name={"action_type"}
                                isClearable
                                placeholder="Select Action Type"
                                className='mb-1'
                                options={createConstSelectOptions(voiceRatioType)}
                                label="Priority"
                                rules={{ required: true }}
                            />
                        </Col>


                        {watch("action_type") === "apply_ratio" ? <Col md="12">
                            <FormGroupCustom
                                control={control}
                                type={"number"}
                                errors={"errors"}
                                name={"ratio_percent_to_delivered"}

                                placeholder="Enter Ratio Percentage"
                                label="Ratio Percentage"
                                rules={{ required: true, min: 1 }}

                            />
                        </Col> : ""}
                    </CardBody>
                </form>
            </CenteredModal>

        </>
    )
}
