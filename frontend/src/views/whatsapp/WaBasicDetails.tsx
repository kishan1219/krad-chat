// @ts-nocheck
import React from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'reactstrap'
import Show from '../../utility/Show'

const WaBasicDetails = ({ edit }) => {
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
                             Delivered
                          </div>
                      </Col>
                      <Col md="6" sm="12" className='d-flex justify-content-end border'>
                          <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                              {edit?.total_delivered}
                          </div>
                      </Col>
                      <Col md="6" sm="12" className='d-flex justify-content-start border'>
                          <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                             Sent
                          </div>
                      </Col>
                      <Col md="6" sm="12" className='d-flex justify-content-end border'>
                          <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                              {edit?.total_sent}
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
                              Total Read
                          </div>
                      </Col>
                      <Col md="6" sm="12" className='d-flex justify-content-end border'>
                          <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                              {edit?.total_read}
                          </div>
                      </Col>
                      <Col md="6" sm="12" className='d-flex justify-content-start border'>
                          <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                              Processing
                          </div>
                      </Col>
                      <Col md="6" sm="12" className='d-flex justify-content-end border'>
                          <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                              {/* {edit?.total_contacts - edit?.total_failed - edit?.total_block_number - edit?.total_delivered} */}
                              {edit?.total_contacts - (edit?.total_block_number + edit?.total_delivered + edit?.total_failed + edit?.total_read + edit?.total_invalid_number + edit?.total_other  + edit?.total_sent)}
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
                      
                      {/* <Col md="6" sm="12" className='d-flex justify-content-start border'>
                          <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                              Total Send
                          </div>
                      </Col>
                      <Col md="6" sm="12" className='d-flex justify-content-end border'>
                          <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                              {edit?.total_sent}
                          </div>
                      </Col> */}
                      <Col md="6" sm="12" className='d-flex justify-content-start border'>
                          <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                              Template Name
                          </div>
                      </Col>
                      <Col md="6" sm="12" className='d-flex justify-content-end border'>
                          <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                              {edit?.whats_app_template?.template_name}
                          </div>
                      </Col>
                      {/* <Col md="6" sm="12" className='d-flex justify-content-start border'>
                          <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                              Template Type
                          </div>
                      </Col>
                      <Col md="6" sm="12" className='d-flex justify-content-end border'>
                          <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                              {edit?.whats_app_template?.template_type}
                          </div>
                      </Col> */}
                      <Col md="6" sm="12" className='d-flex justify-content-start border'>
                          <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                              Template Category
                          </div>
                      </Col>
                      <Col md="6" sm="12" className='d-flex justify-content-end border'>
                          <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                              {edit?.whats_app_template?.category}
                          </div>
                      </Col>
                      {/* <Show IF={edit?.route_type === 3}>
                          <Col md="6" sm="12" className='d-flex justify-content-start border'>
                              <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                  Total Response Rating
                              </div>
                          </Col>
                          <Col md="6" sm="12" className='d-flex justify-content-end border'>
                              <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                  {edit?.total_response_ratings}
                              </div>
                          </Col>
                          <Col md="6" sm="12" className='d-flex justify-content-start border'>
                              <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                  Total Response Interests
                              </div>
                          </Col>
                          <Col md="6" sm="12" className='d-flex justify-content-end border'>
                              <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                  {edit?.total_response_interests}
                              </div>
                          </Col>
                          <Col md="6" sm="12" className='d-flex justify-content-start border'>
                              <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                  Total Response Feedbacks
                              </div>
                          </Col>
                          <Col md="6" sm="12" className='d-flex justify-content-end border'>
                              <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                                  {edit?.total_response_feedbacks}
                              </div>
                          </Col>
                      </Show> */}
                  </Row>
              </CardBody>

          </Card>
   </>
  )
}

export default WaBasicDetails
