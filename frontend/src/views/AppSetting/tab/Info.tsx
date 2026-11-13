// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardBody, CardHeader, CardTitle, Col, Row, Badge } from 'reactstrap'
import { Briefcase, Clock, Globe, Mail, MapPin, Percent, Phone, Shield, User } from 'react-feather'
import { appSettingForAdmin } from '../../../utility/apis/appSetting'

const Info = ({ activeTab }) => {
    const user = useSelector(state => state.auth.userData)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const [info, setInfo] = useState(null)

    const getInfo = () => {
        appSettingForAdmin({
            loading: setLoading,
            dispatch,
            success: (e) => {
                setInfo(e?.data)
            }
        })
    }

    useEffect(() => {
        if (activeTab === '1') {
            getInfo()
        }
    }, [activeTab])

    const isSuperAdmin = user?.userType === 0

    return (
        <Card className='border-0 shadow-sm'>
            <CardHeader className='border-bottom py-2 bg-light-primary bg-opacity-10 d-flex justify-content-between align-items-center'>
                <div className='d-flex align-items-center gap-2'>
                    <div className='p-1 rounded-circle bg-primary bg-opacity-10 text-primary'>
                        <User size={20} />
                    </div>
                    <div>
                        <CardTitle tag='h4' className='mb-0 fw-bolder text-dark'>Profile & Business Information</CardTitle>
                        <small className='text-muted'>Overview of your account identity and organizational contact parameters</small>
                    </div>
                </div>
                <Badge color='light-primary' pill className='px-2 py-1'>
                    {isSuperAdmin ? 'Platform Root' : 'Tenant Account'}
                </Badge>
            </CardHeader>

            <CardBody className='p-3'>
                {isSuperAdmin ? (
                    <Row className='gy-3'>
                        <Col md={4} sm={6}>
                            <div className='p-2 border rounded-3 bg-light bg-opacity-50 h-100'>
                                <div className='d-flex align-items-center gap-2 text-muted small mb-1'>
                                    <Briefcase size={14} className='text-primary' />
                                    <span>Application Name</span>
                                </div>
                                <div className='fw-bold text-dark'>{info?.app_name || 'KRAD Chat'}</div>
                            </div>
                        </Col>
                        <Col md={4} sm={6}>
                            <div className='p-2 border rounded-3 bg-light bg-opacity-50 h-100'>
                                <div className='d-flex align-items-center gap-2 text-muted small mb-1'>
                                    <Phone size={14} className='text-success' />
                                    <span>Support Phone</span>
                                </div>
                                <div className='fw-bold text-dark'>{info?.contact_number || '+91 80500 00000'}</div>
                            </div>
                        </Col>
                        <Col md={4} sm={6}>
                            <div className='p-2 border rounded-3 bg-light bg-opacity-50 h-100'>
                                <div className='d-flex align-items-center gap-2 text-muted small mb-1'>
                                    <Mail size={14} className='text-info' />
                                    <span>Support Email</span>
                                </div>
                                <div className='fw-bold text-dark'>{info?.contact_email || 'support@kradtechnologies.com'}</div>
                            </div>
                        </Col>
                        <Col md={4} sm={6}>
                            <div className='p-2 border rounded-3 bg-light bg-opacity-50 h-100'>
                                <div className='d-flex align-items-center gap-2 text-muted small mb-1'>
                                    <Percent size={14} className='text-warning' />
                                    <span>GST / Tax Percentage</span>
                                </div>
                                <div className='fw-bold text-dark'>{info?.tax_percentage ? `${info.tax_percentage}%` : '18%'}</div>
                            </div>
                        </Col>
                        <Col md={8} sm={12}>
                            <div className='p-2 border rounded-3 bg-light bg-opacity-50 h-100'>
                                <div className='d-flex align-items-center gap-2 text-muted small mb-1'>
                                    <MapPin size={14} className='text-danger' />
                                    <span>Registered Headquarter Address</span>
                                </div>
                                <div className='fw-bold text-dark'>{info?.contact_address || 'KRAD Technologies Private Limited'}</div>
                            </div>
                        </Col>
                    </Row>
                ) : (
                    <Row className='gy-3'>
                        <Col md={4} sm={6}>
                            <div className='p-2 border rounded-3 bg-light bg-opacity-50 h-100'>
                                <div className='d-flex align-items-center gap-2 text-muted small mb-1'>
                                    <User size={14} className='text-primary' />
                                    <span>Full Name</span>
                                </div>
                                <div className='fw-bold text-dark'>{user?.name || user?.username || '—'}</div>
                            </div>
                        </Col>
                        <Col md={4} sm={6}>
                            <div className='p-2 border rounded-3 bg-light bg-opacity-50 h-100'>
                                <div className='d-flex align-items-center gap-2 text-muted small mb-1'>
                                    <Mail size={14} className='text-info' />
                                    <span>Email Address</span>
                                </div>
                                <div className='fw-bold text-dark'>{user?.email || '—'}</div>
                            </div>
                        </Col>
                        <Col md={4} sm={6}>
                            <div className='p-2 border rounded-3 bg-light bg-opacity-50 h-100'>
                                <div className='d-flex align-items-center gap-2 text-muted small mb-1'>
                                    <Briefcase size={14} className='text-success' />
                                    <span>Company Name</span>
                                </div>
                                <div className='fw-bold text-dark'>{user?.companyName || user?.company_name || '—'}</div>
                            </div>
                        </Col>
                        <Col md={4} sm={6}>
                            <div className='p-2 border rounded-3 bg-light bg-opacity-50 h-100'>
                                <div className='d-flex align-items-center gap-2 text-muted small mb-1'>
                                    <Phone size={14} className='text-warning' />
                                    <span>Mobile Number</span>
                                </div>
                                <div className='fw-bold text-dark'>{user?.mobile || '—'}</div>
                            </div>
                        </Col>
                        <Col md={4} sm={6}>
                            <div className='p-2 border rounded-3 bg-light bg-opacity-50 h-100'>
                                <div className='d-flex align-items-center gap-2 text-muted small mb-1'>
                                    <Globe size={14} className='text-primary' />
                                    <span>Website</span>
                                </div>
                                <div className='fw-bold text-dark'>{user?.websiteUrl || user?.website_url || '—'}</div>
                            </div>
                        </Col>
                        <Col md={4} sm={6}>
                            <div className='p-2 border rounded-3 bg-light bg-opacity-50 h-100'>
                                <div className='d-flex align-items-center gap-2 text-muted small mb-1'>
                                    <Clock size={14} className='text-secondary' />
                                    <span>Session Lock Timeout</span>
                                </div>
                                <div className='fw-bold text-dark'>{user?.locktimeout ? `${user.locktimeout} minutes` : '30 minutes'}</div>
                            </div>
                        </Col>
                        <Col md={12}>
                            <div className='p-2 border rounded-3 bg-light bg-opacity-50'>
                                <div className='d-flex align-items-center gap-2 text-muted small mb-1'>
                                    <MapPin size={14} className='text-danger' />
                                    <span>Business Address</span>
                                </div>
                                <div className='fw-bold text-dark'>
                                    {[user?.address, user?.city, user?.zipcode || user?.zipCode].filter(Boolean).join(', ') || '—'}
                                </div>
                            </div>
                        </Col>
                    </Row>
                )}
            </CardBody>
        </Card>
    )
}

export default Info
