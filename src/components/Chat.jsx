



import React, { useState, useEffect, useRef, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { IoIosSend } from "react-icons/io";
import { MdDeleteOutline } from "react-icons/md";
import { AuthContext } from '../context/AuthContext';
import { createSocketConnection } from '../utils/socket';
import { BASE_URL } from "../constant";

const Chat = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [chatUser, setChatUser] = useState(null)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [chatId, setChatId] = useState(null)
  const [deletingMessageId, setDeletingMessageId] = useState(null)
  const [isDeletingChat, setIsDeletingChat] = useState(false)
  const messagesEndRef = useRef(null)
  const { user } = useContext(AuthContext)
  const socketRef = useRef(null);

  const userId = user?._id
  const senderId = userId

  // Create socket connection
  useEffect(() => {
    socketRef.current = createSocketConnection()
    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  // Join chat room
  useEffect(() => {
    if (!socketRef.current || !userId || !id) return;
    socketRef.current.emit("joinChat", { userId, targetUserId: id });
  }, [id, userId]);

  // Fetch chat user details
  useEffect(() => {
    const fetchChatUser = async () => {
      try {
        setIsLoading(true)
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/user/chat/${id}`,
          { withCredentials: true }
        )
        setChatUser(res.data)
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchChatUser()
    }
  }, [id])

  // Fetch chat messages
  useEffect(() => {
    const fetchMessages = async () => {

      try {
        console.log("Fetching messages for chat:", id);

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/chats/${id}`,
          { withCredentials: true }
        )

        const chatData = res.data

        if (chatData?._id) {
          setChatId(chatData._id)
        }

        const messages = chatData?.messages || []

        const chatMessages = messages.map((msg) => ({
          _id: msg._id,
          sender: msg.senderId,
          content: msg.text,
          timestamp: msg.createdAt,
          deletedBy: msg.deletedBy || []
        }))

        console.log("Messages fetched from backend:", chatMessages);
        setMessages(chatMessages)

      } catch (error) {
        console.error('Failed to fetch messages:', error.message)
      }
    }

    // if (id && userId) {
      fetchMessages()
    // }
  }, [id, userId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!inputMessage.trim() || !id) return

    if (!socketRef.current) return;

    socketRef.current.emit("sendMessage", {
      userId,
      targetUserId: id,
      senderId,
      text: inputMessage
    })

    setInputMessage('')
  }

  // Receive message from socket
  useEffect(() => {
    if (!socketRef.current) return;

    const handler = ({ userId, senderId, text, messageId, timestamp, deletedBy }) => {
      console.log("Message received via socket:", { userId, senderId, text, messageId });

      if (userId === senderId) return;

      setMessages((prev) => [
        ...prev,
        {
          _id: messageId,
          content: text,
          sender: senderId,
          timestamp: timestamp || new Date(),
          deletedBy: deletedBy || []
        },
      ]);
    };

    socketRef.current.on("messageReceived", handler);

    return () => {
      socketRef.current?.off("messageReceived", handler);
    };
  }, []);

  // Delete single message
  const handleDeleteMessage = async (messageId, messageSender) => {
    // if (!window.confirm("Delete this message?")) {
    //   return;
    // }

    if (!chatId) {
      console.error("Chat ID not found");
      alert("Error: Chat ID not found");
      return;
    }

    if (!messageId) {
      console.error("Message ID not found");
      alert("Error: Message ID not found");
      return;
    }

    try {
      setDeletingMessageId(messageId);
      console.log("Deleting message:", { chatId, messageId, messageSender });

      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/chats/${chatId}/message/${messageId}`,
        { withCredentials: true }
      );

      console.log("Delete response:", response.data);

      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      console.log("Message deleted successfully from frontend");

    } catch (error) {
      console.error("Error deleting message:", error);
      const errorMsg = error.response?.data?.message || error.message;
      alert("Failed to delete message: " + errorMsg);
    } finally {
      setDeletingMessageId(null);
    }
  }



  // const handleClearChat = async () => {
  //   if (!window.confirm("Clear chat history?")) {
  //     return;
  //   }
  
  //   if (!chatId) {
  //     alert("Error: Chat ID not found");
  //     return;
  //   }
  
  //   try {
  //     setIsDeletingChat(true);
  
  //     await axios.delete(
  //       `${import.meta.env.VITE_API_URL}/chats/${chatId}`,
  //       { withCredentials: true }
  //     );
  
  //     setMessages([]);
      
  //     // ✅ Reset the clearedAt locally to prevent showing old messages
  //     // Consider storing this timestamp in state for accurate filtering
      
  //     alert("Chat history cleared. You can still send new messages.");
  
  //   } catch (error) {
  //     console.error("Error clearing chat:", error);
  //     alert("Failed to clear chat: " + error.response?.data?.message);
  //   } finally {
  //     setIsDeletingChat(false);
  //   }
  // };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-lg text-gray-600">Loading chat...</div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col h-screen bg-red-100 bg-cover bg-center"
      // style={{
      //   backgroundImage:
      //     "url('https://storage.pixteller.com/designs/designs-images/2019-03-27/05/love-and-passion-background-backgrounds-romantic-1-5c9b9947439b9.png')",
      // }}
    >

      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm bg-[radial-gradient(circle,_#fff7ed,_#ffe4e6,_#fbcfe8)]">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 flex-1">
            {chatUser?.profilePicture ? (
              <img
                src={chatUser.profilePicture}
                alt={chatUser.firstname}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <img
                src={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuOzphTLwY88bzD9argr8JGAf1518mgVc7ig&s"}
                alt={chatUser?.firstname}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {chatUser?.firstname + " " + chatUser?.lastname || 'Chat'}
              </h2>
            </div>
          </div>

          {/* Clear Chat Button */}
          {/* <button
            onClick={handleClearChat}
            disabled={isDeletingChat}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm disabled:bg-red-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
          >
            <MdDeleteOutline size={18} />
            {isDeletingChat ? "Clearing..." : "Clear Chat"}
          </button> */}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-base">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isCurrentUser = message.sender === userId;

            return (
              <div
                key={message._id || index}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm relative ${
                    isCurrentUser
                      ? 'bg-green-500 text-white rounded-br-none'
                      : 'bg-white text-gray-900 rounded-bl-none border'
                  }`}
                >
                  <p className="text-sm break-words">{message.content}</p>

                  <div className="flex justify-between items-center mt-1 gap-2">
                    <span className="text-[10px] opacity-70">
                      {formatTime(message.timestamp)}
                    </span>

                    {/* Delete Message Button */}
                    <button
                      onClick={() => handleDeleteMessage(message._id, message.sender)}
                      disabled={deletingMessageId === message._id}
                      className="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-red-600 rounded transition-all duration-200 disabled:opacity-50"
                      title="Delete message"
                    >
                      <MdDeleteOutline
                        size={14}
                        className={deletingMessageId === message._id ? 'animate-spin' : ''}
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 bg-[radial-gradient(circle,_#fff7ed,_#ffe4e6,_#fbcfe8)]">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={!chatUser}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || !chatUser}
            className="px-6 py-2 bg-blue-500 text-white rounded-full font-semibold text-sm hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <IoIosSend />
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chat;

