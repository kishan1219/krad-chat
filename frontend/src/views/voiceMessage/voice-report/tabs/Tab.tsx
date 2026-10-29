// @ts-nocheck
import React from 'react'
import { Nav, NavItem, NavLink } from 'reactstrap'

import Loop from '@mui/icons-material/Loop'
import Summarize from '@mui/icons-material/Summarize'
const Tab = ({ activeTab, toggleTab }) => {
    return (
        <Nav pills className='mb-2'>

            <NavItem>
                <NavLink active={activeTab === '1'} onClick={() => toggleTab('1')}>
                    <Summarize size={18} className='me-50' />

                    <span className='fw-bold'>All Reports</span>
                </NavLink>
            </NavItem>

            {/* <NavItem>
                <NavLink active={activeTab === '2'} onClick={() => toggleTab('2')}>
                    <Loop size={18} className='me-50' />
                    <span className='fw-bold'>Two Way</span>
                </NavLink>
            </NavItem> */}

        </Nav>
    )
}

export default Tab
