import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import OptimizedImage from './OptimizedImage';
import styles from '../Gallery.module.css';

/**
 * IMAGE MODAL COMPONENT
 *
 * Enhanced modal for viewing gallery images with navigation and keyboard support.
 *
 * FEATURES:
 * - Keyboard navigation (ESC to close, Arrow keys for prev/next)
 * - Image navigation (prev/next buttons)
 * - Loading state for large images
 * - Preloads adjacent images for smooth navigation
 * - Click outside to close
 * - React Portal for better rendering
 *
 * PROS:
 * - Better UX with keyboard and navigation
 * - Smooth image transitions
 * - Professional feel
 * - Accessible (keyboard support)
 *
 * CONS:
 * - More complex than simple modal
 * - Slightly larger bundle size
 * - Requires managing current index
 */
const ImageModal = ({ imageUrl, images, onClose }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const modalRef = useRef(null);
  const imageRef = useRef(null);

  // Define navigation handlers first (before useEffect that uses them)
  const handlePrevious = useCallback(() => {
    if (!images || images.length === 0) return;
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex > 0 ? prevIndex - 1 : images.length - 1;
      setImageLoaded(false);
      return newIndex;
    });
  }, [images]);

  const handleNext = useCallback(() => {
    if (!images || images.length === 0) return;
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex < images.length - 1 ? prevIndex + 1 : 0;
      setImageLoaded(false);
      return newIndex;
    });
  }, [images]);

  // Find current image index
  useEffect(() => {
    if (imageUrl && images) {
      const index = images.findIndex((img) => img.url === imageUrl);
      if (index !== -1) {
        setCurrentIndex(index);
        setImageLoaded(false); // Reset loading state when image changes
      }
    }
  }, [imageUrl, images]);

  // Preload adjacent images for smooth navigation
  useEffect(() => {
    if (!images || images.length === 0) return;

    const preloadImage = (url) => {
      const img = new Image();
      img.src = url;
    };

    // Preload previous image
    if (currentIndex > 0) {
      preloadImage(images[currentIndex - 1].url);
    }

    // Preload next image
    if (currentIndex < images.length - 1) {
      preloadImage(images[currentIndex + 1].url);
    }
  }, [currentIndex, images]);

  // Keyboard navigation
  useEffect(() => {
    if (!imageUrl) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageUrl, handlePrevious, handleNext, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (imageUrl) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [imageUrl]);

  const handleBackdropClick = (e) => {
    // Only close if clicking the backdrop, not the image/content
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (!imageUrl || !images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return createPortal(
    <div
      ref={modalRef}
      className={styles.modal}
      onClick={handleBackdropClick}
      role='dialog'
      aria-modal='true'
      aria-label='Image viewer'
    >
      <div className={styles.modalContent}>
        {/* Loading state */}
        {!imageLoaded && (
          <div className={styles.modalLoading}>
            <div className={styles.modalSpinner}></div>
            <p>Loading image...</p>
          </div>
        )}

        {/* Main image */}
        <OptimizedImage
          ref={imageRef}
          src={currentImage.url}
          alt={currentImage.alt || `Gallery image ${currentIndex + 1}`}
          className={styles.modalImage}
          style={{ opacity: imageLoaded ? 1 : 0 }}
          loading='eager'
          decoding='async'
          onLoad={handleImageLoad}
        />

        {/* Navigation buttons - only show if more than one image */}
        {images.length > 1 && (
          <>
            <button
              className={`${styles.modalNavButton} ${styles.modalNavButtonLeft}`}
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              aria-label='Previous image'
            >
              ‹
            </button>
            <button
              className={`${styles.modalNavButton} ${styles.modalNavButtonRight}`}
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label='Next image'
            >
              ›
            </button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className={styles.modalCounter}>
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Close button */}
        <button
          className={styles.closeButton}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label='Close image viewer'
        >
          ×
        </button>
      </div>
    </div>,
    document.body
  );
};

export default ImageModal;
