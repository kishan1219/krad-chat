// @ts-nocheck
// ** Reactstrap Imports
import { Nav, NavItem, NavLink } from 'reactstrap'

// ** Icons Imports
import { Lock, Server, User } from 'react-feather'
import { useSelector } from 'react-redux'
import Hide from '../../../utility/Hide'
import { Permissions } from '../../../utility/Permissions'
import Show from '../../../utility/Show'
import CurrencyRupee from '@mui/icons-material/CurrencyRupee'

const Tabs = ({ activeTab, toggleTab }) => {

    const loginUser = useSelector(state => state.auth.userData)

    return (
        <Nav pills className='mb-2'>
            {/* <Show IF= {Permissions?.appSettingView} > */}

            <NavItem>
                <NavLink active={activeTab === '1'} onClick={() => toggleTab('1')}>
                    <User size={18} className='me-50' />
                    <span className='fw-bold'>Info</span>
                </NavLink>
            </NavItem>

            <Hide IF={loginUser?.userType === 3} >

            </Hide>
            <NavItem>
                <NavLink active={activeTab === '3'} onClick={() => toggleTab('3')}>
                    <Lock size={18} className='me-50' />
                    <span className='fw-bold'>Security</span>
                </NavLink>
            </NavItem>
            <Show IF={Permissions?.userApiKey} >

                <NavItem>
                    <NavLink active={activeTab === '4'} onClick={() => toggleTab('4')}>

                        <Server size={18} className='me-50' />
                        <span className='fw-bold'>App Keys</span>
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
            {/* <Show IF={Permissions?.userCreditAdd}> */}
                <NavItem>
                    <NavLink active={activeTab === '8'} onClick={() => toggleTab('8')}>
                    <CurrencyRupee size={18} className='me-50' />
                        <span className='fw-bold'>Whatsapp & SMS Charges</span>
                    </NavLink>
                </NavItem>
            {/* </Show> */}
            <Show IF={Permissions?.userApiKey} >

                <NavItem>
                    <NavLink active={activeTab === '7'} onClick={() => toggleTab('7')}>
                        <Lock size={18} className='me-50' />
                        <span className='fw-bold'>Additional Security</span>
                    </NavLink>
                </NavItem>
            </Show>


        </Nav>

    )
}

export default Tabs
