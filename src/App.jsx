import { Route, Routes } from "react-router-dom"
import Login from "./components/Login"
import { Register } from "./components/Register"
import Header from "./components/Header"
import Profile from "./components/Profile"
import UpdateProfile from "./components/UpdateProfile"
import ChangePassword from "./components/ChangePassword"
import Requests from "./components/Requests"
import Connections from "./components/Connections"
import Chat from "./components/Chat"
import Feed from "./components/Feed"
// import VideoCall from "./components/VideoCall"
// import IncomingCallPopup from "./components/IncomingCallPopup"




function App() {

  return (
    <>

       {/* <IncomingCallPopup /> */}
     <Routes>


    <Route  element={<Header/>}> 
        <Route path="/" element={<Feed/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/updateProfile" element={<UpdateProfile/>}/>
        <Route path="/friends" element={<Connections/>}/>
           <Route path="/requests" element={<Requests/>}/>

     </Route>
      
      <Route path="/security" element={<ChangePassword/>}/>
     
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
      <Route path="/chat/:id" element={<Chat/>} />
      {/* <Route path="/call" element={<VideoCall />} /> */}


     </Routes>
    
    </>
  )
}

export default App
