export interface Contest {
  id: string | number;
  event: string;
  url: string;
  endTime: string;
  endsIn: string;
  duration: string;
  platform: string;
  platformUrl: string;
  icon?: string;
  label?: string;
  isActive: boolean;
}
