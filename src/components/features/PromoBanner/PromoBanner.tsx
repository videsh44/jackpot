'use client';

import { useRef, ComponentType } from 'react';
import { AirdropBanner, WeeklyRaceBanner, CashCombatBanner } from './BannerImages';
import styles from './PromoBanner.module.scss';

interface BannerSlot {
  id: string;
  Component: ComponentType;
}

const BANNERS: BannerSlot[] = [
  { id: 'airdrop', Component: AirdropBanner },
  { id: 'race', Component: WeeklyRaceBanner },
  { id: 'combat', Component: CashCombatBanner },
];

export function PromoBanner() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // const scroll = useCallback((direction: 'left' | 'right') => {
  //   if (!scrollRef.current) return;
  //   const scrollAmount = 400;
  //   scrollRef.current.scrollBy({
  //     left: direction === 'left' ? -scrollAmount : scrollAmount,
  //     behavior: 'smooth',
  //   });
  // }, []);

  return (
    <section className={styles.section}>
      <div className={styles.carouselWrapper}>
        <div className={styles.carousel} ref={scrollRef}>
          {BANNERS.map(({ id, Component }) => (
            <div key={id} className={styles.banner}>
              <Component />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
