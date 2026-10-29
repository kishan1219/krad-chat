// @ts-nocheck
import React from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'reactstrap'
import Show from '../../../utility/Show'

const BasicDetails = ({ campaign }) => {


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
                                Blocked Number
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-end border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                {campaign?.total_block_number}
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-start border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                Invalid Number
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-end border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                {campaign?.total_invalid_number}
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-start border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                Delivered
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-end border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                {campaign?.total_delivered}
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-start border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                Failed
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-end border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                {campaign?.total_failed}
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-start border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                Processing
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-end border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                {campaign?.total_contacts - campaign?.total_failed - campaign?.total_block_number - campaign?.total_delivered - campaign?.total_invalid_number}
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-start border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                Total
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-end border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                {campaign?.total_contacts}
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-start border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                Template Name
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-end border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                {campaign?.dlt_template?.template_name}
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-start border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                Template ID
                            </div>
                        </Col>
                        <Col md="6" sm="12" className='d-flex justify-content-end border'>
                            <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                {campaign?.dlt_template?.dlt_template_id}
                            </div>
                        </Col>
                        <Show IF={campaign?.route_type === 3}>
                            <Col md="6" sm="12" className='d-flex justify-content-start border'>
                                <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                    Total Response Rating
                                </div>
                            </Col>
                            <Col md="6" sm="12" className='d-flex justify-content-end border'>
                                <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                    {campaign?.total_response_ratings}
                                </div>
                            </Col>
                            <Col md="6" sm="12" className='d-flex justify-content-start border'>
                                <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                    Total Response Interests
                                </div>
                            </Col>
                            <Col md="6" sm="12" className='d-flex justify-content-end border'>
                                <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                    {campaign?.total_response_interests}
                                </div>
                            </Col>
                            <Col md="6" sm="12" className='d-flex justify-content-start border'>
                                <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                    Total Response Feedbacks
                                </div>
                            </Col>
                            <Col md="6" sm="12" className='d-flex justify-content-end border'>
                                <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                    {campaign?.total_response_feedbacks}
                                </div>
                            </Col>
                        </Show>
                    </Row>
                </CardBody>

            </Card>
        </>
    )
}

export default BasicDetails
