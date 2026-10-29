// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { CardBody, Col, Input, Row } from 'reactstrap'
import { createAsyncSelectOptions, createSelectOptions } from '../../../utility/Utils'
import { bulkVoiceFileAction, uploadVoiceCreate } from '../../../utility/apis/voiceUpload'
import { isValid, isValidArray, log } from '../../../utility/helpers/common'
import CenteredModal from '../../components/modal/CenteredModal'
import FormGroupCustom from '../../components/formGroupCustom'
import { loadUser } from '../../../utility/apis/userManagement'
import Show from '../../../utility/Show'
export default function UploadVoice({ edit = null, noView = false, modal = false, setModal = () => { }, showModal = false, setShowModal = () => { }, Component = "span", children = null, ...rest }) {

    const [open, setOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [loadRoles, setLoadRoles] = useState(false)
    const [file, setFile] = useState({})

    const [dur, setDur] = useState(null)
    const [user, setUser] = useState([])
    const dispatch = useDispatch()
    const [role, setRole] = useState(null)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError, getValues } = form

    const loginUser = useSelector(state => state.auth.userData)

    const listUser = async (search, loadedOptions, { page }) => {

        const res = await loadUser({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectOptions(res, page, "name", "id", setUser)

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
            bulkVoiceFileAction({
                // getFIleBinaries(file)s
                jsonData: {
                    voice_upload_sent_gateway_id: edit?.rows,
                    file_status: d.file_status
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

        } else {
            uploadVoiceCreate({
                // getFIleBinaries(file)s
                jsonData: {
                    ...d,
                    title: d.title,
                    user_id: d.user_id,
                    file_location: file
                },
                loading: setLoading,
                dispatch,
                success: (e) => {
                    log("voice upload success", e)
                    handleClose()
                },
                errors: (e) => {
                    handleClose()
                    log("voice upload error", e)
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
    }


    return (
        <>
            {!noView ? <Component role="button" onClick={handleShow} {...rest}>{children}</Component> : null}
            <CenteredModal
                loading={loading}
                open={open}
                scrollControl={false}
                handleModal={handleClose}
                modalClass={isValid(edit) ? "modal-sm" : "modal-lg"}
                disableSave={loading}
                handleSave={handleSubmit(handleSave)}
                title={isValid(edit) ? edit?.title : "Upload Voice"}>
                <form>
                    <CardBody>
                        <Show IF={!isValid(edit)}>

                            <Row>
                                <Col md="4" xs="12" >
                                    <FormGroupCustom
                                        async

                                        loadOptions={listUser}
                                        type={"select"}
                                        control={control}
                                        name="user_id"
                                        isClearable
                                        className='mb-1'
                                        label="Users"
                                        errors={errors}
                                        options={user}
                                        rules={{ required: false }}

                                    />
                                </Col>

                                <Col md="4" xs="12" >
                                    <FormGroupCustom
                                        type={"text"}
                                        control={control}
                                        name="title"
                                        value={edit?.title}
                                        className='mb-1'
                                        label="Title"
                                        rules={{ required: true }}
                                        errors={errors}
                                    />
                                </Col>

                                <Col md="4">
                                    <FormGroupCustom
                                        // async
                                        // defaultOptions
                                        control={control}
                                        type={"select"}
                                        errors={errors}
                                        name={"file_time_duration"}
                                        isClearable
                                        className='mb-1'
                                        // loadOptions={listSecondary}
                                        options={createSelectOptions([{ id: 30, name: "30 Sec" }, { id: 60, name: "60 Sec" }, { id: 90, name: "90 Sec" }, { id: 120, name: "120 Sec" }], "name", "id")}
                                        label="Duration"
                                        rules={{ required: true }}
                                    />
                                </Col>

                                <h4 className=" mt-0"> Upload File </h4>
                                <Col md="12" >
                                    <Input id="inputFile" type="file" onChange={(e) => { setFile(e.target.files[0]) }} accept="audio/*" name="file" />
                                </Col>
                            </Row>
                        </Show>
                        <Show IF={isValid(edit)}>
                            <Row>
                                <Col>
                                    <FormGroupCustom

                                        type={"select"}
                                        control={control}
                                        name="file_status"
                                        isClearable
                                        className='mb-1'
                                        label="Primary Route"
                                        errors={errors}
                                        options={
                                            [
                                                { label: "Pending", value: 1 },
                                                { label: "Processing", value: 2 },
                                                { label: "Approve", value: 3 },
                                                { label: "Reject", value: 4 }
                                            ]
                                        }
                                        rules={{ required: false }}

                                    />
                                </Col>
                            </Row>
                        </Show>
                    </CardBody>
                </form>
            </CenteredModal>

        </>
    )
}
