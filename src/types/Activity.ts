export interface Activity {
  id: string;
  type: string;
  date: string;
}

export type ActivityType = 'biking' | 'mountainbiking' | 'hiking' | 'fitness' | 'skating' | 'hockey' | 'walking';
