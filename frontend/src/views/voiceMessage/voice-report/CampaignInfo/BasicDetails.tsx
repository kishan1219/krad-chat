// @ts-nocheck
import React from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'reactstrap'
import httpConfig from '../../../../utility/http/httpConfig'


const BasicDetails = ({ edit }) => {

    return (
        <>
            <Card className='border'>
                <CardHeader className='border-bottom' >
                    <CardTitle tag='h4' className='fw-bolder mb-0'>Basic Details </CardTitle>
                </CardHeader>

                <CardBody className='p-3'>

                    <Row>
                        <Col md="6" sm="12" className='d-flex justify-content-start border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                Campaign Name
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-end border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                {edit?.campaign}
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-start border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                DTMF
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-end border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                {edit?.dtmf}
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-start border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                Call Patch Number
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-end border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                {edit?.call_patch_number}
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-start border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                Campaign Send Date/Time
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-end border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                {edit?.campaign_send_date_time}
                            </div>
                        </Col>

                        {/* <Col md="6" sm="12" className='d-flex justify-content-start border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                Message Credit Size
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-end border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                {edit?.message_credit_size}
                            </div>
                        </Col> */}
                        {/* <Col md="6" sm="12" className='d-flex justify-content-start border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                Obd Type
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-end border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                {edit?.obd_type === "1" ? 'Voice' : 'Text'}
                            </div>
                        </Col> */}
                        <Col md="6" sm="12" className='d-flex justify-content-start border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                Blocked Number
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-end border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                {edit?.total_block_number}
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-start border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                Invalid Number
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-end border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                {edit?.total_invalid_number}
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-start border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                Answered
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-end border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                {edit?.total_delivered}
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-start border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                Failed
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-end border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                {edit?.total_failed}
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-start border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                Total Contacts
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-end border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                {edit?.total_contacts}
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-start border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                Total Credit Deduct
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-end border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                {edit?.total_credit_deduct}
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-start border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                Processing
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-end border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                {edit?.total_contacts - edit?.total_failed - edit?.total_block_number - edit?.total_delivered - edit?.total_invalid_number}
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-start border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                Total
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-end border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                {edit?.total_contacts}
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-start border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                Voice File Path
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-center border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                <audio controls style={{ height: "40px", width: "250px" }}>
                                    <source src={httpConfig.baseUrl2 + edit?.voice_file_path} type="audio/ogg" />
                                    <source src={httpConfig.baseUrl2 + edit?.voice_file_path} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        </Col>
                        {/* <Col md="6" sm="12" className='d-flex justify-content-start border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                Voice Upload
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-end border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                {edit?.voice_upload.title}
                            </div>
                        </Col> */}


                    </Row>
                </CardBody>

            </Card>
        </>
    )
}

export default BasicDetails
