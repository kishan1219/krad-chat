// @ts-nocheck
// ** React Imports
// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'
import { useEffect } from 'react'
import {
    Button, ButtonGroup, Modal, ModalBody, ModalFooter, ModalHeader
} from 'reactstrap'
import { FM } from '../../../utility/helpers/common'
import Hide from '../../../utility/Hide'
import Show from '../../../utility/Show'
import LoadingButton from '../buttons/LoadingButton'

const StepsModal = ({ hideClose = false, closeButton = null, headerClose = false, hideSave = false, extraButtons = null, display = true, enableForceSave = false, lastIndex = 3, handleSaveForce = () => { }, showForm = false, currentIndex = 0, disableFooter = false, loading = false, modalClass, open, disableSave = false, handleModal, children, handleSave, title = "modal-title", done = "save", close = "close" }) => {

    useEffect(() => {
        if (open !== null) {
            if (open) {
                document.body.style.overflow = "hidden"
            } else {
                document.body.style.overflowY = "visible"
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
    }, [display])

    return (
        <Modal

            zIndex={open ? '1050' : "1049"}
            wrapClassName={`animatedOpacity ${display ? "" : "send-left"}`}
            isOpen={open}
            backdrop="static"
            keyboard={false}
            toggle={e => handleModal(null)}
            className={`modal-dialog-centered  ${modalClass} `}
        >
            {headerClose ? <ModalHeader className='' toggle={(e) => handleModal(null)}>{title}</ModalHeader> : null}

            <ModalBody className='flex-grow-1 p-0'>
                {children}
            </ModalBody>
            {
                !disableFooter ? <ModalFooter className=''>
                    <div className=''>
                        {closeButton}
                    </div>
                    <div className=''>
                        <div>
                            <ButtonGroup className="btn-block">
                                <Hide IF={hideClose}>
                                    <Button.Ripple color='secondary' onClick={e => handleModal('from-button')} outline>
                                        {currentIndex === 0 || showForm ? FM(close) : FM('prev')}
                                    </Button.Ripple>
                                </Hide>
                                <Hide IF={hideSave}>
                                    <LoadingButton disabled={loading || disableSave} loading={currentIndex === lastIndex ? loading : false} color='primary' outline={extraButtons !== null || currentIndex !== lastIndex} onClick={handleSave}>
                                        {currentIndex === lastIndex || showForm ? FM(done) : FM('next')}
                                    </LoadingButton>
                                </Hide>

                                <Show IF={enableForceSave && currentIndex !== lastIndex}>
                                    <LoadingButton disabled={loading || disableSave} loading={loading} color='primary' outline={extraButtons !== null} onClick={handleSaveForce}>
                                        {FM("save")}
                                    </LoadingButton>
                                </Show>

                                {extraButtons}
                            </ButtonGroup>
                        </div>
                    </div>

                </ModalFooter> : null}
        </Modal>
    )
}

export default StepsModal
