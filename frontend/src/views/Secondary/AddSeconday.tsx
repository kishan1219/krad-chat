// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { CardBody, Col, Row } from 'reactstrap'
import { loadPrimaryRoute } from '../../utility/apis/primaryRoutes'
import { addSecondaryRoute, editSecondaryRoute } from '../../utility/apis/seconday'
import { isValid, isValidArray } from '../../utility/helpers/common'
import { createAsyncSelectOptions, createSelectOptions } from '../../utility/Utils'
import FormGroupCustom from '../components/formGroupCustom'
import CenteredModal from '../components/modal/CenteredModal'

export default function AddSeconday({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", children = null, ...rest }) {
    const [open, setOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const [primary, setPrimary] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])
    const dispatch = useDispatch()
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setError, setValue, watch, getValues } = form

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
            editSecondaryRoute({
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
            addSecondaryRoute({
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
                title={isValid(edit) ? "Edit Secondary Route" : "Add Secondary Route"}>
                <form>
                    <CardBody>
                        <Row>
                            <Col md="6">

                                <FormGroupCustom
                                    async
                                    defaultOptions
                                    key={edit?.primary_route_id}
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
                                    type={"text"}
                                    control={control}
                                    name="sec_route_name"
                                    value={edit?.sec_route_name}
                                    className='mb-1'
                                    label="Secondary Route Name"
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
