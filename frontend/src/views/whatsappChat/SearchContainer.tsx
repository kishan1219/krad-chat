import React from 'react'
import './whatsapp.scss'

const SearchContainer = () => {
    return (
        <div className="search-container">
            <div className="input">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input type="text" placeholder="Search or start new chat" />
            </div>
            <i className="fa-sharp fa-solid fa-bars-filter"></i>
        </div>
    )
}

export default SearchContainer
