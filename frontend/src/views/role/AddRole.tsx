// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { addUser, editUser } from '../../utility/apis/userManagement'
import CenteredModal from '../components/modal/CenteredModal'
import { Row, CardBody, Col, Form, Input, Card, Label } from 'reactstrap'
import FormGroupCustom from '../components/formGroupCustom'
import { createConstSelectOptions, toggleArray } from '../../utility/Utils'
import { AuthorityType, forResellerUserType, priority, UserType } from '../../utility/Const'
import DropZone from '../components/fileUploader'
import Hide from '../../utility/Hide'
import httpConfig from '../../utility/http/httpConfig'
import { isValid, isValidArray, log } from '../../utility/helpers/common'
import Show from '../../utility/Show'
import { addRole, editRole, getRolePermission, readAllPermission, readPermission } from '../../utility/apis/roleList'
import Shimmer from '../components/shimmers/Shimmer'

export default function AddRole({ edit = null, preload, noView = false, modal = false, setModal = () => { }, Component = "span", showModal = false, setShowModal = () => { }, children = null, ...rest }) {
    const [open, setOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const users = useSelector(state => state.auth.userData)
    const dispatch = useDispatch()
    const [selected, setSelected] = useState(null)
    const [allPermission, setAllPermission] = useState(null)
    const form = useForm()
    const [id, setId] = useState(null)
    const [permission, setPermission] = useState(null)
    const [checkboxes, setCheckboxes] = useState(false)
    const [checkboxOne, setCheckboxOne] = useState([])
    const [selectedPermissions, setSelectedPermissions] = useState([])

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
        setSelectedPermissions([])

    }
    useEffect(() => {
        setId(edit?.id)
    }, [edit])

    const addPermission = (name) => {

        const per = selectedPermissions
        per.push(name)
        setSelectedPermissions([...per])

    }
    const removePermission = (name) => {
        const per = selectedPermissions ?? []
        const index = per.findIndex(p => p === name)
        per.splice(index, 1)
        setSelectedPermissions([...per])
    }
    const getAllPermissions = (data) => {
        readAllPermission({
            // jsonData: {
            //     ...dataF
            // },
            success: (e) => {
                setPermission(e)
            }
        })
    }

    const getRole = () => {
        getRolePermission({
            id: edit?.id,
            loading: setLoading,
            success: (e) => {
                setSelectedPermissions(e?.permissions?.map(a => a.name))
            }
        })
    }


    useEffect(() => {
        if (open) {
            getAllPermissions()

        }

        if (isValid(edit?.id)) {
            getRole()
        }
    }, [open, edit])

    useEffect(() => {
        setId(edit?.id)
    }, [edit])

    useEffect(() => {
        if (showModal) handleShow()
    }, [showModal])


    const handleSave = (jsonData) => {

        if (selectedPermissions?.length > 0 && !isValid(edit?.id)) {
            addRole({
                jsonData: {
                    ...jsonData,
                    permissions: selectedPermissions

                },
                loading: setLoading,
                dispatch,
                success: () => {
                    handleClose()
                    // SuccessToast("roles-added")
                    // saved(null)
                }
            })

        } else if (isValid(edit?.id)) {
            editRole({
                id: edit?.id,
                jsonData: {
                    ...jsonData,
                    permissions: selectedPermissions
                },
                dispatch,
                loading: setLoading,
                success: () => {
                    handleClose()
                    // SuccessToast("roles-edited")
                    // saved(null)

                }
            })
        }
    }


    // log(permission, "per")

    const isChecked = (permission) => {
        const i = selectedPermissions?.findIndex(p => p === permission?.name)

        if (i !== undefined && i > -1) {
            return true
        } else {
            return false
        }
    }

    const togglePermission = (permission) => {
        const i = selectedPermissions?.findIndex(p => p === permission?.name)
        if (i === -1) {
            if (permission) {
                setSelectedPermissions([...selectedPermissions, permission?.name])
            }
        } else {
            const per = selectedPermissions ?? []
            per.splice(i, 1)
            setSelectedPermissions([...per])
        }
    }
   
    const renderPermissions = () => {
        const re = []
        if (permission) {
            permission?.forEach((permission, index) => {
                re.push(
                    <>
                        {/* <Row> */}
                        <Col md="4" key={`fsfsd4543f-${index}`}>
                            <div className='form-check form-check-inline'>

                                <Input
                                    // disabled={permission?.entry_mode === "required"}
                                    checked={isChecked(permission)}
                                    id={permission?.name}
                                    type={"checkbox"}
                                    onChange={e => togglePermission(permission)}
                                />
                                <Label for={permission?.name}>
                                    {permission?.name}
                                </Label>
                            </div>

                        </Col>
                        {/* </Row> */}
                    </>
                )
            })
        }
        return re
    }
    const editRenderPermissions = () => {
        const re = []
        if (edit) {
            allPermission?.permissions?.forEach((permission, index) => {
                re.push(
                    <>
                        <div className='form-check form-check-inline'>
                            {/* <Row> */}
                            <Col md="4" key={`fsfsdf-${index}`}>
                                <Input
                                    // disabled={permission?.entry_mode === "required"}
                                    checked={isChecked(permission)}
                                    id={permission?.name}
                                    type={"checkbox"}
                                    onChange={e => togglePermission(permission)}
                                />
                                <Label for={permission?.name}>
                                    {permission?.name}
                                </Label>

                            </Col>
                            {/* </Row> */}
                        </div>
                    </>
                )
            })
        }
        return re
    }
    return (
        <>
            {!noView ? <Component role="button" onClick={handleShow} {...rest}>{children}</Component> : null}
            <CenteredModal
                loading={loading}
                open={open}
                scrollControl={false}
                handleModal={handleClose}
                modalClass="modal-xl"
                handleSave={handleSubmit(handleSave)}
                title={edit ? "Edit Role" : "Add Role"}>
                <form>
                    <CardBody>
                        <Row>
                            <Col md="12">
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="name"
                                    value={edit?.actual_name}
                                    className='mb-1'
                                    label="Role Name"
                                    errors={errors}
                                    rules={{ required: false }}

                                />
                            </Col>
                            <Row>
                                {/* <Col md="12"> */}
                                {loading ? <>
                                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5, marginTop: 5 }} />
                                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                                </> : renderPermissions()}
                                {/* </Col> */}
                            </Row>
                        </Row>

                    </CardBody>
                </form>
            </CenteredModal>
        </>
    )
}
