import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { getImagesForCategory, CATEGORIES } from '../../data/helper';
import GalleryImageItem from './components/GalleryImageItem';
import ImageModal from './components/ImageModal';
import styles from './Gallery.module.css';

const imageCache = new Map();

const loadedImagesSet = new Set();

const initializeCache = () => {
  CATEGORIES.forEach((cat) => {
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

initializeCache();

const Gallery = ({ category, isActive }) => {
  /**
   * - Use URL hash/query params for shareable image links
   * - Use React Context if modal needs to persist across tabs
   * - Use history API for back button support
   */
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = useCallback((url) => {
    setSelectedImage(url);
  }, []);

  const handleImageLoad = useCallback((url) => {
    if (!loadedImagesSet.has(url)) {
      loadedImagesSet.add(url);
    }
  }, []);

  const gridRef = useRef(null);

  const observerRef = useRef(null);

  const galleryImages = useMemo(() => {
    const cached = imageCache.get(category) || [];
    return cached;
  }, [category]);

  /**
   * - Observer persists even when tab inactive (minor memory)
   * - Effect runs on every isActive/galleryImages.length change
   * - querySelectorAll runs on every effect (could be optimized)
   * - No error handling for failed image loads
   * - No priority system (all images treated equally)
   *
   * BETTER SOLUTIONS:
   * - Use React 18 useDeferredValue for lower priority loading
   * - Implement image priority queue (load visible first, then nearby)
   * - Add error retry with exponential backoff
   * - Use native lazy loading with loading="lazy" (simpler, but less control)
   * - Implement progressive image loading (blur-up technique)
   * - Use Web Workers for image processing/optimization
   * - Add network-aware loading (reduce quality on slow connections)
   */
  useEffect(() => {
    const gridElement = gridRef.current;

    if (!isActive || !gridElement) {
      // Don't disconnect observer when inactive - keep it ready
      // PRO: Instant response when tab becomes active
      // CON: Observer stays in memory (minor)
      return;
    }
    /**
     * DOM QUERY STRATEGY
     *
     * USE REFS FOR EACH IMAGE (Most React-like)
     *    - Store refs in GalleryImageItem components
     *    - Pass refs up to parent via callback ref
     *    - PRO: No DOM queries, direct element access
     *    - CON: More complex, requires ref management
 
     *
     * NATIVE LAZY LOADING (Simplest)
     *    - Use loading="lazy" on all images
     *    - Let browser handle it
     *    - PRO: Zero JavaScript overhead
     *    - CON: Less control, can't customize loading behavior
     *
     */
    const imageElements = gridElement.querySelectorAll('img[data-src]');

    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              const imageUrl = img.dataset.src;

              if (!imageUrl || loadedImagesSet.has(imageUrl) || img.src) {
                observerRef.current?.unobserve(img);
                return;
              }

              // Mark as loading immediately to prevent race conditions
              // PRO: Prevents multiple observers from loading same image
              // CON: Marks as loaded before actual load (could fail)
              loadedImagesSet.add(imageUrl);

              /**
               * IDLE-TIME LOADING
               *
               * Loads image during browser idle time to avoid blocking UI.
               *
               * PROS:
               * - Doesn't block user interactions
               * - Smooth scrolling experience
               * - Respects browser's main thread
               *
               * CONS:
               * - requestIdleCallback not available in all browsers
               * - 2 second timeout might be too long for fast connections
               * - setTimeout fallback (100ms) still blocks briefly
               *
               * BETTER SOLUTIONS:
               * - Use scheduler.postTask() for better task prioritization
               * - Implement adaptive delays based on connection speed
               * - Use fetch priority hints when available
               */
              const loadImage = () => {
                // Double-check it's still needed (element might have changed)
                if (img.dataset.src === imageUrl && !img.src) {
                  img.src = imageUrl;
                  img.removeAttribute('data-src');
                }
                observerRef.current?.unobserve(img);
              };

              if ('requestIdleCallback' in window) {
                // Modern browsers - use idle callback
                requestIdleCallback(loadImage, { timeout: 2000 });
              } else {
                // Fallback: use setTimeout with delay to avoid blocking
                setTimeout(loadImage, 100);
              }
            }
          });
        },
        {
          rootMargin: '100px', // Start loading 100px before visible
          // PRO: Smoother scrolling, images ready when needed
          // CON: Loads more images than immediately visible (bandwidth)
          threshold: 0.01, // Trigger when 1% visible
        }
      );
    }

    /**
     * SELECTIVE OBSERVATION
     *
     * Only observes images that:
     * - Have data-src attribute
     * - Haven't been loaded yet (not in loadedImagesSet)
     * - Don't already have src set
     *
     * PROS:
     * - Prevents unnecessary observation
     * - Skips already-loaded images
     *
     * CONS:
     * - Runs on every effect (could be optimized with Set diff)
     * - No cleanup of old observations
     */
    imageElements.forEach((img) => {
      const imageUrl = img.dataset.src;
      // Only observe if not already loaded and has data-src
      if (imageUrl && !loadedImagesSet.has(imageUrl) && !img.src) {
        observerRef.current.observe(img);
      }
    });

    /**
     * CLEANUP FUNCTION
     *
     * Handles cleanup when tab becomes inactive or effect dependencies change.
     *
     * STRATEGY:
     * - Unobserve all images when tab becomes inactive (free observer resources)
     * - Keep observer alive for next activation (performance optimization)
     *
     * PROS:
     * - Frees observer resources when tab inactive (images not being watched)
     * - Observer stays ready for next activation (no recreation overhead)
     * - Prevents memory leaks from observing hidden images
     *
     * CONS:
     * - Observer still exists in memory (but lightweight, minimal overhead)
     * - Images need to be re-observed when tab becomes active (minor cost)
     *
     * NOTE: In this app, Gallery components never truly unmount (they use visibility CSS),
     * so we don't need to disconnect the observer. If component structure changes,
     * we could add unmount detection by checking if gridElement still exists in DOM.
     */
    return () => {
      if (!observerRef.current || !gridElement) return;

      // Unobserve all images when tab becomes inactive
      // This frees observer resources while keeping observer ready for next activation
      const allObservedImages = gridElement.querySelectorAll('img[data-src]');
      allObservedImages.forEach((img) => {
        observerRef.current?.unobserve(img);
      });
    };
  }, [isActive, galleryImages.length]); // Re-runs when active state or image count changes

  const title =
    category.charAt(0).toUpperCase() + category.slice(1) + ' Gallery';
  const count = `${galleryImages.length} images`;

  return (
    <div className={styles.gallery}>
      <div className={styles.galleryHeader}>
        <h2 className={styles.galleryTitle}>{title}</h2>
        {galleryImages.length > 0 ? (
          <p className={styles.imageCount}>{count}</p>
        ) : (
          <p className={styles.loadingText}>Loading...</p>
        )}
      </div>

      <div className={styles.grid} ref={gridRef}>
        {galleryImages.map((image, index) => {
          // Check if image has been loaded before (persists across tab switches)
          const isLoaded = loadedImagesSet.has(image.url);

          return (
            <GalleryImageItem
              key={image.filename}
              image={image}
              index={index}
              category={category}
              isActive={isActive}
              isLoaded={isLoaded}
              onImageClick={handleImageClick}
              onImageLoad={handleImageLoad}
            />
          );
        })}
      </div>

      {/* Enhanced Image Modal with navigation and keyboard support */}
      <ImageModal
        imageUrl={selectedImage}
        images={galleryImages}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
};

export default Gallery;
