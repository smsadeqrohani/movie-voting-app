import React from 'react';
import { Heart, ExternalLink, Calendar, Star } from 'lucide-react';
import moment from 'moment-jalaali';
import './MovieCard.css';

interface Movie {
  _id: string;
  imdbId: string;
  title: string;
  year: number;
  director?: string;
  actors?: string[];
  plot?: string;
  poster?: string;
  imdbRating?: number;
  genre?: string[];
  votes: number;
  imdbUrl: string;
  addedAt: number;
}

interface MovieCardProps {
  movie: Movie;
  onVote: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onVote }) => {
  const formatDate = (timestamp: number) => {
    const jalaaliDate = moment(timestamp).format('jYYYY/jMM/jDD');
    // Convert English numbers to Persian numbers
    return jalaaliDate
      .replace(/0/g, '۰')
      .replace(/1/g, '۱')
      .replace(/2/g, '۲')
      .replace(/3/g, '۳')
      .replace(/4/g, '۴')
      .replace(/5/g, '۵')
      .replace(/6/g, '۶')
      .replace(/7/g, '۷')
      .replace(/8/g, '۸')
      .replace(/9/g, '۹');
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('fa-IR');
  };

  return (
    <div className="movie-card">
      <div className="movie-poster">
        {movie.poster ? (
          <img src={movie.poster} alt={movie.title} />
        ) : (
          <div className="no-poster">
            <span>بدون تصویر</span>
          </div>
        )}
        <div className="movie-overlay">
          <button className="vote-button" onClick={onVote}>
            <Heart size={20} />
            رأی دهید
          </button>
        </div>
      </div>
      
      <div className="movie-info">
        <div className="movie-header">
          <h3 className="movie-title">{movie.title}</h3>
          <a
            href={movie.imdbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="imdb-link"
          >
            <ExternalLink size={16} />
          </a>
        </div>
        
        <div className="movie-meta">
          <div className="meta-item">
            <Calendar size={14} />
            <span>{movie.year}</span>
          </div>
          
          {movie.imdbRating && (
            <div className="meta-item">
              <Star size={14} />
              <span>{movie.imdbRating.toFixed(1)}</span>
            </div>
          )}
          
          {movie.genre && movie.genre.length > 0 && (
            <div className="movie-genres">
              {movie.genre.map((g, index) => (
                <span key={index} className="genre-tag">
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Vote count - prominently displayed */}
        <div className="vote-section" onClick={onVote}>
          <div className="vote-count">
            <Heart size={18} className="vote-icon" />
            <span className="vote-number">{formatNumber(movie.votes)}</span>
            <span className="vote-label">رأی</span>
          </div>
        </div>
        
        
        <div className="movie-footer">
          <span className="added-date">
            درخواست شده در {formatDate(movie.addedAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
