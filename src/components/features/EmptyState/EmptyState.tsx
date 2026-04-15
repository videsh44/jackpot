import styles from './EmptyState.module.scss';

interface EmptyStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function EmptyState({ title, message, onRetry }: EmptyStateProps) {
  return (
    <div className={styles.wrapper}>
      <svg
        className={styles.icon}
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button className={styles.retryButton} onClick={onRetry} type="button">
          Try Again
        </button>
      )}
    </div>
  );
}
