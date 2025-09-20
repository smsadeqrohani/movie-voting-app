import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { toast } from 'react-toastify';
import { api } from '../convex/_generated/api';
import { getSessionId } from '../utils/sessionUtils';
import { getCleanErrorMessage } from '../utils/errorUtils';
import MovieCard from './MovieCard';
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

const MovieGrid: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // تعداد آیتم در هر صفحه
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);
  
  // Use server-side pagination
  const moviesData = useQuery(api.movies.getMoviesPaginated, {
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

  // Update allMovies when new data arrives
  useEffect(() => {
    console.log('Movies data updated:', {
      moviesLength: movies.length,
      currentPage,
      pagination: pagination ? {
        hasNextPage: pagination.hasNextPage,
        totalPages: pagination.totalPages,
        totalCount: pagination.totalCount
      } : null
    });
    
    if (movies.length > 0) {
      if (currentPage === 1) {
        // First page - replace all movies
        setAllMovies(movies);
        console.log('Set initial movies:', movies.length);
      } else {
        // Subsequent pages - append to existing movies
        setAllMovies(prev => {
          const newMovies = [...prev, ...movies];
          console.log('Appended movies:', movies.length, 'Total now:', newMovies.length);
          return newMovies;
        });
      }
      setIsLoadingMore(false);
    }
    
    // Update hasMorePages based on pagination
    if (pagination) {
      setHasMorePages(pagination.hasNextPage);
      console.log('Updated hasMorePages:', pagination.hasNextPage);
    }
  }, [movies, currentPage, pagination]);

  // Load more movies when reaching the bottom
  const loadMoreMovies = useCallback(() => {
    console.log('loadMoreMovies called:', {
      isLoadingMore,
      hasMorePages,
      currentPage
    });
    
    if (!isLoadingMore && hasMorePages) {
      console.log('Setting loading and incrementing page...');
      setIsLoadingMore(true);
      setCurrentPage(prev => {
        const newPage = prev + 1;
        console.log('Page incremented from', prev, 'to', newPage);
        return newPage;
      });
    } else {
      console.log('Cannot load more:', { isLoadingMore, hasMorePages });
    }
  }, [isLoadingMore, hasMorePages, currentPage]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        console.log('Intersection observed:', {
          isIntersecting: target.isIntersecting,
          hasMorePages,
          isLoadingMore,
          currentPage,
          moviesCount: allMovies.length
        });
        
        if (target.isIntersecting && hasMorePages && !isLoadingMore) {
          console.log('Loading more movies...');
          loadMoreMovies();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMorePages, isLoadingMore, loadMoreMovies, currentPage, allMovies.length]);

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

  if (allMovies.length === 0 && !isLoadingMore) {
    return (
      <div className="empty-state">
        <h3>هنوز محتوایی اضافه نشده است</h3>
        <p>اولین فیلم یا سریال را با وارد کردن لینک IMDb اضافه کنید</p>
      </div>
    );
  }

  return (
    <div className="movie-grid-container">
      <h2 className="grid-title">محتوای در حال بررسی</h2>
      
      {/* Items Count Info */}
      {allMovies.length > 0 && (
        <div className="pagination-info">
          {formatNumber(allMovies.length)} فیلم نمایش داده شده
          {pagination && (
            <span> از {formatNumber(pagination.totalCount)} فیلم کل</span>
          )}
        </div>
      )}
      
      <div className="movie-grid">
        {allMovies.map((movie: Movie) => (
          <MovieCard
            key={movie._id}
            movie={movie}
            onVote={() => handleVote(movie._id)}
          />
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      {hasMorePages && (
        <div ref={observerRef} className="infinite-scroll-trigger">
          {isLoadingMore && (
            <div className="loading-more">
              <Loader2 className="animate-spin" size={24} />
              <p>در حال بارگذاری بیشتر...</p>
            </div>
          )}
          
          {/* Manual Load More Button for Testing */}
          {!isLoadingMore && (
            <button 
              className="manual-load-more-btn"
              onClick={() => loadMoreMovies()}
            >
              بارگذاری بیشتر ({currentPage + 1})
            </button>
          )}
        </div>
      )}

      {/* End of Content */}
      {!hasMorePages && allMovies.length > 0 && (
        <div className="end-of-content">
          <p>تمام محتواها نمایش داده شدند</p>
        </div>
      )}
    </div>
  );
};

export default MovieGrid;
