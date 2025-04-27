import React, { useState } from "react";
import axios from "axios";
import { Button } from '@headlessui/react'
import ChatPage from "./ChatPage";

export default function ChatHome() {
  const [chatPage,setChatPage] = useState(null)
  const[newRoom,setNewRoom] = useState(false)
  const [join,setJoin] = useState("Join")
  const [name,setName] = useState("")
  const [roomCode,setRoomCode] = useState("")
   async function handleCreateRoom(){
    try {
      const response = await axios.get('http://localhost:3000/generate-code');
      setNewRoom(response.data.code); // Save the code
      console.log('Generated Room Code:', response.data.code);
    } catch (error) {
      console.error('Error generating code:', error);
    }
  }
  async function handleJoin(){
    try {
      const response = await axios.post('http://localhost:3000/join-room', {
        name,
        roomCode
      });

      if (response.data.success) {
        console.log('Joined Successfully!');
        setChatPage(true); // 👈 Move to chat page
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error('Join Error:', error);
    }
  }
  if (chatPage) {
    // ✅ Show ChatPage when chatPage is true
    return <ChatPage name={name} roomCode={roomCode} />;
  }
  return (
    <div className="flex items-center justify-center h-screen">
     <div className="bg-neutral-900 p-9 w-3/6 rounded-4xl">
     <div className ="text-3xl font-bold font-pressStart  p-3  text-white">REAL TIME CHAT</div>
      <Button onClick={handleCreateRoom} className='rounded-lg bg-white px-4 py-3 text-2xl text-black  w-6/6'>Create New Room</Button>
      <input value={name} onChange={(e) => setName(e.target.value)} className="w-6/6 p-5 bg-transparent rounded-lg h-12 mt-4 border-2  border-white border-dashed text-white text-lg"
      placeholder="Enter your Name"></input>
      <span className="flex justify-between"><input value={roomCode} onChange={(e) => setRoomCode(e.target.value)} className="w-8/12 p-5 bg-transparent rounded-lg h-12 mt-4 border-2  border-white border-dashed text-white text-lg"
      placeholder="Enter Room Code"></input>
      <Button onClick = {handleJoin} className="rounded-lg bg-white mt-4 ml-2 text-xl text-black  w-4/12">{join}</Button></span>
      {newRoom && <div className=" flex justify-center w-6/6 h-[15vh] bg-transparent border-2 mt-3  border-white ">
         <div className="text-5xl m-5">{newRoom}</div></div>}
     </div>
     
    </div>
  )
}
