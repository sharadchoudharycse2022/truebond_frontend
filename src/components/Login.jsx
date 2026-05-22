import axios from "axios";
import React, { useContext } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { BASE_URL } from "../constant";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error,setError]=useState("")
  const { setUser } = useContext(AuthContext);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const UserData = {
      email: email,
      password: password,
    };

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, UserData, {
        withCredentials: true,
      });

    

      setUser(res.data);

      if (res.status == 200) {
        return navigate("/");
      }
    } catch (err) {
      console.log(err);
      if (err.response?.status === 401) {
        setError("Invalid credentials");
      } else {
        setError("Something went wrong");
      }
    }
  }

  return (
    <div className=" flex items-center h-screen w-screen justify-center  bg-[radial-gradient(circle,_#fff7ed,_#ffe4e6,_#fbcfe8)]">
      <div className="flex flex-col justify-between h-[350px] w-[500px] rounded-xl   bg-[radial-gradient(circle,_#fff7ed,_#ffe4e6,_#fbcfe8)]">
        <div className="p-7">
          <form
            onSubmit={(e) => handleSubmit(e)}
            className="flex  flex-col  bg-[radial-gradient(circle,_#fff7ed,_#ffe4e6,_#fbcfe8)]"
          >
            <h2 className="text-2xl mb-3  text-center ">Login to TrueBond❤️</h2>

            <label className="block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="Enter your Email"
              className="bg-[#eeeeee] font-bold text-red-900 w-full px-5 py-2 mt-2 rounded "
            />

            <label className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter Your Password"
              className="bg-[#eeeeee] text-red-900 font-bold w-full px-5 py-2 mt-2 rounded "
            />

            <button
              type="submit"
              className="text-white bg-gray-700 font-semibold text-xl py-2 mt-3 rounded "
            >
              Login
            </button>
          </form>

         {error && <p className="text-red-600 text-center pt-2 text-lg">{error}</p>}

          <p className="text-xl text-gray-600 text-center mt-5">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-black font-semibold hover:underline hover:text-gray-800"
            >
              Register Yourself
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
