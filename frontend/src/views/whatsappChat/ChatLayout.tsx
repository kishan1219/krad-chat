import React from 'react'
import Header from './Header'
import NotifBox from './NotifBox'
import SearchContainer from './SearchContainer'
import ChatList from './ChatList'
import ChatContainer from './ChatContainer'
// load whatsapp scss
import './whatsapp.scss'

const ChatLayout = () => {
  return (
      <div className='myFull'>
      <div className="test">
          <div className="background-green"></div>
          <div className="main-container">
              <div className="left-container">
                  <Header />
                  <NotifBox />
                  <SearchContainer />
                  <ChatList />
              </div>
              <div className="right-container">
                  <ChatContainer />
              </div>
          </div>
          </div>
          </div>
        
  )
}

export default ChatLayout
