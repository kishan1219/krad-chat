// @ts-nocheck
// ** React Imports
// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'
import { useEffect } from 'react'
import {
    Button, ButtonGroup, Modal, ModalBody, ModalFooter, ModalHeader
} from 'reactstrap'
import Hide from '../../../utility/Hide'
// import { Permissions } from '../../../utility/Permissions'
import Show from '../../../utility/Show'
import LoadingButton from '../buttons/LoadingButton'

const CenteredModal = ({ id, hideSave = false, footerComponent = null, display = true, scrollControl = true, disableHeader = false, disableFooter = false, loading = false, modalClass, open, disableSave = false, handleModal, children, handleSave, handleSign, fullscreen, title = "modal-title", sign = "sign", done = "save", close = "close", extraButtons = null }) => {
    useEffect(() => {
        if (scrollControl) {
            if (open !== null) {
                if (open) {
                    document.body.style.overflow = "hidden"
                } else {
                    document.body.style.overflowY = "visible"
                }
            }
        }
    }, [open])

    useEffect(() => {
        if (open !== null) {
            if (open) {
                document.body.style.overflow = "hidden"
            } else {
                document.body.style.overflowY = "visible"
            }
        }
    }, [display, open])


    return (
        <Modal
            zIndex={open ? '1050' : "1049"}
            wrapClassName={`animatedOpacity ${display ? "" : "send-left"}`}
            isOpen={open}
            toggle={e => handleModal(null)}
            backdrop="static"
            scrollable={scrollControl}
            keyboard={false}
            // extraButtons={extraButtons}
            className={`modal-dialog-centered ${modalClass}`}
            fullscreen={fullscreen}
        >
            <Hide IF={disableHeader}>
                <ModalHeader className='' toggle={e => handleModal(null)}>
                    {title}
                </ModalHeader>
            </Hide>
            <ModalBody className='flex-grow-1 p-0' id={id}>
                {children}
            </ModalBody>
            <Hide IF={disableFooter}>
                <ModalFooter>
                    <Hide IF={footerComponent}>
                        <div className=''>
                            <ButtonGroup className="btn-block">
                                <Button.Ripple color='secondary' onClick={e => handleModal('from-button')} outline style={{ textTransform: "capitalize" }}>
                                    close
                                </Button.Ripple>
                                <Hide IF={hideSave}>
                                    <LoadingButton disabled={disableSave} loading={loading} color='primary' outline={extraButtons !== null} onClick={handleSave} style={{ textTransform: "capitalize" }}>
                                        save
                                    </LoadingButton>
                                </Hide>
                                {extraButtons}
                            </ButtonGroup>
                        </div>
                    </Hide>
                    {
                        footerComponent
                    }
                </ModalFooter>
            </Hide>
        </Modal>
    )
}

export default CenteredModal
