// @ts-nocheck
import { Nav, NavItem, NavLink } from 'reactstrap'

import { User, Lock, Bookmark, Link, Bell, Server, Upload } from 'react-feather'
import Router from '@mui/icons-material/Router'
import Show from '../../../utility/Show'
import { useSelector } from 'react-redux'
import { Permissions } from '../../../utility/Permissions'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import LanguageIcon from '@mui/icons-material/Language'

const Tabs = ({ activeTab, toggleTab, edit }) => {
    const loginUser = useSelector(state => state.auth.userData)

    return (
        <Nav pills className='mb-2'>
            <NavItem>
                <NavLink active={activeTab === '1'} onClick={() => toggleTab('1')}>
                    <User size={18} className='me-50' />
                    <span className='fw-bold'>Info</span>
                </NavLink>
            </NavItem>
            <Show IF={Permissions?.userApiKey}>
                <NavItem>
                    <NavLink active={activeTab === '4'} onClick={() => toggleTab('4')}>
                        <Server size={18} className='me-50' />
                        <span className='fw-bold'>App Info</span>
                    </NavLink>
                </NavItem>
            </Show>
            <Show IF={Permissions?.userCreditAdd}>
                <NavItem>
                    <NavLink active={activeTab === '5'} onClick={() => toggleTab('5')}>
                        <Lock size={18} className='me-50' />
                        <span className='fw-bold'>Credit Info</span>
                    </NavLink>
                </NavItem>
            </Show>
            {/* <Show IF={Permissions?.userApiKey}>
            <NavItem>
                <NavLink active={activeTab === '7'} onClick={() => toggleTab('7')}>
                    <Lock size={18} className='me-50' />
                    <span className='fw-bold'>Additional Security</span>
                </NavLink>
            </NavItem>
            </Show> */}
            <Show IF={Permissions?.userRouteSetting} >

                <NavItem>
                    <NavLink active={activeTab === '8'} onClick={() => toggleTab('8')}>

                        <Router className='me-50' />
                        <span className='fw-bold'>Route Setting</span>
                    </NavLink>
                </NavItem>
            </Show>
            <Show IF={Permissions?.userUploadDocument}>
                <NavItem>
                    <NavLink active={activeTab === '6'} onClick={() => toggleTab('6')}>

                        <Upload size={18} className='me-50' />
                        <span className='fw-bold'>Documents</span>
                    </NavLink>
                </NavItem>
            </Show>
            <Show IF={Permissions?.whatsappChargesList}>
                <NavItem>
                    <NavLink active={activeTab === '9'} onClick={() => toggleTab('9')}>

                        <WhatsAppIcon size={18} className='me-50' />
                        <span className='fw-bold'>WhatsApp Charge</span>
                    </NavLink>
                </NavItem>
            </Show>

            <Show IF={edit?.allow_to_add_webhook === 1}>
                <NavItem>
                    <NavLink active={activeTab === '10'} onClick={() => toggleTab('10')}>

                        <LanguageIcon size={18} className='me-50' />
                        <span className='fw-bold'>Webhook</span>
                    </NavLink>
                </NavItem>
            </Show>
        </Nav>
    )
}

export default Tabs
