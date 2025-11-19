import { memo, useCallback } from 'react';
import OptimizedImage from './OptimizedImage';
import styles from '../Gallery.module.scss';
import { ImageData } from '../../../types';

interface GalleryImageItemProps {
  image: ImageData;
  index: number;
  category: string;
  isActive: boolean;
  isLoaded: boolean;
  onImageClick: (url: string) => void;
  onImageLoad: (url: string) => void;
}

/**
 * GALLERY IMAGE ITEM COMPONENT
 *
 * Memoized component for individual gallery images to prevent unnecessary re-renders.
 *
 * PROS:
 * - Only re-renders when props change (React.memo optimization)
 * - Prevents re-rendering unchanged images when tab switches
 * - Cleaner code organization
 * - Easier to test independently
 *
 * CONS:
 * - Additional component overhead (minimal)
 * - Need to pass more props
 *
 * PERFORMANCE:
 * - React.memo prevents re-renders when props haven't changed
 * - Critical for smooth tab switching (hundreds of images)
 *
 * NOTE: onImageLoad prop is a function that tracks loaded images.
 * This keeps the loadedImagesSet management in the parent Gallery component.
 */
const GalleryImageItem = memo<GalleryImageItemProps>(
  ({
    image,
    index,
    category,
    isActive,
    isLoaded,
    onImageClick,
    onImageLoad,
  }) => {
    // First 6 images load immediately when tab becomes active (above fold priority)
    const shouldLoadImmediately = isActive && index < 6;

    const handleLoad = useCallback(() => {
      // Track loaded images to prevent reloading
      if (onImageLoad && image.url) {
        onImageLoad(image.url);
      }
    }, [image.url, onImageLoad]);

    return (
      <div
        className={styles.imageContainer}
        onClick={() => image.url && onImageClick(image.url)}
      >
        <OptimizedImage
          src={image.url}
          alt={image.alt || `${category} photography ${index + 1}`}
          className={styles.image}
          lazy={!isLoaded && !shouldLoadImmediately}
          dataSrc={image.url}
          isLoaded={isLoaded}
          shouldLoadImmediately={shouldLoadImmediately}
          loading={index < 6 ? 'eager' : 'lazy'}
          decoding='async'
          onLoad={handleLoad}
        />
      </div>
    );
  }
);

GalleryImageItem.displayName = 'GalleryImageItem';

export default GalleryImageItem;

