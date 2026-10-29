import React from 'react'
import './whatsapp.scss'

const ChatHeader = () => {
    return (
        <div className="header">
            <div className="img-text">
                <div className="user-img">
                    <img className="dp" src="https://images.pexels.com/photos/2474307/pexels-photo-2474307.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" />
                </div>
                <h4>Leo<br /><span>Online</span></h4>
            </div>
            <div className="nav-icons">
                <li><i className="fa-solid fa-magnifying-glass"></i></li>
                <li><i className="fa-solid fa-ellipsis-vertical"></i></li>
            </div>
        </div>
    )
}

export default ChatHeader
