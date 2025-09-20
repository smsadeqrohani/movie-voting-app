import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import SearchBox from './components/SearchBox';
import MovieGrid from './components/MovieGrid';
import SpecialMoviesGrid from './components/SpecialMoviesGrid';
import AdminPage from './pages/AdminPage';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './contexts/ThemeContext';

const convex = new ConvexReactClient(process.env.REACT_APP_CONVEX_URL!);

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'special'>('all');
  const location = useLocation();

  // Don't show tabs on admin page
  if (location.pathname === '/admin') {
    return <AdminPage />;
  }

  return (
    <div className="App" dir="rtl">
      <ThemeToggle />
      <header className="app-header">
        <h1 className="app-title">سیستم درخواست محتوا</h1>
        <p className="app-subtitle">لینک IMDb فیلم یا سریال مورد نظر خود را وارد کنید</p>
        <nav className="main-navigation">
          <Link to="/" className="nav-link">صفحه اصلی</Link>
          <Link to="/admin" className="nav-link admin-link">پنل مدیریت</Link>
        </nav>
      </header>
      
      <main className="app-main">
        <SearchBox />
        
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            در حال بررسی
          </button>
          <button 
            className={`tab-button ${activeTab === 'special' ? 'active' : ''}`}
            onClick={() => setActiveTab('special')}
          >
            بررسی شده
          </button>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'all' ? <MovieGrid /> : <SpecialMoviesGrid />}
      </main>
    </div>
  );
};

function App() {
  return (
    <ConvexProvider client={convex}>
      <ThemeProvider>
        <Router>
          <MainContent />
          <ToastContainer 
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={true}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </Router>
      </ThemeProvider>
    </ConvexProvider>
  );
}

export default App;
