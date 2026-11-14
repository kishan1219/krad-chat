import React from 'react'
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button
} from 'reactstrap'
import { TrendingUp } from 'react-feather'
import { WhatsAppConnection } from '../../../services/whatsappService'
import { TierUpgradeCountdownCard } from './TierUpgradeCountdownCard'

interface TierUpgradeCountdownModalProps {
    connection: WhatsAppConnection | null
    isOpen: boolean
    onClose: () => void
}

export const TierUpgradeCountdownModal: React.FC<TierUpgradeCountdownModalProps> = ({
    connection,
    isOpen,
    onClose
}) => {
    if (!connection) return null

    return (
        <Modal isOpen={isOpen} toggle={onClose} centered size="md">
            <ModalHeader toggle={onClose} className="border-bottom">
                <div className="d-flex align-items-center gap-2">
                    <div className="p-1 rounded bg-light-warning">
                        <TrendingUp size={18} className="text-warning" />
                    </div>
                    <div>
                        <h5 className="mb-0 fw-bold">Predictive Tier Upgrade Countdown</h5>
                        <small className="text-muted">
                            {connection.display_phone_number || connection.phone_number_id} ({connection.messaging_limit_tier || 'TIER_1K'})
                        </small>
                    </div>
                </div>
            </ModalHeader>

            <ModalBody className="py-3">
                <TierUpgradeCountdownCard connectionId={connection.id} onClose={onClose} />
            </ModalBody>

            <ModalFooter className="border-top">
                <Button color="secondary" outline onClick={onClose}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default TierUpgradeCountdownModal

