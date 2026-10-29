// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Col, Row } from 'reactstrap'
import CenteredModal from '../components/modal/CenteredModal'

const ViewTemplate = ({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", showModal = false, setShowModal = () => { }, children = null, ...rest }) => {

    const [open, setOpen] = useState(false)
    const loginUser = useSelector(state => state.auth.userData)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])
    const dispatch = useDispatch()
    const form = useForm()
    const [id, setId] = useState(null)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form
    const [activeTab, setActiveTab] = useState('1')
    const toggleTab = tab => {
        setActiveTab(tab)
    }

    const handleShow = () => {
        reset()
        setOpen(!open)
        setModal(!open)
        if (edit === null) setEditData(null)

    }

    useEffect(() => {
        setId(edit?.id)
    }, [edit])

    useEffect(() => {
        if (showModal) handleShow()
    }, [showModal])
    const handleClose = (from = null) => {
        handleShow()
        setShowModal(false)
    }

    return (
        <>
            {!noView ? <Component role="button" onClick={handleShow} {...rest}>{children}</Component> : null}
            <CenteredModal
                loading={loading}
                open={open}
                disableFooter={true}
                scrollControl={false}
                handleModal={handleClose}
                modalClass="modal-lg"
                // handleSave={handleSubmit(handleSave)}
                title="Notification Template">
                <>
                    <Card>
                        <div className='p-2'>

                            <Row className='align-items-start gy-2'>
                                <Col md="12">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Notification For
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary'>
                                        {edit?.notification_for ?? 'N/A'}
                                    </p>
                                </Col>
                            </Row>
                            <Row className='border-top pt-2 mt-2 gy-2'>
                                <Col md="12">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Notification Subject
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary'>
                                        {edit?.notification_subject ?? 'N/A'}
                                    </p>
                                </Col>

                            </Row>
                            <Row className='border-top pt-2 mt-2 gy-2'>
                                <Col md="12">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Notification Body
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary'>
                                        {edit?.notification_body ?? 'N/A'}
                                    </p>
                                </Col>

                            </Row>
                            <Row className='border-top pt-2 mt-2 gy-2'>
                                <Col md="12">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Mail Subject
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary'>
                                        {edit?.mail_subject ?? 'N/A'}
                                    </p>
                                </Col>

                            </Row>
                            <Row className='border-top pt-2 mt-2 gy-2'>
                                <Col md="12">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Mail Subject
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary'>
                                        {edit?.mail_subject ?? 'N/A'}
                                    </p>
                                </Col>

                            </Row>
                            <Row className='border-top pt-2 mt-2 gy-2'>
                                <Col md="3">
                                    <p className='mb-0 text-dark fw-bolder'>
                                    Custom Attributes
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary'>
                                        {edit?.custom_attributes ?? 'N/A'}
                                    </p>
                                </Col>
                                <Col md="3">
                                    <p className='mb-0 text-dark fw-bolder'>
                                    Save To Database
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary'>
                                        {edit?.save_to_database ===  0 ? 'No' : 'Yes'}
                                    </p>
                                </Col>
                                <Col md="3">
                                    <p className='mb-0 text-dark fw-bolder'>
                                    Status Code
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary'>
                                        {edit?.status_code ?? 'N/A'}
                                    </p>
                                </Col>
                                <Col md="3">
                                    <p className='mb-0 text-dark fw-bolder'>
                                  Route Path(Link)
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary'>
                                        {edit?.route_path ?? 'N/A'}
                                    </p>
                                </Col>

                            </Row>


                        </div>
                    </Card>
                </>

            </CenteredModal>
        </>
    )
}

export default ViewTemplate
