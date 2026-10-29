import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Table } from 'reactstrap'

type ButtonMessageModalProps = {
    open: boolean
    handleModal: () => void
    messageData?: string | null
}

const ButtonMessageModal = ({ open, handleModal, messageData }: ButtonMessageModalProps) => {
    let parsedMessage: Record<string, unknown> | null = null

    try {
        if (messageData) {
            parsedMessage = JSON.parse(messageData)
        }
    } catch (error) {
        console.error('Failed to parse button message data:', error)
        parsedMessage = { error: 'Invalid JSON format', raw: messageData }
    }

    return (
        <Modal isOpen={open} toggle={handleModal} className='modal-dialog-centered'>
            <ModalHeader toggle={handleModal}>Button Message Details</ModalHeader>
            <ModalBody>
                {parsedMessage ? (
                    <div>
                        <Table bordered responsive>
                            <thead>
                                <tr>
                                    <th>Property</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(parsedMessage).map(([key, value]) => (
                                    <tr key={key}>
                                        <td><strong>{key}</strong></td>
                                        <td>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                ) : (
                    <p>No message data available.</p>
                )}
            </ModalBody>
            <ModalFooter>
                <Button color='secondary' onClick={handleModal}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default ButtonMessageModal
