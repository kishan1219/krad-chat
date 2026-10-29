// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { CardBody, Col, Input, Row } from 'reactstrap'
import { setUserRatio } from '../../utility/apis/userManagement'
import { isValidArray } from '../../utility/helpers/common'
import FormGroupCustom from '../components/formGroupCustom'
import CenteredModal from '../components/modal/CenteredModal'
// import ContactEmergency from '@mui/icons-material/ContactEmergency'

export default function AdminRatioSet({ edit = null, noView = false, modal = false, setModal = () => { }, preload, Component = "span", showModal = false, setShowModal = () => { }, children = null, ...rest }) {

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
        setTimeout(() => {
            setValue("ratio", Number(edit?.r_per_this))
        }, 1000)
    }, [edit])

    useEffect(() => {
        if (showModal) handleShow()
    }, [showModal])


    const handleSave = (data) => {

        setUserRatio({
            jsonData: {
                ...data,
                user_id: edit?.id,
                r_per_this: watch("ratio"),
                whatsapp_f_sms : watch("whatsapp_f_sms"),
                whatsapp_sms : watch("whatsapp_sms"),
                voice_f_sms : watch("voice_f_sms"),
                voice_sms : watch("voice_sms"),
                two_way_f_sms : watch("two_way_f_sms"),
                two_way_sms : watch("two_way_sms"),
                promo_text_f_sms : watch("promo_text_f_sms"),
                promo_text_sms : watch("promo_text_sms"),
                trans_text_sms : watch("trans_text_sms"),
                trans_text_f_sms : watch("trans_text_f_sms")

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
        setValue('trans_text_sms', edit?.speed_ratio?.trans_text_sms)
        setValue('promo_text_sms', edit?.speed_ratio?.promo_text_sms)
        setValue('two_way_sms', edit?.speed_ratio?.two_way_sms)
        setValue('voice_sms', edit?.speed_ratio?.voice_sms)
        setValue('whatsapp_sms', edit?.speed_ratio?.whatsapp_sms)
        setValue('trans_text_f_sms', edit?.speed_ratio?.trans_text_f_sms)
        setValue('promo_text_f_sms', edit?.speed_ratio?.promo_text_f_sms)
        setValue('two_way_f_sms', edit?.speed_ratio?.two_way_f_sms)
        setValue('voice_f_sms', edit?.speed_ratio?.voice_f_sms)
        setValue('whatsapp_f_sms', edit?.speed_ratio?.whatsapp_f_sms)

    }, [edit])

    return (
        <>
            {!noView ? <Component role="button" onClick={handleShow} {...rest}>{children}</Component> : null}
            <CenteredModal
                loading={loading}
                open={open}
                scrollControl={false}
                handleModal={handleClose}
                modalClass="modal-lg"
                handleSave={handleSubmit(handleSave)}
                disableSave={loading}
                title={`Set Ratio (${edit?.name})`}>

                <form>
                    <CardBody>
                        <Row>

                            <div className='fw-bolder text-primary'>Delivered</div>
                            {/* <Col md="12">
                                <FormGroupCustom
                                    key={edit?.r_per_this}
                                    control={control}
                                    type={"number"}
                                    name={"ratio"}
                                    defaultValue={edit?.r_per_this}
                                    message={"Ratio must be between 0 & 100"}
                                    placeholder="Enter Ratio"
                                    label="Set Ratio"

                                    rules={{ required: true, min: 0, max: 100 }}

                                />

                            </Col> */}
                            <Col md="4">
                                <FormGroupCustom
                                    key={edit?.speed_ratio?.trans_text_sms}
                                    control={control}
                                    type={"number"}
                                    name={"trans_text_sms"}
                                    defaultValue={edit?.speed_ratio?.trans_text_sms}
                                    // message={"Ratio must be between 0 & 100"}
                                    placeholder=""
                                    label="Transaction Text SMS"
                                    className='mb-1'

                                    rules={{ required: true, min: 0, max: 100 }}
                                />
                            </Col>

                            <Col md="4">
                                <FormGroupCustom
                                    key={edit?.speed_ratio?.promo_text_sms}
                                    control={control}
                                    type={"number"}
                                    name={"promo_text_sms"}
                                    defaultValue={edit?.speed_ratio?.promo_text_sms}
                                    // message={"Ratio must be between 0 & 100"}
                                    placeholder=""
                                    label="Promotion Text SMS"
                                    className='mb-1'

                                   rules={{ required: true, min: 0, max: 100 }}

                                />
                            </Col>
                            <Col md="4">
                                <FormGroupCustom
                                    key={edit?.speed_ratio?.two_way_sms}
                                    control={control}
                                    type={"number"}
                                    name={"two_way_sms"}
                                    defaultValue={edit?.speed_ratio?.two_way_sms}
                                    // message={"Ratio must be between 0 & 100"}
                                    placeholder=""
                                    label="Two Way SMS"
                                    className='mb-1'

                                   rules={{ required: true, min: 0, max: 100 }}

                                />
                            </Col>
                            <Col md="4">
                                <FormGroupCustom
                                    key={edit?.speed_ratio?.voice_sms}
                                    control={control}
                                    type={"number"}
                                    name={"voice_sms"}
                                    defaultValue={edit?.speed_ratio?.voice_sms}
                                    // message={"Ratio must be between 0 & 100"}
                                    placeholder=""
                                    label="Voice SMS"
                                    className='mb-1'

                                   rules={{ required: true, min: 0, max: 100 }}

                                />
                            </Col>
                            <Col md="4">
                                <FormGroupCustom
                                    key={edit?.speed_ratio?.whatsapp_sms}
                                    control={control}
                                    type={"number"}
                                    name={"whatsapp_sms"}
                                    className='mb-1'
                                    defaultValue={edit?.speed_ratio?.whatsapp_sms}
                                    // message={"Ratio must be between 0 & 100"}
                                    placeholder=""
                                    label="Whatsapp SMS"

                                   rules={{ required: true, min: 0, max: 100 }}

                                />
                            </Col>

                            <hr />
                            <div className='fw-bolder text-danger'>Failed</div>
                            {/* <Col md="12">
                                <FormGroupCustom
                                    key={edit?.speed_ratio?.r_per_this}
                                    control={control}
                                    type={"number"}
                                    name={"ratio"}
                                    defaultValue={edit?.speed_ratio?.r_per_this}
                                    message={"Ratio must be between 0 & 100"}
                                    placeholder="Enter Ratio"
                                    label="Set Ratio"

                                    rules={{ required: true, min: 0, max: 100 }}

                                />

                            </Col> */}
                            <Col md="4">
                                <FormGroupCustom
                                    key={edit?.speed_ratio?.trans_text_f_sms}
                                    control={control}
                                    type={"number"}
                                    name={"trans_text_f_sms"}
                                    defaultValue={edit?.speed_ratio?.trans_text_f_sms}
                                    // message={"Ratio must be between 0 & 100"}
                                    placeholder=""
                                    label="Transaction Text SMS"
                                    className='mb-1'

                                   rules={{ required: true, min: 0, max: 100 }}

                                />
                            </Col>

                            <Col md="4">
                                <FormGroupCustom
                                    key={edit?.speed_ratio?.promo_text_f_sms}
                                    control={control}
                                    type={"number"}
                                    name={"promo_text_f_sms"}
                                    defaultValue={edit?.speed_ratio?.promo_text_f_sms}
                                    // message={"Ratio must be between 0 & 100"}
                                    placeholder=""
                                    label="Promotion Text SMS"
                                    className='mb-1'

                                   rules={{ required: true, min: 0, max: 100 }}

                                />
                            </Col>
                            <Col md="4">
                                <FormGroupCustom
                                    key={edit?.speed_ratio?.two_way_f_sms}
                                    control={control}
                                    type={"number"}
                                    name={"two_way_f_sms"}
                                    defaultValue={edit?.speed_ratio?.two_way_f_sms}
                                    // message={"Ratio must be between 0 & 100"}
                                    placeholder=""
                                    label="Two Way SMS"
                                    className='mb-1'

                                   rules={{ required: true, min: 0, max: 100 }}

                                />
                            </Col>
                            <Col md="4">
                                <FormGroupCustom
                                    key={edit?.speed_ratio?.voice_f_sms}
                                    control={control}
                                    type={"number"}
                                    name={"voice_f_sms"}
                                    defaultValue={edit?.speed_ratio?.voice_f_sms}
                                    // message={"Ratio must be between 0 & 100"}
                                    placeholder=""
                                    label="Voice SMS"
                                    className='mb-1'

                                   rules={{ required: true, min: 0, max: 100 }}

                                />
                            </Col>
                            <Col md="4">
                                <FormGroupCustom
                                    key={edit?.speed_ratio?.whatsapp_f_sms}
                                    control={control}
                                    type={"number"}
                                    name={"whatsapp_f_sms"}
                                    className='mb-1'
                                    defaultValue={edit?.speed_ratio?.whatsapp_f_sms}
                                    // message={"Ratio must be between 0 & 100"}
                                    placeholder=""
                                    label="Whatsapp SMS"

                                   rules={{ required: true, min: 0, max: 100 }}

                                />
                            </Col>

                        </Row>
                    </CardBody>
                </form>
            </CenteredModal>
        </>
    )
}
