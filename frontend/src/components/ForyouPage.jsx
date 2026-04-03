import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Film, Tv, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const ForyouPage = () => {

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : {};
   const navigate = useNavigate();

  // Fetch my suggestions
  const [suggestions, setSuggestions] = useState([]);
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/getSuggestions`, {UserName: currentUser.username});
        setSuggestions(res.data.suggestions);
      } catch (err) {
        console.log('Failed to load suggestions.');
      }
    };
    fetchSuggestions();
  }, []);



  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-purple-400 mb-8 text-center">These are only FOR YOU💛💛💛</h1>

      {suggestions.length === 0 ? (
        <p className="text-center text-zinc-400">No suggestion for you 😔😔😔.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {suggestions.map((media) => (
            <div
            key={media.mediaid}
            className="bg-zinc-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl flex gap-4"
            onClick={() =>
            navigate(`/movie/${media.mediaid}`)
          }
>

              {/* Poster */}
              <div className="flex-shrink-0 w-24 h-36 rounded-lg overflow-hidden bg-zinc-800">
                {media.poster ? (
                  <img src={media.poster} alt={media.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {media.type === 'movie' ? <Film size={32} className="text-zinc-500" /> : <Tv size={32} className="text-zinc-500" />}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold text-white">{media.title}</h2>
                    <span className="text-xs bg-purple-700/50 text-purple-300 px-2 py-1 rounded-full capitalize">{media.type}</span>
                  </div>
                  <p className="text-zinc-400 text-sm mb-2 line-clamp-2">{media.overview}</p>

                  <div className="text-xs text-zinc-400 space-y-1">
                    <p><span className="text-zinc-300 font-medium">Year:</span> {media.releaseyear}</p>
                    <p><span className="text-zinc-300 font-medium">Language:</span> {media.language}</p>
                    <p><span className="text-zinc-300 font-medium">Country:</span> {media.country}</p>
                    <p><span className="text-zinc-300 font-medium">Rating:</span> {media.rating ?? 'N/A'}</p>
                    {media.trailer && (
                      <a href={media.trailer} target="_blank" rel="noreferrer" className="text-purple-400 underline">Watch Trailer</a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ForyouPage;