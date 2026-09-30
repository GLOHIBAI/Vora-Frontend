export interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  linkText?: string;
  onLinkClick?: () => void;
}

export interface QuickActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  isLocked?: boolean;
  variant?: 'primary' | 'white';
  onClick?: () => void;
}

export interface JobCardProps {
  logo?: string;
  title: string;
  company: string;
  location: string;
  postedAt: string;
  salary: string;
  period?: string;
  description: string;
  tags: string[];
}
