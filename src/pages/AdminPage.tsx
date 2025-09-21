import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { api } from '../convex/_generated/api';
import { getCleanErrorMessage } from '../utils/errorUtils';
import { Loader2, Check, X, ExternalLink, Home, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import moment from 'moment-jalaali';
import ThemeToggle from '../components/ThemeToggle';
import './AdminPage.css';

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

const AdminPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // تعداد آیتم در هر صفحه
  
  // Use server-side pagination
  const moviesData = useQuery(api.movies.getMoviesForAdminPaginated, {
    page: currentPage,
    limit: itemsPerPage,
    searchTerm: searchTerm || undefined,
  });
  
  const updateSpecialProperties = useMutation(api.movies.updateMovieSpecialProperties);
  
  // Get total count for stats (separate query for better performance)
  const allMovies = useQuery(api.movies.getAllMoviesForAdmin);

  const handleUpdateSpecialProperties = async (
    movieId: string, 
    isDouble?: boolean, 
    hasSubtitle?: boolean, 
    hasContentIssue?: boolean
  ) => {
    try {
      await updateSpecialProperties({
        movieId: movieId as any,
        isDouble,
        hasSubtitle,
        hasContentIssue,
      });
      toast.success('وضعیت فیلم به‌روزرسانی شد! ✅');
    } catch (error: any) {
      console.error('Error updating special properties:', error);
      const cleanMessage = getCleanErrorMessage(error);
      toast.error(cleanMessage);
    }
  };

  const formatDate = (timestamp: number) => {
    const jalaaliDate = moment(timestamp).format('jYYYY/jMM/jDD');
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

  // Extract data from server response
  const movies = moviesData?.movies || [];
  const pagination = moviesData?.pagination;

  // Reset to first page when search term changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (moviesData === undefined || allMovies === undefined) {
    return (
      <div className="admin-loading">
        <Loader2 className="animate-spin" size={32} />
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="header-controls">
        <Link to="/" className="back-to-main-btn">
          <Home size={16} />
          بازگشت به صفحه اصلی
        </Link>
        <ThemeToggle />
      </div>
      
      <div className="admin-header">
        <h1>پنل مدیریت</h1>
        <p>مدیریت محتوای درخواستی</p>
      </div>

      <div className="search-container">
        <div className="search-box">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="جستجو در نام فیلم، سال یا IMDb ID..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="search-results-info">
          {searchTerm ? (
            <>
              {formatNumber(pagination?.totalCount || 0)} نتیجه از {formatNumber(allMovies.length)} فیلم
              {(pagination?.totalPages || 0) > 1 && (
                <span className="pagination-info">
                  {' '}• صفحه {formatNumber(pagination?.currentPage || 1)} از {formatNumber(pagination?.totalPages || 1)}
                </span>
              )}
            </>
          ) : (
            <>
              {formatNumber(allMovies.length)} فیلم کل
              {(pagination?.totalPages || 0) > 1 && (
                <span className="pagination-info">
                  {' '}• صفحه {formatNumber(pagination?.currentPage || 1)} از {formatNumber(pagination?.totalPages || 1)}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <h3>کل محتواها</h3>
          <span className="stat-number">{formatNumber(allMovies.length)}</span>
        </div>
        <div className="stat-card">
          <h3>در حال بررسی</h3>
          <span className="stat-number">{formatNumber(allMovies.filter((m: Movie) => 
            m.isDouble !== true && m.hasSubtitle !== true && m.hasContentIssue !== true
          ).length)}</span>
        </div>
        <div className="stat-card">
          <h3>بررسی شده</h3>
          <span className="stat-number">{formatNumber(allMovies.filter((m: Movie) => 
            m.isDouble === true || m.hasSubtitle === true || m.hasContentIssue === true
          ).length)}</span>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>عنوان</th>
              <th>سال</th>
              <th>رأی</th>
              <th>تاریخ درخواست</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie: Movie) => (
              <tr key={movie._id}>
                <td className="movie-title-cell">
                  <div className="movie-title-info">
                    <h4>{movie.title}</h4>
                    <a
                      href={movie.imdbUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="imdb-link"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </td>
                <td>{movie.year}</td>
                <td className="vote-cell">
                  <span className="vote-count">{formatNumber(movie.votes)}</span>
                </td>
                <td>{formatDate(movie.addedAt)}</td>
                <td className="status-cell">
                  <div className="status-badges">
                    {movie.isDouble && (
                      <span className="status-badge double">دوبله</span>
                    )}
                    {movie.hasSubtitle && (
                      <span className="status-badge subtitle">زیرنویس</span>
                    )}
                    {movie.hasContentIssue && (
                      <span className="status-badge issue">مشکل</span>
                    )}
                    {!movie.isDouble && !movie.hasSubtitle && !movie.hasContentIssue && (
                      <span className="status-badge pending">در انتظار</span>
                    )}
                  </div>
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button
                      className={`action-btn ${movie.isDouble ? 'active' : ''}`}
                      onClick={() => handleUpdateSpecialProperties(
                        movie._id,
                        !movie.isDouble,
                        movie.hasSubtitle,
                        movie.hasContentIssue
                      )}
                      title="دوبله"
                    >
                      <Check size={14} />
                      دوبله
                    </button>
                    <button
                      className={`action-btn ${movie.hasSubtitle ? 'active' : ''}`}
                      onClick={() => handleUpdateSpecialProperties(
                        movie._id,
                        movie.isDouble,
                        !movie.hasSubtitle,
                        movie.hasContentIssue
                      )}
                      title="زیرنویس"
                    >
                      <Check size={14} />
                      زیرنویس
                    </button>
                    <button
                      className={`action-btn ${movie.hasContentIssue ? 'active' : ''}`}
                      onClick={() => handleUpdateSpecialProperties(
                        movie._id,
                        movie.isDouble,
                        movie.hasSubtitle,
                        !movie.hasContentIssue
                      )}
                      title="مشکل محتوایی"
                    >
                      <X size={14} />
                      مشکل
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Component */}
      {(pagination?.totalPages || 0) > 1 && (
        <div className="pagination-container">
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination?.hasPrevPage}
            >
              <ChevronRight size={16} />
              قبلی
            </button>
            
            <div className="pagination-numbers">
              {Array.from({ length: pagination?.totalPages || 0 }, (_, i) => i + 1).map(page => {
                // Show first few pages, last few pages, and pages around current page
                const shouldShow = 
                  page <= 3 || 
                  page >= (pagination?.totalPages || 0) - 2 || 
                  (page >= currentPage - 1 && page <= currentPage + 1);
                
                if (!shouldShow) {
                  // Show ellipsis
                  if (page === 4 && currentPage > 5) {
                    return <span key={page} className="pagination-ellipsis">...</span>;
                  }
                  if (page === (pagination?.totalPages || 0) - 3 && currentPage < (pagination?.totalPages || 0) - 4) {
                    return <span key={page} className="pagination-ellipsis">...</span>;
                  }
                  return null;
                }
                
                return (
                  <button
                    key={page}
                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {formatNumber(page)}
                  </button>
                );
              })}
            </div>
            
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination?.hasNextPage}
            >
              بعدی
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
