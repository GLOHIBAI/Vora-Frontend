export interface PostHireMetrics {
  activeHiresTracked: number;
  checkInsOverdue: number;
  benchmarksPending: number;
  onTrack: number;
}

export interface PostHireBannerAlert {
  hasUrgentAlert: boolean;
  talentName?: string;
  hireId?: string;
  checkInId?: string;
  actionType?: string;
  message?: string;
  ctaText?: string;
}

export interface PostHireItem {
  hireId: string;
  talentId: string;
  talentName: string;
  talentInitials: string;
  applicantCode: string;
  assessmentScore: number | string;
  hiredOn: string;
  nextCheckIn: {
    label: string;
    dueLabel: string;
    overdue: boolean;
  };
  trackingStatus: 'ON_TRACK' | 'CHECK_IN_DUE' | 'BENCHMARKS_PENDING';
  trackingStatusLabel: string;
  action: {
    label: string;
    type: string;
    hireId: string;
    checkInId?: string;
  };
  rolePostingId: string;
  role: string;
  startDate: string;
}

export interface PostHireHiresResponse {
  metrics: PostHireMetrics;
  bannerAlert?: PostHireBannerAlert | null;
  items: PostHireItem[];
}

export interface SubmitCheckInDto {
  benchmarkRatings?: Array<{
    benchmarkId: string;
    rating: number;
    notes?: string;
  }>;
  overallRating: number;
  additionalNotes?: string;
  mentorConnectionFlagged?: boolean;
}

export interface SetBenchmarksDto {
  benchmarks: Array<{
    title: string;
    targetDate?: string;
    weight?: number;
    description?: string;
  }>;
}
