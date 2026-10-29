import React from 'react'
import ChatBox, { type ChatListItem } from './ChatBox'
import './whatsapp.scss'

const chatData: ChatListItem[] = [
    {
        img: 'https://lh5.googleusercontent.com/-7ssjf_mDE1Q/AAAAAAAAAAI/AAAAAAAAASo/tioYx2oklWEHoo5nAEyCT-KeLxYqE5PuQCLcDEAE/s100-c-k-no-mo/photo.jpg',
        name: 'Nowfal',
        time: '11:49',
        message: 'How are you?',
        unread: 1
    },
    {
        img: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        name: 'Rohan',
        time: '10:49',
        message: "I'll be there.",
        unread: 4
    },
    {
        img: 'https://images.pexels.com/photos/8367221/pexels-photo-8367221.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        name: 'Zoya',
        time: '09:49',
        message: "Make somebody's day.",
        unread: 2
    },
    {
        img: 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        name: 'Ava',
        time: '08:49',
        message: 'Dreams come true.'
    },
    {
        img: 'https://images.pexels.com/photos/2474307/pexels-photo-2474307.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        name: 'Leo',
        time: '07:49',
        message: "Awesome! I'll start a vid..",
        active: true
    },
    {
        img: 'https://images.pexels.com/photos/3564412/pexels-photo-3564412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        name: 'Azariah',
        time: '06:49',
        message: 'Love, light, laughter.'
    },
    {
        img: 'https://images.pexels.com/photos/2919367/pexels-photo-2919367.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        name: 'Oliver',
        time: 'Yesterday',
        message: 'Appreciate the mome..',
        unread: 2
    },
    {
        img: 'https://images.pexels.com/photos/14526673/pexels-photo-14526673.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        name: 'Jeslin',
        time: 'Yesterday',
        message: 'Now or never.'
    }
]

const ChatList = () => {
    return (
        <div className='chat-list'>
            {chatData.map((chat, index) => (
                <ChatBox key={index} chat={chat} />
            ))}
        </div>
    )
}

export default ChatList
