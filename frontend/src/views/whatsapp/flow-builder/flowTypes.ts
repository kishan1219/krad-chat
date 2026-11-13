export type FlowNodeType =
    | 'trigger'
    | 'text'
    | 'media'
    | 'buttons'
    | 'list'
    | 'wait'
    | 'condition'
    | 'business_hours'
    | 'handoff'

export interface FlowPort {
    id: string
    label: string
}

export interface FlowNodeData {
    label: string
    // Trigger
    triggerKind?: 'keyword' | 'new_contact' | 'incoming'
    keyword?: string
    // Text / Note
    text?: string
    // Media
    mediaType?: 'image' | 'video' | 'document' | 'audio'
    mediaUrl?: string
    caption?: string
    // Interactive Buttons
    buttons?: string[]
    // Interactive List
    listButtonText?: string
    listTitle?: string
    listRows?: Array<{ id: string; title: string; description?: string }>
    // Wait / Delay
    waitDuration?: number
    waitUnit?: 'seconds' | 'minutes' | 'hours' | 'days'
    // Condition
    conditionField?: 'message' | 'label' | 'state' | 'custom_field'
    conditionKey?: string
    conditionEquals?: string
    // Business Hours
    timezone?: string
    days?: number[]
    startTime?: string
    endTime?: string
    // Assign
    agentId?: number
    // Template
    templateName?: string
    templateLang?: string
}

export interface FlowNode {
    id: string
    type: FlowNodeType
    x: number
    y: number
    data: FlowNodeData
}

export interface FlowEdge {
    id: string
    source: string
    sourceHandle?: string
    target: string
}

