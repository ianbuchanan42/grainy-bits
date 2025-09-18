import { useState } from 'react'
import styles from './Navigation.module.css'

const Navigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'dance', label: 'Dance' },
    { id: 'wedding', label: 'Wedding' },
    { id: 'art', label: 'Art' }
  ]

  return (
    <nav className={styles.navigation}>
      <div className={styles.tabList}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}

export default Navigation
