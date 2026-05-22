import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user } = useContext(AuthContext);

  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        First Authenticate yourself.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 bg-[radial-gradient(circle,_#fff7ed,_#ffe4e6,_#fbcfe8)]">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden bg-[radial-gradient(circle,_#fff7ed,_#ffe4e6,_#fbcfe8)]">
        {/* Top Section */}
        <div className="bg-pink-500 p-6 flex items-center gap-6">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="profile"
              className="h-24 w-24 rounded-full object-cover border-4 border-white"
            />
          ) : (
            <div
              className="h-24 w-24 rounded-full bg-green-300 flex items-center justify-center
               text-4xl font-bold text-black"
            >
              {user.firstname?.charAt(0)}
            </div>
          )}

          <div className="text-white">
            <h2 className="text-2xl font-bold">
              {user.firstname} {user.lastname}
            </h2>
            <p className="opacity-90">{user.email}</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[radial-gradient(circle,_#fff7ed,_#ffe4e6,_#fbcfe8)]">
          <ProfileItem label="First Name" value={user.firstname} />
          <ProfileItem label="Last Name" value={user.lastname} />
          <ProfileItem label="Email" value={user.email} />
          <ProfileItem label="Gender" value={user.gender} />
          <ProfileItem label="Age" value={user.age} />

          {/* About */}
          <div className="md:col-span-2 bg-[radial-gradient(circle,_#fff7ed,_#ffe4e6,_#fbcfe8)]">
            <p className="text-sm text-gray-500 mb-1">About</p>
            <div className="bg-gray-50 p-4 rounded-lg text-gray-700 bg-[radial-gradient(circle,_#fff7ed,_#ffe4e6,_#fbcfe8)]">
              {user.about || "No bio added yet."}
            </div>
          </div>

          {/* Skills */}
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500 mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {user.skills?.length > 0 ? (
                user.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-gray-400">No skills added</span>
              )}
            </div>
          </div>

          {/* Profile Picture URL */}
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500 mb-1">Profile Picture </p>
            <div className="bg-gray-50 p-3 rounded-lg text-gray-700 break-all bg-[radial-gradient(circle,_#fff7ed,_#ffe4e6,_#fbcfe8)]">
              {user.profilePicture || "No profile picture set"}
            </div>
          </div>

          {/* Images  */}
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500 mb-2">Photos</p>

            {user.images && user.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {user.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt="user"
                    className=" h-full object-cover rounded-lg shadow"
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No images uploaded</p>
            )}
          </div>
        </div>

        {/* Button */}
        <div className="p-6 border-t">
          <button
            onClick={() => navigate("/updateProfile")}
            className="bg-green-500 text-white px-6 w-full py-2 rounded-lg
                       hover:bg-green-600 transition"
          >
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileItem = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium text-gray-800">{value || "—"}</p>
  </div>
);

export default Profile;


