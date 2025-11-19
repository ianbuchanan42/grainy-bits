import { MutableRefObject, RefObject, useEffect, useRef } from 'react';

type DivContainerRef =
  | RefObject<HTMLDivElement | null>
  | MutableRefObject<HTMLDivElement | null>;

type IdleCallbackHandle = number;

interface UseLazyImageObserverOptions {
  containerRef: DivContainerRef;
  isActive: boolean;
  loadedImages: Set<string>;
  /**
   * Additional dependencies that should trigger the observer re-evaluation.
   * Example: image count changes when switching categories.
   */
  dependencies?: ReadonlyArray<unknown>;
  /**
   * Observer configuration to tweak eager vs. deferred loading.
   * Defaults mimic the previous in-component settings.
   */
  rootMargin?: string;
  threshold?: number;
}

/**
 * useLazyImageObserver encapsulates the IntersectionObserver wiring used to
 * progressively load gallery images.
 *
 * ✅ Pros
 * - Central place to tweak behaviour across multiple galleries.
 * - Keeps component lean; easier to scan Gallery.tsx render logic.
 * - Hook reuses observer instance while the component stays mounted.
 *
 * ⚠️ Cons
 * - Slight abstraction cost: debugging now requires one extra file hop.
 * - Hook still relies on mutable shared state (`loadedImages`). Ensure the
 *   Set remains a module-level singleton to preserve caching semantics.
 * - Custom hook adds bundle weight compared to keeping logic inline (small).
 */
const useLazyImageObserver = ({
  containerRef,
  isActive,
  loadedImages,
  dependencies = [],
  rootMargin = '100px',
  threshold = 0.01,
}: UseLazyImageObserverOptions) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!isActive || !container) {
      return;
    }

    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            const img = entry.target as HTMLImageElement;
            const imageUrl = img.dataset.src;

            if (!imageUrl || loadedImages.has(imageUrl) || img.src) {
              observerRef.current?.unobserve(img);
              return;
            }

            loadedImages.add(imageUrl);

            const loadImage = () => {
              if (img.dataset.src === imageUrl && !img.src) {
                img.src = imageUrl;
                img.removeAttribute('data-src');
              }
              observerRef.current?.unobserve(img);
            };

            const requestIdle = (
              window as Window & {
                requestIdleCallback?: (
                  callback: IdleRequestCallback,
                  options?: IdleRequestOptions
                ) => IdleCallbackHandle;
              }
            ).requestIdleCallback;

            if (requestIdle) {
              requestIdle(loadImage, { timeout: 2000 });
            } else {
              window.setTimeout(loadImage, 100);
            }
          });
        },
        { rootMargin, threshold }
      );
    }

    const observer = observerRef.current;

    const imageElements =
      container.querySelectorAll<HTMLImageElement>('img[data-src]');

    imageElements.forEach((img) => {
      const imageUrl = img.dataset.src;
      if (imageUrl && !loadedImages.has(imageUrl) && !img.src) {
        observer.observe(img);
      }
    });

    return () => {
      if (!observerRef.current || !container) {
        return;
      }

      const observedImages =
        container.querySelectorAll<HTMLImageElement>('img[data-src]');
      observedImages.forEach((img) => {
        observerRef.current?.unobserve(img);
      });
    };
  }, [
    containerRef,
    isActive,
    loadedImages,
    rootMargin,
    threshold,
    ...dependencies,
  ]);
};

export default useLazyImageObserver;
