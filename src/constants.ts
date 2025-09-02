export const ACTIVITY_EMOJIS: Record<string, string> = {
  biking: '🚲',
  mountainbiking: '🚵',
  hiking: '🏃‍♂️',
  fitness: '💪',
  skating: '⛸️',
  hockey: '🏒',
  walking: '🚶‍♂️'
} as const;

export const DB_CONFIG = {
  name: 'FitnessTrackerDB',
  version: 1,
  store: 'activities'
} as const;
