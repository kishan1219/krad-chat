import React from 'react'
import './whatsapp.scss'

export type ChatListItem = {
    active?: boolean
    img: string
    message: string
    name: string
    time: string
    unread?: number
}

type ChatBoxProps = {
    chat: ChatListItem
}

const ChatBox = ({ chat }: ChatBoxProps) => {
    return (
        <div className={`chat-box ${chat.active ? 'active' : ''}`}>
            <div className="img-box">
                <img className="img-cover" src={chat.img} alt="" />
            </div>
            <div className="chat-details">
                <div className="text-head">
                    <h4>{chat.name}</h4>
                    <p className={`time ${chat.unread ? 'unread' : ''}`}>{chat.time}</p>
                </div>
                <div className="text-message">
                    <p>{chat.message}</p>
                    {chat.unread && <b>{chat.unread}</b>}
                </div>
            </div>
        </div>
    )
}

export default ChatBox
