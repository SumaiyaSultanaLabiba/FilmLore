import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import MoviesPage from './components/MoviesPage';
import SeriesPage from './components/SeriesPage';
import MovieDetailsPage from './components/Moviedetailspage';
import SeriesDetailsPage from './components/Seriesdetailspage';
import WatchlistPage from "./components/WatchlistPage";
import WatchlistDetailsPage from "./components/WatchlistDetailsPage";
import BlogPage from "./components/BlogPage";
import BlogPostPage from "./components/BlogPostPage";
import CreateBlogPage from "./components/CreateBlogPage";
import SubmissionsPage from './components/SubmissionsPage';
import AdminDashboardPage from './components/AdminDashboardPage';
import UserDashboardPage from './components/UserDashboardPage';
import ForyouPage from './components/ForyouPage';


import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/series" element={<SeriesPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:blogId" element={<BlogPostPage />} />
          <Route path="/blog/create" element={<CreateBlogPage />} />
          <Route path="/blog/edit/:blogId" element={<CreateBlogPage />} />
          <Route path="/for-you" element={<ForyouPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/watchlist/:watchlistName" element={<WatchlistDetailsPage />}/>
          <Route path="/admin-dashboard" element={<AdminDashboardPage/>} />
          <Route path="/user-dashboard" element={<UserDashboardPage/>} />
         <Route path="/movie/:movieId" element={<MovieDetailsPage />} />
         <Route path="/series/:seriesId" element={<SeriesDetailsPage />} />
         <Route path="/submissions" element={<SubmissionsPage />} />
        
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
