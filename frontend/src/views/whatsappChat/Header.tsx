import React from 'react'
import './whatsapp.scss'

const Header = () => {
    return (
        <div className="header">
            <div className="user-img">
                <img className="dp" src="https://www.codewithfaraz.com/InstaPic.png" alt="" />
            </div>
            <div className="nav-icons">
                <li><i className="fa-solid fa-users"></i></li>
                <li><i className="fa-solid fa-message"></i></li>
                <li><i className="fa-solid fa-ellipsis-vertical"></i></li>
            </div>
        </div>
    )
}

export default Header
