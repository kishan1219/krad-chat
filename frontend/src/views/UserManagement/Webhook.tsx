// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { CardBody, Col, Row } from 'reactstrap'
import { setWebhookUrl } from '../../utility/apis/userManagement'
import { isValidArray } from '../../utility/helpers/common'
import FormGroupCustom from '../components/formGroupCustom'
import CenteredModal from '../components/modal/CenteredModal'
// import ContactEmergency from '@mui/icons-material/ContactEmergency'

export default function Webhook({ edit = null, noView = false, modal = false, setModal = () => { }, preload, Component = "span", showModal = false, setShowModal = () => { }, children = null, ...rest }) {

    const [open, setOpen] = useState(false)
    const [secondary, setSecondary] = useState(null)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])

    const dispatch = useDispatch()
    const form = useForm({
        defaultValues: {
            ratio: 0
        }
    })
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

        setWebhookUrl({
            jsonData: {
                ...data
                // user_id: edit?.id,
                // webhook_url: watch("webhook_url")

            },
            loading: setLoading,
            dispatch,
            success: (e) => {
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
        // }
    }

    useEffect(() => {
        setValue('webhook_url', edit?.webhook_url)

    }, [edit])

    return (
        <>
            {!noView ? <Component role="button" onClick={handleShow} {...rest}>{children}</Component> : null}
            <CenteredModal
                loading={loading}
                open={open}
                scrollControl={false}
                handleModal={handleClose}
                modalClass="modal-sm"
                handleSave={handleSubmit(handleSave)}
                disableSave={loading}
                title={`Webhook (${edit?.name})`}>

                <form>
                    <CardBody>
                        <Row>

                            <Col md="12">
                                <FormGroupCustom
                                    key={edit?.webhook_url}
                                    control={control}
                                    type={"text"}
                                    name={"webhook_url"}
                                    className='mb-1'
                                    defaultValue={edit?.speed_ratio?.webhook_url}
                                    // message={"Ratio must be between 0 & 100"}
                                    placeholder=""
                                    label="Webhook URL"
                                    error={errors?.webhook_url}
                                    message={'Only add Https URL,  Example: https://example.com, Also it only accept 1 webhook url at a time'}
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
