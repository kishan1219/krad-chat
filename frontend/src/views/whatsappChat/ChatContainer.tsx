import React from 'react'
import ChatHeader from './ChatHeader'
import ChatInput from './ChatInput'
import MessageBox, { type ChatMessage } from './MessageBox'
import './whatsapp.scss'

const messages: ChatMessage[] = [
    { text: "I've been waiting to see that show asap!", time: '07:43', type: 'my-message' },
    { text: "Ahh, I can't believe you do too!", time: '07:45', type: 'friend-message' },
    { text: 'The trailer looks good', time: '07:45', type: 'friend-message' },
    { text: "I've been waiting to watch it!!", time: '07:45', type: 'friend-message' },
    { text: ':| :| :|', time: '07:46', type: 'my-message' },
    { text: 'Mee too! :)', time: '07:46', type: 'my-message' },
    { text: "We should video chat to discuss, if you're up for it!", time: '07:48', type: 'friend-message' },
    { text: 'Sure', time: '07:48', type: 'my-message' },
    { text: "I'm free now!", time: '07:48', type: 'my-message' },
    { text: "Awesome! I'll start a video chat with you in a few.", time: '07:49', type: 'friend-message' }
]

const ChatContainer = () => {
    return (
        <div>
            <ChatHeader />
            <div className='chat-container'>
                {messages.map((msg, index) => (
                    <MessageBox key={index} message={msg} />
                ))}
            </div>
            <ChatInput />
        </div>
    )
}

export default ChatContainer
