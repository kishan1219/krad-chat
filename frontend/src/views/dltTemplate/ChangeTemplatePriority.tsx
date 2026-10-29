// @ts-nocheck
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { CardBody, Col, Row } from 'reactstrap'
import { userPriorityForAdmin } from '../../utility/Const'
import { createAsyncSelectMultiOptions, createConstSelectOptions } from '../../utility/Utils'
import { dltTemplatePriority, loadDlt } from '../../utility/apis/dlt'
import { log } from '../../utility/helpers/common'
import FormGroupCustom from '../components/formGroupCustom'
import CenteredModal from '../components/modal/CenteredModal'
// import ContactEmergency from '@mui/icons-material/ContactEmergency'


export default function ChangeTemplatePriority({ edit = null, noView = false, modal = false, setModal = () => { }, preload = () => { }, Component = "span", children = null, ...rest }) {

    const [open, setOpen] = useState(false)
    const [secondary, setSecondary] = useState(null)
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

    const listDltTemplate = async (search, loadedOptions, { page }) => {

        const res = await loadDlt({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectMultiOptions(res, page, "xName", "dlt_template_id", setUser)

    }


    const handleSave = (data) => {
        // log(data)
        dltTemplatePriority({
            jsonData: {
                ...data
                // dlt_template_ids: [data?.dlt_template_ids?.dlt_template_id]

            },
            loading: setLoading,
            dispatch,
            success: (e) => {
                handleClose()
                preload()
            }
        })
        // }
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
                title="DLT Template Priority">
                <form>
                    <CardBody>
                        <Row>
                            <Col md="12">
                                <FormGroupCustom
                                    // defaultOptions
                                    async
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"dlt_template_ids"}
                                    isClearable
                                    isMulti
                                    placeholder="Select Template"
                                    className='mb-1'
                                    loadOptions={listDltTemplate}
                                    options={user}
                                    label="DLT Template"
                                    rules={{ required: true }}
                                />
                            </Col>

                            <Col md="12">
                                <FormGroupCustom
                                    defaultOptions
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"priority"}
                                    isClearable
                                    placeholder="Select Priority"
                                    className='mb-1'
                                    options={createConstSelectOptions(userPriorityForAdmin)}
                                    label="Priority"
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
