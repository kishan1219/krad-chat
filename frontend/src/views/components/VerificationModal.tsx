// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input, Row, Col } from 'reactstrap'
import { X, AlertCircle } from 'react-feather'
import FormGroupCustom from './formGroupCustom'
import { getWhatsappTemplateLanguage } from '../../utility/apis/whatsappTemplate'
import { useForm } from 'react-hook-form'

const VerificationModal = ({
    isOpen,
    toggle,
    onSMS,
    onVoice,
    item, // This will be passed to onSMS/onVoice
    title = "Send Verification code on?",
    subtitle = "",
    setShowModal, // From parent component
    setConfigData // From parent component
}) => {

    const form = useForm()
    // const location = useLocation()
    // const { data } = location.state
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError, getValues } = form
    const [selectedLanguage, setSelectedLanguage] = useState('en')
    const [loading, setLoading] = useState(false)
    const [loadLanguage, setLoadLanguage] = useState(null)


    const handleSMSClick = () => {
        onSMS({ otp_method: 'SMS', language: selectedLanguage, id: item?.id })
        setShowModal(true) // Assuming this is to show a success/config modal after request
        setConfigData(item?.id) // Assuming this sets data for the next modal
        toggle() // Close this modal
    }

    const handleVoiceClick = () => {
        onVoice({ otp_method: 'VOICE', language: selectedLanguage, id: item?.id })
        setShowModal(true) // Assuming this is to show a success/config modal after request
        setConfigData(item?.id) // Assuming this sets data for the next modal
        toggle() // Close this modal
    }

    // Custom close button for the modal header
    const CloseBtn = <X className='cursor-pointer' size={15} onClick={toggle} />

    const whatsappTemplateLanguage = () => {
        getWhatsappTemplateLanguage({
            loading: setLoading,
            success: (d) => {
                const drop = []
                const object = d
                // log('object', object)
                for (const key in object) {
                    if (Object.hasOwnProperty.call(object, key)) {
                        const element = object[key]
                        drop.push({ value: element, label: key })
                    }
                }
                setLoadLanguage(drop)
            }

        })
    }

    useEffect(() => {
        whatsappTemplateLanguage()
    }, [isOpen])

    return (
        <Modal isOpen={isOpen} toggle={toggle} className='modal-dialog-centered'>
            <ModalHeader toggle={toggle} close={CloseBtn}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  
                </div>
            </ModalHeader>
            <ModalBody className=''>
                <>
                    <h4 className='text-center'  style={{ color: '#6c6c6c', fontWeight: '600', fontSize: '1.3rem', marginBottom: '1rem' }}>{title}</h4>
                    {/* {subtitle && <p style={{ color: '#b23c3c', fontSize: '1.1rem', marginBottom: '1rem' }}>{subtitle}</p>} */}
                        <Row>
                            <Col md="12">
                            <FormGroupCustom
                                // key={resetIt}
                                // key={resetIt}
                                defaultOptions
                                control={control}
                                type={"select"}
                                errors={errors}
                                name={"template_language"}
                                isClearable
                                value={'en'}
                                placeholder="Select Language"
                                className='mb-1'
                                loadOptions={whatsappTemplateLanguage}
                                options={loadLanguage}
                                label="Choose Language"
                                rules={{ required: true }}
                            />
                            </Col>
                        </Row>
                  
                </>
            </ModalBody>
            <ModalFooter className='d-flex justify-content-center'>
                <Row className='w-100'> {/* Use w-100 to make the row take full width */}
                    <Col md="6" className='d-flex justify-content-end pe-1'> {/* Adjust padding/margin as needed */}
                        <Button color='success' onClick={handleSMSClick} style={{ background: '#00b894', color: '#fff', fontWeight: '600', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer', width: '100%' }}>
                            SMS
                        </Button>
                    </Col>
                    <Col md="6" className='d-flex justify-content-start ps-1'> {/* Adjust padding/margin as needed */}
                        <Button color='primary' onClick={handleVoiceClick} style={{ background: '#0984e3', color: '#fff', fontWeight: '600', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer', width: '100%' }}>
                            Voice
                        </Button>
                    </Col>
                </Row>
            </ModalFooter>
        </Modal>
    )
}

export default VerificationModal
