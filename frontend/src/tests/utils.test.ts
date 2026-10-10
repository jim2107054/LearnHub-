import { describe, it, expect } from 'vitest';
import { formatPrice, formatDuration, cn } from '../lib/utils';

describe('Formatters and Utilities', () => {
  it('formats minor units to USD currency string correctly', () => {
    expect(formatPrice(4999, 'USD')).toBe('$49.99');
    expect(formatPrice(10000, 'USD')).toBe('$100.00');
    expect(formatPrice(0, 'USD')).toBe('$0.00');
  });

  it('formats durations in seconds to human-readable strings', () => {
    expect(formatDuration(3600)).toBe('1h 0m');
    expect(formatDuration(7500)).toBe('2h 5m');
    expect(formatDuration(480)).toBe('8m');
  });

  it('merges tailwind class names conditionally with cn', () => {
    expect(cn('bg-red-500', 'p-4')).toBe('bg-red-500 p-4');
    expect(cn('p-2', false && 'hidden', 'p-4')).toBe('p-4');
  });
});
