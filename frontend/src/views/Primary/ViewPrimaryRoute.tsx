// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Badge, CardBody, Col, Row } from 'reactstrap'
import CenteredModal from '../components/modal/CenteredModal'
import Hide from '../../utility/Hide'
import Show from '../../utility/Show'
import { readPrimaryRoute } from '../../utility/apis/primaryRoutes'
import { isValid, log } from '../../utility/helpers/common'

const ViewPrimaryRoute = ({ edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", children = null, ...rest }) => {

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

    const getPrimaryRoute = () => {
        readPrimaryRoute({
            id: edit?.id,
            dispatch,
            // async: true,
            loading: setLoading,
            success: (res) => {
                setEditData(res)
            }
        })
    }

    useEffect(() => {
        if (open) {
            getPrimaryRoute()
        }
    }, [open])


    const routeType = () => {

        if (editData?.gateway_type === 1) {
            return (
                <Badge color="light-success" >
                    Transactional
                </Badge>
            )
        }  if (editData?.gateway_type === 2) {
            return (
                <Badge color="light-danger" >
                    Promotional
                </Badge>
            
            )
        }  if (editData?.gateway_type === 3) {
            return (
                <Badge color="light-warning" >
                    Two Way
                </Badge>
            )
        }  if (editData?.gateway_type === 4) {
            return (
                <Badge color="light-info" >
                    Voice
                </Badge>
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
                modalClass="modal-xl"
                // handleSave={handleSubmit(handleSave)}
                title="Primary Route">
                <>

                    <CardBody className='border-top'>

                        <Row className='align-items-start g-2'>
                            <Col md="3">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Route Name
                                </p>
                                <p className='mb-0 fw-bold text-secondary text-break'>
                                    {editData?.route_name}
                                </p>
                            </Col>
                            <Col md="3">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Route Type
                                </p>
                                <p className='mb-0 fw-bold text-secondary text-break'>

                                    {routeType(editData)}
                                </p>
                            </Col>
                            {/* <Col md="3">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Secondary Route Name
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {editData?.sec_route_name}
                                </p>
                            </Col> */}
                            <Col md="3">
                                <p className='mb-0 text-dark fw-bolder'>
                                    {editData?.gateway_type === 4 ? "Voice Credit" : "SMPP Credit"}
                                </p>
                                <p className='mb-0 fw-bold text-secondary text-break'>
                                    {editData?.smpp_credit}
                                </p>
                            </Col>
                            <Col md="3">
                                <p className='mb-0 text-dark fw-bolder'>

                                    {editData?.gateway_type === 4 ? "Voice ID" : "SMSC ID"}

                                </p>
                                <p className='mb-0 fw-bold text-secondary text-break'>
                                    {editData?.smsc_id}
                                </p>
                            </Col>

                            <Col md="3">
                                <p className='mb-0 text-dark fw-bolder'>
                                    IP Address
                                </p>
                                <p className='mb-0 fw-bold text-secondary text-break'>
                                    {editData?.ip_address ?? "N/A"}
                                </p>
                            </Col>
                            <Col md="3">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Port
                                </p>
                                <p className='mb-0 fw-bold text-secondary text-break'>
                                    {editData?.port ?? "N/A"}
                                </p>
                            </Col>
                            <Col md="3">
                                <p className='mb-0 text-dark fw-bolder'>

                                    {editData?.gateway_type === 4 ? "Voice Username" : "SMSC Username"}

                                </p>
                                <p className='mb-0 fw-bold text-secondary text-break'>
                                    {editData?.smsc_username}
                                </p>
                            </Col>
                            <Col md="3">
                                <p className='mb-0 text-dark fw-bolder'>
                                    System Type
                                </p>
                                <p className='mb-0 fw-bold text-secondary text-break'>
                                    {editData?.system_type ?? "N/A"}
                                </p>
                            </Col>
                            <Hide IF={editData?.gateway_type === 4}>
                                <Col md="3">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Throughput
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary text-break'>
                                        {editData?.throughput}
                                    </p>
                                </Col>
                                <Col md="3">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Reconnect Delay
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary text-break'>
                                        {editData?.reconnect_delay}
                                    </p>
                                </Col>
                                <Col md="3">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Enquire Link Interval
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary text-break'>
                                        {editData?.enquire_link_interval}
                                    </p>
                                </Col>
                                <Col md="3">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Maximum Pending Submits
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary text-break'>
                                        {editData?.max_pending_submits}
                                    </p>
                                </Col>

                                <Col md="3">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Transceiver Mode
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary text-break'>
                                        {editData?.transceiver_mode}
                                    </p>
                                </Col>
                                <Col md="3">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Source Addon
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary text-break'>
                                        {editData?.source_addr_ton}
                                    </p>
                                </Col>
                                <Col md="3">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Source Addr Npi
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary text-break'>
                                        {editData?.source_addr_npi}
                                    </p>
                                </Col>
                                <Col md="3">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Dest Addr Ton
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary text-break'>
                                        {editData?.dest_addr_ton}
                                    </p>
                                </Col>

                                <Col md="3">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Dest Addr Npi
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary text-break' >
                                        {editData?.dest_addr_npi}
                                    </p>
                                </Col>
                                <Col md="3">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Log File
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary text-break'>
                                        {editData?.log_file}
                                    </p>
                                </Col>
                                <Col md="3">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Log Level
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary text-break'>
                                        {editData?.log_level ?? "N/A"}
                                    </p>
                                </Col>
                                <Col md="3">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Instances
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary text-break'>
                                        {editData?.instances ?? "N/A"}
                                    </p>
                                </Col>
                            </Hide>
                            <Show IF={editData?.gateway_type === 4}>
                                <Col md="3">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Voice
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary text-break'>
                                        YES
                                    </p>
                                </Col>
                            </Show>
                            <Col md="3">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Api Url for Voice
                                </p>
                                <p className='mb-0 fw-bold text-secondary text-break'>
                                    {editData?.api_url_for_voice ?? "N/A"}
                                </p>
                            </Col>
                           
                        </Row>
                        {/* <Row className='align-items-start g-2 mt-1'>
                        <Col md="3">
                                <p className='mb-0 text-dark fw-bolder'>
                                   Secondary Routes
                                </p>
                              
                            </Col>
                        </Row> */}
                    </CardBody>
                </>

            </CenteredModal>
        </>
    )
}

export default ViewPrimaryRoute
