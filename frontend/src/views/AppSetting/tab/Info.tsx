// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'reactstrap'
import Hide from '../../../utility/Hide'
import Show from '../../../utility/Show'
import { appSettingForAdmin } from '../../../utility/apis/appSetting'
import { log } from '../../../utility/helpers/common'

const Info = ({activeTab}) => {
    const user = useSelector(state => state.auth.userData)
    const [loading, setLoading] = useState(false)

    const dispatch = useDispatch()
 
    const [info, setInfo] = useState(null)
    const getInfo = () => {
        appSettingForAdmin({
            // perPage: 1000,
            loading: setLoading,
            dispatch,
            success: (e) => {
                setInfo(e?.data)
            }
        })
    }

    useEffect(() => {
        if (activeTab === "1") {
        getInfo()
        }
    }, [activeTab])

    // log(info)

    return (
        <>
            <Card>
                <CardHeader className='border-bottom'>
                    <CardTitle tag='h4'>Profile Details</CardTitle>
                </CardHeader>
                <Show IF={user?.userType === 0}>
                    <CardBody className='py-2 my-25'>
                        <Row className='align-items-start gy-2'>
                            <Col md="3">
                                <p className='mb-0 text-dark fw-bolder'>
                                    App Name
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {info?.app_name ?? 'N/A'}
                                </p>
                            </Col>
                            <Col md="3">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Contact Number
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {info?.contact_number ?? 'N/A'}
                                </p>
                            </Col>
                            <Col md="3">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Contact Email
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {info?.contact_email ?? 'N/A'}
                                </p>
                            </Col>
                            <Col md="3">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Tax Percentage
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {info?.tax_percentage ?? 'N/A'}
                                </p>
                            </Col>
                           
                        </Row>
                        <Row className='border-top pt-2 mt-2 gy-2'>
                            
                            <Col md="12">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Contact Address
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {info?.contact_address ?? 'N/A'}
                                </p>
                            </Col>
                        </Row>
                    </CardBody>
                </Show>
                <Hide IF={user?.userType === 0}>
                    <CardBody className='py-2 my-25'>
                        <Row className='align-items-start gy-2'>
                            <Col md="3">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Name
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {user?.name ?? 'N/A'}
                                </p>
                            </Col>
                           
                            <Col md="3">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Company Name
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {user?.companyName ?? 'N/A'}
                                </p>
                            </Col>
                            <Col md="3">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Contact Address
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {user?.address ?? 'N/A'}
                                </p>
                            </Col>
                            
                        </Row>
                        <Row className='border-top pt-2 mt-2 gy-2'>
                            <Col md="3">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Website Url
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {user?.websiteUrl ?? 'N/A'}
                                </p>
                            </Col>
                            <Col md="3">
                                <p className='mb-0 text-dark fw-bolder'>
                                   City
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {user?.city}, {user?.zipCode ?? 'N/A'}
                                </p>
                            </Col>
                            <Col md="3">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Designation
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {user?.designation ?? 'N/A'}
                                </p>
                            </Col>
                            <Col md="3">
                                <p className='mb-0 text-dark fw-bolder'>
                                    Locktimeout
                                </p>
                                <p className='mb-0 fw-bold text-secondary'>
                                    {user?.locktimeout ?? 'N/A'}
                                </p>
                            </Col>
                        </Row>
                    </CardBody>
                </Hide>
            </Card>
        </>
    )
}

export default Info
