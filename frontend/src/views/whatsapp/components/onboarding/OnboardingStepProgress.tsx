import React from 'react'
import { Check } from 'react-feather'

interface OnboardingStepProgressProps {
    currentStep: number
    isMultiNumber?: boolean
}

export const OnboardingStepProgress: React.FC<OnboardingStepProgressProps> = ({
    currentStep,
    isMultiNumber = false
}) => {
    const steps = [
        { id: 1, label: 'Requirements' },
        { id: 2, label: 'Profile' },
        { id: 3, label: 'Authorize' },
        ...(isMultiNumber ? [{ id: 4, label: 'Select Lines' }] : [])
    ]

    const totalSteps = steps.length
    const currentLabel = steps.find(s => s.id === currentStep)?.label || 'Setup'

    return (
        <div className="mb-3 px-1">
            {/* Mobile View: Compact Bar with Label */}
            <div className="d-block d-sm-none">
                <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small fw-bold text-muted" style={{ fontSize: '0.75rem' }}>
                        Step {currentStep} of {totalSteps}
                    </span>
                    <span className="badge bg-light-primary text-primary fw-bold" style={{ fontSize: '0.75rem' }}>
                        {currentLabel}
                    </span>
                </div>
                <div className="progress" style={{ height: '6px', borderRadius: '10px' }}>
                    <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                            width: `${(currentStep / totalSteps) * 100}%`,
                            backgroundColor: '#ff8c21',
                            transition: 'width 0.4s ease'
                        }}
                    />
                </div>
            </div>

            {/* Tablet & Desktop View: Connected Stepper Nodes */}
            <div className="d-none d-sm-flex align-items-center justify-content-between position-relative">
                {steps.map((s, idx) => {
                    const isCompleted = currentStep > s.id
                    const isActive = currentStep === s.id

                    return (
                        <div key={s.id} className="d-flex flex-column align-items-center flex-grow-1 position-relative">
                            {idx > 0 && (
                                <div
                                    className="position-absolute"
                                    style={{
                                        top: '15px',
                                        right: '50%',
                                        left: '-50%',
                                        height: '2px',
                                        backgroundColor: isCompleted || isActive ? '#ff8c21' : '#e2e8f0',
                                        zIndex: 0,
                                        transition: 'background-color 0.3s'
                                    }}
                                />
                            )}
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    fontSize: '0.8rem',
                                    backgroundColor: isCompleted ? '#ff8c21' : isActive ? '#fff' : '#f1f5f9',
                                    color: isCompleted ? '#fff' : isActive ? '#ff8c21' : '#94a3b8',
                                    border: isActive ? '2px solid #ff8c21' : isCompleted ? 'none' : '1px solid #cbd5e1',
                                    zIndex: 1,
                                    transition: 'all 0.3s'
                                }}
                            >
                                {isCompleted ? <Check size={14} /> : s.id}
                            </div>
                            <span
                                className="mt-1 small fw-semibold text-center text-truncate"
                                style={{
                                    fontSize: '0.75rem',
                                    color: isActive ? '#ff8c21' : isCompleted ? '#334155' : '#94a3b8',
                                    maxWidth: '100px'
                                }}
                            >
                                {s.label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default OnboardingStepProgress

