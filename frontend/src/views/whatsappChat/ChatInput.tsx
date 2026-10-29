import React from 'react'
import './whatsapp.scss'

const ChatInput = () => {
    return (
        <div className="chatbox-input">
            <i className="fa-regular fa-face-grin"></i>
            <i className="fa-sharp fa-solid fa-paperclip"></i>
            <input type="text" placeholder="Type a message" />
            <i className="fa-solid fa-microphone"></i>
        </div>
    )
}

export default ChatInput
