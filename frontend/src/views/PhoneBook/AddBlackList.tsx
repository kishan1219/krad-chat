// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { SlideDown } from '@components/slide-down'
import { Plus, Trash2 } from 'react-feather'
import { useFieldArray, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Button, CardBody, Col, InputGroup, InputGroupText, Row } from 'reactstrap'
import { addBlacklist } from '../../utility/apis/blacklist'
import FormGroupCustom from '../components/formGroupCustom'
import CenteredModal from '../components/modal/CenteredModal'

export default function AddBlackList({ edit = null, noView = false, modal = false, setModal = () => { }, preload, Component = "span", children = null, ...rest }) {
    const [open, setOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])
    const [id, setId] = useState(null)

    const dispatch = useDispatch()
    const form = useForm()

    const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
        control: form.control, // control props comes from useForm (optional: if you are using FormContext)
        name: "mobile_numbers" // unique name for your Field Array
    })

    useEffect(() => {
        if (fields.length === 0) {
            append({ value: '' })
        }
    }, [])

    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form

    const handleShow = () => {
        reset()
        setOpen(!open)
        setModal(!open)
        if (edit === null) setEditData(null)

    }

    const handleClose = (from = null) => {
        handleShow()
        remove()
        append({ value: '' })
    }

    const handleSave = (data) => {
        addBlacklist({
            jsonData: {
                mobile_numbers: data?.mobile_numbers?.map(a => a.value)
            },
            loading: setLoading,
            dispatch,
            success: (e) => {
                handleClose()
                preload()
                remove()
                append({ value: '' })
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
                disableSave={loading}
                handleSave={handleSubmit(handleSave)}
                title="Add BlackList">
                <form>
                    <CardBody>
                        <Row>
                            <Col md="12">
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
                                                                name={`mobile_numbers[${i}].value`}
                                                                value={`edit?.mobile_numbers[${i}]`}
                                                                className={`animation-item-name-${i}`}
                                                                // label="Group Name"
                                                                errors={errors}
                                                                rules={{ required: true, minLength: 10, maxLength: 12 }}
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
                        </Row>
                    </CardBody>
                </form>
            </CenteredModal>
        </>
    )
}
