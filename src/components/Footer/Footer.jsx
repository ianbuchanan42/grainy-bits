import styles from './Footer.module.css'
import instagramIcon from '../../assets/instagram-round.svg'
import instagramIconBlack from '../../assets/instagram-round-black.svg'

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.brand}>
          <p className={styles.copyright}>&copy; 2024 Grainy Bits Photography</p>
          <p className={styles.photographer}>Photography by Maggie Carey</p>
        </div>
        
        <div className={styles.social}>
          <a 
            href="https://www.instagram.com/grainy_bits/" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.instagramLink}
            aria-label="Follow Grainy Bits on Instagram"
          >
            <img 
              src={instagramIcon} 
              alt=""
              className={styles.instagramIcon}
            />
            <img 
              src={instagramIconBlack} 
              alt=""
              className={styles.instagramIconHover}
            />
            <span className={styles.instagramText}>@grainy_bits</span>
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
