// src/components/MovieRecommender.jsx
import React, { useState, useEffect } from 'react';
import { Film, Star, Clock, TrendingUp, Loader, AlertCircle, Globe } from 'lucide-react';

// ✅ FIXED — correct env format for CRA
const apiKey = process.env.REACT_APP_API_KEY;

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// TMDB genre id -> name mapping
const TMDB_GENRES = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

// reverse mapping name -> id
const GENRE_NAME_TO_ID = Object.fromEntries(
  Object.entries(TMDB_GENRES).map(([id, name]) => [name, Number(id)])
);

// UI-visible genre list
const availableGenres = [
  "Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller",
  "Adventure", "Crime", "Mystery", "Fantasy", "Musical"
];

const MovieRecommender = () => {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [recommendations, setRecommendations] = useState([]);
  const [viewMode, setViewMode] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const languageDisplay = (code) => {
    if (!code) return 'Unknown';
    if (code.startsWith('hi')) return 'Hindi';
    if (code.startsWith('en')) return 'English';
    return code.toUpperCase();
  };

  // ----------------------
  // TMDB Fetch Function
  // ----------------------
  const fetchMoviesFromTMDB = async () => {
    if (selectedGenres.length === 0) {
      setRecommendations([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const genreIds = selectedGenres
        .map(g => GENRE_NAME_TO_ID[g])
        .filter(Boolean);

      if (genreIds.length === 0) {
        setRecommendations([]);
        setLoading(false);
        return;
      }

      const with_genres = genreIds.join(',');
      const original_lang = selectedLanguage === 'Hindi' ? 'hi' : 'en';

      // ✅ FIXED — use correct apiKey variable
      const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${with_genres}&with_original_language=${original_lang}&sort_by=vote_average.desc&vote_count.gte=50&page=1`;

      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`TMDB Error: ${resp.status}`);

      const data = await resp.json();
      const results = Array.isArray(data.results) ? data.results : [];

      const movies = results.map(m => {
        const genreNames = (m.genre_ids || []).map(id => TMDB_GENRES[id]).filter(Boolean);
        const year = m.release_date ? m.release_date.split('-')[0] : 'N/A';

        return {
          id: m.id,
          title: m.title,
          genres: genreNames,
          rating: m.vote_average,
          year,
          description: m.overview,
          language: languageDisplay(m.original_language),
          poster_path: m.poster_path
        };
      });

      // match scoring
      const scored = movies.map(movie => {
        const matchCount = movie.genres.filter(g => selectedGenres.includes(g)).length;
        const matchScore = selectedGenres.length > 0 ? (matchCount / selectedGenres.length) : 0;
        return { ...movie, matchCount, matchScore };
      });

      const filtered = scored
        .filter(m => m.matchCount > 0)
        .sort((a, b) => b.matchScore - a.matchScore || b.rating - a.rating);

      setRecommendations(filtered);

    } catch (err) {
      setError(err.message || "Unknown TMDB error");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced effect
  useEffect(() => {
    const id = setTimeout(fetchMoviesFromTMDB, 300);
    return () => clearTimeout(id);
  }, [selectedGenres, selectedLanguage]);

  const toggleGenre = (g) => {
    setSelectedGenres(prev =>
      prev.includes(g) ? prev.filter(i => i !== g) : [...prev, g]
    );
  };

  const clearGenres = () => {
    setSelectedGenres([]);
    setRecommendations([]);
    setError(null);
  };

  const getMatchPercentage = (movie) => {
    const pct = Math.round((movie.rating || 0) * 10);
    return Math.max(0, Math.min(pct, 100));
  };

  const displayedMovies = viewMode === 'top'
    ? recommendations.slice(0, 5)
    : recommendations;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Globe className="w-12 h-12 text-yellow-400 animate-pulse" />
            <h1 className="text-5xl font-bold text-white">Live Movie Recommender</h1>
          </div>
          <p className="text-blue-200 text-lg">
            Real-time movie recommendations fetched directly from TMDB
          </p>
        </div>

        {/* Language & Genre Selection */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 shadow-2xl">

          {/* Language */}
          <h2 className="text-2xl font-semibold text-white mb-4">Select Language</h2>
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setSelectedLanguage('English')}
              className={`px-8 py-4 rounded-xl font-semibold text-lg ${
                selectedLanguage === 'English'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white/20 text-white'
              }`}
            >
              🇬🇧 English / Hollywood
            </button>

            <button
              onClick={() => setSelectedLanguage('Hindi')}
              className={`px-8 py-4 rounded-xl font-semibold text-lg ${
                selectedLanguage === 'Hindi'
                  ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg'
                  : 'bg-white/20 text-white'
              }`}
            >
              🇮🇳 Hindi / Bollywood
            </button>
          </div>

          {/* Genre */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-white">Select Genres</h2>

            {selectedGenres.length > 0 && (
              <button
                onClick={clearGenres}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {availableGenres.map((g) => (
              <button
                key={g}
                onClick={() => toggleGenre(g)}
                className={`px-6 py-3 rounded-full font-medium ${
                  selectedGenres.includes(g)
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                    : 'bg-white/20 text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white/10 rounded-2xl p-12 text-center shadow-2xl">
            <Loader className="w-16 h-16 mx-auto mb-4 text-yellow-400 animate-spin" />
            <h3 className="text-2xl font-semibold text-white">Searching TMDB…</h3>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-500/20 rounded-2xl p-6 shadow-2xl border border-red-500/50">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-8 h-8 text-red-300" />
              <h3 className="text-xl font-semibold text-white">Error Fetching Data</h3>
            </div>
            <p className="text-red-200 mb-4">{error}</p>
            <button
              onClick={fetchMoviesFromTMDB}
              className="px-6 py-2 bg-red-500 text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        )}

        {/* Movie Results */}
        {!loading && !error && selectedGenres.length > 0 && recommendations.length > 0 && (
          <div className="bg-white/10 rounded-2xl p-6 shadow-2xl">

            {/* View Mode */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-yellow-400" />
                Recommendations ({recommendations.length})
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('all')}
                  className={`px-4 py-2 rounded-lg ${
                    viewMode === 'all' ? 'bg-yellow-500 text-white' : 'bg-white/20 text-white'
                  }`}
                >
                  Show All
                </button>

                <button
                  onClick={() => setViewMode('top')}
                  className={`px-4 py-2 rounded-lg ${
                    viewMode === 'top' ? 'bg-yellow-500 text-white' : 'bg-white/20 text-white'
                  }`}
                >
                  Top 5
                </button>
              </div>
            </div>

            {/* Movie List */}
            <div className="grid gap-4">
              {displayedMovies.map((movie, index) => (
                <div key={movie.id} className="bg-white/20 rounded-xl p-5 hover:bg-white/30 transition-all">

                  <div className="flex flex-col md:flex-row justify-between gap-4">

                    {/* Poster */}
                    <div className="md:w-40">
                      <img
                        src={
                          movie.poster_path
                            ? `${IMG_BASE}${movie.poster_path}`
                            : "https://via.placeholder.com/320x480?text=No+Image"
                        }
                        alt={movie.title}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl font-bold text-yellow-400">#{index + 1}</span>
                        <h3 className="text-2xl font-bold text-white">{movie.title}</h3>
                      </div>

                      <div className="flex items-center gap-4 mb-3 text-blue-200">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>{movie.rating.toFixed(1)}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{movie.year}</span>
                        </div>

                        <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm">
                          {movie.language}
                        </span>
                      </div>

                      <p className="text-blue-100 mb-3">
                        {movie.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {movie.genres.map((g, i) => (
                          <span
                            key={i}
                            className={`px-3 py-1 rounded-full text-sm ${
                              selectedGenres.includes(g)
                                ? 'bg-yellow-400 text-black'
                                : 'bg-white/30 text-white'
                            }`}
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Match Score */}
                    <div className="md:w-36 text-center">
                      <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold text-lg inline-block">
                        {getMatchPercentage(movie)}% Match
                      </div>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {selectedGenres.length === 0 && !loading && (
          <div className="bg-white/10 rounded-2xl p-12 text-center shadow-2xl">
            <Globe className="w-24 h-24 mx-auto mb-6 text-yellow-400 opacity-50 animate-pulse" />
            <h3 className="text-2xl font-semibold text-white mb-3">Ready to Search!</h3>
            <p className="text-blue-200 text-lg mb-4">
              Select language + genres to fetch live recommendations
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default MovieRecommender;
