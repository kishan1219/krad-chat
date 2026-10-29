import React from 'react'
import './whatsapp.scss'

export type ChatMessage = {
    text: string
    time: string
    type: 'my-message' | 'friend-message'
}

type MessageBoxProps = {
    message: ChatMessage
}

const MessageBox = ({ message }: MessageBoxProps) => {
    return (
        <div className={`message-box ${message.type}`}>
            <p>{message.text}<br /><span>{message.time}</span></p>
        </div>
    )
}

export default MessageBox
