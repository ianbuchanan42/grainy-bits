import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface UseVisibilityObserverOptions {
  /** Whether observation work should run (e.g. tab is visible). */
  isActive: boolean;
  rootMargin?: string;
  threshold?: number | number[];
}

interface UseVisibilityObserverResult<Key extends string> {
  registerElement: (key: Key, element: HTMLElement | null) => void;
  visibleKeys: Set<Key>;
  isVisible: (key: Key) => boolean;
}

/**
 * Lightweight abstraction over IntersectionObserver that records when elements
 * have become visible at least once. Useful for lazy-loading media or deferring
 * work until an element is on screen.
 */
const useVisibilityObserver = <Key extends string>(
  {
    isActive,
    rootMargin = '0px',
    threshold = 0,
  }: UseVisibilityObserverOptions
): UseVisibilityObserverResult<Key> => {
  const [visibleKeys, setVisibleKeys] = useState<Set<Key>>(() => new Set());

  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Map<Key, HTMLElement>>(new Map());
  const elementKeyMapRef = useRef<Map<HTMLElement, Key>>(new Map());
  const observerSupportedRef = useRef<boolean>(true);

  const visibleKeysRef = useRef<Set<Key>>(new Set());

  useEffect(() => {
    visibleKeysRef.current = visibleKeys;
  }, [visibleKeys]);

  const registerElement = useCallback(
    (key: Key, element: HTMLElement | null) => {
      const elements = elementsRef.current;
      const elementKeyMap = elementKeyMapRef.current;

      const existingElement = elements.get(key);
      if (existingElement && existingElement !== element) {
        observerRef.current?.unobserve(existingElement);
        elementKeyMap.delete(existingElement);
      }

      if (!element) {
        elements.delete(key);
        return;
      }

      elements.set(key, element);
      elementKeyMap.set(element, key);

      if (observerSupportedRef.current && observerRef.current) {
        observerRef.current.observe(element);
      } else if (!observerSupportedRef.current) {
        // No IntersectionObserver support – consider element immediately visible.
        setVisibleKeys((prev) => {
          if (prev.has(key)) {
            return prev;
          }
          const next = new Set(prev);
          next.add(key);
          return next;
        });
      }
    },
    []
  );

  useEffect(() => {
    if (!isActive) {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    const supportsObserver =
      typeof window !== 'undefined' && 'IntersectionObserver' in window;

    if (!supportsObserver) {
      observerSupportedRef.current = false;
      // Mark all registered elements as visible immediately.
      setVisibleKeys(new Set(elementsRef.current.keys()));
      return;
    }

    observerSupportedRef.current = true;

    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const element = entry.target as HTMLElement;
          const key = elementKeyMapRef.current.get(element);

          if (!key) {
            return;
          }

          setVisibleKeys((prev) => {
            if (prev.has(key)) {
              return prev;
            }
            const next = new Set(prev);
            next.add(key);
            return next;
          });

          observer.unobserve(element);
        });
      },
      { rootMargin, threshold }
    );

    observerRef.current = observer;

    elementsRef.current.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [isActive, rootMargin, threshold]);

  const isVisible = useCallback((key: Key) => {
    return visibleKeysRef.current.has(key);
  }, []);

  const visibleSet = useMemo(() => new Set(visibleKeys), [visibleKeys]);

  return {
    registerElement,
    visibleKeys: visibleSet,
    isVisible,
  };
};

export default useVisibilityObserver;
