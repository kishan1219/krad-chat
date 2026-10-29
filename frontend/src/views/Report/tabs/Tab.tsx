// @ts-nocheck
import React from 'react'
import { Nav, NavItem, NavLink } from 'reactstrap'

// ** Icons Imports
import { User, Lock, Bookmark, Link, Bell, Upload, Server } from 'react-feather'
import Loop from '@mui/icons-material/Loop'
import Summarize from '@mui/icons-material/Summarize'
import SettingsVoice from '@mui/icons-material/SettingsVoice'
import WhatsApp from '@mui/icons-material/WhatsApp'
const Tab = ({ activeTab, toggleTab }) => {
    return (
        <Nav pills className='mb-2'>
        
            <NavItem>
                <NavLink active={activeTab === '1'} onClick={() => toggleTab('1')}>
                    <Summarize size={18} className='me-50' />

                    <span className='fw-bold'>Text SMS</span>
                </NavLink>
            </NavItem>

            <NavItem>
                <NavLink active={activeTab === '2'} onClick={() => toggleTab('2')}>
                    <Loop size={18} className='me-50' />
                    <span className='fw-bold'>Two Way</span>
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink active={activeTab === '3'} onClick={() => toggleTab('3')}>
                   
                    <SettingsVoice fontSize='medium' className='me-50' />
                    <span className='fw-bold'>Voice</span>
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink active={activeTab === '4'} onClick={() => toggleTab('4')}>
                   
                    <WhatsApp fontSize='medium' className='me-50' />
                    <span className='fw-bold'>WhatsApp</span>
                </NavLink>
            </NavItem>

        </Nav>
    )
}

export default Tab
