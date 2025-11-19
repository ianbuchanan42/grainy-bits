import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ImageData } from '../types';

interface UseStaggeredImageRevealOptions {
  /**
   * Minimum and maximum delay (in ms) between sequential reveals.
   * Defaults to a gentle 150–500ms range.
   */
  delayRange?: [number, number];
}

interface UseStaggeredImageRevealResult {
  /** Set of image URLs that have been revealed (faded in). */
  visibleImageUrls: Set<string>;
  /** Helper to check if a given image URL is already visible. */
  isVisible: (url?: string | null) => boolean;
}

const DEFAULT_DELAY_RANGE: [number, number] = [150, 500];

/**
 * Orchestrates a randomized, staggered fade-in once images finish preloading.
 *
 * The hook preloads each image, tracks which ones have completed, and then
 * reveals them one-by-one within a configurable delay range. By default, it
 * never shows an image before it has fully loaded, ensuring the UI stays free
 * of flashing placeholders.
 */
const useStaggeredImageReveal = (
  images: readonly ImageData[],
  { delayRange = DEFAULT_DELAY_RANGE }: UseStaggeredImageRevealOptions = {}
): UseStaggeredImageRevealResult => {
  const [loadedImageUrls, setLoadedImageUrls] = useState<Set<string>>(
    () => new Set()
  );
  const [visibleImageUrls, setVisibleImageUrls] = useState<Set<string>>(
    () => new Set()
  );

  const revealTimeoutRef = useRef<number | null>(null);
  const loadedRef = useRef<Set<string>>(new Set());
  const visibleRef = useRef<Set<string>>(new Set());

  // Keep refs in sync so async callbacks can read the latest sets.
  useEffect(() => {
    loadedRef.current = loadedImageUrls;
  }, [loadedImageUrls]);

  useEffect(() => {
    visibleRef.current = visibleImageUrls;
  }, [visibleImageUrls]);

  // Reset state whenever the image collection changes (new session, etc.).
  useEffect(() => {
    setLoadedImageUrls(new Set());
    setVisibleImageUrls(new Set());
    loadedRef.current = new Set();
    visibleRef.current = new Set();

    if (revealTimeoutRef.current !== null) {
      window.clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
  }, [images]);

  // Preload images and mark them as loaded once they resolve (success or error).
  useEffect(() => {
    if (images.length === 0) {
      return;
    }

    const preloadTargets = images
      .map((image) => image.url)
      .filter((url): url is string => Boolean(url));

    const uniqueTargets = Array.from(new Set(preloadTargets));
    const loaders: HTMLImageElement[] = [];

    uniqueTargets.forEach((url) => {
      if (loadedRef.current.has(url)) {
        return;
      }

      const img = new Image();
      const handleComplete = () => {
        setLoadedImageUrls((prev) => {
          if (prev.has(url)) {
            return prev;
          }
          const next = new Set(prev);
          next.add(url);
          return next;
        });
      };

      img.onload = handleComplete;
      img.onerror = handleComplete;
      img.src = url;
      loaders.push(img);
    });

    return () => {
      loaders.forEach((loader) => {
        loader.onload = null;
        loader.onerror = null;
      });
    };
  }, [images]);

  // Reveal loaded images one at a time using a gentle randomized cadence.
  useEffect(() => {
    const pending = Array.from(loadedImageUrls).filter(
      (url) => !visibleImageUrls.has(url)
    );

    if (pending.length === 0 || revealTimeoutRef.current !== null) {
      return;
    }

    const [minDelay, maxDelay] = delayRange;
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;

    revealTimeoutRef.current = window.setTimeout(() => {
      revealTimeoutRef.current = null;

      const available = Array.from(loadedRef.current).filter(
        (url) => !visibleRef.current.has(url)
      );

      if (available.length === 0) {
        return;
      }

      const nextUrl = available[Math.floor(Math.random() * available.length)];

      setVisibleImageUrls((prev) => {
        if (prev.has(nextUrl)) {
          return prev;
        }

        const next = new Set(prev);
        next.add(nextUrl);
        return next;
      });
    }, delay);
  }, [delayRange, loadedImageUrls, visibleImageUrls]);

  // Clear any outstanding reveal timers on unmount.
  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current !== null) {
        window.clearTimeout(revealTimeoutRef.current);
      }
    };
  }, []);

  const visibleSet = useMemo(
    () => new Set(visibleImageUrls),
    [visibleImageUrls]
  );

  const isVisible = useCallback(
    (url?: string | null) => {
      if (!url) {
        return false;
      }
      return visibleImageUrls.has(url);
    },
    [visibleImageUrls]
  );

  return {
    visibleImageUrls: visibleSet,
    isVisible,
  };
};

export default useStaggeredImageReveal;
