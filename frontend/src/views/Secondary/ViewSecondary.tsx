// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { CardBody, Col, Row } from 'reactstrap'
import { readDlr } from '../../utility/apis/dlr'
import { formatDate } from '../../utility/Utils'
import CenteredModal from '../components/modal/CenteredModal'

const ViewSecondary = ({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", children = null, ...rest }) => {

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
                title="SMPP Secondary Route">
                    <>
                   
                   <CardBody className='border-top'>
                    <Row className = 'align-items-start gy-2'>
                    <Col md="4">
                        <p className='mb-0 text-dark fw-bolder'>
                          Secondary Route Name
                        </p>
                        <p className='mb-0 fw-bold text-secondary'>
                         {edit?.sec_route_name}
                        </p>
                    </Col>
                    <Col md="4">
                        <p className='mb-0 text-dark fw-bolder'>
                          Primary Route Name
                        </p>
                        <p className='mb-0 fw-bold text-secondary'>
                         {edit?.primary_route?.route_name}
                        </p>
                    </Col>
                    <Col md="4">
                        <p className='mb-0 text-dark fw-bolder'>
                          Status
                        </p>
                        <p className='mb-0 fw-bold text-secondary'>
                         {edit?.status === 1 ? "Active" : "In-Active" }
                        </p>
                    </Col>
                   
                    </Row>
                    <Row className='border-top pt-2 mt-2 gy-2'>
                    
                    <Col md="6">
                        <p className='mb-0 text-dark fw-bolder'>
                         Created By
                        </p>
                        <p className='mb-0 fw-bold text-secondary'>
                        {edit?.created_by?.name}
                        </p>
                    </Col>
                    <Col md="6">
                        <p className='mb-0 text-dark fw-bolder'>
                          Created At
                        </p>
                        <p className='mb-0 fw-bold text-secondary'>
                        {formatDate(edit?.created_at, "DD-MM-YYYY")}
                        </p>
                    </Col>
                    </Row>
                   </CardBody>
                    </>

            </CenteredModal>
        </>
    )
}

export default ViewSecondary
