// @ts-nocheck
import React from 'react'
import { Nav, NavItem, NavLink } from 'reactstrap'
import { CreditCard, Key, Lock, Shield, Sliders, Smartphone, User } from 'react-feather'
import { useSelector } from 'react-redux'
import { Permissions } from '../../../utility/Permissions'
import Show from '../../../utility/Show'

const Tabs = ({ activeTab, toggleTab }) => {
    const loginUser = useSelector(state => state.auth.userData)

    const navItems = [
        {
            id: '1',
            title: 'Profile Info',
            icon: <User size={16} className='me-1' />,
            show: true
        },
        {
            id: '3',
            title: 'Password & Security',
            icon: <Lock size={16} className='me-1' />,
            show: true
        },
        {
            id: '6',
            title: 'WhatsApp Cloud API',
            icon: <Smartphone size={16} className='me-1' />,
            show: true
        },
        {
            id: '4',
            title: 'API Credentials',
            icon: <Key size={16} className='me-1' />,
            show: Boolean(Permissions?.userApiKey)
        },
        {
            id: '5',
            title: 'Credits & Balances',
            icon: <CreditCard size={16} className='me-1' />,
            show: Boolean(Permissions?.userCreditAdd)
        },
        {
            id: '8',
            title: 'Messaging Rates',
            icon: <Sliders size={16} className='me-1' />,
            show: true
        },
        {
            id: '7',
            title: 'IP Security Whitelist',
            icon: <Shield size={16} className='me-1' />,
            show: Boolean(Permissions?.userApiKey)
        }
    ]

    return (
        <div className='settings-tabs-wrapper mb-3'>
            <Nav pills className='flex-wrap gap-2 p-1 bg-white rounded-3 shadow-xs border'>
                {navItems.filter(item => item.show).map(tab => {
                    const isActive = activeTab === tab.id
                    return (
                        <NavItem key={tab.id} className='mb-0'>
                            <NavLink
                                active={isActive}
                                onClick={() => toggleTab(tab.id)}
                                className={`d-flex align-items-center px-3 py-2 rounded-2 fw-semibold cursor-pointer ${
                                    isActive
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-dark bg-transparent hover-bg-light'
                                }`}
                                style={{
                                    transition: 'all 0.2s ease-in-out',
                                    fontSize: '0.88rem'
                                }}
                            >
                                {tab.icon}
                                <span>{tab.title}</span>
                            </NavLink>
                        </NavItem>
                    )
                })}
            </Nav>
        </div>
    )
}

export default Tabs
