import React, { useState, useEffect, useRef } from 'react';

const ChatPage = ({ roomCode, name }) => {
  const [newMessage, setNewMessage] = useState('');
  const [roomJoin, setRoomJoin] = useState(false);
  const [messages, setMessages] = useState([]);
  const socket = useRef<WebSocket | null>(null);
  const chatBoxRef = useRef<HTMLDivElement | null>(null);

  const handleSend = () => {
    if (newMessage.trim() === '') return; // Don't send empty messages

    socket.current?.send(
      JSON.stringify({
        type: 'message',
        roomCode,
        text: newMessage,
      })
    );

    setNewMessage('');
  };

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    socket.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: 'join-room',
          roomCode,
          name,
        })
      );
      setRoomJoin(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data.toString());
      setMessages((prev) => [...prev, data]);
    };

    ws.onclose = () => {};

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  if (!roomJoin) {
    return <div>Joining room</div>;
  }

  return (
    <div className="min-h-screen font-mono">
      <div className="w-6/6 flex min-h-screen justify-center items-center">
        <div className="w-6/12 h-[90vh] p-7 border-2 rounded-lg border-white border-dashed">
          <div className="flex flex-col items-center h-[90%]">
            <div className="w-6/6 rounded-lg bg-neutral-800 m-3 text-lg tracking-wide pl-5 p-3">
              {"Room Code:" + roomCode + " Share Code with Your friends to join"}
            </div>
            <div
              ref={chatBoxRef}
              className="w-6/6 h-[83%] p-3 overflow-y-auto scrollbar-hide scroll-smooth mt-2 rounded-lg border-2 m-5 border-neutral-700"
            >
              {messages.map((message, index) => {
                if (message.sender === name) {
                  return (
                    <div key={index} className="chat chat-end">
                      <div className="chat-header">{message.sender}</div>
                      <div className="chat-bubble">{message.text}</div>
                    </div>
                  );
                }
                return (
                  <div key={index} className="chat chat-start">
                    <div className="chat-header">{message.sender}</div>
                    <div className="chat-bubble">{message.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-between">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-9/12 px-2 py-1 bg-transparent border-2 border-neutral-700 text-lg rounded"
              type="text"
              placeholder="Type Your text..."
            />
            <button
              onClick={handleSend}
              className="bg-white w-2/12 rounded-lg text-black px-2 py-1"
            >
              SEND
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
