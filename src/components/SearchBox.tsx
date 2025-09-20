import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { toast } from 'react-toastify';
import { api } from '../convex/_generated/api';
import { extractImdbId, isValidImdbUrl } from '../utils/imdbUtils';
import { getCleanErrorMessage } from '../utils/errorUtils';
import { fetchMovieData } from '../services/movieService';
import { Search, Plus, Loader2 } from 'lucide-react';
import './SearchBox.css';

const SearchBox: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const addMovie = useMutation(api.movies.addMovie);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!url.trim()) {
      setError('لطفاً لینک IMDb یا شناسه فیلم را وارد کنید');
      return;
    }

    if (!isValidImdbUrl(url)) {
      setError('لینک IMDb یا شناسه فیلم نامعتبر است');
      return;
    }

    setIsLoading(true);
    
    try {
      const imdbId = extractImdbId(url);
      if (!imdbId) {
        setError('نمی‌توان شناسه فیلم را استخراج کرد');
        return;
      }

      // Fetch movie data
      const movieData = await fetchMovieData(imdbId);
      
      if (!movieData) {
        setError('فیلم در TMDB یافت نشد. لطفاً لینک یا شناسه صحیح وارد کنید');
        return;
      }

      // Add movie to database
      await addMovie(movieData);
      
      setUrl('');
      setError('');
      toast.success(`فیلم "${movieData.title}" با موفقیت اضافه شد! 🎬`);
    } catch (err: any) {
      console.error('Error adding movie:', err);
      const cleanMessage = getCleanErrorMessage(err);
      setError(cleanMessage);
      toast.error(cleanMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-box-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-group">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="لینک IMDb یا شناسه فیلم (مثل: tt0111161) را وارد کنید..."
              className="search-input"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="search-button"
            disabled={isLoading || !url.trim()}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Plus size={20} />
            )}
            {isLoading ? 'در حال پردازش...' : 'افزودن فیلم'}
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
      </form>
    </div>
  );
};

export default SearchBox;
