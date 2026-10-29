// @ts-nocheck
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { CardBody, Col, Row } from 'reactstrap'
import CenteredModal from '../components/modal/CenteredModal'

const ViewDlr = ({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", children = null, ...rest }) => {

    const [open, setOpen] = useState(false)
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
                title="Dlr Code">
                    <>
                   
                   <CardBody className='border-top'>
                    <Row className = 'align-items-start gy-2'>
                    <Col md="4">
                        <p className='mb-0 text-dark fw-bolder'>
                           Primary Route ID
                        </p>
                                <p className='mb-0 fw-bold text-secondary text-break'>
                         {edit?.primary_route_id}
                        </p>
                    </Col>
                    <Col md="4">
                        <p className='mb-0 text-dark fw-bolder'>
                           DLR Code
                        </p>
                                <p className='mb-0 fw-bold text-secondary text-break'>
                         {edit?.dlr_code}
                        </p>
                    </Col>
                    <Col md="4">
                        <p className='mb-0 text-dark fw-bolder'>
                          Primary Route Name
                        </p>
                                <p className='mb-0 fw-bold text-secondary text-break'>
                         {edit?.primary_route?.route_name}
                        </p>
                    </Col>
                    </Row>
                    <Row className='border-top pt-2 mt-2 gy-2'>
                    <Col md="4">
                        <p className='mb-0 text-dark fw-bolder'>
                          Description
                        </p>
                        <p className='mb-0 fw-bold text-secondary text-break'>
                         {edit?.description}
                        </p>
                    </Col>
                    <Col md="4">
                        <p className='mb-0 text-dark fw-bolder'>
                          Retry Applicable
                        </p>
                        <p className='mb-0 fw-bold text-secondary'>
                         {edit?.is_retry_applicable === 1 ? 'Yes' : "No"}
                        </p>
                    </Col>
                    <Col md="4">
                        <p className='mb-0 text-dark fw-bolder'>
                          Refund Applicable
                        </p>
                        <p className='mb-0 fw-bold text-secondary'>
                         {edit?.is_refund_applicable === 1 ? 'Yes' : 'No'}
                        </p>
                    </Col>
                    </Row>
                   </CardBody>
                    </>

            </CenteredModal>
        </>
    )
}

export default ViewDlr
