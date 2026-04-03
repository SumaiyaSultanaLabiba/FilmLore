import React, { useState, useEffect } from "react";
import "chart.js/auto";
import "./AdminDashboardPage.css";
import axios from 'axios';


const UserDashboardPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPhotoLink, setNewPhotoLink] = useState("");

  // Parse user from localStorage
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : {};
  

  // Fetch my blogs
  const [myBlogs, setMyBlogs] = useState([]);
  useEffect(() => {
    const fetchMyBlogs = async () => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/getMyBlogs`, {UserName: currentUser.username});
        setMyBlogs(res.data.myBlogs);
      } catch (err) {
        console.log('Failed to load my blogs.');
      }
    };
    fetchMyBlogs();
  }, []);


  // Fetch my comments
  const [myComments, setMyComments] = useState([]);
  useEffect(() => {
    const fetchMyComments = async () => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/getMyComments`, {UserName: currentUser.username});
        setMyComments(res.data.comments);
      } catch (err) {
        console.log('Failed to load my comments.');
      }
    };
    fetchMyComments();
  }, []);

 
  const [userInfo, setUserInfo] = useState({
    fullName: currentUser.fullname || "",
    username: currentUser.username || "",
    email: currentUser.email || "",
    dob: currentUser.dateofbirth || "",
    profilePic: currentUser.profilepicture || "",
  });

  // Track which field is being edited
  const [editingField, setEditingField] = useState(null);

  const handleChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const toggleEdit = async (field) => {
  if (editingField === field) {
    setEditingField(null);

    const updateLocalStorage = (updatedFields, token) => {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      const merged = { ...stored, ...updatedFields };
      localStorage.setItem("user", JSON.stringify(merged));
      if (token) localStorage.setItem("token", token); // update token too
    };

    if (field === "fullName") {
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/editFullname`, {
          UserName: userInfo.username,
          FullName: userInfo.fullName
        });
        updateLocalStorage({ fullname: userInfo.fullName }, res.data.token);
      } catch (err) {
        alert('Action failed. Please try again.');
      }
    }

    if (field === "email") {
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/editEmail`, {
          UserName: userInfo.username,
          Email: userInfo.email
        });
        updateLocalStorage({ email: userInfo.email }, res.data.token);
      } catch (err) {
        alert('Action failed. Please try again.');
      }
    }

    if (field === "dob") {
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/editDOB`, {
          UserName: userInfo.username,
          DateOfBirth: userInfo.dob
        });
        updateLocalStorage({ dateofbirth: userInfo.dob }, res.data.token);
      } catch (err) {
        alert('Action failed. Please try again.');
      }
    }

  } else {
    setEditingField(field);
  }
};



  return (
    <div className="dashboard-container">
      {/* Top Section */}
      <h1 className="console-title">FILMLORE · USER CONSOLE</h1>
      <h2 className="welcome-text">WELCOME BACK<br />{userInfo.username}</h2>

      <div className="profile-card">
        <div className="profile-pic-container">
          <img
            src={userInfo.profilePic}
            alt="Profile"
            className="profile-pic"
          />
          <button className="edit-btn" onClick={() => setIsDialogOpen(true)}>
          Change Photo
          </button>

        </div>

        <div className="profile-info">
          <h3 className="section-title">PROFILE INFORMATION</h3>

          {/* Full Name */}
          <div className="info-field">
            <label>Full Name</label>
            {editingField === "fullName" ? (
              <input
                type="text"
                name="fullName"
                value={userInfo.fullName}
                onChange={handleChange}
              />
            ) : (
              <span className="info-value">{userInfo.fullName}</span>
            )}
            <button
              className="edit-btn"
              onClick={() => toggleEdit("fullName")}
            >
              {editingField === "fullName" ? "Save" : "Edit"}
            </button>
          </div>


          {/* Email */}
          <div className="info-field">
            <label>Email</label>
            {editingField === "email" ? (
              <input
                type="email"
                name="email"
                value={userInfo.email}
                onChange={handleChange}
              />
            ) : (
              <span className="info-value">{userInfo.email}</span>
            )}
            <button
              className="edit-btn"
              onClick={() => toggleEdit("email")}
            >
              {editingField === "email" ? "Save" : "Edit"}
            </button>
          </div>

          {/* Date of Birth */}
          <div className="info-field">
            <label>Date of Birth</label>
            {editingField === "dob" ? (
              <input
                type="date"
                name="dob"
                value={userInfo.dob}
                onChange={handleChange}
              />
            ) : (
              <span className="info-value">{new Date(userInfo.dob).toLocaleDateString()}</span>
            )}
            <button
              className="edit-btn"
              onClick={() => toggleEdit("dob")}
            >
              {editingField === "dob" ? "Save" : "Edit"}
            </button>
          </div>
        </div>
      </div>


        {isDialogOpen && (
          <div className="dialog-overlay">
            <div className="dialog-box">
              <h3>Update Profile Picture</h3>
              <input
                type="text"
                placeholder="Enter new photo URL"
                value={newPhotoLink}
                onChange={(e) => setNewPhotoLink(e.target.value)}
              />
              <div className="dialog-actions">
                <button
                  onClick={async() => {
                    setUserInfo({ ...userInfo, profilePic: newPhotoLink });
                    setIsDialogOpen(false);
                    try {
                    await axios.post(`${import.meta.env.VITE_API_URL}/api/user/editProfilePicture`, {
                    UserName: userInfo.username,
                    ProfilePicture: newPhotoLink,
                    });
                    } catch (error) {
                      console.log("Action failed!!", error)
                    }
                  }}
                >
                  Save
                </button>
                <button onClick={() => setIsDialogOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

{/* My Blogs */}
<div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-900 text-white px-6 py-10">
  <h1 className="text-4xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 drop-shadow-lg">
All the Blogs you Posted
</h1>

  {myBlogs.length === 0 ? (
    <p className="text-center text-zinc-400">No blogs found.</p>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {myBlogs.map((blog) => (
        <div
          key={blog.blogid}
          className="relative bg-zinc-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl hover:shadow-purple-500/40 transition duration-300 group"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r  from-purple-700/20 via-pink-600/10 to-indigo-700/20 opacity-0 group-hover:opacity-100 blur-xl transition"></div>

          {/* Blog Content */}
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-3 text-purple-300 group-hover:text-pink-400 transition">
              {blog.title}
            </h2>
            <p className="text-zinc-300 text-2xl leading-relaxed line-clamp-4">
              {blog.content}
            </p>
            <p className="mt-4 text-xl text-white-500 italic">
              Posted on {new Date(blog.createdate).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  )}
</div>



{/* My Comments */}
<div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-900 text-white px-6 py-10">
  <h1 className="text-4xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 drop-shadow-lg">
All of your comments
</h1>

  {myComments.length === 0 ? (
    <p className="text-center text-zinc-400">No Comments found.</p>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {myComments.map((comment) => (
        <div
          key={comment.commentid}
          className="relative bg-zinc-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl hover:shadow-purple-500/40 transition duration-300 group"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r  from-purple-700/20 via-pink-600/10 to-indigo-700/20 opacity-0 group-hover:opacity-100 blur-xl transition"></div>

          {/* Blog Content */}
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-3 text-blue-500 group-hover:text-pink-400 transition">
              Blog Title: {comment.title}
            </h2>
            <p className="text-green-500 text-2xl leading-relaxed line-clamp-4">
              Blog Content: {comment.content}
            </p>
            <p className="text-red-500 text-2xl leading-relaxed line-clamp-4">
              My Comment: {comment.commenttext}
            </p>
            <p className="mt-4 text-xl text-white-500 italic">
              Posted on {new Date(comment.commentdate).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

    </div>
  );
};

export default UserDashboardPage;
