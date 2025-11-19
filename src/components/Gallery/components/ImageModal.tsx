import { useRef } from 'react';
import { createPortal } from 'react-dom';
import OptimizedImage from './OptimizedImage';
import styles from '../Gallery.module.scss';
import { ImageData } from '../../../types';
import useImageModalControls from '../hooks/useImageModalControls';

interface ImageModalProps {
  imageUrl: string | null;
  images: ImageData[];
  onClose: () => void;
}

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
const ImageModal = ({ imageUrl, images, onClose }: ImageModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const {
    currentIndex,
    currentImage,
    imageLoaded,
    handleNext,
    handlePrevious,
    handleImageLoad,
  } = useImageModalControls({ imageUrl, images, onClose });

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop, not the image/content
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!imageUrl || !currentImage?.url) return null;

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
              <span>‹</span>
            </button>
            <button
              className={`${styles.modalNavButton} ${styles.modalNavButtonRight}`}
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label='Next image'
            >
              <span>›</span>
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

