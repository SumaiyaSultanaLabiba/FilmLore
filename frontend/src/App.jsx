import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import MoviesPage from './components/MoviesPage';
import SeriesPage from './components/SeriesPage';
import MovieDetailsPage from './components/Moviedetailspage';

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
          <Route path="/blog" element={<div style={{color: 'white', padding: '2rem'}}>Blog Page (To be implemented)</div>} />
          <Route path="/for-you" element={<div style={{color: 'white', padding: '2rem'}}>For You Page (To be implemented)</div>} />
          <Route path="/watchlist" element={<div style={{color: 'white', padding: '2rem'}}>Watchlist Page (To be implemented)</div>} />
          <Route path="/dashboard" element={<div style={{color: 'white', padding: '2rem'}}>Dashboard Page (To be implemented)</div>} />
         <Route path="/movie/:movieId" element={<MovieDetailsPage />} />
        
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
