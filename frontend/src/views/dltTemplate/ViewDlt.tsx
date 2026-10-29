// @ts-nocheck
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Col, Row } from 'reactstrap'
import CenteredModal from '../components/modal/CenteredModal'
import { isValid } from '../../utility/helpers/common'

const ViewDlt = ({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", children = null, ...rest }) => {

    const [open, setOpen] = useState(false)
    const loginUser = useSelector(state => state.auth.userData)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])
    const dispatch = useDispatch()
    const form = useForm()
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
    const handleClose = (from = null) => {
        handleShow()
    }


    const priority = (edit) => {
        if (edit?.priority === "0") {
            return (
                <div>Normal</div>
            )
        } else if (edit?.priority === '1') {
            return (
                <div>Medium</div>
            )
        } else if (edit?.priority === '2') {
            return (
                <div>Fast</div>
            )
        } else {
            return (
                <div>Instant(OTP)</div>
            )
        }
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
                title="DLT Details">
                <>
                    <Card>
                        <div className='p-2'>

                            <Row className='align-items-start gy-2'>
                                <Col md="4">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        User's Name
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary'>
                                        {edit?.name}
                                    </p>
                                </Col>
                                <Col md="4">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Template Name
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary'>
                                        {edit?.template_name}
                                    </p>
                                </Col>
                                <Col md="4">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Template ID
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary'>
                                        {edit?.dlt_template_id}
                                    </p>
                                </Col>


                            </Row>
                            <Row className='border-top pt-2 mt-2 gy-2'>
                                <Col md="4">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Sender ID
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary'>
                                        {edit?.sender_id}
                                    </p>
                                </Col>
                                <Col md="4">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Entity ID
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary'>
                                        {edit?.entity_id}
                                    </p>
                                </Col>
                                <Col md="4">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Header ID
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary'>
                                        {edit?.header_id}
                                    </p>
                                </Col>
                                </Row>
                            <Row className='border-top pt-2 mt-2 gy-2'>
                                <Col md="4">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Unicode
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary'>
                                        {edit?.is_unicode === 0 ? 'No' : 'Yes'}
                                    </p>
                                </Col>

                                <Col md="4">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Priority
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary'>
                                        {priority(edit)}
                                    </p>
                                </Col>
                                <Col md="4">
                                    <p className='mb-0 text-dark fw-bolder'>
                                   Is Visible Template Group
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary'>
                                        {isValid(edit?.dlt_template_group_id) ? 'Yes' : 'No'}
                                    </p>
                                </Col>
                            </Row>

                            <Row className='border-top pt-2 mt-2 gy-2'>

                                <Col md="12">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        DLT Message
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary'>
                                        {edit?.dlt_message}
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

export default ViewDlt
