// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { CardBody, Col, Row } from 'reactstrap'
import { userPriorityForAdmin } from '../../utility/Const'
import { createConstSelectOptions, createSelectOptions } from '../../utility/Utils'
import { userPriority } from '../../utility/apis/adminOperation'
import { loadUser } from '../../utility/apis/userManagement'
import FormGroupCustom from '../components/formGroupCustom'
import CenteredModal from '../components/modal/CenteredModal'
// import ContactEmergency from '@mui/icons-material/ContactEmergency'

export default function UserPriority({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", children = null, ...rest }) {

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

    const listUser = () => {
        loadUser({
            perPage: 15,
            loading: setLoading,
            dispatch,
            success: (e) => {
                setUser(createSelectOptions(e?.data?.data, "name", "id"))

            }
        })
    }

    useEffect(() => {
        if (open) {
            listUser()
        }
    }, [open])


    const handleSave = (data) => {
       
            userPriority({
            jsonData: {
                ...data

            },
            loading: setLoading,
            dispatch,
            success: (e) => {
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
                title="Assign Route">
                <form>
                    <CardBody>
                        <Row>

                            <Col md="12">
                                <FormGroupCustom

                                    defaultOptions
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    name={"user_id"}
                                    isClearable
                                    placeholder="Select User"
                                    className='mb-1'
                                    loadOptions={listUser}
                                    options={user}
                                    label="User"
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
