import { useEffect, useRef, useCallback } from 'react';

interface UseIntersectionObserverOptions {
  enabled?: boolean;
  rootMargin?: string;
}

export function useIntersectionObserver(
  callback: () => void,
  options: UseIntersectionObserverOptions = {}
) {
  const { enabled = true, rootMargin = '200px' } = options;
  const targetRef = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef(callback);

  callbackRef.current = callback;

  const setRef = useCallback((node: HTMLDivElement | null) => {
    targetRef.current = node;
  }, []);

  useEffect(() => {
    const target = targetRef.current;
    if (!enabled || !target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callbackRef.current();
        }
      },
      { rootMargin }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return setRef;
}
