// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { CopyToClipboard } from '@components/copy-to-clipboard'
import { Check, Copy, Eye, EyeOff, Key, RefreshCw, Shield, Terminal } from 'react-feather'
import { Alert, Badge, Button, Card, CardBody, CardHeader, Col, Input, InputGroup, Row } from 'reactstrap'
import { userChangeApi } from '../../../utility/apis/userManagement'
import ConfirmStop from '../../../utility/helpers/ConfirmStop'
import { emitAlertStatus, SuccessToast, ErrorToast } from '../../../utility/Utils'

const AppInfo = ({ activeTab }) => {
    const [loading, setLoading] = useState(false)
    const [api, setApi] = useState(null)
    const [showSecret, setShowSecret] = useState(false)
    const [copiedKey, setCopiedKey] = useState(false)
    const [copiedSecret, setCopiedSecret] = useState(false)
    const [copiedCurl, setCopiedCurl] = useState(false)

    const fetchUserApi = () => {
        setLoading(true)
        userChangeApi({
            loading: setLoading,
            success: (d) => {
                setApi(d?.data || d)
            },
            errors: () => {
                ErrorToast('Failed to load API credentials.')
            }
        })
    }

    useEffect(() => {
        if (activeTab === '4') {
            fetchUserApi()
        }
    }, [activeTab])

    const handleCopyKey = () => {
        setCopiedKey(true)
        SuccessToast('API Key copied to clipboard!')
        setTimeout(() => setCopiedKey(false), 2500)
    }

    const handleCopySecret = () => {
        setCopiedSecret(true)
        SuccessToast('API Secret copied to clipboard!')
        setTimeout(() => setCopiedSecret(false), 2500)
    }

    const handleCopyCurl = () => {
        setCopiedCurl(true)
        SuccessToast('Sample cURL command copied!')
        setTimeout(() => setCopiedCurl(false), 2500)
    }

    const handleRotateKeys = () => {
        userChangeApi({
            jsonData: {
                change_key: 1
            },
            loading: setLoading,
            success: (e) => {
                setApi(e?.data || e)
                emitAlertStatus('success', null, 'rotate-api-keys')
                SuccessToast('New API Key & Secret generated successfully!')
            },
            errors: () => {
                ErrorToast('Failed to rotate API credentials.')
            }
        })
    }

    const apiKey = api?.app_key || api?.api_key || ''
    const apiSecret = api?.app_secret || api?.key_id || ''

    const sampleCurl = `curl -X POST https://krad-chat.guptakishan805.workers.dev/api/v1/send-whatsapp \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"recipient": "+1234567890", "message": "Hello from KRAD Chat!"}'`

    return (
        <div className='app-keys-management'>
            <Card className='border-0 shadow-sm mb-3'>
                <CardHeader className='border-bottom py-2 bg-light-primary bg-opacity-10 d-flex flex-wrap justify-content-between align-items-center gap-2'>
                    <div className='d-flex align-items-center gap-2'>
                        <div className='p-1 rounded-circle bg-primary bg-opacity-10 text-primary'>
                            <Shield size={22} />
                        </div>
                        <div>
                            <h4 className='fw-bolder mb-0 text-dark'>Developer API Keys</h4>
                            <small className='text-muted'>
                                Secure credentials for integrating WhatsApp chatbots, webhook endpoints, and automated campaigns
                            </small>
                        </div>
                    </div>

                    <div className='d-flex align-items-center gap-2'>
                        <ConfirmStop
                            eventId='rotate-api-keys'
                            title='Regenerate API Key & Secret?'
                            description='Existing integrations using the old credentials will stop functioning immediately.'
                            color='text-warning'
                            onClickYes={handleRotateKeys}
                        >
                            <Button color='primary' size='sm' className='d-flex align-items-center gap-1 shadow-sm' disabled={loading}>
                                <RefreshCw size={14} className={loading ? 'spin' : ''} />
                                <span>Change API Key & Secret</span>
                            </Button>
                        </ConfirmStop>
                    </div>
                </CardHeader>

                <CardBody className='p-3'>
                    <Alert color='info' className='d-flex align-items-center gap-2 mb-3 py-2'>
                        <Key size={18} className='flex-shrink-0 text-info' />
                        <div className='small text-dark'>
                            <strong>Keep your API credentials private:</strong> Never commit API keys or secrets to public repositories or expose them in client-side code.
                        </div>
                    </Alert>

                    <Row className='gy-3'>
                        {/* API Key Box */}
                        <Col md={12}>
                            <div className='p-3 border rounded-3 bg-white shadow-xs'>
                                <div className='d-flex justify-content-between align-items-center mb-1'>
                                    <div className='d-flex align-items-center gap-2'>
                                        <span className='fw-bold text-dark' style={{ fontSize: '0.92rem' }}>API Key</span>
                                        <Badge color='light-success' pill className='px-2'>Production</Badge>
                                    </div>
                                    <span className='text-muted small'>Header: <code className='text-primary'>x-api-key</code> or <code className='text-primary'>Bearer</code></span>
                                </div>
                                <InputGroup className='align-items-center'>
                                    <Input
                                        type='text'
                                        readOnly
                                        value={apiKey || 'Click "Change API Key & Secret" to generate your key'}
                                        className='font-monospace bg-light border-end-0 fw-semibold text-primary'
                                        style={{ fontSize: '0.88rem', letterSpacing: '0.5px' }}
                                    />
                                    {apiKey && (
                                        <CopyToClipboard onCopy={handleCopyKey} text={apiKey}>
                                            <Button color='primary' outline className='d-flex align-items-center gap-1'>
                                                {copiedKey ? <Check size={15} className='text-success' /> : <Copy size={15} />}
                                                <span className='d-none d-sm-inline'>{copiedKey ? 'Copied' : 'Copy'}</span>
                                            </Button>
                                        </CopyToClipboard>
                                    )}
                                </InputGroup>
                            </div>
                        </Col>

                        {/* API Secret Box */}
                        <Col md={12}>
                            <div className='p-3 border rounded-3 bg-white shadow-xs'>
                                <div className='d-flex justify-content-between align-items-center mb-1'>
                                    <div className='d-flex align-items-center gap-2'>
                                        <span className='fw-bold text-dark' style={{ fontSize: '0.92rem' }}>API Secret</span>
                                        <Badge color='light-warning' pill className='px-2'>Confidential</Badge>
                                    </div>
                                    <span className='text-muted small'>Used to sign secure webhook payloads</span>
                                </div>
                                <InputGroup className='align-items-center'>
                                    <Input
                                        type={showSecret ? 'text' : 'password'}
                                        readOnly
                                        value={apiSecret || '••••••••••••••••••••••••••••••••'}
                                        className='font-monospace bg-light border-end-0 fw-semibold text-dark'
                                        style={{ fontSize: '0.88rem', letterSpacing: '0.5px' }}
                                    />
                                    {apiSecret && (
                                        <>
                                            <Button
                                                color='secondary'
                                                outline
                                                onClick={() => setShowSecret(!showSecret)}
                                                title={showSecret ? 'Hide secret' : 'Reveal secret'}
                                                className='border-start-0'
                                            >
                                                {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </Button>
                                            <CopyToClipboard onCopy={handleCopySecret} text={apiSecret}>
                                                <Button color='primary' outline className='d-flex align-items-center gap-1'>
                                                    {copiedSecret ? <Check size={15} className='text-success' /> : <Copy size={15} />}
                                                    <span className='d-none d-sm-inline'>{copiedSecret ? 'Copied' : 'Copy'}</span>
                                                </Button>
                                            </CopyToClipboard>
                                        </>
                                    )}
                                </InputGroup>
                            </div>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {/* Integration Quick Start Section */}
            <Card className='border-0 shadow-sm'>
                <CardHeader className='border-bottom py-2 bg-light bg-opacity-50 d-flex justify-content-between align-items-center'>
                    <div className='d-flex align-items-center gap-2'>
                        <Terminal size={18} className='text-primary' />
                        <h5 className='mb-0 fw-bold text-dark'>Quick Integration Preview</h5>
                    </div>
                    <CopyToClipboard onCopy={handleCopyCurl} text={sampleCurl}>
                        <Button color='flat-primary' size='sm' className='d-flex align-items-center gap-1'>
                            {copiedCurl ? <Check size={14} className='text-success' /> : <Copy size={14} />}
                            <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
                        </Button>
                    </CopyToClipboard>
                </CardHeader>
                <CardBody className='p-3'>
                    <pre
                        className='bg-dark text-white p-3 rounded-3 mb-0 user-select-all font-monospace'
                        style={{ fontSize: '0.82rem', overflowX: 'auto', lineHeight: '1.6' }}
                    >
                        {sampleCurl}
                    </pre>
                </CardBody>
            </Card>
        </div>
    )
}

export default AppInfo
