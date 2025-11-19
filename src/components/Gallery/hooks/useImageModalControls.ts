import { useCallback, useEffect, useMemo, useState } from 'react';
import { ImageData } from '../../../types';

interface UseImageModalControlsOptions {
  imageUrl: string | null;
  images: ImageData[];
  onClose: () => void;
}

interface UseImageModalControlsResult {
  currentIndex: number;
  currentImage: ImageData | null;
  imageLoaded: boolean;
  handleNext: () => void;
  handlePrevious: () => void;
  handleImageLoad: () => void;
}

/**
 * Consolidates the behavioural logic for `ImageModal`, keeping the component
 * render-focused while the hook manages navigation, preloading, keyboard
 * shortcuts, and body scroll locking.
 */
const useImageModalControls = ({
  imageUrl,
  images,
  onClose,
}: UseImageModalControlsOptions): UseImageModalControlsResult => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageCount = images.length;

  const handlePrevious = useCallback(() => {
    if (imageCount === 0) {
      return;
    }

    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex > 0 ? prevIndex - 1 : imageCount - 1;
      return newIndex;
    });
    setImageLoaded(false);
  }, [imageCount]);

  const handleNext = useCallback(() => {
    if (imageCount === 0) {
      return;
    }

    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex < imageCount - 1 ? prevIndex + 1 : 0;
      return newIndex;
    });
    setImageLoaded(false);
  }, [imageCount]);

  useEffect(() => {
    if (!imageUrl || imageCount === 0) {
      return;
    }

    const index = images.findIndex((img) => img.url === imageUrl);
    if (index !== -1) {
      setCurrentIndex(index);
      setImageLoaded(false);
    }
  }, [imageUrl, images, imageCount]);

  useEffect(() => {
    if (!imageUrl) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious, imageUrl, onClose]);

  useEffect(() => {
    if (!imageUrl) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow || '';
    };
  }, [imageUrl]);

  useEffect(() => {
    if (imageCount === 0) {
      return;
    }

    const preload = (url?: string) => {
      if (!url) {
        return;
      }
      const img = new Image();
      img.src = url;
    };

    const previousIndex = currentIndex > 0 ? currentIndex - 1 : imageCount - 1;
    const nextIndex = currentIndex < imageCount - 1 ? currentIndex + 1 : 0;

    preload(images[previousIndex]?.url);
    preload(images[nextIndex]?.url);
  }, [currentIndex, imageCount, images]);

  useEffect(() => {
    if (!imageUrl) {
      setImageLoaded(false);
    }
  }, [imageUrl]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const currentImage = useMemo(() => {
    if (imageCount === 0) {
      return null;
    }
    return images[currentIndex] ?? null;
  }, [currentIndex, imageCount, images]);

  return {
    currentIndex,
    currentImage,
    imageLoaded,
    handleNext,
    handlePrevious,
    handleImageLoad,
  };
};

export default useImageModalControls;
