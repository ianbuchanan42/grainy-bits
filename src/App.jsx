import { useState, useCallback, memo, useRef } from 'react';
import Navigation from './components/Navigation/Navigation';
import HomePage from './components/HomePage/HomePage';
import Gallery from './components/Gallery/Gallery';
import FilmPage from './components/FilmPage/FilmPage';
import Footer from './components/Footer/Footer';
import logoImage from './assets/logo.png';
import styles from './App.module.css';

// Memoize components to prevent re-renders when switching tabs
const MemoizedHomePage = memo(HomePage);
const MemoizedGallery = memo(Gallery);
const MemoizedFilmPage = memo(FilmPage);

function App() {
  const [activeTab, setActiveTab] = useState('home');

  // Use refs to directly manipulate DOM - bypasses React reconciliation
  const panelsRef = useRef({
    home: null,
    dance: null,
    wedding: null,
    art: null,
    videos: null,
  });

  // Direct DOM manipulation for instant tab switching - bypasses React render cycle
  const handleTabChange = useCallback((tabId) => {
    // Update state for Navigation (urgent - user needs feedback)
    setActiveTab(tabId);

    // Directly toggle classes on DOM using refs - instant, no React reconciliation
    // This happens synchronously before React's render cycle
    Object.keys(panelsRef.current).forEach((tab) => {
      const panel = panelsRef.current[tab];
      if (panel) {
        if (tab === tabId) {
          panel.classList.add(styles.active);
        } else {
          panel.classList.remove(styles.active);
        }
      }
    });
  }, []);

  return (
    <div className={styles.app}>
      <header className={styles.header} onClick={() => handleTabChange('home')}>
        <h1 className={styles.title}>Grainy Bits</h1>
        <img src={logoImage} alt='Grainy Bits Logo' className={styles.logo} />
        <p className={styles.subtitle}>Photography by Maggie Carey</p>
      </header>

      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />

      <main className={styles.main}>
        {/* Render all panels simultaneously, refs allow direct DOM manipulation */}
        <div
          ref={(el) => (panelsRef.current.home = el)}
          className={`${styles.contentPanel} ${
            activeTab === 'home' ? styles.active : ''
          }`}
        >
          <MemoizedHomePage />
        </div>
        <div
          ref={(el) => (panelsRef.current.dance = el)}
          className={`${styles.contentPanel} ${
            activeTab === 'dance' ? styles.active : ''
          }`}
        >
          <MemoizedGallery category='dance' isActive={activeTab === 'dance'} />
        </div>
        <div
          ref={(el) => (panelsRef.current.wedding = el)}
          className={`${styles.contentPanel} ${
            activeTab === 'wedding' ? styles.active : ''
          }`}
        >
          <MemoizedGallery
            category='wedding'
            isActive={activeTab === 'wedding'}
          />
        </div>
        <div
          ref={(el) => (panelsRef.current.art = el)}
          className={`${styles.contentPanel} ${
            activeTab === 'art' ? styles.active : ''
          }`}
        >
          <MemoizedGallery category='art' isActive={activeTab === 'art'} />
        </div>
        <div
          ref={(el) => (panelsRef.current.videos = el)}
          className={`${styles.contentPanel} ${
            activeTab === 'videos' ? styles.active : ''
          }`}
        >
          <MemoizedFilmPage isActive={activeTab === 'videos'} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
