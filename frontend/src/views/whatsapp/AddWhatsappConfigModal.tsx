import React from 'react'
import { Modal, ModalHeader, ModalBody, Alert, Card, CardBody, Row, Col, Input, Label, Button } from 'reactstrap'
import { Settings, X } from 'react-feather'
import { useWhatsAppOnboarding } from './hooks/useWhatsAppOnboarding'
import { StepPrerequisites } from './components/onboarding/StepPrerequisites'
import { StepBusinessProfile } from './components/onboarding/StepBusinessProfile'
import { StepMetaAuthorize } from './components/onboarding/StepMetaAuthorize'
import { WabaMultiNumberSelector } from './components/onboarding/WabaMultiNumberSelector'

interface AddWhatsappConfigModalProps {
    isOpen: boolean
    onClose?: () => void
    toggle?: () => void
    onSuccess?: () => void
}

export default function AddWhatsappConfigModal({
    isOpen,
    onClose,
    toggle,
    onSuccess
}: AddWhatsappConfigModalProps) {
    const handleClose = () => {
        if (onClose) onClose()
        else if (toggle) toggle()
    }

    const {
        step,
        setStep,
        name,
        setName,
        category,
        setCategory,
        enableAutoResponse,
        setEnableAutoResponse,
        autoResponseMessage,
        setAutoResponseMessage,
        busy,
        error,
        notice,
        config,
        showQuickConfig,
        setShowQuickConfig,
        quickAppId,
        setQuickAppId,
        quickConfigId,
        setQuickConfigId,
        quickAppSecret,
        setQuickAppSecret,
        quickGraphVersion,
        setQuickGraphVersion,
        savingQuickConfig,
        saveQuickConfig,
        handleConnectWithFacebook,
        wabaPhoneNumbers,
        selectedNumberIds,
        setSelectedNumberIds,
        numberLabels,
        setNumberLabels,
        handleBatchConnect
    } = useWhatsAppOnboarding(isOpen, onSuccess, handleClose)

    if (!isOpen) return null

    return (
        <Modal
            isOpen={isOpen}
            toggle={handleClose}
            className="modal-dialog-centered modal-lg"
            contentClassName="rounded-3 shadow-lg border-0"
            backdrop="static"
            keyboard={false}
        >
            <ModalHeader
                toggle={handleClose}
                className="border-bottom py-1"
                close={
                    <div className="d-flex align-items-center gap-1">
                        <Button
                            color="link"
                            size="sm"
                            className="p-50 text-muted"
                            title="Meta App Config"
                            onClick={() => setShowQuickConfig(!showQuickConfig)}
                        >
                            <Settings size={18} />
                        </Button>
                        <Button
                            color="link"
                            size="sm"
                            className="p-50 text-muted"
                            onClick={handleClose}
                        >
                            <X size={20} />
                        </Button>
                    </div>
                }
            >
                <div>
                    <span className="fw-bolder" style={{ color: '#5e5873', fontSize: '1.15rem' }}>
                        Add Configuration
                    </span>
                </div>
            </ModalHeader>

            <ModalBody className="p-2" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                {/* Meta Embedded Credentials Drawer */}
                {showQuickConfig && (
                    <Card className="border mb-2 shadow-none" style={{ backgroundColor: '#fff9f5', borderColor: '#ffd8be' }}>
                        <CardBody className="p-1">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <h6 className="fw-bolder mb-0" style={{ color: '#ff8c21' }}>
                                    Meta Embedded Signup Credentials
                                </h6>
                                <span className="small text-muted">Self-hosted Meta App IDs</span>
                            </div>
                            <form onSubmit={saveQuickConfig}>
                                <Row className="g-1">
                                    <Col md="6">
                                        <Label className="small mb-25 fw-bold">Meta App ID</Label>
                                        <Input
                                            bsSize="sm"
                                            value={quickAppId}
                                            onChange={(e) => setQuickAppId(e.target.value)}
                                            placeholder="e.g. 598395012455883"
                                        />
                                    </Col>
                                    <Col md="6">
                                        <Label className="small mb-25 fw-bold">Config ID</Label>
                                        <Input
                                            bsSize="sm"
                                            value={quickConfigId}
                                            onChange={(e) => setQuickConfigId(e.target.value)}
                                            placeholder="Embedded Signup Configuration ID"
                                        />
                                    </Col>
                                    <Col md="6">
                                        <Label className="small mb-25 fw-bold">App Secret (optional)</Label>
                                        <Input
                                            bsSize="sm"
                                            type="password"
                                            value={quickAppSecret}
                                            onChange={(e) => setQuickAppSecret(e.target.value)}
                                            placeholder="••••••••••••"
                                        />
                                    </Col>
                                    <Col md="6">
                                        <Label className="small mb-25 fw-bold">Graph Version</Label>
                                        <Input
                                            bsSize="sm"
                                            value={quickGraphVersion}
                                            onChange={(e) => setQuickGraphVersion(e.target.value)}
                                            placeholder="v22.0"
                                        />
                                    </Col>
                                    <Col md="12" className="d-flex justify-content-end gap-1 mt-1">
                                        <Button
                                            type="button"
                                            size="sm"
                                            color="secondary"
                                            outline
                                            onClick={() => setShowQuickConfig(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={savingQuickConfig}
                                            style={{ backgroundColor: '#ff8c21', borderColor: '#ff8c21', color: '#fff' }}
                                        >
                                            {savingQuickConfig ? 'Saving...' : 'Save Meta Config'}
                                        </Button>
                                    </Col>
                                </Row>
                            </form>
                        </CardBody>
                    </Card>
                )}

                {/* Notices & Alerts */}
                {error && (
                    <Alert color="danger" className="p-1 mb-2 small">
                        {error}
                    </Alert>
                )}
                {notice && (
                    <Alert color="info" className="p-1 mb-2 small">
                        {notice}
                    </Alert>
                )}

                {/* Step Routing */}
                {step === 1 && (
                    <StepPrerequisites
                        onNext={() => setStep(2)}
                        onClose={handleClose}
                    />
                )}

                {step === 2 && (
                    <StepBusinessProfile
                        name={name}
                        setName={setName}
                        category={category}
                        setCategory={setCategory}
                        enableAutoResponse={enableAutoResponse}
                        setEnableAutoResponse={setEnableAutoResponse}
                        autoResponseMessage={autoResponseMessage}
                        setAutoResponseMessage={setAutoResponseMessage}
                        onBack={() => setStep(1)}
                        onNext={() => setStep(3)}
                    />
                )}

                {step === 3 && (
                    <StepMetaAuthorize
                        name={name}
                        config={config}
                        busy={busy}
                        onBack={() => setStep(2)}
                        onConnectLive={() => handleConnectWithFacebook('live')}
                        onConnectSandbox={() => handleConnectWithFacebook('sandbox')}
                    />
                )}

                {step === 4 && (
                    <WabaMultiNumberSelector
                        numbers={wabaPhoneNumbers}
                        selectedIds={selectedNumberIds}
                        onToggleSelection={(id) => {
                            setSelectedNumberIds(prev =>
                                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                            )
                        }}
                        numberLabels={numberLabels}
                        onUpdateLabel={(id, label) => {
                            setNumberLabels(prev => ({ ...prev, [id]: label }))
                        }}
                        busy={busy}
                        onBack={() => setStep(3)}
                        onBatchConnect={handleBatchConnect}
                    />
                )}
            </ModalBody>
        </Modal>
    )
}
