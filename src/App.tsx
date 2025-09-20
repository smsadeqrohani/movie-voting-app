import React, { useState } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import SearchBox from './components/SearchBox';
import MovieGrid from './components/MovieGrid';
import SpecialMoviesGrid from './components/SpecialMoviesGrid';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './contexts/ThemeContext';

const convex = new ConvexReactClient(process.env.REACT_APP_CONVEX_URL!);

function App() {
  const [activeTab, setActiveTab] = useState<'all' | 'special'>('all');

  return (
    <ConvexProvider client={convex}>
      <ThemeProvider>
        <div className="App" dir="rtl">
          <ThemeToggle />
          <header className="app-header">
            <h1 className="app-title">سیستم درخواست محتوا</h1>
            <p className="app-subtitle">لینک IMDb فیلم یا سریال مورد نظر خود را وارد کنید</p>
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
        </div>
      </ThemeProvider>
    </ConvexProvider>
  );
}

export default App;
