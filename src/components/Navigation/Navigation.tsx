import { useState, MouseEvent } from 'react';
import styles from './Navigation.module.scss';
import { TabId } from '../../types';

interface NavigationProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

interface Tab {
  id: TabId;
  label: string;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs: Tab[] = [
    { id: 'home', label: 'Home' },
    { id: 'dance', label: 'Dance' },
    { id: 'wedding', label: 'Wedding' },
    { id: 'art', label: 'Art' },
    { id: 'videos', label: 'Dance Films' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleTabClick = (tabId: TabId) => {
    onTabChange(tabId);
    setIsMenuOpen(false); // Close menu when tab is selected
  };

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
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

