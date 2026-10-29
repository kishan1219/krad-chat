import React from 'react'
import './whatsapp.scss'

const NotifBox = () => {
    return (
        <div className='notif-box'>
            <i className='fa-solid fa-bell-slash'></i>
            <div className='notif-text'>
                <p>Get Notified of New Messages</p>
                <a href='#'>Turn on Desktop Notifications &gt;</a>
            </div>
            <i className='fa-solid fa-xmark'></i>
        </div>
    )
}

export default NotifBox
