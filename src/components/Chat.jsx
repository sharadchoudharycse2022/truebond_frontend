



import React, { useState, useEffect, useRef, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { IoIosSend } from "react-icons/io";
import { MdDeleteOutline } from "react-icons/md";
import { AiOutlinePaperClip } from "react-icons/ai"
import { GrClose } from "react-icons/gr"
import { AuthContext } from '../context/AuthContext';
import { createSocketConnection } from '../utils/socket';
import MessageItem from './MessageItem'
import UserStatusIndicator from './UserStatusIndicator'
import TypingIndicator from './TypingIndicator'


const Chat = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [chatUser, setChatUser] = useState(null)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [chatId, setChatId] = useState(null)
  const [deletingMessageId, setDeletingMessageId] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [recipientTyping, setRecipientTyping] = useState(false)
  const [userStatus, setUserStatus] = useState({ isOnline: false, lastSeen: null })
  const [uploadingMedia, setUploadingMedia] = useState(false)
  // const [isDeletingChat, setIsDeletingChat] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const pollIntervalRef = useRef(null)
  const { user } = useContext(AuthContext)
  const socketRef = useRef(null);

  const userId = user?._id
  // const senderId = userId

  // Create socket connection
  useEffect(() => {
    socketRef.current = createSocketConnection()

    if (socketRef.current && userId) {
      socketRef.current.emit("register-user", userId)
    }


    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
      socketRef.current?.disconnect()
    }
  }, [userId])

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
 
    const fetchMessages = async () => {

      try {
        // console.log("Fetching messages for chat:", id);

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
          deletedBy: msg.deletedBy || [],
          isRead: msg.isRead || false,
          messageType: msg.messageType || 'text',
          mediaFiles: msg.mediaFiles || []
        }))

        // console.log("Messages fetched from backend:", chatMessages);
        setMessages(chatMessages)

      } catch (error) {
        console.error('Failed to fetch messages:', error.message)
      }
    }
    
   // Fetch messages on mount
    useEffect(() => {
      if (!id) return
      fetchMessages()
    }, [id])

    // Poll for new messages every 1 second
  useEffect(() => {
    if (!id) return

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
    }

    pollIntervalRef.current = setInterval(() => {
      fetchMessages()
    }, 1000)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }

  })
   
   // Fetch user status
   useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/chats/status/${id}`,
          { withCredentials: true }
        )
        setUserStatus({
          isOnline: res.data.isOnline,
          lastSeen: res.data.lastSeen
        })
      } catch (error) {
        console.error('Failed to fetch user status:', error)
      }
    }

    if (id) {
      fetchUserStatus()
      const interval = setInterval(fetchUserStatus, 5000)
      return () => clearInterval(interval)
    }
  }, [id])

    // Listen to user status changes via socket
    useEffect(() => {
      if (!socketRef.current) return
  
      const handleStatusChange = (data) => {
        if (data.userId === id) {
          setUserStatus({
            isOnline: data.isOnline,
            lastSeen: data.lastSeen
          })
        }
      }
  
      socketRef.current.on("user:status:changed", handleStatusChange)
  
      return () => {
        socketRef.current?.off("user:status:changed", handleStatusChange)
      }
    }, [id])


      // Listen to typing indicator
  useEffect(() => {
    if (!socketRef.current) return

    const handleTypingStatus = (data) => {
      if (data.userId === id) {
        setRecipientTyping(data.isTyping)
      }
    }

    socketRef.current.on("user:typing:status", handleTypingStatus)

    return () => {
      socketRef.current?.off("user:typing:status", handleTypingStatus)
    }
  }, [id])


  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle typing with debounce
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      socketRef.current?.emit("user:typing", {
        userId,
        targetUserId: id,
        isTyping: true
      })
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      socketRef.current?.emit("user:typing", {
        userId,
        targetUserId: id,
        isTyping: false
      })
    }, 3000)
  }


  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!inputMessage.trim() && selectedFiles.length === 0) return
    if (!id) return

    // if (!socketRef.current) return;
    
    try {
      if (selectedFiles.length > 0) {
        // Send media message
        const formData = new FormData()
        selectedFiles.forEach(file => {
          formData.append('files', file)
        })
        if (inputMessage.trim()) {
          formData.append('text', inputMessage)
        }

        setUploadingMedia(true)
        await axios.post(
          `${import.meta.env.VITE_API_URL}/chats/${id}/media`,
          formData,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        )

        setSelectedFiles([])
        setUploadingMedia(false)
      } else if (inputMessage.trim()) {
        // Send text message
        await axios.post(
          `${import.meta.env.VITE_API_URL}/chats/${id}/text`,
          { text: inputMessage },
          { withCredentials: true }
        )
      }

      setInputMessage('')
      setIsTyping(false)
      socketRef.current?.emit("user:typing", {
        userId,
        targetUserId: id,
        isTyping: false
      })

      // Refresh messages immediately after sending
      await fetchMessages()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
      setUploadingMedia(false)
    }
    
  }

  // Receive message from socket

  // useEffect(() => {
  //   if (!socketRef.current) return;

  //   const handler = ({ userId, senderId, text, messageId, timestamp, deletedBy }) => {
  //     console.log("Message received via socket:", { userId, senderId, text, messageId });

  //     if (userId === senderId) return;

  //     setMessages((prev) => [
  //       ...prev,
  //       {
  //         _id: messageId,
  //         content: text,
  //         sender: senderId,
  //         timestamp: timestamp || new Date(),
  //         deletedBy: deletedBy || []
  //       },
  //     ]);
  //   };

  //   socketRef.current.on("messageReceived", handler);

  //   return () => {
  //     socketRef.current?.off("messageReceived", handler);
  //   };
  // }, []);

  // Delete single message
  const handleDeleteMessage = async (messageId) => {
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
      // console.log("Deleting message:", { chatId, messageId, messageSender });

      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/chats/${chatId}/message/${messageId}`,
        { withCredentials: true }
      );

      // console.log("Delete response:", response.data);

      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      console.log("Message deleted successfully ");

    } catch (error) {
      console.error("Error deleting message:", error);
      const errorMsg = error.response?.data?.message || error.message;
      // alert("Failed to delete message: " + errorMsg);
    } finally {
      setDeletingMessageId(null);
    }
  }
  

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(prev => [...prev, ...files])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
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


  const formatLastSeen = (date) => {
    if (!date) return null
    const now = new Date()
    const lastSeen = new Date(date)
    const diffMs = now - lastSeen
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return lastSeen.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-lg text-gray-600">Loading chat...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-red-100">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 p-4">
          {chatUser?.profilePicture ? (
            <img
              src={chatUser.profilePicture}
              alt={chatUser.firstname}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuOzphTLwY88bzD9argr8JGAf1518mgVc7ig&s"
              alt={chatUser?.firstname}
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold">
              {chatUser?.firstname + " " + chatUser?.lastname || 'Chat'}
            </h2>
            <UserStatusIndicator
              isOnline={userStatus.isOnline}
              lastSeen={userStatus.lastSeen}
              formatLastSeen={formatLastSeen}
            />
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender === userId

            return (
              <MessageItem
                key={message._id}
                message={message}
                isCurrentUser={isCurrentUser}
                formatTime={formatTime}
                onDelete={() => handleDeleteMessage(message._id)}
                isDeleting={deletingMessageId === message._id}
              />
            )
          })
        )}

        {recipientTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-3 p-2 bg-gray-100 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Selected Files ({selectedFiles.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white p-2 rounded border border-gray-300"
                >
                  <span className="text-xs text-gray-600 truncate max-w-xs">
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-red-100 rounded"
                    type="button"
                  >
                    <GrClose size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingMedia}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            title="Attach media"
          >
            <AiOutlinePaperClip size={20} />
          </button>

          <input
            type="text"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value)
              handleTyping()
            }}
            disabled={!chatUser || uploadingMedia}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={(!inputMessage.trim() && selectedFiles.length === 0) || !chatUser || uploadingMedia}
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-400"
          >
            {uploadingMedia ? <span className="animate-spin">⏳</span> : <IoIosSend />}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chat;






