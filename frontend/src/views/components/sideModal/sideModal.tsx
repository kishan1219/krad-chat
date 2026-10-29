// @ts-nocheck
// ** React Imports
import { useState } from 'react'

// ** Third Party Components
import Flatpickr from 'react-flatpickr'
import { User, Briefcase, Mail, Calendar, DollarSign, X } from 'react-feather'
import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    FormGroup,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Input,
    Label,
    ButtonGroup,
    ModalFooter
} from 'reactstrap'

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'
import { FM } from '../../../utility/helpers/common'
import LoadingButton from '../buttons/LoadingButton'

const SideModal = ({ loading = false, open, disableSave = false, handleModal, children, handleSave, title = "modal-title", done = "done", close = "close" }) => {
    // ** State
    const [Picker, setPicker] = useState(new Date())

    // ** Custom close btn
    const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleModal} />

    return (
        <Modal
            isOpen={open}
            toggle={handleModal}
            className='sidebar-sm'
            modalClassName='modal-slide-in'
            contentClassName='pt-0 pb-0'
        >
            <ModalHeader className='mb-0' toggle={handleModal} close={CloseBtn} tag='div'>
                <h5 className='modal-title'>
                    {FM(title)}
                </h5>
            </ModalHeader>
            <ModalBody className='flex-grow-1 pt-2 pb-2' style={{ height: "100vh", overflowY: "scroll" }}>
                {children}
            </ModalBody>
            <ModalFooter>
                <ButtonGroup className="btn-block">
                    <Button.Ripple color='secondary' onClick={handleModal} outline style={{ textTransform: "capitalize" }}>
                        {FM(close)}
                    </Button.Ripple>
                    <LoadingButton disabled={disableSave} loading={loading} color='primary' onClick={handleSave} style={{ textTransform: "capitalize"}}>
                        {FM(done)}
                    </LoadingButton>
                  
                </ButtonGroup>
            </ModalFooter>
        </Modal>
    )
}

export default SideModal
