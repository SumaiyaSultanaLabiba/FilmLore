import React, { useState, useEffect } from 'react';
import { Search, Film, Tv, BookOpen, Heart, Bookmark, LayoutDashboard, User, LogOut, Filter, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SeriesPage.css';
import axios from 'axios';

const SeriesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [series, setSeries] = useState([]);
  const [filteredSeries, setFilteredSeries] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [user, setUser] = useState(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  // Form data state
  const [formdata, setFormdata] = useState({
    UserName:'',
    Title: '',
    Overview: '',
    Poster: '',
    Language: '',
    Rating: '',
    Trailer: '',
    ReleaseYear: '',
    Country: '',
    Type: '',
    Duration: '',
    isOngoing: ''
  });
  
  // Loading and feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  // Filter states
  const [filters, setFilters] = useState({
    country: 'All Countries',
    language: 'All Languages',
    genre: 'All Genres'
  });

  // Sample filter options (you can fetch these from backend)
  const countries = ['All Countries', 'USA', 'Bangladesh', 'India', 'Canada', 'Korea', 'China', 'Japan', 'France', 'Australia', 'UK', 'New Zealand'];
  const languages = ['All Languages', 'English', 'Bangla','Hindi' , 'Korean', 'Japanese', 'French', 'Chinese'];
  const genres = ['All Genres', 'action', 'drama', 'comedy', 'thriller', 'sci-fi', 'horror', 'romance'];

  // Get user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Redirect to login if not authenticated
      navigate('/login');
    }
  }, [navigate]);

  // Fetch series from backend
  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const res = await fetch('${import.meta.env.VITE_API_URL}/api/series');
        const json = await res.json();
        
        if (json.success) {
          const seriesData = json.data.map((s) => ({
            id: s.mediaid,
            title: s.title,
            year: s.releaseyear,
            rating: s.rating,
            poster: s.poster,
            country: s.country,
            language: s.language
          }));

          const seriesWithGenres = await Promise.all(
          seriesData.map(async (series) => {
            try {
              const genreRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/genre/${series.id}`);
              return { ...series, genres: genreRes.data.genres };
            } catch (err) {
              console.error(`Error fetching genres for series ${series.id}:`, err);
              return { ...series, genres: [] };
            }
          })
        );

        setSeries(seriesWithGenres);
        setFilteredSeries(seriesWithGenres);
        }
      } catch (err) {
        console.error('Error fetching series:', err);
      }
    };

    fetchSeries();
  }, []);



  // Apply filters
  useEffect(() => {
    let filtered = [...series];

    // Filter by country
    if (filters.country !== 'All Countries') {
      filtered = filtered.filter(s => s.country === filters.country);
    }

    // Filter by language
    if (filters.language !== 'All Languages') {
      filtered = filtered.filter(s => s.language === filters.language);
    }

    // Filter by genre
    if (filters.genre !== 'All Genres') {
      filtered = filtered.filter(s => s.genres.includes(filters.genre));
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSeries(filtered);
  }, [filters, searchQuery, series]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const addToWatchlist = (seriesId) => {
    // TODO: Implement add to watchlist API call
    console.log('Add to watchlist:', seriesId);
  };

  // Handle input changes
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormdata((prev) => ({
    ...prev,
    [name]: value
  }));
};


const handleSubmission = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setSuccess("");

  const user = JSON.parse(localStorage.getItem("user"));
  const submissionData = { ...formdata, UserName: user.username, Title: formdata.Title.trim(), Type: 'Series' };

  try {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/submission/submit`, submissionData);
    setSuccess("Submission sent to admin for approval!");
    setFormdata({
      UserName: '',
      Title: '',
      Overview: '',
      Poster: '',
      Language: '',
      Rating: '',
      Trailer: '',
      ReleaseYear: '',
      Country: '',
      Type: '',
      Duration: '',
      isOngoing: ''
    });
  } catch (err) {
  console.log("Submission failed:", err);
  setError(err.response?.data?.error || "Submission request failed. Try again.");
}
  finally {
    setLoading(false);
    setShowSubmissionForm(false);
  }
};

  return (
    <div className="series-page">
      {/* Navigation */}
      <nav className="series-navbar">
        <div className="nav-left">
          <h1 className="logo">FILMLORE</h1>
          <div className="nav-links">
            <a href="/movies" className="nav-link">
              <Film size={20} />
              <span>Movies</span>
            </a>
            <a href="/series" className="nav-link active">
              <Tv size={20} />
              <span>Series</span>
            </a>

            {user?.role?.toLowerCase() === 'user' && (
            <a href="/blog" className="nav-link">
              <BookOpen size={20} />
              <span>Blog</span>
            </a>)}

            {user?.role?.toLowerCase() === 'user' && (
            <a href="/for-you" className="nav-link">
              <Heart size={20} />
              <span>For You</span>
            </a>)}

            {user?.role?.toLowerCase() === 'user' && (
            <a href="/watchlist" className="nav-link">
              <Bookmark size={20} />
              <span>Watchlist</span>
            </a>)}


            {user?.role?.toLowerCase() === 'admin' && (
            <span className="nav-link" onClick={() => navigate('/admin-dashboard')} style={{cursor:'pointer'}}>
            <span>Dashboard</span>
            </span>)}
            {user?.role?.toLowerCase() === 'user' && (
            <span className="nav-link" onClick={() => navigate('/user-dashboard')} style={{cursor:'pointer'}}>
            <span>Dashboard</span>
            </span>)}
            {user?.role?.toLowerCase() === 'admin' && (
            <span className="nav-link" onClick={() => navigate('/submissions')} style={{cursor:'pointer'}}>
            <Bell size={20} />
            <span>Submissions</span>
            </span>)}
          </div>
        </div>

        <div className="nav-right">
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search series, shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="user-section">
            <div className="user-info">
              <User size={20} />
              <span className="username">{user?.username || "User"}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="logout-btn-simple"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Filters Section */}
      <div className="filters-container">
        <div className="filters-header">
          <h2>
            <Filter size={24} />
            Filters
          </h2>
          <button 
            className="toggle-filters"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide' : 'Show'}
          </button>
        </div>

        {showFilters && (
          <div className="filters-grid">
            <div className="filter-group">
              <label>Country</label>
              <select 
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
              >
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Language</label>
              <select 
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Genre</label>
              <select 
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Series Grid */}
      <div className="series-content">
        <h2 className="results-title">{filteredSeries.length} Series Found</h2>
        
        <div className="series-grid">
          {filteredSeries.map((show) => (
            <div key={show.id} 
            className="series-card"
            onClick={() => navigate(`/series/${show.id}`)}
            >

              <div key={show.id} className="series-card">
              <div className="series-poster">
                {show.poster ? (
                  <img src={show.poster} alt={show.title} />
                ) : (
                  <div className="poster-placeholder">
                    <Tv size={48} />
                  </div>
                )}
                <button 
                  className="watchlist-btn"
                  onClick={() => addToWatchlist(show.id)}
                >
                  <Bookmark size={20} />
                </button>
              </div>
              <div className="series-info">
                <h3>{show.title}</h3>
                <p className="series-year">{show.year}</p>
                <div className="series-rating">
                  <span>⭐</span>
                  <span>{show.rating}</span>
                </div>
              </div>
            </div>
            </div>
          ))}
        </div>

        {filteredSeries.length === 0 && (
          <div className="no-results">
            <Tv size={64} />
            <p>No series found with the selected filters.</p>
            <button onClick={() => setFilters({
              country: 'All Countries',
              language: 'All Languages',
              genre: 'All Genres'
            })}>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {user?.role?.toLowerCase() === 'user' && (
           <section className="text-center my-8">
        {/* Toggle button */}
        <button
          className="py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
          onClick={() => setShowSubmissionForm(!showSubmissionForm)}
        >
          Want your favourite series to be added in your favourite site??
        </button>
      
        {/* Submission form card */}
        {showSubmissionForm && (
          <div className="mt-6 max-w-xl mx-auto">
            <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 shadow-2xl shadow-purple-500/10">
              <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                <Film className="w-6 h-6 text-purple-400" />
                Suggest a New Series
              </h2>
      
              <form onSubmit={handleSubmission} className="space-y-6">
                {/* Title */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-zinc-300 mb-2">Title</label>
                  <input
                    name="Title"
                    type="text"
                    placeholder="Enter series title"
                    value={formdata.Title}
                    onChange={handleChange}
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
                    value={formdata.Overview}
                    onChange={handleChange}
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
                    value={formdata.ReleaseYear}
                    onChange={handleChange}
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
                    value={formdata.Poster}
                    onChange={handleChange}
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
                    value={formdata.Trailer}
                    onChange={handleChange}
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
                    value={formdata.Language}
                    onChange={handleChange}
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
                    value={formdata.Country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
      
                {/* isOngoing */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-zinc-300 mb-2">Is Ongoing??</label>
                  <input
                    name="isOngoing"
                    type="text"
                    placeholder="Enter Yes/No"
                    value={formdata.isOngoing}
                    onChange={handleChange}
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
                    value={formdata.Rating}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
      
                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                >
                  {loading ? "Submitting..." : "Submit for Approval"}
                </button>
              </form>
      
              {/* Feedback */}
              <h1 className="text-lg font-semibold bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent mt-4">
                {error && <p>{error}</p>}
                {success && <p>Submission sent to admin for approval!</p>}
              </h1>
            </div>
          </div>
        )}
      </section>
      )}
    </div>
  );
};

export default SeriesPage;
