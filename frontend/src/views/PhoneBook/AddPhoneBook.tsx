// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { SlideDown } from '@components/slide-down'
import { Plus, Trash2 } from 'react-feather'
import { useFieldArray, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Button, CardBody, Col, InputGroup, InputGroupText, Row } from 'reactstrap'
import Hide from '../../utility/Hide'
import { createSelectOptions } from '../../utility/Utils'
import { editContactGroup, readContactGroup } from '../../utility/apis/contactGroup'
import { addContactNumber } from '../../utility/apis/contactNumber'
import { loadUser } from '../../utility/apis/userManagement'
import { isValid, isValidArray, log } from '../../utility/helpers/common'
import FormGroupCustom from '../components/formGroupCustom'
import CenteredModal from '../components/modal/CenteredModal'

export default function AddPhoneBook({ edit = null, noView = false, modal = false, preload = () => { }, setModal = () => { }, showModal = false, setShowModal = () => { }, Component = "span", children = null, ...rest }) {
    const [open, setOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const [group, setGroup] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])
    const [id, setId] = useState(null)
    //  const user = useSelector(state => state.auth.userData)
    const dispatch = useDispatch()
    const form = useForm()
    const [count, setCount] = useState(1)

    const increaseCount = () => {
        setCount(count + 1)
    }

    useEffect(() => {
        setId(edit?.id)
    }, [edit])

    const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
        control: form.control, // control props comes from useForm (optional: if you are using FormContext)
        name: "numbers" // unique name for your Field Array
    })

    useEffect(() => {
        if (fields.length === 0) {
            append({ value: '' })
        }
    }, [])

    const deleteForm = e => {
        e.preventDefault()
        const slideDownWrapper = e.target.closest('.react-slidedown'),
            form = e.target.closest('form')
        if (slideDownWrapper) {
            slideDownWrapper.remove()
        } else {
        }
    }

    const { formState: { errors }, handleSubmit, control, setError, reset, setValue, watch, getValues } = form

    const handleShow = () => {
        reset()
        setOpen(!open)
        setModal(!open)
        if (edit === null) setEditData(null)

    }

    const handleClose = (from = null) => {
        handleShow()
        setShowModal(false)
        setCount(1)
        remove()
        append({ value: '' })
    }

    // const handleClose = (from = null) => {
    //     handleModal()
    // }

    useEffect(() => {
        if (showModal) handleShow()
    }, [showModal])

    const loadDetails = () => {
        // if (isValid(id)) {
        if (isValid(edit?.id)) {
            readContactGroup({
                id: edit?.id,
                loading: setLoading,
                success: (e) => {
                    setGroup(e)
                }
            })
        }
    }

    const listUser = () => {
        loadUser({
            perPage: 1000,
            loading: setLoading,
            dispatch,
            success: (e) => {
                setUser(createSelectOptions(e?.data?.data, "name", "id"))
            }
        })
    }

    useEffect(() => {
        if (open) {
            // listUser()
            loadDetails()
        }

    }, [open, edit])

    // useEffect(() => {
    //     loadDetails()
    // }, [edit])

    const handleSave = (data) => {
        if (edit?.id) {
            editContactGroup({
                id: edit?.id,
                jsonData: {
                    ...data,
                    numbers: data?.numbers?.map(a => a.value)

                },
                dispatch,
                loading: setLoading,
                success: (d) => {
                    handleClose()
                    remove()
                    append({ value: '' })
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
            addContactNumber({
                jsonData: {
                    ...data,
                    // user_id: user?.id,
                    numbers: data?.numbers?.map(a => a.value)

                },
                loading: setLoading,
                dispatch,
                success: (e) => {
                    handleClose()
                    preload()
                    remove()
                    append({ value: '' })
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
                modalClass="modal-sm"
                disableSave={loading}
                handleSave={handleSubmit(handleSave)}
                title="Groups">
                <form>
                    <CardBody>
                        <Row>
                          
                            <Col md="12" xs="12" >
                                <FormGroupCustom
                                    type={"text"}
                                    control={control}
                                    name="group_name"
                                    value={edit?.group_name}
                                    className='mb-1'
                                    label="Group Name"
                                    errors={errors}
                                    rules={{ required: true }}
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

                            <Hide IF={isValid(edit)}>

                                <Col md="12" sm="12" className=''>

                                    <Row>

                                        {fields.map((field, i) => {
                                            const Tag = i === 0 ? 'div' : SlideDown
                                            return (
                                                <Tag key={field?.id}>
                                                    <Row className='justify-content-between align-items-center'>
                                                        <Col md={12} className=''>
                                                            <InputGroup>
                                                                <FormGroupCustom
                                                                    type={"number"}
                                                                    noLabel
                                                                    control={control}
                                                                    placeholder="Enter Mobile Number"
                                                                    name={`numbers[${i}].value`}
                                                                    value={`edit?.numbers[${i}]`}
                                                                    className={`animation-item-name-${i}`}
                                                                    // label="Group Name"
                                                                    errors={errors}
                                                                    rules={{ required: true, min: 0, minLength: 10, maxLength: 12 }}
                                                                    append={i === 0 ? null : <InputGroupText role={"button"} onClick={e => remove(i)}>
                                                                        <Trash2 className='text-danger' size={16} />
                                                                    </InputGroupText>
                                                                    }
                                                                />
                                                            </InputGroup>
                                                        </Col>
                                                        <Col sm={12}>
                                                            <hr />
                                                        </Col>
                                                    </Row>
                                                </Tag>
                                            )
                                        })}

                                    </Row>
                                 
                                    <Col md="12" sm="12" className=''>
                                        <Button block className='btn-icon' color='primary' onClick={() => append({ value: "" })}>
                                            <Plus size={14} />
                                            <span className='align-middle ms-25'>Add New</span>
                                        </Button>
                                    </Col>
                                </Col>
                            </Hide>
                        </Row>
                    </CardBody>
                </form>
            </CenteredModal>
        </>
    )
}
