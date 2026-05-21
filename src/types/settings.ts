export type TabType = 'profile' | 'availability' | 'courses' | 'mentorship' | 'notification' | 'account';

export interface Slot {
  id: number;
  startTime: string;
  duration: string;
  rate: number;
}

export interface DayAvailability {
  active: boolean;
  open: boolean;
  slots: Slot[];
}
