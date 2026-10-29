// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { CardBody, Col, Row } from 'reactstrap'
import { addDlr, editDlr, loadDlr } from '../../utility/apis/dlr'
import { loadPrimaryRoute } from '../../utility/apis/primaryRoutes'
import { isValidArray } from '../../utility/helpers/common'
import { createAsyncSelectOptions, createSelectOptions } from '../../utility/Utils'
import FormGroupCustom from '../components/formGroupCustom'
import CenteredModal from '../components/modal/CenteredModal'

export default function AddDlr({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", children = null, ...rest }) {

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


    const listPrimary = async (search, loadedOptions, { page }) => {

        const res = await loadPrimaryRoute({
            async: true,
            page,
            perPage: 25,
            jsonData: { route_name: search }
        })
        return createAsyncSelectOptions(res, page, "route_name", "id", setPrimary)

    }


    const handleSave = (data) => {
        if (edit?.id) {
            editDlr({
                id: edit?.id,
                jsonData: {
                    ...data,
                    is_retry_applicable : data?.is_retry_applicable  === 1 ? 1 : 0,
                    is_refund_applicable : data?.is_refund_applicable  === 1 ? 1 : 0
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
            addDlr({
                jsonData: {
                    ...data,
                    is_retry_applicable : data?.is_retry_applicable  === 1 ? 1 : 0,
                    is_refund_applicable : data?.is_refund_applicable  === 1 ? 1 : 0
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
                title="Dlr Code">
                <form>
                    <CardBody>
                        <Row>
                            <Col md="6">
                                <FormGroupCustom
                    async
                                    // defaultOptions
                                    value={edit?.primary_route_id}
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"primary_route_id"}
                                    isClearable
                                    className='mb-1'
                                    loadOptions={listPrimary}
                                    options={primary}
                                    label="Primary Route"
                                    rules={{ required: true }}

                                />
                            </Col>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"number"}
                                    control={control}
                                    name="dlr_code"
                                    value={edit?.dlr_code}
                                    className='mb-1'
                                    label="Dlr Code"
                                    errors={errors}
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"checkbox"}
                                    control={control}
                                    name="is_refund_applicable"
                                    value={edit?.is_refund_applicable}
                                    className='mb-1'
                                    label="Refund Applicable"
                                    errors={errors}
                                // rules={{ required: true }}
                                />
                            </Col>
                            <Col md="6" xs="12" >
                                <FormGroupCustom
                                    type={"checkbox"}
                                    control={control}
                                    name="is_retry_applicable"
                                    value={edit?.is_retry_applicable}
                                    className='mb-1'
                                    label="Retry Applicable"
                                    errors={errors}
                                // rules={{ required: true }}
                                />
                            </Col>
                            <Col md="12" xs="12" >
                                <FormGroupCustom
                                    type={"textarea"}
                                    control={control}
                                    name="description"
                                    value={edit?.description}
                                    className='mb-1'
                                    label="Description"
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
