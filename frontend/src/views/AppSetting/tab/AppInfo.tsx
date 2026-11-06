// @ts-nocheck
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import React, { useEffect, useRef, useState } from 'react'
import { CopyToClipboard } from '@components/copy-to-clipboard'
import { Key } from 'react-feather'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Card, CardHeader, Row, UncontrolledTooltip } from 'reactstrap'
import { addIp, loadIp } from '../../../utility/apis/IpList'
import { enableApiSecurity, userChangeApi } from '../../../utility/apis/userManagement'
import useUser from '../../../utility/hooks/useUser'
import ConfirmStop from '../../../utility/helpers/ConfirmStop'
import { log } from '../../../utility/helpers/common'
import { emitAlertStatus } from '../../../utility/Utils'


const AppInfo = ({ activeTab }) => {
    const user = useSelector(state => state.auth.userData)
    const [loading, setLoading] = useState(false)
    const [api, setApi] = useState(null)
    const form = useForm()
    const [ip, setIp] = useState(null)
    const [loadingSet, setLoadingSet] = useState(false)
    const [deleted, setDeleted] = useState(false)
    const [failed, setFailed] = useState(false)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form
    const [deletedId, setDeletedId] = useState(null)
    const [copied, setCopied] = useState(false)
    const userT = useUser()
    const ref = useRef(null)

    const handleCopy = ({ target: { api } }) => {
        setApi(api)
        if (copied) {
            setCopied(false)
        }
    }

    const onCopyKey = () => {
        setCopied(true)
        toast.success('Api key Copied !')
    }
    const onCopySecret = () => {
        setCopied(true)
        toast.success('Api Secret Copied !')
    }

    const dispatch = useDispatch()
    const [count, setCount] = useState(1)

    const increaseCount = () => {
        setCount(count + 1)
    }

    const deleteForm = e => {
        e.preventDefault()
        const slideDownWrapper = e.target.closest('.react-slidedown'),
            form = e.target.closest('form')
        if (slideDownWrapper) {
            slideDownWrapper.remove()
        } else {
            form.remove()
        }
    }

    const userApi = () => {
        userChangeApi({
            success: (d) => {
                setApi(d)

            }
        })
    }

    useEffect(() => {
        if (activeTab === "4") {
            userApi()
        }
    }, [watch("change_api"), activeTab])

    const [copySuccess, setCopySuccess] = useState('')
    const textAreaRef = useRef(null)

    const copyToClipboard = (e) => {
        textAreaRef.current.select()
        document.execCommand('copy')
        // This is just personal preference.
        // I prefer to not show the whole text area selected.
        e?.target?.focus()
        setCopySuccess('Copied!')
    }

    const enableSecurity = (data) => {
        enableApiSecurity({
            jsonData: {
                // ...userT,
                ...data,
                is_enabled_api_ip_security: watch("is_enabled_api_ip_security") ? 1 : 0
            },
            success: (d) => {

            }
        })
    }
    const getAllIp = () => {
        loadIp({
            success: (d) => {
                setIp(d)
            }
        })
    }


    const onSubmit = (dataa) => {
        addIp({
            jsonData: {
                ip_address: dataa?.ip_address

            },
            loading: setLoading,
            success: () => {
                ///  getAllIp()
            }
        })
    }

    const handleSave = () => {
        userChangeApi({
            jsonData: {
                change_key: 1

            },
            loading: setLoading,
            success: (e) => {
                userApi()
                emitAlertStatus("success", null, 'stop-campaign')
            }
        })
    }


    return (
        <>
            <Card className='p-2'>
                <Row>
                    <CardHeader className='border-bottom d-flex justify-content-between align-items-center mb-2'>
                        <h4 className='h4 text-dark fw-bolder mb-0'>
                            Api Keys
                        </h4>

                        <div className='d-flex justify-content-end'>
                            <ConfirmStop
                                eventId={`stop-campaign`}
                                title={`Change API Key & Secret?`}
                                color='text-warning'
                                onClickYes={() => handleSave()}
                            >
                                <Button.Ripple size="sm" color="primary">
                                    <Key size="14" /> Change API Key & Secret
                                </Button.Ripple>
                            </ConfirmStop>
                        </div>
                    </CardHeader>

                    {(() => {
                        const apiKey = api?.app_key || api?.api_key || ''
                        const apiSecret = api?.app_secret || api?.key_id || ''
                        return (
                            <>
                                <div className='d-flex justify-content-between align-items-center border p-1 rounded-top'>
                                    <div className='h5 mb-0 text-dark fw-bolder'>
                                        Api key
                                    </div>
                                    <div className="h5 mb-0 text-dark fw-bolder d-flex align-items-center">
                                        {apiKey ? (
                                            <>
                                                <code className='user-select-all text-primary me-1' style={{ fontSize: '0.9rem' }}>{apiKey}</code>
                                                <CopyToClipboard onCopy={onCopyKey} text={apiKey}>
                                                    <ContentCopyIcon className='text-success' style={{ cursor: 'pointer' }} />
                                                </CopyToClipboard>
                                            </>
                                        ) : (
                                            <span className='text-muted fw-normal fst-italic' style={{ fontSize: '0.85rem' }}>
                                                Click &quot;Change API Key &amp; Secret&quot; to generate keys
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className='d-flex justify-content-between align-items-center border-start border-end border-bottom p-1 rounded-bottom'>
                                    <div className='h5 mb-0 text-dark fw-bolder'>
                                        Api Secret
                                    </div>
                                    <div className="h5 mb-0 text-dark fw-bolder d-flex align-items-center">
                                        {apiSecret ? (
                                            <>
                                                <code className='user-select-all text-secondary me-1' style={{ fontSize: '0.9rem' }}>{apiSecret}</code>
                                                <CopyToClipboard onCopy={onCopySecret} text={apiSecret}>
                                                    <ContentCopyIcon className='text-success' style={{ cursor: 'pointer' }} />
                                                </CopyToClipboard>
                                            </>
                                        ) : (
                                            <span className='text-muted fw-normal fst-italic' style={{ fontSize: '0.85rem' }}>—</span>
                                        )}
                                    </div>
                                </div>
                            </>
                        )
                    })()}

                </Row>
            </Card>
        </>
    )
}

export default AppInfo
