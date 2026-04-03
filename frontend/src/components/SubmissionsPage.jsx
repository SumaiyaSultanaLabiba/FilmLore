import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Film, Tv, Check, X } from 'lucide-react';

const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  // Protect the page — redirect non-admins
  useEffect(() => {
    if (!user || user.role?.toLowerCase() !== 'admin') {
      navigate('/movies');
    }
  }, []);

  // Fetch all pending submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/submission/getAllSubmissions`);
        setSubmissions(res.data.submissions);
      } catch (err) {
        setError('Failed to load submissions.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const handleDecision = async (submissionId, decision) => {
    console.log("Sending:", { submissionId, adminUserName: user.username, decision });
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/submission/approve`, {
        submissionId,
        adminUserName: user.username,
        decision
      });
      // Remove the processed submission from the list
      setSubmissions(prev => prev.filter(s => s.submissionid !== submissionId));
    } catch (err) {
      alert('Action failed. Please try again.');
    }
  };

  if (loading) return <p className="text-white text-center mt-10">Loading submissions...</p>;
  if (error) return <p className="text-red-400 text-center mt-10">{error}</p>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-purple-400 mb-8 text-center">Pending Submissions</h1>

      {submissions.length === 0 ? (
        <p className="text-center text-zinc-400">No pending submissions.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {submissions.map((sub) => (
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

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleDecision(sub.submissionid, 'Approved')}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-semibold transition-all"
                  >
                    <Check size={16} /> Accept
                  </button>
                  <button
                    onClick={() => handleDecision(sub.submissionid, 'Rejected')}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold transition-all"
                  >
                    <X size={16} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmissionsPage;