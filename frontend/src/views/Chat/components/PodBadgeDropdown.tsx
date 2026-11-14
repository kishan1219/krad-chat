import React, { useState, useEffect } from 'react'
import {
    Badge,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Spinner
} from 'reactstrap'
import { Users, ChevronDown } from 'react-feather'
import { whatsappService, AgentPod } from '../../../services/whatsappService'

interface PodBadgeDropdownProps {
    currentPodId?: number | null
    currentPodName?: string | null
    detectedIntent?: string | null
    onSelectPod: (podId: number | null) => void
    disabled?: boolean
}

const PodBadgeDropdown: React.FC<PodBadgeDropdownProps> = ({
    currentPodId,
    currentPodName,
    detectedIntent,
    onSelectPod,
    disabled = false
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [pods, setPods] = useState<AgentPod[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (dropdownOpen && pods.length === 0) {
            setLoading(true)
            whatsappService
                .getAgentPods()
                .then(res => setPods(res || []))
                .catch(() => setPods([]))
                .finally(() => setLoading(false))
        }
    }, [dropdownOpen, pods.length])

    const toggle = () => setDropdownOpen(prevState => !prevState)

    const displayName = currentPodName || pods.find(p => p.id === currentPodId)?.name || 'General Support'

    return (
        <div className="d-flex align-items-center gap-1 ms-2">
            {detectedIntent && (
                <Badge color="light-info" pill style={{ fontSize: '0.72rem' }}>
                    Intent: {detectedIntent.replace(/_/g, ' ')}
                </Badge>
            )}

            <Dropdown isOpen={dropdownOpen} toggle={toggle} disabled={disabled}>
                <DropdownToggle
                    tag="span"
                    className="cursor-pointer d-flex align-items-center gap-1"
                    data-toggle="dropdown"
                >
                    <Badge color="light-primary" pill className="d-flex align-items-center gap-1 py-1 px-2">
                        <Users size={12} />
                        <span>Pod: {displayName}</span>
                        <ChevronDown size={12} />
                    </Badge>
                </DropdownToggle>
                <DropdownMenu end>
                    <DropdownItem header>Reassign to Agent Pod</DropdownItem>
                    {loading ? (
                        <div className="text-center p-2">
                            <Spinner size="sm" color="primary" />
                        </div>
                    ) : (
                        <>
                            <DropdownItem
                                active={!currentPodId}
                                onClick={() => onSelectPod(null)}
                            >
                                Default / No Pod
                            </DropdownItem>
                            {pods.map(pod => (
                                <DropdownItem
                                    key={pod.id}
                                    active={pod.id === currentPodId}
                                    onClick={() => onSelectPod(pod.id)}
                                >
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>{pod.name}</span>
                                        <small className="text-muted ms-2">({pod.department})</small>
                                    </div>
                                </DropdownItem>
                            ))}
                        </>
                    )}
                </DropdownMenu>
            </Dropdown>
        </div>
    )
}

export default PodBadgeDropdown

