import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'

type LocationData = {
    latitude?: string | number
    longitude?: string | number
}

type LocationDisplayModalProps = {
    open: boolean
    toggle: () => void
    locationData?: LocationData | null
}

const LocationDisplayModal = ({ open, toggle, locationData }: LocationDisplayModalProps) => {
    return (
        <Modal isOpen={open} toggle={toggle} className='modal-dialog-centered'>
            <ModalHeader toggle={toggle}>Location Details</ModalHeader>
            <ModalBody>
                {locationData ? (
                    <>
                        <p><strong>Latitude:</strong> {locationData.latitude}</p>
                        <p><strong>Longitude:</strong> {locationData.longitude}</p>
                        <p>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${locationData.latitude},${locationData.longitude}`}
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                View on Google Maps
                            </a>
                        </p>
                    </>
                ) : (
                    <p>No location data available.</p>
                )}
            </ModalBody>
            <ModalFooter>
                <Button color='secondary' onClick={toggle}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default LocationDisplayModal
