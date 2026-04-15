'use client';

import { EmptyState } from '@/components/features/EmptyState/EmptyState';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: '48px 16px' }}>
      <EmptyState
        title="Something went wrong"
        message="An unexpected error occurred. Please try again."
        onRetry={reset}
      />
    </div>
  );
}
