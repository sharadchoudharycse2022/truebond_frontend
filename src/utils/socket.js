// import { io } from "socket.io-client"
// import { BASE_URL } from "../constant";

// export const createSocketConnection =()=>{

//     return io(`${import.meta.env.VITE_API_URL}`)
// }


import { io } from "socket.io-client"

export const createSocketConnection = () => {
  const socket = io(`${import.meta.env.VITE_API_URL}`, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling']
  })

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id)
  })

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error)
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected')
  })

  return socket
}
