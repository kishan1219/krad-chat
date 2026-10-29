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
                    <CardHeader className='border-bottom'>
                        <h4 className='h2 text-dark fw-bolder' >
                            Api Keys
                        </h4>

                        <div className='d-flex justify-content-end'>

                            {/* <UncontrolledTooltip target="reload">Change API Key & Secret</UncontrolledTooltip>

                            <Button.Ripple size="sm" color="primary" id="reload" onClick={handleSave} >
                                <Key size="14" /> Change API Key & Secret
                            </Button.Ripple> */}
                            <ConfirmStop
                                // item={row}
                                eventId={`stop-campaign`}
                                title={`Change API Key & Secret !!!`}
                                color='text-warning'
                                onClickYes={() => handleSave()}
                                // onSuccessEvent={(item) => { log("item", item); navigate('/') }}
                                // onFailedEvent={((item) => { log("item", item) })}
                                // className="dropdown-item"
                            // id={`grid-delete-${row?.id}`}
                            >
                                {/* <Key size="14" /><span className='ms-1 align-middle'>Change API Key & Secret</span> */}
                                <Button.Ripple size="sm" color="primary">
                                    <Key size="14" /> Change API Key & Secret
                                </Button.Ripple>
                            </ConfirmStop>

                        </div>

                    </CardHeader>

                    <div className='d-flex justify-content-between border'>
                        <div className='mt-1 mb-1 h5 text-dark fw-bolder' >
                            Api key
                        </div>
                        <div className="mt-1 mb-1 h5 text-dark fw-bolder">

                            {api?.app_key}  <CopyToClipboard onCopy={onCopyKey} text={api?.app_key}><ContentCopyIcon className='text-success' text={api?.app_key} style={{ cursor: 'pointer' }} /></CopyToClipboard>
                        </div>
                    </div>
                    <div className='d-flex justify-content-between border-top border bottom'>
                        <div className='mt-1 mb-1 h5 text-dark fw-bolder '>
                            Api Secret
                        </div>
                        <div className="mt-1 mb-1 h5 text-dark fw-bolder">
                            {api?.app_secret} <CopyToClipboard onCopy={onCopySecret} text={api?.app_secret}><ContentCopyIcon className='text-success' style={{ cursor: 'pointer' }} /></CopyToClipboard>
                        </div>
                    </div>

                </Row>
            </Card>
        </>
    )
}

export default AppInfo
