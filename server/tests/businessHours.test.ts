import { describe, it, expect } from 'vitest';
import { isStoreCurrentlyOpen } from '../src/services/businessHours';

describe('Business Hours Service Tests', () => {
  it('respects manual store override when closed', () => {
    const result = isStoreCurrentlyOpen(false, [
      { dayOfWeek: 0, isOpen: true, openTime: '00:00', closeTime: '23:59' },
      { dayOfWeek: 1, isOpen: true, openTime: '00:00', closeTime: '23:59' },
      { dayOfWeek: 2, isOpen: true, openTime: '00:00', closeTime: '23:59' },
      { dayOfWeek: 3, isOpen: true, openTime: '00:00', closeTime: '23:59' },
      { dayOfWeek: 4, isOpen: true, openTime: '00:00', closeTime: '23:59' },
      { dayOfWeek: 5, isOpen: true, openTime: '00:00', closeTime: '23:59' },
      { dayOfWeek: 6, isOpen: true, openTime: '00:00', closeTime: '23:59' },
    ]);

    expect(result.isOpen).toBe(false);
    expect(result.reason).toContain('Temporarily closed');
  });

  it('marks store as open when manual override is true and open 24/7', () => {
    const result = isStoreCurrentlyOpen(true, [
      { dayOfWeek: 0, isOpen: true, openTime: '00:00', closeTime: '23:59' },
      { dayOfWeek: 1, isOpen: true, openTime: '00:00', closeTime: '23:59' },
      { dayOfWeek: 2, isOpen: true, openTime: '00:00', closeTime: '23:59' },
      { dayOfWeek: 3, isOpen: true, openTime: '00:00', closeTime: '23:59' },
      { dayOfWeek: 4, isOpen: true, openTime: '00:00', closeTime: '23:59' },
      { dayOfWeek: 5, isOpen: true, openTime: '00:00', closeTime: '23:59' },
      { dayOfWeek: 6, isOpen: true, openTime: '00:00', closeTime: '23:59' },
    ]);

    expect(result.isOpen).toBe(true);
  });
});
