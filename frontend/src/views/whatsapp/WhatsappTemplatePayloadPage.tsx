// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { CardBody, CardHeader, Col, Row } from 'reactstrap'
import CopyToClipboard from '@components/copy-to-clipboard'
import CenteredModal from '../components/modal/CenteredModal'
import { log } from '../../utility/helpers/common'
import hljs from 'highlight.js'
import toast from 'react-hot-toast'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

export default function WhatsappTemplatePayloadPage({
    edit = null,
    noView = false,
    modal = false,
    setModal = () => { },
    preload,
    Component = "span",
    showModal = false,
    setShowModal = () => { },
    children = null,
    ...rest
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

    const dispatch = useDispatch()
    const form = useForm({
        defaultValues: {
            ratio: 0
        }
    })
    const { handleSubmit, reset } = form

        const onCopyKey = () => {
            setCopied(true)
            toast.success('Payload Copied !')
        }
    const handleShow = () => {
        reset()
        setOpen(!open)
        setModal(!open)
    }

    const handleClose = () => {
        handleShow()
        setShowModal(false)
    }

    useEffect(() => {
        if (showModal) handleShow()
    }, [showModal])

    // Ensure edit is not null before using JSON.stringify
    const jsonData = edit ? JSON.stringify(edit?.data, null, 2) : '{}'

    const highlightedCode = (text, lang) => hljs.highlight(text, { language: lang }).value

    const codyData = () => {
        <CopyToClipboard onCopy={onCopyKey} text={jsonData}><ContentCopyIcon className='text-success' text={jsonData} style={{ cursor: 'pointer' }} /></CopyToClipboard>
    }
    return (
        <>
            {!noView ? (
                <Component role="button" onClick={handleShow} {...rest}>
                    {children}
                </Component>
            ) : null}

            <CenteredModal
                loading={loading}
                open={open}
                scrollControl={false}
                handleModal={handleClose}
                modalClass="modal-md"
                disableFooter={false}
                hideSave
                extraButtons={
                    <CopyToClipboard onCopy={onCopyKey} text={jsonData}>
                        <button type="button" className="btn btn-primary">
                            Copy Payload
                        </button>
                    </CopyToClipboard>
                }
                title={<>
                  View Payload
                </>}
            >
                <form>
                    <CardBody>
                       
                        
                        <span className="hljs">
                            <pre>
                                <code dangerouslySetInnerHTML={{ __html: highlightedCode(jsonData, 'json') }} />
                            </pre>
                        </span>
                    </CardBody>
                </form>
            </CenteredModal>
        </>
    )
}
