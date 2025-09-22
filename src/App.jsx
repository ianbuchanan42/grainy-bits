import { useState } from 'react';
import Navigation from './components/Navigation/Navigation';
import Gallery from './components/Gallery/Gallery';
import Footer from './components/Footer/Footer';
import logoImage from './assets/logo.png';
import styles from './App.module.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Grainy Bits</h1>
        <img src={logoImage} alt='Grainy Bits Logo' className={styles.logo} />
        <p className={styles.subtitle}>Photography by Maggie Carey</p>
      </header>

      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />

      <main className={styles.main}>
        <Gallery category={activeTab} />
      </main>

      <Footer />
    </div>
  );
}

export default App;
