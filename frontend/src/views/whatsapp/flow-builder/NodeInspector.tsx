import React from 'react'
import {
    FormGroup,
    Label,
    Input,
    Button,
    Badge
} from 'reactstrap'
import {
    X,
    Trash2,
    Plus,
    MessageSquare,
    Image,
    Clock,
    Zap,
    Users,
    Sliders,
    HelpCircle
} from 'react-feather'
import { FlowNode } from './flowTypes'

interface NodeInspectorProps {
    node: FlowNode | null
    onUpdate: (updatedNode: FlowNode) => void
    onDelete: (nodeId: string) => void
    onClose: () => void
}

export default function NodeInspector({ node, onUpdate, onDelete, onClose }: NodeInspectorProps) {
    if (!node) return null

    const updateData = (fields: Partial<FlowNode['data']>) => {
        onUpdate({
            ...node,
            data: {
                ...node.data,
                ...fields
            }
        })
    }

    const addVariable = (varName: string) => {
        const currentText = node.data.text || ''
        updateData({ text: `${currentText} {{${varName}}}` })
    }

    const addButton = () => {
        const current = node.data.buttons || []
        if (current.length >= 3) return
        updateData({ buttons: [...current, `Option ${current.length + 1}`] })
    }

    const removeButton = (idx: number) => {
        const current = node.data.buttons || []
        updateData({ buttons: current.filter((_, i) => i !== idx) })
    }

    const updateButtonText = (idx: number, text: string) => {
        const current = [...(node.data.buttons || [])]
        current[idx] = text
        updateData({ buttons: current })
    }

    const addListRow = () => {
        const current = node.data.listRows || []
        if (current.length >= 10) return
        updateData({
            listRows: [
                ...current,
                { id: `opt_${Date.now()}`, title: `Item ${current.length + 1}`, description: 'Description' }
            ]
        })
    }

    const removeListRow = (idx: number) => {
        const current = node.data.listRows || []
        updateData({ listRows: current.filter((_, i) => i !== idx) })
    }

    const updateListRow = (idx: number, title: string, description: string) => {
        const current = [...(node.data.listRows || [])]
        current[idx] = { ...current[idx], title, description }
        updateData({ listRows: current })
    }

    return (
        <div
            className='flow-inspector shadow-lg bg-white border-start'
            style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: '380px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto'
            }}
        >
            {/* Inspector Header */}
            <div className='p-2 border-bottom d-flex align-items-center justify-content-between bg-light'>
                <div className='d-flex align-items-center gap-1'>
                    <Sliders size={18} className='text-primary' />
                    <div>
                        <h5 className='mb-0 fw-bold'>{node.data.label || 'Node Properties'}</h5>
                        <Badge color='light-primary' pill className='small'>{node.type.toUpperCase()}</Badge>
                    </div>
                </div>
                <Button size='sm' color='flat-secondary' className='btn-icon' onClick={onClose}>
                    <X size={18} />
                </Button>
            </div>

            {/* Inspector Body */}
            <div className='p-2 flex-grow-1'>
                {/* Node Label */}
                <FormGroup className='mb-2'>
                    <Label className='fw-bold small text-muted'>Node Display Name</Label>
                    <Input
                        value={node.data.label || ''}
                        onChange={e => updateData({ label: e.target.value })}
                        placeholder='Step Name'
                    />
                </FormGroup>

                {/* 1. TRIGGER NODE */}
                {node.type === 'trigger' && (
                    <>
                        <FormGroup className='mb-2'>
                            <Label className='fw-bold small text-muted'>Inbound Trigger Type</Label>
                            <Input
                                type='select'
                                value={node.data.triggerKind || 'keyword'}
                                onChange={e => updateData({ triggerKind: e.target.value as any })}
                            >
                                <option value='keyword'>Exact Keyword Match</option>
                                <option value='new_contact'>First Message from New Contact</option>
                                <option value='incoming'>Any Inbound WhatsApp Message</option>
                            </Input>
                        </FormGroup>

                        {node.data.triggerKind === 'keyword' && (
                            <FormGroup className='mb-2'>
                                <Label className='fw-bold small text-muted'>Trigger Keyword *</Label>
                                <Input
                                    value={node.data.keyword || ''}
                                    onChange={e => updateData({ keyword: e.target.value })}
                                    placeholder='e.g. HELP, JOIN, DEMO, START'
                                />
                                <small className='text-muted'>Matches case-insensitively when customer sends this word.</small>
                            </FormGroup>
                        )}
                    </>
                )}

                {/* 2. TEXT NODE */}
                {node.type === 'text' && (
                    <>
                        <FormGroup className='mb-2'>
                            <div className='d-flex justify-content-between align-items-center mb-50'>
                                <Label className='fw-bold small text-muted mb-0'>WhatsApp Message Text *</Label>
                                <div className='d-flex gap-50'>
                                    <Badge
                                        color='light-info'
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => addVariable('name')}
                                    >
                                        + {'{{name}}'}
                                    </Badge>
                                    <Badge
                                        color='light-info'
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => addVariable('phone')}
                                    >
                                        + {'{{phone}}'}
                                    </Badge>
                                </div>
                            </div>
                            <Input
                                type='textarea'
                                rows={5}
                                value={node.data.text || ''}
                                onChange={e => updateData({ text: e.target.value })}
                                placeholder='Type your WhatsApp message here. Use *bold*, _italics_, and {{variables}}.'
                            />
                        </FormGroup>
                    </>
                )}

                {/* 3. MEDIA NODE */}
                {node.type === 'media' && (
                    <>
                        <FormGroup className='mb-2'>
                            <Label className='fw-bold small text-muted'>Media Type</Label>
                            <Input
                                type='select'
                                value={node.data.mediaType || 'image'}
                                onChange={e => updateData({ mediaType: e.target.value as any })}
                            >
                                <option value='image'>Image (JPG, PNG)</option>
                                <option value='video'>Video (MP4)</option>
                                <option value='document'>Document (PDF)</option>
                                <option value='audio'>Audio (MP3, OGG)</option>
                            </Input>
                        </FormGroup>

                        <FormGroup className='mb-2'>
                            <Label className='fw-bold small text-muted'>Public Media URL *</Label>
                            <Input
                                value={node.data.mediaUrl || ''}
                                onChange={e => updateData({ mediaUrl: e.target.value })}
                                placeholder='https://example.com/assets/brochure.pdf'
                            />
                        </FormGroup>

                        <FormGroup className='mb-2'>
                            <Label className='fw-bold small text-muted'>Caption (Optional)</Label>
                            <Input
                                value={node.data.caption || ''}
                                onChange={e => updateData({ caption: e.target.value })}
                                placeholder='Attached product catalogue'
                            />
                        </FormGroup>
                    </>
                )}

                {/* 4. INTERACTIVE BUTTONS NODE */}
                {node.type === 'buttons' && (
                    <>
                        <FormGroup className='mb-2'>
                            <Label className='fw-bold small text-muted'>Message Body Text *</Label>
                            <Input
                                type='textarea'
                                rows={3}
                                value={node.data.text || ''}
                                onChange={e => updateData({ text: e.target.value })}
                                placeholder='Please select how we can help you today:'
                            />
                        </FormGroup>

                        <div className='mb-2'>
                            <div className='d-flex justify-content-between align-items-center mb-1'>
                                <Label className='fw-bold small text-muted mb-0'>
                                    Interactive Buttons (Max 3)
                                </Label>
                                <Button
                                    size='sm'
                                    color='primary'
                                    outline
                                    disabled={(node.data.buttons || []).length >= 3}
                                    onClick={addButton}
                                    className='d-inline-flex align-items-center gap-50 py-25 px-50'
                                >
                                    <Plus size={14} /> Add Button
                                </Button>
                            </div>

                            {(node.data.buttons || []).map((btn, idx) => (
                                <div key={idx} className='d-flex align-items-center gap-1 mb-1'>
                                    <Badge color='light-primary' pill>{idx + 1}</Badge>
                                    <Input
                                        bsSize='sm'
                                        value={btn}
                                        maxLength={20}
                                        onChange={e => updateButtonText(idx, e.target.value)}
                                        placeholder={`Button ${idx + 1} text (max 20 chars)`}
                                    />
                                    <Button
                                        size='sm'
                                        color='flat-danger'
                                        className='btn-icon p-25'
                                        onClick={() => removeButton(idx)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            ))}
                            <small className='text-muted'>
                                Each button creates a dedicated output connector port on the canvas to branch conversations.
                            </small>
                        </div>
                    </>
                )}

                {/* 5. INTERACTIVE LIST MESSAGE NODE */}
                {node.type === 'list' && (
                    <>
                        <FormGroup className='mb-2'>
                            <Label className='fw-bold small text-muted'>Menu Button Label *</Label>
                            <Input
                                value={node.data.listButtonText || 'Select Option'}
                                onChange={e => updateData({ listButtonText: e.target.value })}
                                placeholder='e.g. View Options'
                            />
                        </FormGroup>

                        <FormGroup className='mb-2'>
                            <Label className='fw-bold small text-muted'>Section Title</Label>
                            <Input
                                value={node.data.listTitle || 'Main Menu'}
                                onChange={e => updateData({ listTitle: e.target.value })}
                                placeholder='e.g. Products & Services'
                            />
                        </FormGroup>

                        <div className='mb-2'>
                            <div className='d-flex justify-content-between align-items-center mb-1'>
                                <Label className='fw-bold small text-muted mb-0'>Menu Rows (Max 10)</Label>
                                <Button
                                    size='sm'
                                    color='primary'
                                    outline
                                    disabled={(node.data.listRows || []).length >= 10}
                                    onClick={addListRow}
                                    className='d-inline-flex align-items-center gap-50 py-25 px-50'
                                >
                                    <Plus size={14} /> Add Row
                                </Button>
                            </div>

                            {(node.data.listRows || []).map((row, idx) => (
                                <div key={idx} className='p-1 border rounded mb-1 bg-light'>
                                    <div className='d-flex justify-content-between align-items-center mb-50'>
                                        <span className='fw-bold small text-primary'>Row #{idx + 1}</span>
                                        <Button
                                            size='sm'
                                            color='flat-danger'
                                            className='btn-icon p-0'
                                            onClick={() => removeListRow(idx)}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                    <Input
                                        bsSize='sm'
                                        className='mb-50'
                                        value={row.title}
                                        maxLength={24}
                                        onChange={e => updateListRow(idx, e.target.value, row.description || '')}
                                        placeholder='Row Title (Max 24 chars)'
                                    />
                                    <Input
                                        bsSize='sm'
                                        value={row.description || ''}
                                        maxLength={72}
                                        onChange={e => updateListRow(idx, row.title, e.target.value)}
                                        placeholder='Description (Optional)'
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* 6. WAIT DELAY NODE */}
                {node.type === 'wait' && (
                    <>
                        <FormGroup className='mb-2'>
                            <Label className='fw-bold small text-muted'>Delay Duration</Label>
                            <div className='d-flex gap-1'>
                                <Input
                                    type='number'
                                    min={1}
                                    value={node.data.waitDuration || 1}
                                    onChange={e => updateData({ waitDuration: Math.max(1, parseInt(e.target.value) || 1) })}
                                />
                                <Input
                                    type='select'
                                    value={node.data.waitUnit || 'hours'}
                                    onChange={e => updateData({ waitUnit: e.target.value as any })}
                                >
                                    <option value='seconds'>Seconds</option>
                                    <option value='minutes'>Minutes</option>
                                    <option value='hours'>Hours</option>
                                    <option value='days'>Days</option>
                                </Input>
                            </div>
                            <small className='text-muted mt-50 d-block'>
                                Used for automated multi-day drip campaigns (e.g. send next follow-up 24 hours later).
                            </small>
                        </FormGroup>
                    </>
                )}

                {/* 7. CONDITION NODE */}
                {node.type === 'condition' && (
                    <>
                        <FormGroup className='mb-2'>
                            <Label className='fw-bold small text-muted'>Check Condition Field</Label>
                            <Input
                                type='select'
                                value={node.data.conditionField || 'message'}
                                onChange={e => updateData({ conditionField: e.target.value as any })}
                            >
                                <option value='message'>Customer Reply Equals</option>
                                <option value='label'>Conversation Has Label</option>
                                <option value='state'>Conversation State (open/closed)</option>
                                <option value='custom_field'>Custom Contact Field Equals</option>
                            </Input>
                        </FormGroup>

                        {node.data.conditionField === 'custom_field' && (
                            <FormGroup className='mb-2'>
                                <Label className='fw-bold small text-muted'>Custom Field Name</Label>
                                <Input
                                    value={node.data.conditionKey || ''}
                                    onChange={e => updateData({ conditionKey: e.target.value })}
                                    placeholder='e.g. tier, industry, plan'
                                />
                            </FormGroup>
                        )}

                        <FormGroup className='mb-2'>
                            <Label className='fw-bold small text-muted'>Expected Value *</Label>
                            <Input
                                value={node.data.conditionEquals || ''}
                                onChange={e => updateData({ conditionEquals: e.target.value })}
                                placeholder='Value to match'
                            />
                        </FormGroup>
                    </>
                )}

                {/* 8. BUSINESS HOURS NODE */}
                {node.type === 'business_hours' && (
                    <>
                        <FormGroup className='mb-2'>
                            <Label className='fw-bold small text-muted'>Timezone</Label>
                            <Input
                                value={node.data.timezone || 'Asia/Kolkata'}
                                onChange={e => updateData({ timezone: e.target.value })}
                            />
                        </FormGroup>

                        <div className='d-flex gap-1 mb-2'>
                            <FormGroup className='flex-grow-1 mb-0'>
                                <Label className='fw-bold small text-muted'>Start Time</Label>
                                <Input
                                    type='time'
                                    value={node.data.startTime || '09:00'}
                                    onChange={e => updateData({ startTime: e.target.value })}
                                />
                            </FormGroup>
                            <FormGroup className='flex-grow-1 mb-0'>
                                <Label className='fw-bold small text-muted'>End Time</Label>
                                <Input
                                    type='time'
                                    value={node.data.endTime || '18:00'}
                                    onChange={e => updateData({ endTime: e.target.value })}
                                />
                            </FormGroup>
                        </div>
                    </>
                )}

                {/* 9. HUMAN HANDOFF NODE */}
                {node.type === 'handoff' && (
                    <div className='p-2 bg-light-warning rounded mb-2'>
                        <h6 className='fw-bold text-warning mb-1'>Human Agent Takeover</h6>
                        <p className='small text-muted mb-0'>
                            When the conversation reaches this step, automated bot replies pause and the conversation is transferred to your agent queue in KRAD Live Chat.
                        </p>
                    </div>
                )}
            </div>

            {/* Inspector Footer Actions */}
            <div className='p-2 border-top d-flex justify-content-between align-items-center bg-light'>
                {node.type !== 'trigger' ? (
                    <Button
                        size='sm'
                        color='danger'
                        outline
                        onClick={() => onDelete(node.id)}
                        className='d-inline-flex align-items-center gap-50'
                    >
                        <Trash2 size={14} /> Delete Node
                    </Button>
                ) : (
                    <span className='small text-muted'>Trigger node cannot be deleted</span>
                )}
                <Button size='sm' color='primary' onClick={onClose}>
                    Done
                </Button>
            </div>
        </div>
    )
}
