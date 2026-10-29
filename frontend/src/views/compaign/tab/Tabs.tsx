// @ts-nocheck
// ** Reactstrap Imports
import { Nav, NavItem, NavLink } from 'reactstrap'

// ** Icons Imports
import LoopIcon from '@mui/icons-material/Loop'
import { Lock, User } from 'react-feather'

const Tabs = ({ activeTab, toggleTab}) => {
    return (
        <Nav pills className='mb-2'>
            <NavItem>
                <NavLink active={activeTab === '1'} onClick={() => toggleTab('1')}>
                    <User size={18} className='me-50' />
                    <span className='fw-bold'>Basic Detail</span>
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink active={activeTab === '2'} onClick={() => toggleTab('2')}>
                    <Lock size={18} className='me-50' />
                    <span className='fw-bold'>Sent Number Log</span>
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink active={activeTab === '3'} onClick={() => toggleTab('3')}>
                    <LoopIcon size={18} className='me-50' />
                    <span className='fw-bold'>Two Way Click Report</span>
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink active={activeTab === '4'} onClick={() => toggleTab('4')}>
                    <LoopIcon size={18} className='me-50' />
                    <span className='fw-bold'>Two Way Response Report</span>
                </NavLink>
            </NavItem>
            </Nav>
    )
}


export default Tabs
