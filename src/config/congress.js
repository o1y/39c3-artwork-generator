const CONGRESS_START = new Date('2025-12-27T00:00:00+01:00'); // 39C3 Day 1

export function getCongressDay(timestamp) {
  const diffMs = new Date(timestamp).getTime() - CONGRESS_START.getTime();
  const day = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return `Day ${day}`;
}
