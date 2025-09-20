import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { toast } from 'react-toastify';
import { api } from '../convex/_generated/api';
import { getSessionId } from '../utils/sessionUtils';
import { getCleanErrorMessage } from '../utils/errorUtils';
import SpecialMovieCard from './SpecialMovieCard';
import { Loader2 } from 'lucide-react';
import './MovieGrid.css';

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
  isDouble?: boolean;
  hasSubtitle?: boolean;
  hasContentIssue?: boolean;
}

const SpecialMoviesGrid: React.FC = () => {
  const movies = useQuery(api.movies.getMoviesWithSpecialProperties);
  const voteForMovie = useMutation(api.movies.voteForMovie);

  const handleVote = async (movieId: string) => {
    try {
      const sessionId = getSessionId();
      await voteForMovie({ 
        movieId: movieId as any,
        sessionId: sessionId
      });
      toast.success('رأی شما با موفقیت ثبت شد! 🎉');
    } catch (error: any) {
      console.error('Error voting:', error);
      const cleanMessage = getCleanErrorMessage(error);
      toast.error(cleanMessage);
    }
  };


  if (movies === undefined) {
    return (
      <div className="loading-container">
        <Loader2 className="animate-spin" size={32} />
        <p>در حال بارگذاری محتوا...</p>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="empty-state">
        <h3>هنوز محتوایی بررسی نشده است</h3>
        <p>محتوای بررسی شده در اینجا نمایش داده می‌شود</p>
      </div>
    );
  }

  return (
    <div className="movie-grid-container">
      <h2 className="grid-title">محتوای بررسی شده</h2>
      <div className="movie-grid">
        {movies.map((movie: Movie) => (
          <SpecialMovieCard
            key={movie._id}
            movie={movie}
            onVote={() => handleVote(movie._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default SpecialMoviesGrid;
