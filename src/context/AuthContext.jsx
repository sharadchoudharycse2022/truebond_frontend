import { createContext, useEffect, useState } from "react";
import axios from "axios"

export  const AuthContext=createContext();


export const AuthProvider = ({children})=>{

    const [user,setUser]=useState(null)
    const [loading, setLoading] = useState(true)


      // Fetch user on mount
    useEffect(() => {
        const fetchUser = async () => {
          try {
            const res = await axios.get(
              `${import.meta.env.VITE_API_URL}/profile/view`,
              { withCredentials: true }
            )
            setUser(res.data)
          } catch (error) {
            console.error("Failed to fetch user:", error)
            setUser(null)
          } finally {
            setLoading(false)
          }
        }
    
        fetchUser()
      }, [])

    return (
        <AuthContext.Provider value={{user,setUser,loading}}>
            {children}
        </AuthContext.Provider>
    )

}






