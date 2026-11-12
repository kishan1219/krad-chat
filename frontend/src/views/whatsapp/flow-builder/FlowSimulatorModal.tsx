import React, { useState, useEffect } from 'react'
import {
    Modal,
    ModalHeader,
    ModalBody,
    Button,
    Badge
} from 'reactstrap'
import { RotateCcw, Send, Check, Phone, Video, MoreVertical, X } from 'react-feather'
import { FlowNode, FlowEdge } from './flowTypes'

interface FlowSimulatorProps {
    isOpen: boolean
    toggle: () => void
    nodes: FlowNode[]
    edges: FlowEdge[]
}

interface Message {
    id: string
    sender: 'bot' | 'user'
    text: string
    mediaUrl?: string
    mediaType?: string
    buttons?: string[]
    listButton?: string
    listRows?: Array<{ id: string; title: string; description?: string }>
    time: string
}

export default function FlowSimulatorModal({ isOpen, toggle, nodes, edges }: FlowSimulatorProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)
    const [userInput, setUserInput] = useState('')
    const [waitingSeconds, setWaitingSeconds] = useState<number | null>(null)

    const getCurrentTime = () => {
        const d = new Date()
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    }

    // Start or restart simulation
    const startSimulation = () => {
        setMessages([])
        setWaitingSeconds(null)
        const trigger = nodes.find(n => n.type === 'trigger') || nodes[0]
        if (!trigger) return

        // Initial welcome trigger
        const initialUserMsg: Message = {
            id: 'msg_0',
            sender: 'user',
            text: trigger.data.keyword ? trigger.data.keyword.toUpperCase() : 'Hello',
            time: getCurrentTime()
        }

        setMessages([initialUserMsg])
        // Trigger first connected node
        const firstEdge = edges.find(e => e.source === trigger.id)
        if (firstEdge) {
            executeNode(firstEdge.target, [initialUserMsg])
        }
    }

    useEffect(() => {
        if (isOpen) {
            startSimulation()
        }
    }, [isOpen])

    const executeNode = (nodeId: string, currentMsgs = messages) => {
        setCurrentNodeId(nodeId)
        const node = nodes.find(n => n.id === nodeId)
        if (!node) return

        if (node.type === 'wait') {
            const secs = node.data.waitDuration || 5
            setWaitingSeconds(secs)
            const waitMsg: Message = {
                id: `wait_${Date.now()}`,
                sender: 'bot',
                text: `⏳ *[Simulated Wait]* Pausing sequence for ${node.data.waitDuration} ${node.data.waitUnit || 'seconds'}...`,
                time: getCurrentTime()
            }
            const updated = [...currentMsgs, waitMsg]
            setMessages(updated)
            // Follow next edge
            const nextEdge = edges.find(e => e.source === nodeId)
            if (nextEdge) {
                setTimeout(() => {
                    executeNode(nextEdge.target, updated)
                }, 1200)
            }
            return
        }

        if (node.type === 'handoff') {
            const handoffMsg: Message = {
                id: `handoff_${Date.now()}`,
                sender: 'bot',
                text: '🔔 *[Live Agent Takeover]* Your request has been transferred to a support specialist in KRAD Live Chat.',
                time: getCurrentTime()
            }
            setMessages([...currentMsgs, handoffMsg])
            return
        }

        const newMsg: Message = {
            id: `msg_${Date.now()}`,
            sender: 'bot',
            text: node.data.text || (node.type === 'buttons' ? 'Select an option:' : 'Hello from KRAD Chat!'),
            mediaUrl: node.data.mediaUrl,
            mediaType: node.data.mediaType,
            buttons: node.type === 'buttons' ? node.data.buttons : undefined,
            listButton: node.type === 'list' ? (node.data.listButtonText || 'Select Option') : undefined,
            listRows: node.type === 'list' ? node.data.listRows : undefined,
            time: getCurrentTime()
        }

        const updated = [...currentMsgs, newMsg]
        setMessages(updated)

        // If it's a linear node (text or media) and has an outgoing edge, auto-trigger next node
        if (['text', 'media'].includes(node.type)) {
            const nextEdge = edges.find(e => e.source === nodeId)
            if (nextEdge) {
                setTimeout(() => {
                    executeNode(nextEdge.target, updated)
                }, 800)
            }
        }
    }

    // User clicked an interactive button or list item
    const handleButtonClick = (btnText: string, handleIdx: number) => {
        if (!currentNodeId) return
        const userMsg: Message = {
            id: `usr_${Date.now()}`,
            sender: 'user',
            text: btnText,
            time: getCurrentTime()
        }
        const updated = [...messages, userMsg]
        setMessages(updated)

        // Find edge with sourceHandle matching this button or general target
        const handle = `btn-${handleIdx}`
        const branchEdge = edges.find(e => e.source === currentNodeId && e.sourceHandle === handle) ||
                           edges.find(e => e.source === currentNodeId)

        if (branchEdge) {
            setTimeout(() => {
                executeNode(branchEdge.target, updated)
            }, 600)
        }
    }

    const handleSendCustom = (e: React.FormEvent) => {
        e.preventDefault()
        if (!userInput.trim()) return
        const userMsg: Message = {
            id: `usr_${Date.now()}`,
            sender: 'user',
            text: userInput,
            time: getCurrentTime()
        }
        const updated = [...messages, userMsg]
        setMessages(updated)
        setUserInput('')

        // Check if current node has an edge matching user text
        if (currentNodeId) {
            const nextEdge = edges.find(e => e.source === currentNodeId)
            if (nextEdge) {
                setTimeout(() => {
                    executeNode(nextEdge.target, updated)
                }, 700)
            }
        }
    }

    return (
        <Modal isOpen={isOpen} toggle={toggle} centered size='md' contentClassName='p-0 border-0 bg-transparent'>
            <div
                className='mx-auto shadow-2xl overflow-hidden'
                style={{
                    width: '360px',
                    height: '680px',
                    borderRadius: '40px',
                    border: '12px solid #1f2937',
                    backgroundColor: '#efeae2',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                }}
            >
                {/* Smartphone Speaker & Camera Notch */}
                <div
                    style={{
                        position: 'absolute',
                        top: '8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '120px',
                        height: '18px',
                        backgroundColor: '#1f2937',
                        borderRadius: '0 0 12px 12px',
                        zIndex: 20
                    }}
                />

                {/* WhatsApp Phone Header */}
                <div
                    style={{
                        backgroundColor: '#008069',
                        color: '#FFFFFF',
                        padding: '30px 14px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        zIndex: 10
                    }}
                >
                    <div className='d-flex align-items-center gap-1'>
                        <div
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: '#25D366',
                                color: '#FFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '15px'
                            }}
                        >
                            KC
                        </div>
                        <div>
                            <div className='fw-bold' style={{ fontSize: '14px', lineHeight: 1.2 }}>
                                KRAD WhatsApp Bot
                            </div>
                            <div style={{ fontSize: '11px', opacity: 0.85 }}>online · verified</div>
                        </div>
                    </div>

                    <div className='d-flex align-items-center gap-1'>
                        <Button
                            size='sm'
                            color='flat-light'
                            className='btn-icon text-white p-0'
                            title='Restart Simulator'
                            onClick={startSimulation}
                        >
                            <RotateCcw size={16} />
                        </Button>
                        <Button
                            size='sm'
                            color='flat-light'
                            className='btn-icon text-white p-0'
                            onClick={toggle}
                        >
                            <X size={18} />
                        </Button>
                    </div>
                </div>

                {/* WhatsApp Chat Conversation Body */}
                <div
                    style={{
                        flex: 1,
                        padding: '12px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
                        backgroundSize: '16px 16px'
                    }}
                >
                    <div className='text-center my-1'>
                        <span
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                                color: '#54656f',
                                fontSize: '11px',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
                            }}
                        >
                            TODAY · END-TO-END ENCRYPTED
                        </span>
                    </div>

                    {messages.map(msg => (
                        <div
                            key={msg.id}
                            style={{
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '82%',
                                backgroundColor: msg.sender === 'user' ? '#d9fdd3' : '#FFFFFF',
                                color: '#111b21',
                                borderRadius: msg.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                padding: '8px 10px',
                                fontSize: '13px',
                                boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                                position: 'relative'
                            }}
                        >
                            {msg.mediaUrl && (
                                <div className='mb-1 overflow-hidden' style={{ borderRadius: '8px' }}>
                                    <img
                                        src={msg.mediaUrl}
                                        alt='Attachment'
                                        style={{ width: '100%', maxHeight: '140px', objectFit: 'cover' }}
                                        onError={e => {
                                            (e.currentTarget as any).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'
                                        }}
                                    />
                                </div>
                            )}

                            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.4 }}>
                                {msg.text}
                            </div>

                            {/* Render Clickable Quick Reply Buttons */}
                            {msg.buttons && msg.buttons.length > 0 && (
                                <div className='mt-2 d-flex flex-column gap-1 border-top pt-1'>
                                    {msg.buttons.map((btn, idx) => (
                                        <button
                                            key={idx}
                                            type='button'
                                            onClick={() => handleButtonClick(btn, idx)}
                                            style={{
                                                backgroundColor: '#FFFFFF',
                                                border: '1px solid #00a884',
                                                color: '#00a884',
                                                borderRadius: '8px',
                                                padding: '6px 10px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease'
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.backgroundColor = '#00a884'
                                                e.currentTarget.style.color = '#FFFFFF'
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.backgroundColor = '#FFFFFF'
                                                e.currentTarget.style.color = '#00a884'
                                            }}
                                        >
                                            {btn}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Render Clickable List Menu Rows */}
                            {msg.listRows && msg.listRows.length > 0 && (
                                <div className='mt-2 border-top pt-1'>
                                    <div className='small fw-bold text-muted mb-1'>{msg.listButton || 'Options Menu'}</div>
                                    <div className='d-flex flex-column gap-1'>
                                        {msg.listRows.map((row, idx) => (
                                            <button
                                                key={idx}
                                                type='button'
                                                onClick={() => handleButtonClick(row.title, idx)}
                                                style={{
                                                    backgroundColor: '#f0f2f5',
                                                    border: 'none',
                                                    textAlign: 'left',
                                                    borderRadius: '6px',
                                                    padding: '6px 8px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <div style={{ fontWeight: 600, fontSize: '12px', color: '#111b21' }}>{row.title}</div>
                                                {row.description && (
                                                    <div style={{ fontSize: '10px', color: '#667781' }}>{row.description}</div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    gap: '3px',
                                    fontSize: '10px',
                                    color: '#667781',
                                    marginTop: '4px'
                                }}
                            >
                                <span>{msg.time}</span>
                                {msg.sender === 'user' && <Check size={13} color='#53bdeb' />}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chat Footer / Input */}
                <form
                    onSubmit={handleSendCustom}
                    style={{
                        backgroundColor: '#f0f2f5',
                        padding: '8px 10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <input
                        type='text'
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        placeholder='Type a reply...'
                        style={{
                            flex: 1,
                            backgroundColor: '#FFFFFF',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '8px 14px',
                            fontSize: '13px',
                            outline: 'none'
                        }}
                    />
                    <button
                        type='submit'
                        disabled={!userInput.trim()}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#00a884',
                            border: 'none',
                            color: '#FFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: userInput.trim() ? 'pointer' : 'default',
                            opacity: userInput.trim() ? 1 : 0.6
                        }}
                    >
                        <Send size={15} />
                    </button>
                </form>
            </div>
        </Modal>
    )
}
