// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { CardBody, Col, Input, Row } from 'reactstrap'
import { loadRole } from '../../../utility/apis/roleList'
import { checkPassword, createAsyncSelectOptions, createConstSelectOptions, createSelectOptions, getFIleBinaries } from '../../../utility/Utils'
import { adminVoiceProcess, syncVoiceTemplateToVendor, uploadVoiceCreate } from '../../../utility/apis/voiceUpload'
import { isValid, isValidArray, log } from '../../../utility/helpers/common'
import CenteredModal from '../../components/modal/CenteredModal'
import FormGroupCustom from '../../components/formGroupCustom'
import { loadSecondaryRoute } from '../../../utility/apis/seconday'
import Show from '../../../utility/Show'

export default function VoiceProcessActionModal({ title = "", edit = null, noView = false, modal = false, setModal = () => { }, showModal = false, setShowModal = () => { }, Component = "span", children = null, ...rest }) {

    const [open, setOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])
    const dispatch = useDispatch()
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError, getValues } = form

    const listSecondary = async (search, loadedOptions, { page }) => {

        const res = await loadSecondaryRoute({
            async: true,
            page,
            perPage: 25,
            jsonData: { name: search, status: 1, gateway_type: 4 }
        })
        return createAsyncSelectOptions(res, page, "sec_route_name", "id", setUser)

    }


    // useEffect(() => {
    //     if (open) {
    //         listAllRoles()
    //     }
    // }, [open])
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

    const handleSave = (d) => {
        if (isValid(edit)) {
            adminVoiceProcess({
                // getFIleBinaries(file)s
                jsonData: {
                    voice_upload_id: edit?.id,
                    primary_route_id: d?.primary_route_id
                },
                loading: setLoading,
                dispatch,
                success: (e) => {
                    handleClose()
                },
                errors: (e) => {
                }
            })

        } else {
            syncVoiceTemplateToVendor({
                jsonData: {
                    ...d
                },
                loading: setLoading,
                dispatch,
                success: (e) => {
                    handleClose()
                },
                errors: (e) => {
                }
            })
        }


    }

    return (
        <>
            {!noView ? <Component role="button" onClick={handleShow} {...rest}>{children}</Component> : null}
            <CenteredModal
                loading={loading}
                open={open}
                scrollControl={false}
                handleModal={handleClose}
                modalClass="modal-sm"
                disableSave={loading}
                handleSave={handleSubmit(handleSave)}
                title={title}>
                <form>

                    <CardBody>
                        <Row>
                            <Col>
                                <FormGroupCustom
                                    async
                                    loadOptions={listSecondary}
                                    type={"select"}
                                    control={control}
                                    name="primary_route_id"
                                    isClearable
                                    className='mb-1'
                                    label="Primary Route"
                                    errors={errors}
                                    options={user}
                                    rules={{ required: false }}

                                />
                            </Col>
                            {/* <FormGroupCustom
                                type={"hidden"}
                                control={control}
                                name="title"
                                noLabel
                                noGroup
                                value={edit?.title}
                                className='mb-1'
                                label="Title"
                                rules={{ required: true }}
                                errors={errors}
                            /> */}
                        </Row>
                    </CardBody>

                </form>
            </CenteredModal>

        </>
    )
}
