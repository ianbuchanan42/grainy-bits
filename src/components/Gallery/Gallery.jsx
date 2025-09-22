import { useState, useEffect } from 'react';
import { getImagesForCategory } from '../../data/images';
import styles from './Gallery.module.css';

// Cache for all gallery images
const imageCache = new Map();
// Track preloaded images
const preloadedImages = new Set();

const Gallery = ({ category }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  useEffect(() => {
    // Always clear images first to prevent flickering
    setImages([]);

    if (category === 'home') {
      // Set loading to false immediately for home - navigation should be instant
      setLoading(false);

      // Load home image asynchronously
      setImages([
        {
          url: 'https://afziltusqfvlckjbgkil.supabase.co/storage/v1/object/public/grainy-bits/Home/000057380024.jpg',
          filename: '000057380024.jpg',
          isHero: true,
        },
      ]);

      // Load all gallery images into cache on home page (background)
      if (!allImagesLoaded) {
        loadAllGalleryImages();
      }
    } else {
      // For galleries, show loading state but don't block navigation
      setLoading(true);

      // Check if we have cached images
      if (imageCache.has(category)) {
        const cachedImages = imageCache.get(category);
        setImages(cachedImages);

        // Check if first 8 images are preloaded
        const firstEight = cachedImages.slice(0, 8);
        const arePreloaded = firstEight.every((img) =>
          preloadedImages.has(img.url)
        );

        if (arePreloaded) {
          // Images are preloaded, show immediately
          setLoading(false);
        } else {
          // Images not preloaded yet, show loading briefly
          setTimeout(() => setLoading(false), 100);
        }
      } else {
        // No cached images, load them
        try {
          const categoryImages = getImagesForCategory(category);
          imageCache.set(category, categoryImages);
          setImages(categoryImages);
          setLoading(false);
        } catch (error) {
          console.error('Error loading images:', error);
          setImages([]);
          setLoading(false);
        }
      }
    }
  }, [category, allImagesLoaded]);

  // Load all gallery images into cache and preload first 8 of each
  const loadAllGalleryImages = () => {
    const categories = ['dance', 'wedding', 'art'];
    let loadedCount = 0;
    const totalImages = categories.length * 8; // 8 images per category

    categories.forEach((cat) => {
      try {
        const categoryImages = getImagesForCategory(cat);
        // Ensure we only cache gallery images, not home images
        const galleryImages = categoryImages.filter((img) => !img.isHero);
        imageCache.set(cat, galleryImages);

        // Preload first 8 images for instant display
        const firstEight = galleryImages.slice(0, 8);
        firstEight.forEach((image) => {
          const img = new Image();
          img.onload = () => {
            preloadedImages.add(image.url);
            loadedCount++;
            if (loadedCount === totalImages) {
              setAllImagesLoaded(true);
            }
          };
          img.onerror = () => {
            console.error(`Failed to preload image: ${image.url}`);
            loadedCount++;
            if (loadedCount === totalImages) {
              setAllImagesLoaded(true);
            }
          };
          img.src = image.url;
        });
      } catch (error) {
        console.error(`Error loading ${cat} images:`, error);
      }
    });
  };

  // Show loading for all categories during transition
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading {category} gallery...</p>
      </div>
    );
  }

  // Home page content - only show if category is home AND we have home images AND not loading
  if (
    category === 'home' &&
    !loading &&
    images.length > 0 &&
    images[0]?.isHero
  ) {
    return (
      <div className={styles.homeContent}>
        <div className={styles.heroImage}>
          <img
            src={images[0].url}
            alt='Maggie Carey Photography'
            className={styles.mainImage}
            loading='eager'
            decoding='async'
          />
        </div>
        <div className={styles.content}>
          <p className={styles.description}>
            Welcome to my photography portfolio.
          </p>
        </div>

        {/* Book Highlight Section */}
        <div className={styles.bookSection}>
          <div className={styles.bookContainer}>
            <div className={styles.bookCover}>
              <img
                src='https://afziltusqfvlckjbgkil.supabase.co/storage/v1/object/public/grainy-bits/Book/front_cover.png'
                alt='Grainy Bits: Volume 1 Book Cover'
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
                  My name is Maggie Carey and I am a professional ballet dancer
                  in San Francisco. I feel so fortunate to be able to capture
                  and share the parts of my career that people don't always see
                  on stage — the rehearsals, backstage, the dressing rooms. It
                  gives a very short career the ability to live on forever. I
                  have always romanticized film photography and the ability to
                  freeze moments in time exactly as I remember them - sometimes
                  they are even better than I recall.
                </p>
              </div>

              <button className={styles.bookButton}>Purchase Book</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state - only show if not home and no images
  if (category !== 'home' && images.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No images found in {category} gallery</p>
        <p className={styles.emptySubtext}>
          Images will appear here when they're added to the {category} folder
        </p>
      </div>
    );
  }

  // Filter out any home images that might have leaked in
  const galleryImages = images.filter((img) => !img.isHero);

  // Split images into immediate and lazy loaded
  const immediateImages = galleryImages.slice(0, 8);
  const lazyImages = galleryImages.slice(8);

  return (
    <div className={styles.gallery}>
      <div className={styles.galleryHeader}>
        <h2 className={styles.galleryTitle}>
          {category.charAt(0).toUpperCase() + category.slice(1)} Gallery
        </h2>
        {galleryImages.length > 0 && (
          <p className={styles.imageCount}>{galleryImages.length} images</p>
        )}
      </div>

      <div className={styles.grid}>
        {/* First 8 images - load immediately */}
        {immediateImages.map((image, index) => (
          <div
            key={image.filename}
            className={styles.imageContainer}
            onClick={() => setSelectedImage(image.url)}
          >
            <img
              src={image.url}
              alt={`${category} photography ${index + 1}`}
              className={styles.image}
            />
          </div>
        ))}

        {/* Remaining images - lazy load */}
        {lazyImages.map((image, index) => (
          <div
            key={image.filename}
            className={styles.imageContainer}
            onClick={() => setSelectedImage(image.url)}
          >
            <img
              src={image.url}
              alt={`${category} photography ${index + 9}`}
              className={styles.image}
              loading='lazy'
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
