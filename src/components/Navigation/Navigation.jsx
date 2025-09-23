import { useState } from 'react';
import styles from './Navigation.module.css';

const Navigation = ({ activeTab, onTabChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'dance', label: 'Dance' },
    { id: 'wedding', label: 'Wedding' },
    { id: 'art', label: 'Art' },
    { id: 'videos', label: 'Dance Films' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
    setIsMenuOpen(false); // Close menu when tab is selected
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className={styles.navigation}>
      <div className={styles.navContainer}>
        <div className={styles.tabList}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${
                activeTab === tab.id ? styles.active : ''
              }`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Hamburger Menu Button */}
        <button
          className={`${styles.hamburger} ${
            isMenuOpen ? styles.hamburgerOpen : ''
          }`}
          onClick={toggleMenu}
          aria-label='Toggle navigation menu'
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`${styles.mobileMenu} ${
          isMenuOpen ? styles.mobileMenuOpen : ''
        }`}
        onClick={handleOverlayClick}
      >
        <div className={styles.mobileMenuContent}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.mobileTab} ${
                activeTab === tab.id ? styles.mobileTabActive : ''
              }`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
