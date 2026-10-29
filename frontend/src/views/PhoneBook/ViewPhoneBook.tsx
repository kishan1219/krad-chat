// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { CardBody, Col, Row, Table } from 'reactstrap'
import { readContactGroup } from '../../utility/apis/contactGroup'
import { isValid } from '../../utility/helpers/common'
import CenteredModal from '../components/modal/CenteredModal'
import Shimmer from '../components/shimmers/Shimmer'

export default function ViewPhoneBook({ edit = null, noView = false, modal = false, setModal = () => { }, showModal = false, setShowModal = () => { }, Component = "span", children = null, ...rest }) {
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

    useEffect(() => {
        setId(edit?.id)
    }, [edit])

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

    }
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

        // }
    }


    useEffect(() => {
        if (open) {
            loadDetails()
        }

    }, [open, edit])

    return (
        <>
            {!noView ? <Component role="button" onClick={handleShow} {...rest}>{children}</Component> : null}
            <CenteredModal
                loading={loading}
                open={open}
                scrollControl={false}
                handleModal={handleClose}
                disableFooter
                modalClass="modal-lg"
                // handleSave={handleSubmit(handleSave)}
                title="Groups">
                <form>
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
                </> : <>
                    <CardBody>
                        <Row className='align-items-start gy-2'>
                            <Col md="6">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Group Name
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {group?.group_name}
                                </p>
                            </Col>
                            <Col md="6">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Description
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {group?.description}
                                </p>
                            </Col>
                        </Row>
                        <Row className='border-top pt-1 mt-1 gy-2'>
                            <Col md="12">
                                {/* <p className='mb-0 text-dark fw-bolder'>
                                    Mobile Numbers
                                </p> */}

                                <p className='mb-0 fw-bold text-secondary'>
                                    <Row>

                                        <Table striped responsive>

                                            <thead>

                                                <tr>
                                                    <th scope='col' className='text-nowrap'>
                                                        #
                                                    </th>
                                                    <th scope='col' className='text-nowrap'>
                                                      Mobile NO.
                                                    </th>
                                                </tr>
                                            </thead>
                                            {group?.contact_numbers?.map((item, index) => {
                                                return (

                                                    <>
                                                        <tbody>
                                                            <tr>
                                                                <td className='text-nowrap' > {index + 1} </td>
                                                                <td className='text-nowrap'> {item?.number}</td>
                                                            </tr>
                                                        </tbody>
                                                    </>
                                                )
                                            })}
                                        </Table>
                                        
                                    </Row>


                                </p>
                            </Col>
                        </Row>
                    </CardBody>
                    </>
                }

                </form>
            </CenteredModal>
        </>
    )
}
