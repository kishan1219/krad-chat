// @ts-nocheck
// ** React Imports
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Utils
import { isUserLoggedIn } from '@utils'

// ** Store & Actions
import { useDispatch, useSelector } from 'react-redux'
// import { handleLogout } from '@store/authentication'

// ** Third Party Components
import { User, Mail, CheckSquare, MessageSquare, Settings, CreditCard, HelpCircle, Power, UserCheck, Codesandbox } from 'react-feather'

// ** Reactstrap Imports
import { UncontrolledDropdown, DropdownMenu, DropdownToggle, DropdownItem } from 'reactstrap'

// ** Default Avatar Image
import defaultAvatar from '@src/assets/images/portrait/small/avatar-s-11.jpg'
import httpConfig from '../../../../utility/http/httpConfig'
import Hide from '../../../../utility/Hide'
import Show from '../../../../utility/Show'
import Api from '@mui/icons-material/Api'
import { Permissions } from '../../../../utility/Permissions'
import ApiEndpoints from '../../../../utility/http/ApiEndpoints'
import HistoryIcon from '@mui/icons-material/History'
import axios from 'axios'
import { handleLogout, handleRemoveOtp } from '../../../../redux/authentication'

const UserDropdown = () => {
    // ** Store Vars
    const dispatch = useDispatch()

    // ** State
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    //** ComponentDidMount
    useEffect(() => {
        if (isUserLoggedIn() !== null) {
            setUserData(JSON.parse(localStorage.getItem('kradChatData') || 'null'))
        }
    }, [])

    //** Vars
    const userAvatar = (userData && userData.avatar) || defaultAvatar

    const user = useSelector(state => state.auth.userData)

    const getUserType = (user) => {

        if (user?.userType === 0) {
            return 'Admin'
        } else if (user?.userType === 1) {
            return 'Reseller'
        } else if (user?.userType === 2) {
            return 'Client'
        } else {
            return 'Employee'
        }
    }

    const userTypeLabel = getUserType(user)

    const loadLogout = (e) => {
        e.preventDefault()
        axios
            .post(`${httpConfig.baseUrl}${ApiEndpoints.logout}`)
            .then((res) => {
                setLoading(false)

                dispatch(handleLogout())
                dispatch(handleRemoveOtp())
                localStorage.removeItem('access_token')
                // dispatch(handle)
                window.location.href = '/authentication'
            })
            .catch((err) => {
                setError(err?.response?.data?.message)
            })
    }
    return (
        <UncontrolledDropdown tag='li' className='dropdown-user nav-item'>
            <DropdownToggle href='/' tag='a' className='nav-link dropdown-user-link' onClick={e => e.preventDefault()}>
                <div className='user-nav d-sm-flex d-none'>
                    <span className='user-name fw-bold'>{userData?.name || userData?.username || userData?.email || 'Account'}</span>
                    {/* <span className='user-status'>{(userData && userData.role) || 'Admin'}</span> */}
                    <span className='user-status'>{userTypeLabel}</span>
                </div>
                <Show IF={user?.userType === 0 || user?.userType === 3}>
                    <Avatar img={httpConfig?.baseUrl2 + user?.companyLogo ?? userAvatar} imgHeight='40' imgWidth='40' status='online' />
                </Show>
                <Hide IF={user?.userType === 0 || user?.userType === 3}>
                    <Avatar img={httpConfig?.baseUrl2 + user?.companyLogo ?? userAvatar} imgHeight='40' imgWidth='40' status='online' />
                </Hide>
            </DropdownToggle>
            <DropdownMenu end>
                <Show IF={Permissions?.editProfile} >
                    <DropdownItem tag={Link} to='/app-settings'>
                        <Settings size={14} className='me-75' />
                        <span className='align-middle'>Setting</span>
                    </DropdownItem>
                </Show>
                <Show IF={Permissions?.editProfile} >
                    <DropdownItem tag={Link} to='/edit-profile'>
                        <UserCheck size={14} className='me-75' />

                        <span className='align-middle'>Profile</span>
                    </DropdownItem>
                </Show>
                {/* </Show> */}
                {/* <Show IF={Permissions?.dashboardView}> */}
                <DropdownItem tag={Link} to='/documents' target='_blank'>
                    <Api size={14} className='me-75' />
                    <span className='align-middle'>API Documents</span>
                </DropdownItem>

                <Show IF={user?.userType === 0}>
                    <DropdownItem tag={Link} to='/server-commands'>
                        <Codesandbox className='me-75' />

                        <span className='align-middle'>Server Command</span>
                    </DropdownItem>
                </Show>

                <Show IF={user?.userType === 0}>
                    <DropdownItem tag={Link} to='/login-user-log'>
                        <HistoryIcon className='me-75' />

                        <span className='align-middle'>Application Logs</span>
                    </DropdownItem>
                </Show>

                {/* </Show> */}
                {/* <DropdownItem tag={Link} to='/apps/email'>
                    <Mail size={14} className='me-75' />
                    <span className='align-middle'>Inbox</span>
                </DropdownItem>
                <DropdownItem tag={Link} to='/apps/todo'>
                    <CheckSquare size={14} className='me-75' />
                    <span className='align-middle'>Tasks</span>
                </DropdownItem>
                <DropdownItem tag={Link} to='/apps/chat'>
                    <MessageSquare size={14} className='me-75' />
                    <span className='align-middle'>Chats</span>
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem tag={Link} to='/pages/account-settings'>
                    <Settings size={14} className='me-75' />
                    <span className='align-middle'>Settings</span>
                </DropdownItem>
                <DropdownItem tag={Link} to='/pages/pricing'>
                    <CreditCard size={14} className='me-75' />
                    <span className='align-middle'>Pricing</span>
                </DropdownItem>
                <DropdownItem tag={Link} to='/pages/faq'>
                    <HelpCircle size={14} className='me-75' />
                    <span className='align-middle'>FAQ</span>
                </DropdownItem> */}
                <DropdownItem tag={Link} to='/authentication' onClick={loadLogout}>
                    <Power size={14} className='me-75' />
                    <span className='align-middle'>Logout</span>
                </DropdownItem>
            </DropdownMenu>
        </UncontrolledDropdown >
    )
}

export default UserDropdown
