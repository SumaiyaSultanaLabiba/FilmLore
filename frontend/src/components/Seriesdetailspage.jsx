

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  Share2,
  Star,
  Award,
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
} from "lucide-react";
import "./SeriesDetailsPage.css";

const SeriesDetailsPage = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editText, setEditText] = useState("");
  const [expandedSeasons, setExpandedSeasons] = useState({});

  // Helper function to render stars based on rating
  const renderStars = (rating) => {
    return Array.from({ length: 10 }, (_, i) => (
      <span
        key={i}
        style={{
          opacity: i < Math.floor(rating) ? 1 : 0.3,
          fontSize: "1rem",
        }}
      >
        ⭐
      </span>
    ));
  };

  useEffect(() => {
    const fetchSeriesDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5004/api/series/${seriesId}`);
        const json = await res.json();

        if (json.success) {
          setSeries(json.data);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching series:", err);
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await fetch(
          `http://localhost:5004/api/series/${seriesId}/reviews`,
        );
        const json = await res.json();

        if (json.success) {
          setReviews(json.data || []);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setReviews([]);
      }
    };

    fetchSeriesDetails();
    fetchReviews();
  }, [seriesId]);

  const toggleSeason = (seasonNumber) => {
    setExpandedSeasons((prev) => ({
      ...prev,
      [seasonNumber]: !prev[seasonNumber],
    }));
  };

  // Review functions (same as MovieDetailsPage)
  const handleSubmitReview = async () => {
    if (!userRating || !reviewText.trim()) {
      alert("Please provide both a rating and review text");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (!token || !user) {
        alert("Please login to submit a review");
        navigate("/login");
        return;
      }

      const res = await fetch(
        `http://localhost:5004/api/series/${seriesId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: userRating,
            text: reviewText,
            seriesId: seriesId,
            username: user.username,
          }),
        },
      );

      const json = await res.json();

      if (json.success) {
        const newReview = {
          username: user.username,
          rating: userRating,
          text: reviewText,
          date: new Date().toISOString().split("T")[0],
        };

        setReviews((prevReviews) => [newReview, ...prevReviews]);

        if (json.data.newSeriesRating) {
          setSeries((prevSeries) => ({
            ...prevSeries,
            rating: json.data.newSeriesRating,
          }));
        }

        setUserRating(0);
        setReviewText("");

        alert("Review submitted successfully!");
      } else {
        alert(json.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error submitting review. Please try again.");
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review.reviewid);
    setEditRating(review.rating);
    setEditText(review.text);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditText("");
  };

  const handleUpdateReview = async (reviewId) => {
    if (!editRating || !editText.trim()) {
      alert("Please provide both a rating and review text");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5004/api/reviews/${reviewId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: editRating,
            text: editText,
          }),
        },
      );

      const json = await res.json();

      if (json.success) {
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.reviewid === reviewId
              ? { ...review, rating: editRating, text: editText }
              : review
          )
        );

        if (json.data.newSeriesRating) {
          setSeries((prevSeries) => ({
            ...prevSeries,
            rating: json.data.newSeriesRating,
          }));
        }

        handleCancelEdit();
        alert("Review updated successfully!");
      } else {
        alert(json.message || "Failed to update review");
      }
    } catch (error) {
      console.error("Error updating review:", error);
      alert("Error updating review. Please try again.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5004/api/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json = await res.json();

      if (json.success) {
        setReviews((prevReviews) =>
          prevReviews.filter((review) => review.reviewid !== reviewId)
        );

        if (json.data.newSeriesRating) {
          setSeries((prevSeries) => ({
            ...prevSeries,
            rating: json.data.newSeriesRating,
          }));
        }

        alert("Review deleted successfully!");
      } else {
        alert(json.message || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Error deleting review. Please try again.");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!series) {
    return <div className="error">Series not found</div>;
  }

  return (
    <div className="series-details-page">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate("/series")}>
        <ArrowLeft size={20} />
        <span>Back to Series</span>
      </button>

      {/* Hero Section */}
      <div className="hero-section">
        <div
          className="hero-background"
          style={{ backgroundImage: `url(${series.poster})` }}
        >
          <div className="hero-overlay" />
        </div>

        <div className="hero-content">
          <div className="series-poster-large">
            {series.poster ? (
              <img src={series.poster} alt={series.title} />
            ) : (
              <div className="poster-placeholder">
                <Star size={64} />
              </div>
            )}
          </div>

          <div className="series-info-hero">
            <h1 className="series-title">{series.title}</h1>
            <p className="series-tagline">{series.overview}</p>

            <div className="series-meta">
              <span className="rating">
                <Star size={20} fill="currentColor" />
                {series.rating}/10
              </span>
              <span className="year">
                📅 {series.releaseyear || series.year}
              </span>
              <span className="seasons">
                📺 {series.total_seasons || series.seasons?.length || "N/A"} Seasons
              </span>
              <span className="language">🌐 {series.language}</span>
            </div>

            <div className="genre-tags">
              {series.genres &&
                series.genres.map((genre, idx) => (
                  <span key={idx} className="genre-tag">
                    {genre.genrename}
                  </span>
                ))}
            </div>

            <div className="action-buttons">
              <button className="btn-secondary">
                <Bookmark size={20} />
                In Watchlist
              </button>
              <button className="btn-icon">
                <Share2 size={20} />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-container">
        <button
          className={`tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === "episodes" ? "active" : ""}`}
          onClick={() => setActiveTab("episodes")}
        >
          Episodes
        </button>
        <button
          className={`tab ${activeTab === "cast" ? "active" : ""}`}
          onClick={() => setActiveTab("cast")}
        >
          Cast & Crew
        </button>
        <button
          className={`tab ${activeTab === "awards" ? "active" : ""}`}
          onClick={() => setActiveTab("awards")}
        >
          Awards
        </button>
        <button
          className={`tab ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews
        </button>
      </div>

      {/* Content Sections */}
      <div className="content-container">
        {activeTab === "overview" && (
          <div className="overview-section">
            <div className="section-card">
              <h2>📖 Plot Summary</h2>
              <p>{series.overview || "No plot summary available."}</p>
            </div>

            <div className="section-card">
              <h2>📺 Series Details</h2>
              <div className="production-grid">
                <div className="detail-item">
                  <span className="label">Creator</span>
                  <span className="value">
                    {series.directors && series.directors.length > 0
                      ? series.directors.map((d) => d.directorname).join(", ")
                      : "Unknown"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Network/Studio</span>
                  <span className="value">
                    {series.studios && series.studios.length > 0
                      ? series.studios.map((s) => s.studioname).join(", ")
                      : "Unknown"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Country</span>
                  <span className="value">{series.country || "Unknown"}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Total Episodes</span>
                  <span className="value">
                    {series.episodes?.length || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "episodes" && (
          <div className="episodes-section">
            <div className="section-card">
              <h2>📺 Episodes</h2>
              {series.seasons && series.seasons.length > 0 ? (
                series.seasons.map((season) => (
                  <div key={season.seasonid} className="season-container">
                    <button
                      className="season-header"
                      onClick={() => toggleSeason(season.seasonnumber)}
                    >
                      <h3>
                        Season {season.seasonnumber}
                      </h3>
                      <span className="episode-count">
                        {series.episodes?.filter(
                          (ep) => ep.seasonid === season.seasonid
                        ).length || 0}{" "}
                        Episodes
                      </span>
                      {expandedSeasons[season.seasonnumber] ? (
                        <ChevronUp size={24} />
                      ) : (
                        <ChevronDown size={24} />
                      )}
                    </button>

                    {expandedSeasons[season.seasonnumber] && (
                      <div className="episodes-list">
                        {series.episodes
                          ?.filter((ep) => ep.seasonid === season.seasonid)
                          .map((episode) => (
                            <div
                              key={episode.episodeid}
                              className="episode-card"
                            >
                              <div className="episode-number">
                                E{episode.episodenumber}
                              </div>
                              <div className="episode-details">
                                <h4>{episode.episodetitle}</h4>
                                <div className="episode-meta">
                                  <span>
                                    <Clock size={16} />
                                    {episode.duration || "N/A"} min
                                  </span>
                                  <span>
                                    <Calendar size={16} />
                                    {episode.releasedate
                                      ? new Date(episode.releasedate).toLocaleDateString()
                                      : "TBA"}
                                  </span>
                                  {episode.rating && (
                                    <span>
                                      <Star size={16} fill="currentColor" />
                                      {episode.rating}/10
                                    </span>
                                  )}
                                </div>
                                <p className="episode-synopsis">
                                  {episode.synopsis || "No synopsis available."}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-data">No episodes information available.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "cast" && (
          <div className="cast-section">
            <div className="section-card">
              <h2>🎭 Cast</h2>
              <div className="cast-grid">
                {series.actors && series.actors.length > 0 ? (
                  series.actors.map((actor) => (
                    <div key={actor.actorid} className="cast-card">
                      <div className="actor-photo">
                        {actor.actorphoto ? (
                          <img src={actor.actorphoto} alt={actor.actorname} />
                        ) : (
                          <div className="photo-placeholder">👤</div>
                        )}
                      </div>
                      <div className="actor-info">
                        <h3>{actor.actorname}</h3>
                        <p>{actor.charactername || "Role"}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No cast information available.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "awards" && (
          <div className="awards-section">
            <div className="section-card">
              <h2>
                <Award size={24} />
                Awards & Nominations
              </h2>
              <div className="awards-list">
                {series.awards && series.awards.length > 0 ? (
                  series.awards.map((award, idx) => (
                    <div key={idx} className="award-item">
                      <div className="award-icon">
                        <Award size={24} />
                      </div>
                      <div className="award-details">
                        <h3>{award.awardname}</h3>
                        <p>{award.awardcategory}</p>
                        <span className="award-year">{award.awardyear}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No awards information available.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="reviews-section">
            <div className="section-card">
              <h2>💬 Write a Series Review</h2>
              <div className="review-form">
                <div className="rating-input">
                  <label>Your Rating</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                      <button
                        key={star}
                        className={`star ${userRating >= star ? "active" : ""}`}
                        onClick={() => setUserRating(star)}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  placeholder="Share your thoughts about this series..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={5}
                />
                <button
                  className="submit-review-btn"
                  onClick={handleSubmitReview}
                >
                  Submit Review
                </button>
              </div>
            </div>

            <div className="section-card">
              <h2>👥 User Reviews ({reviews.length})</h2>
              <div className="reviews-list">
                {reviews.length > 0 ? (
                  reviews.map((review, idx) => {
                    const user = JSON.parse(localStorage.getItem("user"));
                    const isMyReview = user && review.username === user.username;
                    const isEditing = editingReviewId === review.reviewid;

                    return (
                      <div key={idx} className="review-item">
                        <div className="review-header">
                          <h3>{review.username || "Anonymous User"}</h3>
                          <div className="review-rating">
                            {isEditing ? (
                              <div className="edit-star-rating">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                  <button
                                    key={star}
                                    className={`star ${editRating >= star ? "active" : ""}`}
                                    onClick={() => setEditRating(star)}
                                  >
                                    ⭐
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <>
                                {renderStars(review.rating)} {review.rating}/10
                              </>
                            )}
                          </div>
                          <span className="review-date">
                            {review.date ||
                              new Date().toISOString().split("T")[0]}
                          </span>
                        </div>

                        {isEditing ? (
                          <div className="edit-review-form">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              rows={5}
                              className="edit-textarea"
                            />
                            <div className="edit-actions">
                              <button
                                className="save-edit-btn"
                                onClick={() => handleUpdateReview(review.reviewid)}
                              >
                                Save
                              </button>
                              <button
                                className="cancel-edit-btn"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="review-text">{review.text}</p>
                        )}

                        {isMyReview && !isEditing && (
                          <div className="review-actions">
                            <button
                              className="edit-review-btn"
                              onClick={() => handleEditReview(review)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="delete-review-btn"
                              onClick={() => handleDeleteReview(review.reviewid)}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="no-data">
                    No reviews yet. Be the first to review!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesDetailsPage;