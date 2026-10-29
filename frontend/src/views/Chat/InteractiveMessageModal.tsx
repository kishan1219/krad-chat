import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Table } from 'reactstrap'

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

type JsonRecursiveProps = {
    data: Record<string, JsonValue>
}

type InteractiveMessageModalProps = {
    isOpen: boolean
    toggle: () => void
    interactiveData?: {
        nfm_reply?: {
            body?: string
            response_json?: string
        }
    } | null
}

const renderValue = (value: JsonValue) => {
    if (Array.isArray(value)) {
        return value.join(', ')
    }

    if (typeof value === 'object' && value !== null) {
        return <JsonRecursive data={value as Record<string, JsonValue>} />
    }

    return String(value)
}

const JsonRecursive = ({ data }: JsonRecursiveProps) => {
    return (
        <Table bordered size='sm' style={{ margin: 0 }}>
            <tbody>
                {Object.entries(data).map(([key, value]) => (
                    <tr key={key}>
                        <th style={{ width: '30%', verticalAlign: 'top' }}>{key.replace(/_/g, ' ')}</th>
                        <td>{renderValue(value)}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    )
}

const InteractiveMessageModal = ({ isOpen, toggle, interactiveData }: InteractiveMessageModalProps) => {
    if (!interactiveData?.nfm_reply?.response_json) {
        return null
    }

    let responseJson: Record<string, JsonValue>

    try {
        responseJson = JSON.parse(interactiveData.nfm_reply.response_json)
    } catch (error) {
        console.error('Failed to parse response_json:', error)
        return (
            <Modal isOpen={isOpen} toggle={toggle} centered>
                <ModalHeader toggle={toggle}>Interactive Message</ModalHeader>
                <ModalBody>
                    <p>Error parsing message data.</p>
                </ModalBody>
                <ModalFooter>
                    <Button color='secondary' onClick={toggle}>Close</Button>
                </ModalFooter>
            </Modal>
        )
    }

    return (
        <Modal isOpen={isOpen} toggle={toggle} centered size='lg'>
            <ModalHeader toggle={toggle}>Interactive Message Details</ModalHeader>
            <ModalBody>
                {interactiveData.nfm_reply.body ? <h5>{interactiveData.nfm_reply.body}</h5> : null}
                <JsonRecursive data={responseJson} />
            </ModalBody>
            <ModalFooter>
                <Button color='secondary' onClick={toggle}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default InteractiveMessageModal
