import { useState, useMemo, useRef, useEffect } from 'react';
import { getImagesForCategory } from '../../data/images';
import styles from './Gallery.module.css';

// Cache for gallery images - shared across all Gallery instances
const imageCache = new Map();

// Initialize cache for all categories immediately (runs once)
const initializeCache = () => {
  const categories = ['dance', 'wedding', 'art'];
  categories.forEach((cat) => {
    if (!imageCache.has(cat)) {
      try {
        const categoryImages = getImagesForCategory(cat);
        imageCache.set(cat, categoryImages);
      } catch (error) {
        console.error(`Error loading ${cat} images:`, error);
        imageCache.set(cat, []);
      }
    }
  });
};

// Initialize cache on module load
initializeCache();

const Gallery = ({ category, isActive }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const gridRef = useRef(null);
  const observerRef = useRef(null);

  // Get images from cache synchronously - no state updates, no re-renders
  const galleryImages = useMemo(() => {
    const cached = imageCache.get(category) || [];
    return cached.filter((img) => img.url && !img.isHero);
  }, [category]);

  // Professional lazy loading with Intersection Observer
  // Only loads images when panel is active AND images are visible
  useEffect(() => {
    if (!isActive || !gridRef.current) return;

    const imageElements = gridRef.current.querySelectorAll('img[data-src]');

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create intersection observer with aggressive root margin for smoother loading
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            // Use requestIdleCallback to defer loading during user interaction
            if ('requestIdleCallback' in window) {
              requestIdleCallback(
                () => {
                  if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                  }
                },
                { timeout: 1000 }
              );
            } else {
              // Fallback for browsers without requestIdleCallback
              setTimeout(() => {
                if (img.dataset.src) {
                  img.src = img.dataset.src;
                  img.removeAttribute('data-src');
                }
              }, 0);
            }
            observerRef.current.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading slightly before visible
        threshold: 0.01,
      }
    );

    // Observe all images with data-src
    imageElements.forEach((img) => {
      observerRef.current.observe(img);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isActive, galleryImages.length]);

  return (
    <div className={styles.gallery}>
      <div className={styles.galleryHeader}>
        <h2 className={styles.galleryTitle}>
          {category.charAt(0).toUpperCase() + category.slice(1)} Gallery
        </h2>
        {galleryImages.length > 0 ? (
          <p className={styles.imageCount}>{galleryImages.length} images</p>
        ) : (
          <p className={styles.loadingText}>Loading...</p>
        )}
      </div>

      <div className={styles.grid} ref={gridRef}>
        {/* First 6 images - load immediately when panel is active, otherwise defer */}
        {galleryImages.slice(0, 6).map((image, index) => (
          <div
            key={image.filename}
            className={styles.imageContainer}
            onClick={() => setSelectedImage(image.url)}
          >
            {isActive ? (
              <img
                src={image.url}
                alt={image.alt || `${category} photography ${index + 1}`}
                className={styles.image}
                loading='eager'
                decoding='async'
              />
            ) : (
              <img
                data-src={image.url}
                alt={image.alt || `${category} photography ${index + 1}`}
                className={styles.image}
                decoding='async'
              />
            )}
          </div>
        ))}

        {/* Remaining images - lazy load only when visible and panel is active */}
        {galleryImages.slice(6).map((image, index) => (
          <div
            key={image.filename}
            className={styles.imageContainer}
            onClick={() => setSelectedImage(image.url)}
          >
            <img
              data-src={isActive ? image.url : undefined}
              alt={image.alt || `${category} photography ${index + 7}`}
              className={styles.image}
              decoding='async'
            />
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className={styles.modal} onClick={() => setSelectedImage(null)}>
          <div className={styles.modalContent}>
            <img
              src={selectedImage}
              alt='Full size'
              className={styles.modalImage}
            />
            <button
              className={styles.closeButton}
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
