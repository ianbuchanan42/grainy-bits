import { useMemo, useEffect, useState } from 'react';
import { getImagesForCategory } from '../../data/helper';
import styles from './FilmPage.module.scss';
import { VideoData } from '../../types';
import useVisibilityObserver from '../../hooks/useVisibilityObserver';

interface FilmPageProps {
  isActive: boolean;
}

// Cache videos - load once at module init
const videoCache = (() => {
  try {
    return getImagesForCategory('videos') as VideoData[];
  } catch (error) {
    console.error('Error loading videos:', error);
    return [];
  }
})();

const FilmPage = ({ isActive }: FilmPageProps) => {
  // Get videos from cache - no state, no re-renders
  const videos = useMemo(() => videoCache, []);
  const { registerElement: registerVideoRef, isVisible: isVideoVisible } =
    useVisibilityObserver<string>({
      isActive,
      rootMargin: '100px 0px',
      threshold: 0.25,
    });

  // Fallback: ensure videos load after a short delay when tab is active
  // This helps with IntersectionObserver timing issues in production
  const [forceLoad, setForceLoad] = useState(false);
  useEffect(() => {
    if (isActive) {
      // Give IntersectionObserver a chance, then force load if needed
      const timer = setTimeout(() => {
        setForceLoad(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setForceLoad(false);
    }
  }, [isActive]);

  return (
    <div className={styles.videosSection}>
      <div className={styles.videosContainer}>
        <h2 className={styles.videosTitle}>Dance Films</h2>
        <p className={styles.videosSubtitle}>
          A collection of choreographed dance pieces and artistic collaborations
        </p>

        <div className={styles.videosGrid}>
          {videos.map((video) => (
            <div
              key={video.id}
              className={styles.videoCard}
              ref={(el) => registerVideoRef(video.id, el)}
            >
              <div className={styles.videoPlayer}>
                {/* Only load iframe src when panel is active - prevents YouTube from loading */}
                {isActive && (isVideoVisible(video.id) || forceLoad) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}?enablejsapi=1`}
                    title={video.title}
                    frameBorder='0'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
                    className={styles.videoIframe}
                    loading='lazy'
                  ></iframe>
                ) : (
                  <div className={styles.videoPlaceholder}></div>
                )}
              </div>

              <div className={styles.videoContent}>
                <h3 className={styles.videoTitle}>{video.title}</h3>
                <p className={styles.videoDescription}>{video.description}</p>

                {video.credits && (
                  <div className={styles.videoCredits}>
                    <h4 className={styles.creditsTitle}>Credits</h4>
                    <div className={styles.creditsList}>
                      {Object.entries(video.credits).map(([key, value]) => (
                        <div key={key} className={styles.creditItem}>
                          <span className={styles.creditLabel}>
                            {key.charAt(0).toUpperCase() +
                              key.slice(1).replace(/([A-Z])/g, ' $1')}
                            :
                          </span>
                          <span className={styles.creditValue}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {video.location && (
                  <div className={styles.videoLocation}>
                    <strong>Location:</strong> {video.location}
                  </div>
                )}

                {video.locations && (
                  <div className={styles.videoLocations}>
                    <strong>Locations:</strong> {video.locations.join(', ')}
                  </div>
                )}

                {video.poem && (
                  <div className={styles.videoPoem}>
                    <h4 className={styles.poemTitle}>{video.poem.title}</h4>
                    <p className={styles.poemAuthor}>by {video.poem.author}</p>
                    <p className={styles.poemCopyright}>
                      {video.poem.copyright}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilmPage;

