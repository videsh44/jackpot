'use client';

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import styles from './LoadMoreTrigger.module.scss';

interface LoadMoreTriggerProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

export function LoadMoreTrigger({
  onLoadMore,
  hasMore,
  isLoading,
}: LoadMoreTriggerProps) {
  const setRef = useIntersectionObserver(onLoadMore, {
    enabled: hasMore && !isLoading,
  });

  if (!hasMore) return null;

  return (
    <div ref={setRef} className={styles.trigger}>
      {isLoading && (
        <div className={styles.spinner}>
          <div className={styles.dot} />
          <div className={styles.dot} />
          <div className={styles.dot} />
        </div>
      )}
    </div>
  );
}
