'use client';

import { useFilterStore } from '@/store/useFilterStore';
import { CATEGORIES } from '@/constants';
import { Category } from '@/types/game';
import { Badge } from '@/components/ui/Badge/Badge';
import styles from './CategoryFilter.module.scss';

export function CategoryFilter() {
  const category = useFilterStore((s) => s.category);
  const setCategory = useFilterStore((s) => s.setCategory);

  const handleCategoryClick = (value: Category | null) => {
    setCategory(value === category ? null : value);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.filters}>
        <Badge
          active={category === null}
          onClick={() => handleCategoryClick(null)}
        >
          All Games
        </Badge>
        {CATEGORIES.map((cat) => (
          <Badge
            key={cat.value}
            active={category === cat.value}
            onClick={() => handleCategoryClick(cat.value)}
          >
            {cat.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
