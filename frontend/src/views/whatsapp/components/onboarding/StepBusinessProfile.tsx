import React from 'react'
import { Form, FormGroup, Label, Input, Button } from 'reactstrap'

export const BUSINESS_CATEGORIES = [
    { value: 'OTHER', label: 'OTHER' },
    { value: 'AUTO', label: 'AUTO' },
    { value: 'BEAUTY', label: 'BEAUTY' },
    { value: 'APPAREL', label: 'APPAREL' },
    { value: 'EDU', label: 'EDU' },
    { value: 'ENTERTAIN', label: 'ENTERTAIN' },
    { value: 'EVENT_PLAN', label: 'EVENT_PLAN' },
    { value: 'FINANCE', label: 'FINANCE' },
    { value: 'FOOD_GROCERY', label: 'FOOD_GROCERY' },
    { value: 'HEALTH', label: 'HEALTH' },
    { value: 'HOTEL', label: 'HOTEL' },
    { value: 'NONPROFIT', label: 'NONPROFIT' },
    { value: 'PROF_SERVICES', label: 'PROF_SERVICES' },
    { value: 'RESTAURANT', label: 'RESTAURANT' },
    { value: 'RETAIL', label: 'RETAIL' },
    { value: 'TRAVEL', label: 'TRAVEL' }
]

interface StepBusinessProfileProps {
    name: string
    setName: (val: string) => void
    category: string
    setCategory: (val: string) => void
    enableAutoResponse: boolean
    setEnableAutoResponse: (val: boolean) => void
    autoResponseMessage: string
    setAutoResponseMessage: (val: string) => void
    onBack: () => void
    onNext: () => void
}

export const StepBusinessProfile: React.FC<StepBusinessProfileProps> = ({
    name,
    setName,
    category,
    setCategory,
    enableAutoResponse,
    setEnableAutoResponse,
    autoResponseMessage,
    setAutoResponseMessage,
    onBack,
    onNext
}) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext()
    }

    return (
        <Form onSubmit={handleSubmit} className="py-1">
            <FormGroup className="mb-2">
                <Label
                    for="businessName"
                    className="form-label fw-bolder mb-50"
                    style={{ color: '#22292f', fontSize: '0.92rem' }}
                >
                    Name
                </Label>
                <Input
                    id="businessName"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Krad Technology"
                    style={{
                        borderRadius: '6px',
                        border: '1px solid #d8d6de',
                        padding: '0.65rem 0.9rem',
                        fontSize: '0.9rem'
                    }}
                />
            </FormGroup>

            <FormGroup className="mb-2">
                <Label
                    for="businessCategory"
                    className="form-label fw-bolder mb-50"
                    style={{ color: '#22292f', fontSize: '0.92rem' }}
                >
                    Business Category <span style={{ color: '#ea5455' }}>*</span>
                </Label>
                <Input
                    id="businessCategory"
                    type="select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                        borderRadius: '6px',
                        border: '1.5px solid #ff8c21',
                        padding: '0.65rem 0.9rem',
                        fontSize: '0.9rem',
                        color: '#22292f'
                    }}
                >
                    <option value="" disabled>select</option>
                    {BUSINESS_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                            {cat.label}
                        </option>
                    ))}
                </Input>
            </FormGroup>

            <div className="pt-50 mb-2">
                <div className="form-check d-flex align-items-center">
                    <Input
                        type="checkbox"
                        id="enableAutoResponseCheck"
                        checked={enableAutoResponse}
                        onChange={(e) => setEnableAutoResponse(e.target.checked)}
                        style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            accentColor: '#ff8c21'
                        }}
                    />
                    <Label
                        for="enableAutoResponseCheck"
                        className="form-check-label fw-bolder ms-1"
                        style={{ color: '#22292f', fontSize: '0.92rem', cursor: 'pointer' }}
                    >
                        Enable Auto Response
                    </Label>
                </div>

                {enableAutoResponse && (
                    <div className="mt-1 ms-2">
                        <Label
                            for="autoResponseMsg"
                            className="form-label small text-muted mb-50"
                        >
                            Auto Response Message
                        </Label>
                        <Input
                            id="autoResponseMsg"
                            type="textarea"
                            rows={3}
                            value={autoResponseMessage}
                            onChange={(e) => setAutoResponseMessage(e.target.value)}
                            placeholder="Type an instant reply message..."
                            style={{
                                borderRadius: '6px',
                                border: '1px solid #d8d6de',
                                fontSize: '0.88rem'
                            }}
                        />
                    </div>
                )}
            </div>

            <div className="d-flex flex-column-reverse flex-sm-row justify-content-end align-items-stretch align-items-sm-center gap-2 pt-2 border-top mt-3">
                <Button
                    color="secondary"
                    outline
                    type="button"
                    onClick={onBack}
                    className="w-100 w-sm-auto"
                    style={{
                        borderRadius: '6px',
                        padding: '0.6rem 1.75rem',
                        fontWeight: 500,
                        borderColor: '#b9b9c3',
                        color: '#6e6b7b'
                    }}
                >
                    Back
                </Button>
                <Button
                    type="submit"
                    className="w-100 w-sm-auto"
                    style={{
                        backgroundColor: '#ff8c21',
                        borderColor: '#ff8c21',
                        color: '#ffffff',
                        borderRadius: '6px',
                        padding: '0.6rem 2.25rem',
                        fontWeight: 600,
                        boxShadow: '0 2px 6px rgba(255,140,33,0.3)'
                    }}
                >
                    Continue
                </Button>
            </div>
        </Form>
    )
}
