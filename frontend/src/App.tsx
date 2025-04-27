import { useState } from 'react'
import { StrictMode } from 'react'

import ChatHome from './components/ChatHome'
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (<StrictMode><div className="min-h-screen bg-black">
    <ChatHome></ChatHome></div></StrictMode>
  )
}

export default App
