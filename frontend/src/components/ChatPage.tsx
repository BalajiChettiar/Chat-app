import React from 'react'

import { useState,useEffect,useRef} from 'react'

const ChatPage = ({roomCode,name}) => {
  const [newMessage, setNewMessage] = useState('');
  const [roomJoin,setRoomJoin] = useState(false)
  const [messages,setMessages] = useState([])
  const socket = useRef<WebSocket| null>(null)
 
  const handleSend = () => {
    if (newMessage.trim() === '') return; // Don't send empty messages
  
    socket.current?.send(
      JSON.stringify({
        type: 'message',    // Very important
        roomCode,           // You should have this from earlier join
        text: newMessage,
      })
    );
  
    // Optionally clear the input after sending
    setNewMessage('');
  };
  useEffect(  ()=>{
    console.log('🔵 Setting up WebSocket connection');
        const ws = new WebSocket('ws://localhost:8080');
  socket.current = ws;

  // Only once the connection is open do we send
  ws.onopen = () => {
    console.log('🟢 WebSocket is open');
    console.log('WebSocket is open—sending join!');
    ws.send(JSON.stringify({
      type: 'join-room',
      roomCode,
      name
    }));
    setRoomJoin(true)
  };
    socket.current.onmessage=(event)=>{
      console.log('🟡 Message received:', event.data);
      const data = JSON.parse(event.data.toString());
      console.log('Message received:', data);
      setMessages((prev) => [...prev, data]);
    }
    socket.current.onclose = ()=>{
      console.log('🔴 WebSocket closed');
      console.log('Disconnected from WebSocket');
    }
    return () => {
      console.log('Cleaning up WebSocket');
      ws.close();
    };
     
  },[])
  if(!roomJoin){
    return <div>Joining room</div>
  }
  return (
    <div className ="min-h-screen">
      <div className="w-6/6 flex min-h-screen justify-center items-center ">
        <div className="w-6/12 h-[120vh] p-7 border-2  border-white border-dashed">
        <div className="flex flex-col items-center h-[70%]">
        <div className="w-6/6 rounded-lg bg-neutral-800 m-3 p-5">Room Code</div>
        <div className="w-6/6 h-[83%] mt-2 rounded-lg border-2 m-5 border-neutral-700">{messages.map((message)=>{
          return(<div>{message.text}</div>)
        })}</div></div>
        <div className="flex justify-between">
        <input  value={newMessage} onChange={(e) => setNewMessage(e.target.value)}  className="w-9/12 px-2 py-1 bg-transparent border-2 border-neutral-700 text-lg rounded" type="text" placeholder="Type Your text..."></input>
        <button onClick={handleSend} className="bg-white w-2/12 rounded-lg text-black px-2 py-1">SEND</button></div>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
