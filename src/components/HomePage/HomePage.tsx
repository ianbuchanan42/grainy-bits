import { useMemo } from 'react';
import { getAllImages, shuffleArray } from '../../data/helper';
import styles from './HomePage.module.scss';
import { ImageData } from '../../types';
import useStaggeredImageReveal from '../../hooks/useStaggeredImageReveal';
import homeData from '../../data/home.json';

const HomePage = () => {
  // Get random banner images that persist for the session
  const bannerImages = useMemo<ImageData[]>(() => {
    const sessionKey = 'grainy-bits-banner-images';
    const stored = sessionStorage.getItem(sessionKey);

    if (stored) {
      try {
        return JSON.parse(stored) as unknown as ImageData[];
      } catch {
        // If parsing fails, generate new ones
      }
    }

    // Get all images and shuffle them
    const allImages = getAllImages();
    const shuffled = shuffleArray(allImages);
    // Select 6 random images for the banner
    const selected = shuffled.slice(0, 6);

    // Store in sessionStorage so they persist during this session
    sessionStorage.setItem(sessionKey, JSON.stringify(selected));
    return selected;
  }, []);

  const { isVisible } = useStaggeredImageReveal(bannerImages);

  return (
    <div className={styles.homeContent}>
      <div className={styles.content}>
        <p className={styles.description}>
          Welcome to my photography portfolio.
        </p>
      </div>
      <div className={styles.banner}>
        {bannerImages.map((image, index) => (
          <div
            key={`${image.category}-${image.filename}`}
            className={styles.bannerImageContainer}
          >
            {/**
             * Only fade images in once they have finished loading, in a random order.
             * Keeps the grid lively while avoiding blank slots for slow-loading assets.
             */}
            <img
              src={image.url}
              alt={image.alt || `Photography by Maggie Carey ${index + 1}`}
              className={`${styles.bannerImage} ${
                isVisible(image.url) ? styles.bannerImageVisible : ''
              }`}
              loading='eager'
              decoding='async'
            />
          </div>
        ))}
      </div>

      {/* Book Highlight Section */}
      <div className={styles.bookSection}>
        <div className={styles.bookContainer}>
          <div className={styles.bookCover}>
            <img
              src={homeData.book.url}
              alt={homeData.book.alt}
              className={styles.bookImage}
            />
          </div>
          <div className={styles.bookDetails}>
            <h2 className={styles.bookTitle}>Grainy Bits: Volume 1</h2>
            <p className={styles.bookSubtitle}>
              Film Photography by Maggie Carey
            </p>
            <p className={styles.bookAuthor}>by Maggie Carey</p>

            <div className={styles.bookSpecs}>
              <p className={styles.bookSpec}>Softcover</p>
              <p className={styles.bookSpec}>
                Flexible, high-gloss laminated cover
              </p>
              <p className={styles.bookPrice}>US $35.00</p>
            </div>

            <div className={styles.bookDescription}>
              <h3 className={styles.bookDescriptionTitle}>About the Book</h3>
              <p className={styles.bookDescriptionText}>
                My name is Maggie Carey and I am a professional ballet dancer in
                San Francisco. I feel so fortunate to be able to capture and
                share the parts of my career that people don't always see on
                stage — the rehearsals, backstage, the dressing rooms. It gives
                a very short career the ability to live on forever. I have
                always romanticized film photography and the ability to freeze
                moments in time exactly as I remember them - sometimes they are
                even better than I recall.
              </p>
            </div>

            <a
              href='https://www.blurb.com/b/11566336-grainy-bits-volume-1'
              target='_blank'
              rel='noopener noreferrer'
              className={styles.bookButton}
            >
              Purchase Book
            </a>
          </div>
        </div>
      </div>

      {/* Featured Article Section */}
      <div className={styles.articleSection}>
        <div className={styles.articleContainer}>
          <div className={styles.articleContent}>
            <div className={styles.articleHeader}>
              <h2 className={styles.articleTitle}>Featured Article</h2>
              <p className={styles.articleSubtitle}>
                Behind the Curtains: Documenting Ballet on Film
              </p>
            </div>

            <div className={styles.articleDescription}>
              <p className={styles.articleText}>
                Maggie Carey was recently featured in Lomography Magazine,
                sharing her journey as a professional ballet dancer and film
                photographer. The article explores how she documents the
                intimate moments of ballet life — from rehearsals to backstage
                preparations — using various Lomography film stocks including
                Earl Grey B&W, LomoChrome Purple, and Lomography Color Negative
                400.
              </p>

              <blockquote className={styles.articleQuote}>
                "The career of a ballet dancer is so fleeting, and through
                photography I am able to document and freeze moments in time
                exactly as I remember them."
              </blockquote>

              <p className={styles.articleText}>
                Read the full interview to learn about Maggie's creative
                process, her favorite Lomography films, and how her dual careers
                in ballet and photography complement each other.
              </p>
            </div>

            <a
              href='https://www.lomography.com/magazine/352618-behind-the-curtains-documenting-ballet-on-film-with-maggie-carey'
              target='_blank'
              rel='noopener noreferrer'
              className={styles.articleButton}
            >
              Read Full Article
            </a>
          </div>

          <div className={styles.articleImage}>
            <img
              src={homeData.lomography.url}
              alt={homeData.lomography.alt}
              className={styles.articleImagePhoto}
            />
            <p className={styles.articleImageCaption}>
              taken on Earl Grey 100 and Lomo 400 35mm film.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
