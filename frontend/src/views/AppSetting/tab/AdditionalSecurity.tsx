// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Plus, Shield, Trash2, CheckCircle, AlertTriangle } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Alert, Badge, Card, CardBody, CardHeader, CardTitle, Col, Form, Input, Row, Table } from 'reactstrap'
import { handleLogin } from '../../../redux/authentication'
import { ipDelete } from '../../../redux/reducers/ip'
import { formatDate, SuccessToast, ErrorToast } from '../../../utility/Utils'
import { addIp, deleteIp, loadIp } from '../../../utility/apis/IpList'
import { enableApiSecurity } from '../../../utility/apis/userManagement'
import ConfirmAlert from '../../../utility/helpers/ConfirmAlert'
import LoadingButton from '../../components/buttons/LoadingButton'
import FormGroupCustom from '../../components/formGroupCustom'
import Shimmer from '../../components/shimmers/Shimmer'

const AdditionalSecurity = ({ activeTab, user }) => {
    const [loading, setLoading] = useState(false)
    const [ip, setIp] = useState(null)
    const [loadingToggle, setLoadingToggle] = useState(false)
    const [deleted, setDeleted] = useState(false)
    const [failed, setFailed] = useState(false)
    const [deletedId, setDeletedId] = useState(null)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, watch } = form
    const dispatch = useDispatch()

    const getAllIp = () => {
        loadIp({
            success: (d) => {
                setIp(d)
            }
        })
    }

    const isSecurityEnabled = Number(user?.is_enabled_api_ip_security) === 1

    const handleToggleSecurity = (e) => {
        const nextState = e.target.checked ? 1 : 0
        setLoadingToggle(true)
        enableApiSecurity({
            jsonData: {
                ...user,
                is_enabled_api_ip_security: nextState
            },
            success: (d) => {
                setLoadingToggle(false)
                dispatch(handleLogin({
                    ...user,
                    ...d?.data,
                    is_enabled_api_ip_security: nextState
                }))
                SuccessToast(nextState === 1 ? 'IP Whitelisting security enabled!' : 'IP Whitelisting disabled.')
            },
            errors: () => {
                setLoadingToggle(false)
                ErrorToast('Failed to update IP security setting.')
            }
        })
    }

    useEffect(() => {
        if (activeTab === '7') {
            getAllIp()
        }
    }, [activeTab])

    const onSubmit = (data) => {
        addIp({
            jsonData: {
                ip_address: data?.ip_address?.trim()
            },
            loading: setLoading,
            success: () => {
                reset({ ip_address: '' })
                getAllIp()
                SuccessToast('IP address added to whitelist!')
            },
            errors: (err) => {
                ErrorToast(err?.message || 'Invalid IP address format.')
            }
        })
    }

    return (
        <Card className='border-0 shadow-sm'>
            <CardHeader className='border-bottom py-2 bg-light-primary bg-opacity-10 d-flex justify-content-between align-items-center'>
                <div className='d-flex align-items-center gap-2'>
                    <div className='p-1 rounded-circle bg-primary bg-opacity-10 text-primary'>
                        <Shield size={20} />
                    </div>
                    <div>
                        <CardTitle tag='h4' className='mb-0 fw-bolder text-dark'>IP Whitelist & Network Security</CardTitle>
                        <small className='text-muted'>Restrict API access strictly to your designated and approved server IP addresses</small>
                    </div>
                </div>
                <Badge color={isSecurityEnabled ? 'light-success' : 'light-secondary'} pill className='px-2 py-1'>
                    {isSecurityEnabled ? 'Active Filter' : 'Filter Disabled'}
                </Badge>
            </CardHeader>

            <CardBody className='p-3'>
                {/* Security Toggle Switch Banner */}
                <div className='p-3 border rounded-3 bg-light bg-opacity-50 mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2'>
                    <div>
                        <h5 className='fw-bold mb-1 text-dark'>Enforce IP Whitelist Protection</h5>
                        <p className='text-muted small mb-0'>
                            When enabled, our gateway strictly rejects all API key requests originating from unlisted IP addresses.
                        </p>
                    </div>
                    <div className='form-check form-switch'>
                        <Input
                            type='switch'
                            id='ip-security-switch'
                            checked={isSecurityEnabled}
                            disabled={loadingToggle}
                            onChange={handleToggleSecurity}
                            style={{ width: '42px', height: '22px', cursor: 'pointer' }}
                        />
                    </div>
                </div>

                {isSecurityEnabled ? (
                    <Row className='gy-3'>
                        {/* Add IP Address Form */}
                        <Col lg={5} md={12}>
                            <div className='p-3 border rounded-3 bg-white h-100 shadow-xs'>
                                <h5 className='fw-bold mb-2 text-dark d-flex align-items-center gap-1'>
                                    <Plus size={16} className='text-primary' />
                                    <span>Add Whitelisted IP</span>
                                </h5>
                                <Form onSubmit={handleSubmit(onSubmit)}>
                                    <FormGroupCustom
                                        type='text'
                                        control={control}
                                        name='ip_address'
                                        label='IPv4 or IPv6 Address'
                                        placeholder='e.g. 198.51.100.1 or 2001:db8::1'
                                        errors={errors}
                                        className='mb-2'
                                        rules={{ required: 'IP Address is required' }}
                                    />
                                    <LoadingButton loading={loading} type='submit' color='primary' block className='shadow-sm'>
                                        <Plus size={14} className='me-1' /> Add to Whitelist
                                    </LoadingButton>
                                </Form>
                            </div>
                        </Col>

                        {/* Whitelisted IPs Table */}
                        <Col lg={7} md={12}>
                            <div className='p-3 border rounded-3 bg-white h-100 shadow-xs'>
                                <h5 className='fw-bold mb-2 text-dark d-flex align-items-center justify-content-between'>
                                    <span>Authorized IP Addresses</span>
                                    <Badge color='light-info' pill>{ip?.data?.length || 0} IPs</Badge>
                                </h5>

                                {loading ? (
                                    <>
                                        <Shimmer style={{ height: 35, marginBottom: 8, borderRadius: 4 }} />
                                        <Shimmer style={{ height: 35, marginBottom: 8, borderRadius: 4 }} />
                                    </>
                                ) : (
                                    <div className='table-responsive'>
                                        <Table hover size='sm' className='mb-0'>
                                            <thead>
                                                <tr className='text-muted small'>
                                                    <th>#</th>
                                                    <th>IP Address</th>
                                                    <th>Added On</th>
                                                    <th className='text-end'>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ip?.data && ip.data.length > 0 ? (
                                                    ip.data.map((item, idx) => (
                                                        <tr key={item?.id || idx}>
                                                            <td>{idx + 1}</td>
                                                            <td>
                                                                <code className='text-primary fw-semibold'>{item?.ip_address}</code>
                                                            </td>
                                                            <td className='text-muted small'>
                                                                {formatDate(item?.created_at, 'DD MMM YYYY')}
                                                            </td>
                                                            <td className='text-end'>
                                                                <ConfirmAlert
                                                                    title={`Remove ${item?.ip_address}?`}
                                                                    color='text-warning'
                                                                    onClickYes={() => deleteIp({
                                                                        id: item?.id,
                                                                        success: () => {
                                                                            dispatch(ipDelete(item?.id))
                                                                            getAllIp()
                                                                            SuccessToast('IP removed successfully')
                                                                        },
                                                                        error: () => ErrorToast('Failed to delete IP')
                                                                    })}
                                                                    className='btn btn-flat-danger btn-sm p-1'
                                                                    id={`del-ip-${item?.id}`}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </ConfirmAlert>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={4} className='text-center py-4 text-muted small'>
                                                            No IP addresses whitelisted yet. All requests are currently blocked.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                ) : (
                    <Alert color='warning' className='d-flex align-items-center gap-2 mb-0 py-2'>
                        <AlertTriangle size={18} className='flex-shrink-0 text-warning' />
                        <div className='small text-dark'>
                            <strong>IP Whitelisting is currently inactive:</strong> Your API endpoints will accept requests from any client IP address holding a valid API key. Enable the switch above to enforce IP security.
                        </div>
                    </Alert>
                )}
            </CardBody>
        </Card>
    )
}

export default AdditionalSecurity
