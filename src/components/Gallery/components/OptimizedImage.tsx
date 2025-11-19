import { forwardRef, useCallback, ImgHTMLAttributes } from 'react';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'loading' | 'decoding'> {
  src?: string;
  alt: string;
  // Lazy loading props
  lazy?: boolean;
  dataSrc?: string; // For lazy loading (uses data-src instead of src)
  isLoaded?: boolean; // Whether image should be loaded
  shouldLoadImmediately?: boolean; // Force immediate load
  // Performance props
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'auto' | 'sync';
  onLoad?: (url?: string) => void;
}

/**
 * OPTIMIZED IMAGE COMPONENT
 *
 * Shared image component for gallery and modal use cases.
 * Handles lazy loading, loading states, and performance optimizations.
 *
 * FEATURES:
 * - Lazy loading support (data-src attribute)
 * - Loading state management (opacity transitions)
 * - Performance optimizations (decoding, loading attributes)
 * - Ref forwarding for parent components
 * - Flexible styling via className and style props
 *
 * PROS:
 * - DRY principle (single source of truth for image rendering)
 * - Consistent behavior across gallery and modal
 * - Easier to maintain and optimize
 * - Reusable for future image components
 *
 * CONS:
 * - Additional abstraction layer
 * - Need to handle different use cases in one component
 */
const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  (
    {
      src,
      alt,
      className,
      style,
      onLoad,
      // Lazy loading props
      lazy = false,
      dataSrc, // For lazy loading (uses data-src instead of src)
      isLoaded = false, // Whether image should be loaded
      shouldLoadImmediately = false, // Force immediate load
      // Performance props
      loading = 'lazy', // 'lazy' or 'eager'
      decoding = 'async',
      // Additional props
      ...rest
    },
    ref
  ) => {
    const handleLoad = useCallback(() => {
      if (onLoad) {
        onLoad(src || dataSrc);
      }
    }, [src, dataSrc, onLoad]);

    // Determine if we should render with src or data-src
    const shouldRenderWithSrc =
      !lazy || isLoaded || shouldLoadImmediately || src;

    // For lazy loading, use data-src if not ready to load
    if (lazy && !shouldRenderWithSrc && dataSrc) {
      return (
        <img
          ref={ref}
          data-src={dataSrc}
          alt={alt}
          className={className}
          decoding={decoding}
          style={style}
          {...rest}
        />
      );
    }

    // Render with src (either immediate or lazy-loaded)
    return (
      <img
        ref={ref}
        src={src || dataSrc}
        alt={alt}
        className={className}
        loading={loading}
        decoding={decoding}
        onLoad={handleLoad}
        style={style}
        {...rest}
      />
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;

