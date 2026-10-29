import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Table } from 'reactstrap'

type OrderItem = Record<string, string | number | boolean | null>

type OrderData = {
    catalog_id?: string | number
    product_items?: OrderItem[]
}

type OrderDetailsModalProps = {
    isOpen: boolean
    toggle: () => void
    orderData?: OrderData | null
}

const OrderDetailsModal = ({ isOpen, toggle, orderData }: OrderDetailsModalProps) => {
    if (!orderData) {
        return null
    }

    const { catalog_id, product_items } = orderData

    const renderTableHeaders = () => {
        if (!product_items || product_items.length === 0) {
            return null
        }

        const headers = Object.keys(product_items[0])
        return (
            <tr>
                {headers.map(header => <th key={header}>{header.replace(/_/g, ' ').toUpperCase()}</th>)}
            </tr>
        )
    }

    const renderTableBody = () => {
        if (!product_items || product_items.length === 0) {
            return (
                <tr>
                    <td colSpan={100}>No items in this order.</td>
                </tr>
            )
        }

        const headers = Object.keys(product_items[0])
        return product_items.map((item, index) => (
            <tr key={index}>
                {headers.map(header => <td key={`${header}-${index}`}>{String(item[header] ?? '')}</td>)}
            </tr>
        ))
    }

    return (
        <Modal isOpen={isOpen} toggle={toggle} centered size='lg'>
            <ModalHeader toggle={toggle}>Order Details</ModalHeader>
            <ModalBody>
                {catalog_id ? <h5>Catalog ID: {catalog_id}</h5> : null}
                <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
                    <Table striped bordered responsive>
                        <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                            {renderTableHeaders()}
                        </thead>
                        <tbody>
                            {renderTableBody()}
                        </tbody>
                    </Table>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color='secondary' onClick={toggle}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default OrderDetailsModal
