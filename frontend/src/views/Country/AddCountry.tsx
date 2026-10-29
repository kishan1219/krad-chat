// @ts-nocheck
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { CardBody, Col, Row } from 'reactstrap'
import { addCountry, editCountry } from '../../utility/apis/countryCrud'
import { isValidArray } from '../../utility/helpers/common'
import CenteredModal from '../components/modal/CenteredModal'
import FormGroupCustom from '../components/formGroupCustom'

export default function AddCountry({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", children = null, preload, ...rest }) {

    const [open, setOpen] = useState(false)
    const [primary, setPrimary] = useState(null)
    const loginUser = useSelector(state => state.auth.userData)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])
    const [language, setLanguage] = useState(null)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const form = useForm()
    const [loadUser, setLoadUser] = useState(false)
    const [loadConfig, setLoadConfig] = useState(false)
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

        if (edit?.id) {
            editCountry({
                id: edit?.id,
                jsonData: {
                    ...data

                },
                dispatch,
                loading: setLoading,
                success: (d) => {
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

            addCountry({
                jsonData: {
                    ...data
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
                // modalClass="modal-lg"
                handleSave={handleSubmit(handleSave)}
                disableSave={loading}
                title="Add Country">
                <form>
                    <CardBody>
                        <Row>

                            <Col md="12" xs="12" >

                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="name"
                                    value={edit?.name}
                                    className='mb-1'
                                    label="Country Name"
                                    errors={errors}
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="iso"
                                    value={edit?.iso}
                                    className='mb-1'
                                    label="ISO"
                                    errors={errors}
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="iso3"
                                    value={edit?.iso3}
                                    className='mb-1'
                                    label="ISO3"
                                    errors={errors}
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="currency_code"
                                    value={edit?.currency_code}
                                    className='mb-1'
                                    label="Country Code"
                                    errors={errors}
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="currency"
                                    value={edit?.currency}
                                    className='mb-1'
                                    label="Currency"
                                    errors={errors}
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="currency_symbol"
                                    value={edit?.currency_symbol}
                                    className='mb-1'
                                    label="Currency Symbol"
                                    errors={errors}
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="phonecode"
                                    value={edit?.phonecode}
                                    className='mb-1'
                                    label="Phone Code"
                                    errors={errors}
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="min"
                                    value={edit?.min}
                                    className='mb-1'
                                    label="Min"
                                    errors={errors}
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="max"
                                    value={edit?.max}
                                    className='mb-1'
                                    label="Max"
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
