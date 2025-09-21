import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // تعداد آیتم در هر صفحه
  
  // Use server-side pagination
  const moviesData = useQuery(api.movies.getSpecialMoviesPaginated, {
    page: currentPage,
    limit: itemsPerPage,
  });
  
  const voteForMovie = useMutation(api.movies.voteForMovie);
  
  // Extract data from server response
  const movies = moviesData?.movies || [];
  const pagination = moviesData?.pagination;

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

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of grid when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('fa-IR');
  };


  if (moviesData === undefined) {
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

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    if (!pagination) return [];
    
    const { currentPage: page, totalPages } = pagination;
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="movie-grid-container">
      <h2 className="grid-title">محتوای بررسی شده</h2>
      
      {/* Items Count Info */}
      {movies.length > 0 && (
        <div className="pagination-info">
          {formatNumber(movies.length)} فیلم نمایش داده شده
          {pagination && (
            <span> از {formatNumber(pagination.totalCount)} فیلم کل</span>
          )}
        </div>
      )}
      
      <div className="movie-grid">
        {movies.map((movie: Movie) => (
          <SpecialMovieCard
            key={movie._id}
            movie={movie}
            onVote={() => handleVote(movie._id)}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination">
            {/* Previous Button */}
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <span>قبلی</span>
            </button>

            {/* Page Numbers */}
            <div className="pagination-numbers">
              {generatePageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={index} className="pagination-ellipsis">...</span>
                ) : (
                  <button
                    key={index}
                    className={`pagination-number ${page === currentPage ? 'active' : ''}`}
                    onClick={() => handlePageChange(page as number)}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>

            {/* Next Button */}
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              <span>بعدی</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialMoviesGrid;
