import { useState, useMemo, useRef, useCallback } from 'react';
import { getImagesForCategory, CATEGORIES } from '../../data/helper';
import GalleryImageItem from './components/GalleryImageItem';
import ImageModal from './components/ImageModal';
import useLazyImageObserver from './hooks/useLazyImageObserver';
import styles from './Gallery.module.scss';
import { ImageData, Category } from '../../types';

const imageCache = new Map<Category, ImageData[]>();

const loadedImagesSet = new Set<string>();

const initializeCache = () => {
  CATEGORIES.forEach((cat) => {
    if (!imageCache.has(cat)) {
      try {
        const categoryImages = getImagesForCategory(cat) as ImageData[];
        imageCache.set(cat, categoryImages);
      } catch (error) {
        console.error(`Error loading ${cat} images:`, error);
        imageCache.set(cat, []);
      }
    }
  });
};

initializeCache();

interface GalleryProps {
  category: Category;
  isActive: boolean;
}

const Gallery = ({ category, isActive }: GalleryProps) => {
  /**
   * - Use URL hash/query params for shareable image links
   * - Use React Context if modal needs to persist across tabs
   * - Use history API for back button support
   */
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageClick = useCallback((url: string) => {
    setSelectedImage(url);
  }, []);

  const handleImageLoad = useCallback((url: string) => {
    if (!loadedImagesSet.has(url)) {
      loadedImagesSet.add(url);
    }
  }, []);

  const gridRef = useRef<HTMLDivElement>(null);

  const galleryImages = useMemo(() => {
    const cached = imageCache.get(category) || [];
    return cached;
  }, [category]);

  /**
   * useLazyImageObserver keeps the heavy IntersectionObserver wiring out of the
   * render body. We pass:
   * - gridRef: root element containing lazy images
   * - isActive: prevents work when the tab is hidden
   * - loadedImagesSet: shared cache so images persist across tab switches
   * - dependencies: galleryImages.length so new assets get observed
   *
   * ✅ Pros: Clears 100+ lines from the component, centralises tuning, and makes
   * testing / reuse easier (other galleries can opt-in).
   * ⚠️ Cons: Adds an indirection layer—investigate the hook when debugging, and
   * we still rely on the mutable shared Set (documented inside the hook).
   */
  useLazyImageObserver({
    containerRef: gridRef,
    isActive,
    loadedImages: loadedImagesSet,
    dependencies: [galleryImages.length],
  });

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
          const isLoaded = image.url ? loadedImagesSet.has(image.url) : false;

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
