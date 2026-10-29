import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Table } from 'reactstrap'

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

type JsonRecursiveProps = {
    data: Record<string, JsonValue>
}

type JsonDisplayModalProps = {
    isOpen: boolean
    toggle: () => void
    jsonData?: string | Record<string, JsonValue> | null
    title?: string
}

const renderValue = (value: JsonValue) => {
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

const JsonDisplayModal = ({ isOpen, toggle, jsonData, title }: JsonDisplayModalProps) => {
    if (!jsonData) {
        return null
    }

    let data: Record<string, JsonValue>

    try {
        data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
    } catch (error) {
        console.error('Failed to parse JSON data:', error)
        return (
            <Modal isOpen={isOpen} toggle={toggle} centered>
                <ModalHeader toggle={toggle}>{title || 'Message Details'}</ModalHeader>
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
            <ModalHeader toggle={toggle}>{title || 'Message Details'}</ModalHeader>
            <ModalBody>
                <JsonRecursive data={data} />
            </ModalBody>
            <ModalFooter>
                <Button color='secondary' onClick={toggle}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default JsonDisplayModal
