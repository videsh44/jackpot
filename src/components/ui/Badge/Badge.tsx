import styles from './Badge.module.scss';
import { cn } from '@/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function Badge({ children, active = false, onClick }: BadgeProps) {
  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      className={cn(styles.badge, active && styles.active)}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {children}
    </Component>
  );
}
