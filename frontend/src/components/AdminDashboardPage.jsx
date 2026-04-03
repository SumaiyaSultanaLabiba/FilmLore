import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import "./AdminDashboardPage.css";
import "./MoviesPage.css";
import axios from 'axios';
import { Film, Bookmark } from 'lucide-react';



const AdminDashboardPage = () => {
// Parse user from localStorage
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : {};
  

  // Fetch all approvedMedia
  const [approvedMedia, setApprovedMedia] = useState([]);
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await axios.post('http://localhost:5004/api/submission/approvedMedia', {UserName: currentUser.username});
        setApprovedMedia(res.data.media);
      } catch (err) {
        console.log('Failed to load approved Media.');
      }
    };
    fetchMedia();
  }, []);



 // Fetch all rejectedMedia
  const [rejectedMedia, setRejectedMedia] = useState([]);
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await axios.post('http://localhost:5004/api/submission/rejectedMedia', {UserName: currentUser.username});
        setRejectedMedia(res.data.media);
      } catch (err) {
        console.log('Failed to load rejected Media.');
      }
    };
    fetchMedia();
  }, []);



  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPhotoLink, setNewPhotoLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [movie, setmovie] = useState(0);
  const [series, setseries] = useState(0);
  const [actor, setactor] = useState(0);
  const [director, setdirector] = useState(0);
  const [genre, setgenre] = useState(0);
  const [users, setusers] = useState(0);
  const [studio, setstudio] = useState(0);
  const [blog, setblog] = useState(0);


  const [showMovieForm, setShowMovieForm] = useState(false);
  const [showSeriesForm, setShowSeriesForm] = useState(false);
  
  // Movie form data state
  const [moviedata, setmoviedata] = useState({
    Title: '',
    Overview: '',
    Poster: '',
    Language: '',
    Rating: '',
    Trailer: '',
    ReleaseYear: '',
    Country: '',
    Type: '',
    Duration: ''
  });

  // Series form data state
  const [seriesdata, setseriesdata] = useState({
    Title: '',
    Overview: '',
    Poster: '',
    Language: '',
    Rating: '',
    Trailer: '',
    ReleaseYear: '',
    Country: '',
    Type: '',
    IsOnGoing: ''
  });
  
  // Handle input changes
const handleMovie = (e) => {
  const { name, value } = e.target;
  setmoviedata((prev) => ({
    ...prev,
    [name]: value
  }));
};

// Handle input changes
const handleSeries = (e) => {
  const { name, value } = e.target;
  setseriesdata((prev) => ({
    ...prev,
    [name]: value
  }));
};

  const handleMovieSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setSuccess("");

  const movieData = { ...moviedata, Title: moviedata.Title.trim(), Type: 'Movie' };

  try {
    await axios.post(`http://localhost:5004/api/submission/addMovie`, movieData);
    setSuccess("New movie added!");
    setmoviedata({
      Title: '',
      Overview: '',
      Poster: '',
      Language: '',
      Rating: '',
      Trailer: '',
      ReleaseYear: '',
      Country: '',
      Type: '',
      Duration: ''
    });
  } catch (err) {
  console.log("New movie addition failed:", err);
  setError(err.response?.data?.error || "Action failed. Try again.");
}
  finally {
    setLoading(false);
    setShowMovieForm(false);
  }
};



const handleSeriesSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setSuccess("");

  const seriesData = { ...seriesdata, Title: seriesdata.Title.trim(), Type: 'Series' };

  try {
    await axios.post(`http://localhost:5004/api/submission/addSeries`, seriesData);
    setSuccess("New series added!");
    setseriesdata({
      Title: '',
      Overview: '',
      Poster: '',
      Language: '',
      Rating: '',
      Trailer: '',
      ReleaseYear: '',
      Country: '',
      Type: '',
      IsOnGoing: ''
    });
  } catch (err) {
  console.log("New series addition failed:", err);
  setError(err.response?.data?.error || "Action failed. Try again.");
}
  finally {
    setLoading(false);
    setShowSeriesForm(false);
  }
};

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
        const res = await axios.post('http://localhost:5004/api/user/editFullname', {
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
        const res = await axios.post('http://localhost:5004/api/user/editEmail', {
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
        const res = await axios.post('http://localhost:5004/api/user/editDOB', {
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

  // 
  useEffect(() => {
    const getStatistics = async () => {
      try {
        const res = await axios.get('http://localhost:5004/api/user/getStatistics');
        setmovie(Number(res.data.movie));
        setseries(Number(res.data.series));
        setactor(Number(res.data.actor));
        setdirector(Number(res.data.director));
        setgenre(Number(res.data.genre));
        setusers(Number(res.data.users));
        setstudio(Number(res.data.studio));
        setblog(Number(res.data.blog));
      } catch (err) {
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    getStatistics();
  }, []);


  // Stats data
    const stats = {
      Movies: movie,
      Series: series,
      Actors: actor,
      Directors: director,
      Genres: genre,
      Users: users,
      Companies: studio,
      Blogs: blog,
    };

  const totalEntries = Object.values(stats).reduce((a, b) => a + b, 0);

  const chartData = {
    labels: Object.keys(stats),
    datasets: [
      {
        data: Object.values(stats),
        backgroundColor: [
          "#fcc200", // Movies
          "#00ffff", // Series
          "#9370DB", // Actors
          "#9932CC", // Directors
          "#7fffd4", // Genres
          "#39ff14", // Users
          "#7fffd4", // Companies
          "#FFFFFF", // Blogs
        ],
        borderColor: "#111",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      {/* Top Section */}
      <h1 className="console-title">FILMLORE · ADMIN CONSOLE</h1>
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
                    await axios.post("http://localhost:5004/api/user/editProfilePicture", {
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



      {/* Bottom Section */}
      <div className="stats-container">
        <h2 className="stats-title">Platform Overview: Content Statistics</h2>

        <div className="stats-grid">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="stat-item">
              <span className="stat-label">{key}</span>
              <span className="stat-value">{value}</span>
            </div>
          ))}
        </div>

        <div className="chart-wrapper">
          <Doughnut
            data={chartData}
            options={{
              plugins: {
                legend: {
                  position: "bottom",
                  labels: { color: "#e0e0ff" },
                },
                tooltip: {
                  callbacks: {
                    label: (context) =>
                      `${context.label}: ${context.raw.toLocaleString()}`,
                  },
                },
              },
            }}
          />
          <div className="chart-center">
            <p>Total</p>
            <h3>{totalEntries.toLocaleString()} Entries</h3>
          </div>
        </div>
      </div>


{/*adding a new movie */}
     <section className="text-center my-8">
  {/* Toggle button */}
  <button
    className="py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
    onClick={() => setShowMovieForm(!showMovieForm)}
  >
    Add a new movie
  </button>

  {/* Submission form card */}
  {showMovieForm && (
    <div className="mt-6 max-w-xl mx-auto">
      <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 shadow-2xl shadow-purple-500/10">
        <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
          <Film className="w-6 h-6 text-purple-400" />
          Add a New Movie
        </h2>

        <form onSubmit={handleMovieSubmit} className="space-y-6">
          {/* Title */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-zinc-300 mb-2">Title</label>
            <input
              name="Title"
              type="text"
              placeholder="Enter movie title"
              value={moviedata.Title}
              onChange={handleMovie}
              required
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Overview */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-zinc-300 mb-2">Overview</label>
            <textarea
              name="Overview"
              rows="3"
              placeholder="Brief description..."
              value={moviedata.Overview}
              onChange={handleMovie}
              required
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Release Year */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-zinc-300 mb-2">Release Year</label>
            <input
              name="ReleaseYear"
              type="number"
              placeholder="e.g. 2025"
              value={moviedata.ReleaseYear}
              onChange={handleMovie}
              required
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Poster URL */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-zinc-300 mb-2">Poster URL</label>
            <input
              name="Poster"
              type="url"
              placeholder="https://example.com/poster.jpg"
              value={moviedata.Poster}
              onChange={handleMovie}
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Trailer URL */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-zinc-300 mb-2">Trailer URL</label>
            <input
              name="Trailer"
              type="url"
              placeholder="https://youtube.com/..."
              value={moviedata.Trailer}
              onChange={handleMovie}
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Language */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-zinc-300 mb-2">Language</label>
            <input
              name="Language"
              type="text"
              placeholder="The main language used in this movie"
              value={moviedata.Language}
              onChange={handleMovie}
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Country*/}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-zinc-300 mb-2">Country</label>
            <input
              name="Country"
              type="text"
              placeholder="The geographical location"
              value={moviedata.Country}
              onChange={handleMovie}
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Duration */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-zinc-300 mb-2">Duration</label>
            <input
              name="Duration"
              type="number"
              placeholder="Enter in minute unit"
              value={moviedata.Duration}
              onChange={handleMovie}
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Suggested Rating */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-zinc-300 mb-2">Suggested Rating</label>
            <input
              name="Rating"
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="e.g. 8.5"
              value={moviedata.Rating}
              onChange={handleMovie}
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
          >
            {loading ? "Adding..." : "Add this movie"}
          </button>
        </form>

        {/* Feedback */}
        <h1 className="text-lg font-semibold bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent mt-4">
          {error && <p>{error}</p>}
          {success && <p>New movie added!</p>}
        </h1>
      </div>
    </div>
  )}
    </section>


    {/*adding a new series */}
     <section className="text-center my-8">
  {/* Toggle button */}
  <button
    className="py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
    onClick={() => setShowSeriesForm(!showSeriesForm)}
  >
    Add a new series
  </button>

  {/* Submission form card */}
  {showSeriesForm && (
    <div className="mt-6 max-w-xl mx-auto">
      <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 shadow-2xl shadow-purple-500/10">
        <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
          <Film className="w-6 h-6 text-purple-400" />
          Add a New Series
        </h2>

        <form onSubmit={handleSeriesSubmit} className="space-y-6">
          {/* Title */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-zinc-300 mb-2">Title</label>
            <input
              name="Title"
              type="text"
              placeholder="Enter series title"
              value={seriesdata.Title}
              onChange={handleSeries}
              required
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Overview */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-zinc-300 mb-2">Overview</label>
            <textarea
              name="Overview"
              rows="3"
              placeholder="Brief description..."
              value={seriesdata.Overview}
              onChange={handleSeries}
              required
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Release Year */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-zinc-300 mb-2">Release Year</label>
            <input
              name="ReleaseYear"
              type="number"
              placeholder="e.g. 2025"
              value={seriesdata.ReleaseYear}
              onChange={handleSeries}
              required
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Poster URL */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-zinc-300 mb-2">Poster URL</label>
            <input
              name="Poster"
              type="url"
              placeholder="https://example.com/poster.jpg"
              value={seriesdata.Poster}
              onChange={handleSeries}
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Trailer URL */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-zinc-300 mb-2">Trailer URL</label>
            <input
              name="Trailer"
              type="url"
              placeholder="https://youtube.com/..."
              value={seriesdata.Trailer}
              onChange={handleSeries}
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Language */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-zinc-300 mb-2">Language</label>
            <input
              name="Language"
              type="text"
              placeholder="The main language used in this movie"
              value={seriesdata.Language}
              onChange={handleSeries}
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Country*/}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-zinc-300 mb-2">Country</label>
            <input
              name="Country"
              type="text"
              placeholder="The geographical location"
              value={seriesdata.Country}
              onChange={handleSeries}
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* IsOnGoing */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-zinc-300 mb-2">Is it ongoing</label>
            <input
              name="IsOnGoing"
              type="text"
              placeholder="Enter Yes/No"
              value={seriesdata.IsOnGoing}
              onChange={handleSeries}
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Suggested Rating */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-zinc-300 mb-2">Suggested Rating</label>
            <input
              name="Rating"
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="e.g. 8.5"
              value={seriesdata.Rating}
              onChange={handleSeries}
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
          >
            {loading ? "Adding..." : "Add this series"}
          </button>
        </form>

        {/* Feedback */}
        <h1 className="text-lg font-semibold bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent mt-4">
          {error && <p>{error}</p>}
          {success && <p>New series added!</p>}
        </h1>
      </div>
    </div>
  )}
    </section>

{/*Approved movies or series */}
<div className="min-h-screen bg-zinc-950 text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-purple-400 mb-8 text-center">Approved Movies/Series by You</h1>

      {approvedMedia.length === 0 ? (
        <p className="text-center text-zinc-400">No approved media.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {approvedMedia.map((sub) => (
            <div
              key={sub.submissionid}
              className="bg-zinc-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl flex gap-4"
            >
              {/* Poster */}
              <div className="flex-shrink-0 w-24 h-36 rounded-lg overflow-hidden bg-zinc-800">
                {sub.poster ? (
                  <img src={sub.poster} alt={sub.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {sub.type === 'movie' ? <Film size={32} className="text-zinc-500" /> : <Tv size={32} className="text-zinc-500" />}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold text-white">{sub.title}</h2>
                    <span className="text-xs bg-purple-700/50 text-purple-300 px-2 py-1 rounded-full capitalize">{sub.type}</span>
                  </div>
                  <p className="text-zinc-400 text-sm mb-2 line-clamp-2">{sub.overview}</p>

                  <div className="text-xs text-zinc-400 space-y-1">
                    <p><span className="text-zinc-300 font-medium">Submitted by:</span> {sub.username}</p>
                    <p><span className="text-zinc-300 font-medium">Year:</span> {sub.releaseyear}</p>
                    <p><span className="text-zinc-300 font-medium">Language:</span> {sub.language}</p>
                    <p><span className="text-zinc-300 font-medium">Country:</span> {sub.country}</p>
                    <p><span className="text-zinc-300 font-medium">Rating:</span> {sub.rating ?? 'N/A'}</p>
                    {sub.type === 'movie' && <p><span className="text-zinc-300 font-medium">Duration:</span> {sub.duration ? `${sub.duration} min` : 'N/A'}</p>}
                    {sub.type === 'series' && <p><span className="text-zinc-300 font-medium">Ongoing:</span> {sub.isongoing ? 'Yes' : 'No'}</p>}
                    {sub.trailer && (
                      <a href={sub.trailer} target="_blank" rel="noreferrer" className="text-purple-400 underline">Watch Trailer</a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    
{/*Rejected movies or series */}
<div className="min-h-screen bg-zinc-950 text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-purple-400 mb-8 text-center">Rejected Movies/Series by You</h1>

      {rejectedMedia.length === 0 ? (
        <p className="text-center text-zinc-400">No rejected media.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {rejectedMedia.map((sub) => (
            <div
              key={sub.submissionid}
              className="bg-zinc-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl flex gap-4"
            >
              {/* Poster */}
              <div className="flex-shrink-0 w-24 h-36 rounded-lg overflow-hidden bg-zinc-800">
                {sub.poster ? (
                  <img src={sub.poster} alt={sub.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {sub.type === 'movie' ? <Film size={32} className="text-zinc-500" /> : <Tv size={32} className="text-zinc-500" />}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold text-white">{sub.title}</h2>
                    <span className="text-xs bg-purple-700/50 text-purple-300 px-2 py-1 rounded-full capitalize">{sub.type}</span>
                  </div>
                  <p className="text-zinc-400 text-sm mb-2 line-clamp-2">{sub.overview}</p>

                  <div className="text-xs text-zinc-400 space-y-1">
                    <p><span className="text-zinc-300 font-medium">Submitted by:</span> {sub.username}</p>
                    <p><span className="text-zinc-300 font-medium">Year:</span> {sub.releaseyear}</p>
                    <p><span className="text-zinc-300 font-medium">Language:</span> {sub.language}</p>
                    <p><span className="text-zinc-300 font-medium">Country:</span> {sub.country}</p>
                    <p><span className="text-zinc-300 font-medium">Rating:</span> {sub.rating ?? 'N/A'}</p>
                    {sub.type === 'movie' && <p><span className="text-zinc-300 font-medium">Duration:</span> {sub.duration ? `${sub.duration} min` : 'N/A'}</p>}
                    {sub.type === 'series' && <p><span className="text-zinc-300 font-medium">Ongoing:</span> {sub.isongoing ? 'Yes' : 'No'}</p>}
                    {sub.trailer && (
                      <a href={sub.trailer} target="_blank" rel="noreferrer" className="text-purple-400 underline">Watch Trailer</a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>



    </div>
  );
};

export default AdminDashboardPage;
