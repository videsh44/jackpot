import { Skeleton } from '@/components/ui/Skeleton/Skeleton';

export default function Loading() {
  return (
    <div style={{ maxWidth: 1216, margin: '0 auto', padding: '80px 16px 48px' }}>
      <Skeleton width="100%" height="34px" borderRadius="6px" />
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} width="100px" height="32px" borderRadius="6px" />
        ))}
      </div>
      <div style={{ marginTop: 32 }}>
        <Skeleton width="200px" height="32px" borderRadius="6px" />
        <div style={{ display: 'flex', gap: 10, marginTop: 16, overflowX: 'hidden' }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} width="170px" height="227px" borderRadius="6px" />
          ))}
        </div>
      </div>
    </div>
  );
}
