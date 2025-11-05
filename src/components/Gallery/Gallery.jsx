import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { getImagesForCategory, CATEGORIES } from '../../data/helper';
import GalleryImageItem from './components/GalleryImageItem';
import styles from './Gallery.module.css';

/**
 * MODULE-LEVEL CACHE SYSTEM
 *
 * Purpose: Store image metadata once at module load, shared across all Gallery instances.
 *
 * PROS:
 * - Prevents re-fetching image data on every render
 * - Shared across all Gallery components (dance, wedding, art tabs)
 * - Synchronous access - no async state management needed
 * - Memory efficient - single source of truth
 *
 * CONS:
 * - Lives in memory for entire app lifetime (won't clear until page refresh)
 * - Not reactive - won't update if image data changes without page reload
 * - Could grow large if many categories/images are added
 *
 * BETTER SOLUTIONS:
 * - Use React Context for shared cache (would allow clearing/updating)
 * - Use IndexedDB for persistent cache across sessions
 * - Implement cache expiration/eviction policy
 * - Use SWR or React Query for automatic cache management
 */
const imageCache = new Map();

/**
 * LOADED IMAGES TRACKING
 *
 * Purpose: Track which image URLs have been loaded to prevent duplicate network requests.
 *
 * PROS:
 * - Prevents reloading same image when switching tabs
 * - Simple Set lookup - O(1) performance
 * - Persists across tab switches and component re-renders
 * - Prevents browser from re-fetching cached images
 *
 * CONS:
 * - Never clears - grows indefinitely (could use memory)
 * - No distinction between categories (if same URL exists in multiple categories)
 * - Doesn't track failed loads (would retry failed images)
 *
 * BETTER SOLUTIONS:
 * - Use WeakMap keyed by Image element (auto-cleanup)
 * - Add expiration timestamps for cache invalidation
 * - Track load status (loading, loaded, error) for better UX
 * - Use Service Worker for advanced caching strategies
 */
const loadedImagesSet = new Set();

/**
 * CACHE INITIALIZATION
 *
 * Purpose: Preload all category image metadata when module first loads.
 *
 * PROS:
 * - Instant access to image data when user clicks tabs
 * - Catches errors early (before user interaction)
 * - Runs once, not on every component mount
 * - No blocking - happens during module initialization
 *
 * CONS:
 * - Loads ALL categories even if user never visits them
 * - Synchronous - if getImagesForCategory is slow, delays module load
 * - No retry mechanism if initialization fails
 * - Hardcoded category list - must update if categories change
 *
 * BETTER SOLUTIONS:
 * - Lazy load categories on first tab click
 * - Use dynamic import for category data
 * - Add retry logic with exponential backoff
 * - Fetch from API endpoint instead of static JSON
 * - Use Suspense boundaries for progressive loading
 */
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

// Initialize cache on module load (runs once when file is imported)
initializeCache();

/**
 * GALLERY COMPONENT
 *
 * Props:
 * - category: 'dance' | 'wedding' | 'art' - which gallery to display
 * - isActive: boolean - whether this tab is currently visible
 *
 * DESIGN PHILOSOPHY:
 * Optimized for smooth tab switching by minimizing re-renders and preventing
 * image reloads. Images that have loaded once stay loaded.
 */
const Gallery = ({ category, isActive }) => {
  /**
   * SELECTED IMAGE STATE
   *
   * Purpose: Track which image is clicked for modal display.
   *
   * PROS:
   * - Simple state management
   * - Local to component (no global state needed)
   *
   * CONS:
   * - Resets when component unmounts (tab switch)
   * - Could use URL state for shareable links
   *
   * BETTER SOLUTIONS:
   * - Use URL hash/query params for shareable image links
   * - Use React Context if modal needs to persist across tabs
   * - Use history API for back button support
   */
  const [selectedImage, setSelectedImage] = useState(null);

  // Memoize click handler to prevent GalleryImageItem re-renders
  const handleImageClick = useCallback((url) => {
    setSelectedImage(url);
  }, []);

  // Memoize load handler to track loaded images
  const handleImageLoad = useCallback((url) => {
    if (!loadedImagesSet.has(url)) {
      loadedImagesSet.add(url);
    }
  }, []);

  /**
   * DOM REFS
   *
   * gridRef: Reference to grid container for querying image elements
   * observerRef: Reference to IntersectionObserver instance (persists across renders)
   *
   * PROS:
   * - Direct DOM access without re-renders
   * - Observer persists - no recreation overhead
   *
   * CONS:
   * - Bypasses React's virtual DOM (less React-like)
   * - Potential for memory leaks if not cleaned up properly
   */
  const gridRef = useRef(null);
  const observerRef = useRef(null);

  /**
   * IMAGE LIST MEMOIZATION
   *
   * Purpose: Get filtered image list for current category, memoized to prevent recalculation.
   *
   * PROS:
   * - Only recalculates when category changes
   * - Synchronous access from cache (no loading state needed)
   * - Filters out invalid images early
   *
   * CONS:
   * - Filter runs on every category change (minor overhead)
   * - No loading state - assumes cache is always ready
   * - Filter logic could be moved to cache initialization
   *
   * BETTER SOLUTIONS:
   * - Pre-filter during cache initialization
   * - Add loading/error states for cache misses
   * - Use React.memo on component if parent re-renders frequently
   */
  const galleryImages = useMemo(() => {
    const cached = imageCache.get(category) || [];
    return cached;
  }, [category]);

  /**
   * INTERSECTION OBSERVER SETUP
   *
   * Purpose: Lazy load images as they enter viewport, only when tab is active.
   *
   * ARCHITECTURE DECISIONS:
   * 1. Observer persists across renders (created once, reused)
   * 2. Only observes when tab is active (saves resources)
   * 3. Checks loadedImagesSet to prevent duplicate loads
   * 4. Uses requestIdleCallback to avoid blocking UI
   *
   * PROS:
   * - Only loads images user will see
   * - Doesn't block main thread (uses idle time)
   * - Prevents duplicate network requests
   * - Observer reuse reduces overhead
   * - Early loading (100px margin) for smoother scrolling
   *
   * CONS:
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
    // Capture gridRef.current at effect start for cleanup function
    const gridElement = gridRef.current;

    // Early return if inactive - prevents unnecessary work
    if (!isActive || !gridElement) {
      // Don't disconnect observer when inactive - keep it ready
      // PRO: Instant response when tab becomes active
      // CON: Observer stays in memory (minor)
      return;
    }

    // Query all images waiting to load (those with data-src attribute)
    // PRO: Simple, direct DOM query
    // CON: Runs on every effect (could cache results)
    const imageElements = gridElement.querySelectorAll('img[data-src]');

    /**
     * OBSERVER CREATION (Single Instance Pattern)
     *
     * Only creates observer if it doesn't exist - reuses existing one.
     *
     * PROS:
     * - No recreation overhead
     * - Maintains observation state
     * - Better performance
     *
     * CONS:
     * - Observer never cleaned up (could leak if component unmounts)
     * - Shared across all Gallery instances (could conflict if multiple active)
     */
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              const imageUrl = img.dataset.src;

              /**
               * DUPLICATE LOAD PREVENTION
               *
               * Triple-check to prevent unnecessary loads:
               * 1. imageUrl exists
               * 2. Not in loadedImagesSet
               * 3. img.src not already set
               *
               * PROS:
               * - Bulletproof duplicate prevention
               * - Handles edge cases
               *
               * CONS:
               * - Multiple checks (minor overhead)
               */
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

      {
        /**
         * IMAGE MODAL
         *
         * Displays clicked image in full-screen modal overlay.
         *
         * PROS:
         * - Simple, local state management
         * - Click outside to close (good UX)
         * - Close button for explicit dismissal
         *
         * CONS:
         * - No keyboard navigation (ESC to close)
         * - No image navigation (prev/next)
         * - No zoom/pan functionality
         * - Modal image loads immediately (could be large)
         * - No loading state for modal image
         * - Resets when component unmounts (tab switch)
         *
         * BETTER SOLUTIONS:
         * - Add keyboard event listeners (ESC, arrow keys)
         * - Implement image navigation (prev/next)
         * - Add zoom/pan with touch gestures
         * - Use Intersection Observer for modal image lazy loading
         * - Implement shared element transitions
         * - Add image preloading for adjacent images
         * - Use React Portal for better modal rendering
         * - Add analytics tracking for image views
         */
        selectedImage && (
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
        )
      }
    </div>
  );
};

export default Gallery;
