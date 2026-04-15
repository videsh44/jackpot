import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import styles from './GameCardSkeleton.module.scss';

export function GameCardSkeleton() {
  return (
    <div className={styles.card}>
      <Skeleton className={styles.image} />
      <div className={styles.info}>
        <Skeleton width="80%" height="14px" />
        <Skeleton width="50%" height="12px" />
      </div>
    </div>
  );
}
