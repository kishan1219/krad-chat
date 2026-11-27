import React from 'react'
import { Modal, ModalHeader, ModalBody, Alert, Button } from 'reactstrap'
import { Settings, X } from 'react-feather'
import { useWhatsAppOnboarding } from './hooks/useWhatsAppOnboarding'
import { StepPrerequisites } from './components/onboarding/StepPrerequisites'
import { StepBusinessProfile } from './components/onboarding/StepBusinessProfile'
import { StepMetaAuthorize } from './components/onboarding/StepMetaAuthorize'
import { WabaMultiNumberSelector } from './components/onboarding/WabaMultiNumberSelector'
import { OnboardingStepProgress } from './components/onboarding/OnboardingStepProgress'
import { MetaCredentialsDrawer } from './components/onboarding/MetaCredentialsDrawer'

interface AddWhatsappConfigModalProps {
    isOpen: boolean
    onClose?: () => void
    toggle?: () => void
    onSuccess?: () => void | Promise<void>
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
        signupMode,
        setSignupMode,
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
        capturedCode,
        capturedAssets,
        handleManualSave,
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
            contentClassName="rounded-3 shadow-lg border-0 overflow-hidden"
            backdrop="static"
            keyboard={false}
        >
            <ModalHeader
                toggle={handleClose}
                className="border-bottom py-2 px-3 bg-light"
                close={
                    <Button
                        color="link"
                        size="sm"
                        className="p-1 text-muted d-flex align-items-center"
                        onClick={handleClose}
                    >
                        <X size={20} />
                    </Button>
                }
            >
                <div className="d-flex align-items-center gap-2">
                    <span className="fw-bolder fs-5" style={{ color: '#1e293b' }}>
                        Add WhatsApp Connection
                    </span>
                    <span
                        className="badge pill fw-semibold d-none d-sm-inline"
                        style={{
                            backgroundColor: signupMode === 'coexistence' ? '#dcfce7' : '#fff7ed',
                            color: signupMode === 'coexistence' ? '#16a34a' : '#ff8c21',
                            fontSize: '0.72rem'
                        }}
                    >
                        {signupMode === 'coexistence' ? 'Co-Existence (App + API)' : 'Dedicated Cloud API'}
                    </span>
                </div>
            </ModalHeader>

            <ModalBody className="p-2 p-sm-3" style={{ maxHeight: '82vh', overflowY: 'auto' }}>
                {/* Onboarding Visual Progress Stepper */}
                <OnboardingStepProgress
                    currentStep={step}
                    isMultiNumber={wabaPhoneNumbers.length > 1}
                />

                {/* Meta Embedded Credentials Drawer (Collapsible) */}
                {showQuickConfig && (
                    <MetaCredentialsDrawer
                        appId={quickAppId}
                        setAppId={setQuickAppId}
                        configId={quickConfigId}
                        setConfigId={setQuickConfigId}
                        appSecret={quickAppSecret}
                        setAppSecret={setQuickAppSecret}
                        graphVersion={quickGraphVersion}
                        setGraphVersion={setQuickGraphVersion}
                        saving={savingQuickConfig}
                        onSave={saveQuickConfig}
                        onCancel={() => setShowQuickConfig(false)}
                    />
                )}

                {/* Dynamic Status Notices & Alerts */}
                {error && (
                    <Alert color="danger" className="p-2 mb-3 rounded-2" style={{ fontSize: '0.85rem' }}>
                        {error}
                    </Alert>
                )}
                {notice && (
                    <Alert color="info" className="p-2 mb-3 rounded-2" style={{ fontSize: '0.85rem' }}>
                        {notice}
                    </Alert>
                )}

                {/* Step Routing */}
                {step === 1 && (
                    <StepPrerequisites
                        signupMode={signupMode}
                        setSignupMode={setSignupMode}
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
                        signupMode={signupMode}
                        config={config}
                        busy={busy}
                        capturedCode={capturedCode}
                        capturedAssets={capturedAssets}
                        onBack={() => setStep(2)}
                        onConnectLive={() => handleConnectWithFacebook('live')}
                        onConnectSandbox={() => handleConnectWithFacebook('sandbox')}
                        onSave={handleManualSave}
                    />
                )}

                {step === 4 && wabaPhoneNumbers.length > 0 && (
                    <WabaMultiNumberSelector
                        numbers={wabaPhoneNumbers}
                        selectedIds={selectedNumberIds}
                        onToggleSelection={(id) => {
                            setSelectedNumberIds((prev) =>
                                prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
                            )
                        }}
                        numberLabels={numberLabels}
                        onUpdateLabel={(id, label) => {
                            setNumberLabels((prev) => ({ ...prev, [id]: label }))
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
