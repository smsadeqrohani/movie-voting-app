import React, { useState } from 'react';
import { useAction } from 'convex/react';
import { toast } from 'react-toastify';
import { api } from '../convex/_generated/api';
import { extractImdbId, isValidImdbUrl } from '../utils/imdbUtils';
import { getCleanErrorMessage } from '../utils/errorUtils';
import { Search, Plus, Loader2 } from 'lucide-react';
import './SearchBox.css';

const SearchBox: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const addMovieWithTMDB = useAction(api.movies.addMovieWithTMDB);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!url.trim()) {
      setError('لطفاً لینک IMDb یا شناسه فیلم/سریال را وارد کنید');
      return;
    }

    if (!isValidImdbUrl(url)) {
      setError('لینک IMDb یا شناسه فیلم/سریال نامعتبر است');
      return;
    }

    setIsLoading(true);
    
    try {
      const imdbId = extractImdbId(url);
      if (!imdbId) {
        setError('نمی‌توان شناسه فیلم/سریال را استخراج کرد');
        return;
      }

      // Add content to database (backend will fetch from TMDB)
      await addMovieWithTMDB({ imdbId });
      
      setUrl('');
      setError('');
      toast.success('محتوای مورد نظر با موفقیت اضافه شد و رأی شما ثبت شد! 🎬❤️');
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
              placeholder="لینک IMDb یا شناسه فیلم/سریال (مثل: tt0111161) را وارد کنید..."
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
            {isLoading ? 'در حال پردازش...' : 'افزودن محتوا'}
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
