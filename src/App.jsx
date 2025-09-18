import { useState } from 'react'
import styles from './App.module.css'
import Navigation from './components/Navigation/Navigation'
import Gallery from './components/Gallery/Gallery'

function App() {
  const [activeTab, setActiveTab] = useState('home')

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className={styles.homeContent}>
            <div className={styles.heroImage}>
              <img 
                src="https://afziltusqfvlckjbgkil.supabase.co/storage/v1/object/public/grainy-bits/Home/000057380024.jpg"
                alt="Grainy Bits Photography"
                className={styles.mainImage}
              />
            </div>
            
            <div className={styles.content}>
              <p className={styles.description}>
                Capturing moments in black and white film. 
                <br />
                Simple. Authentic. Timeless.
              </p>
            </div>
          </div>
        )
      case 'dance':
      case 'wedding':
      case 'art':
        return <Gallery category={activeTab} />
      default:
        return null
    }
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Grainy Bits</h1>
        <p className={styles.subtitle}>Photography by Maggie Carey</p>
      </header>
      
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className={styles.main}>
        {renderContent()}
      </main>
      
      <footer className={styles.footer}>
        <p>&copy; 2024 Grainy Bits Photography</p>
      </footer>
    </div>
  )
}

export default App
