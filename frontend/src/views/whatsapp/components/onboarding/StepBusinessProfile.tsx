import React from 'react'
import { Form, FormGroup, Label, Input, Button, Badge, Alert } from 'reactstrap'
import { ArrowLeft, ArrowRight, UserCheck, MessageSquare, Zap } from 'react-feather'

export const BUSINESS_CATEGORIES = [
    { value: 'PROF_SERVICES', label: 'Professional Services & Consulting' },
    { value: 'TECH', label: 'Technology, IT & Software' },
    { value: 'FINANCE', label: 'Financial Services, Banking & Insurance' },
    { value: 'RETAIL', label: 'Retail, E-Commerce & Consumer Goods' },
    { value: 'HEALTH', label: 'Healthcare, Medical & Pharmaceuticals' },
    { value: 'EDU', label: 'Education & Training' },
    { value: 'AUTO', label: 'Automotive & Transport' },
    { value: 'BEAUTY', label: 'Beauty, Cosmetics & Personal Care' },
    { value: 'APPAREL', label: 'Clothing, Apparel & Fashion' },
    { value: 'ENTERTAIN', label: 'Entertainment & Recreation' },
    { value: 'EVENT_PLAN', label: 'Event Planning & Services' },
    { value: 'FOOD_GROCERY', label: 'Grocery, Supermarkets & FMCG' },
    { value: 'HOTEL', label: 'Hotel, Lodging & Hospitality' },
    { value: 'RESTAURANT', label: 'Restaurants, Dining & Food Delivery' },
    { value: 'TRAVEL', label: 'Travel, Tourism & Airlines' },
    { value: 'REAL_ESTATE', label: 'Real Estate & Property Management' },
    { value: 'MEDIA', label: 'Media, News & Publishing' },
    { value: 'TELECOM', label: 'Telecommunications' },
    { value: 'LOGISTICS', label: 'Logistics, Shipping & Courier' },
    { value: 'LEGAL', label: 'Legal & Corporate Advisory' },
    { value: 'MANUFACTURING', label: 'Manufacturing & Heavy Industry' },
    { value: 'AGRICULTURE', label: 'Agriculture & Farming' },
    { value: 'ARTS', label: 'Arts, Culture & Design' },
    { value: 'FITNESS', label: 'Fitness, Sports & Gym' },
    { value: 'NONPROFIT', label: 'Non-Profit & NGO' },
    { value: 'OTHER', label: 'Other Business Category' }
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
                <div className="d-flex justify-content-between align-items-center mb-1">
                    <Label for="businessName" className="form-label fw-bold mb-0 text-dark" style={{ fontSize: '0.88rem' }}>
                        Brand Display Name *
                    </Label>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Shown to WhatsApp users
                    </small>
                </div>
                <Input
                    id="businessName"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. KRAD Technology"
                    bsSize="sm"
                    style={{ borderRadius: '6px', fontSize: '0.88rem', padding: '0.55rem 0.75rem' }}
                />
            </FormGroup>

            <FormGroup className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                    <Label for="businessCategory" className="form-label fw-bold mb-0 text-dark" style={{ fontSize: '0.88rem' }}>
                        Meta Industry Category *
                    </Label>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Official Meta classification
                    </small>
                </div>
                <Input
                    id="businessCategory"
                    type="select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    bsSize="sm"
                    style={{
                        borderRadius: '6px',
                        border: '1.5px solid #ff8c21',
                        fontSize: '0.88rem',
                        padding: '0.55rem 0.75rem',
                        color: '#1e293b'
                    }}
                >
                    {BUSINESS_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                            {cat.label}
                        </option>
                    ))}
                </Input>
            </FormGroup>

            {/* Inbound Auto-Response Rule Setup */}
            <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div className="form-check d-flex align-items-center mb-2">
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
                        className="form-check-label fw-bold ms-1 cursor-pointer mb-0 text-dark"
                        style={{ fontSize: '0.88rem' }}
                    >
                        Provision Instant Inbound Auto-Response
                    </Label>
                </div>

                <small className="text-muted d-block mb-2" style={{ fontSize: '0.78rem', lineHeight: 1.45 }}>
                    Automatically responds to any incoming WhatsApp message with an instant greeting, wired directly to KradChat’s Inbound Router.
                </small>

                {enableAutoResponse && (
                    <div>
                        <Label for="autoResponseMsg" className="form-label small fw-semibold text-muted mb-1">
                            Greeting Message Text:
                        </Label>
                        <Input
                            id="autoResponseMsg"
                            type="textarea"
                            rows={3}
                            value={autoResponseMessage}
                            onChange={(e) => setAutoResponseMessage(e.target.value)}
                            placeholder="Type an instant reply message..."
                            style={{ borderRadius: '6px', fontSize: '0.85rem' }}
                        />
                    </div>
                )}
            </div>

            {/* Modal Navigation Buttons */}
            <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                <Button
                    color="secondary"
                    outline
                    type="button"
                    onClick={onBack}
                    className="d-inline-flex align-items-center gap-1"
                    style={{
                        borderRadius: '6px',
                        padding: '0.55rem 1.5rem',
                        fontWeight: 500,
                        borderColor: '#cbd5e1',
                        color: '#475569'
                    }}
                >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                </Button>
                <Button
                    type="submit"
                    className="d-inline-flex align-items-center gap-1 shadow-sm"
                    style={{
                        backgroundColor: '#ff8c21',
                        borderColor: '#ff8c21',
                        color: '#ffffff',
                        borderRadius: '6px',
                        padding: '0.55rem 2rem',
                        fontWeight: 600
                    }}
                >
                    <span>Proceed to Meta Auth</span>
                    <ArrowRight size={14} />
                </Button>
            </div>
        </Form>
    )
}
export default StepBusinessProfile
