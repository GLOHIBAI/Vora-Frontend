/**
 * Types for VORA Talent Verified Mentorship
 * Conforms to frontend handoff specification (schemaVersion === 1)
 */

export interface MentorsApiEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
}

// ─── Discover Mentors ────────────────────────────────────────────────────────

export interface DiscoverMentorSessionType {
  id: string;
  durationMinutes: number;
  rate: number;
  currency: string;
  formattedRate: string;
  durationOptionLabel: string; // e.g. "45 Mins ($65)"
}

export interface DiscoverMentorItem {
  id: string;
  displayName: string;
  verified: boolean;
  professionalTitle: string;
  organisation: string;
  headline?: string;
  bio?: string;
  photoS3Key?: string | null;
  focusTags: string[];
  rating: number | null; // HIDE stars when null
  ratingsCount: number | null;
  sessionsCompleted: number;
  rate: number;
  currency: string;
  formattedRate: string;
  nextSlotAt: string | null; // null if no availability
  nextSlotLabel: string | null; // null if no availability
  primarySessionType?: DiscoverMentorSessionType | null;
  sessionTypes: DiscoverMentorSessionType[];
  cta: {
    label: string; // "Book 1:1 Session"
    enabled: boolean;
    hrefHint?: string;
  };
}

export interface DiscoverMentorsData {
  schemaVersion: 1;
  page: number;
  limit: number;
  total: number;
  focusFilters: string[]; // ["ALL", ...] from real expertise
  items: DiscoverMentorItem[];
}

export interface DiscoverMentorsParams {
  page?: number;
  limit?: number;
  q?: string;
  focus?: string;
}

// ─── Booking Panel & Book Modal ──────────────────────────────────────────────

export interface BookingPanelSlotTime {
  scheduledAt: string; // ISO format or target scheduled timestamp
  timeLabel: string; // e.g. "3:00 PM WAT"
}

export interface BookingPanelSlotDay {
  date: string; // YYYY-MM-DD
  dayLabel: string; // Today | Tomorrow | ...
  times: BookingPanelSlotTime[];
}

export interface BookingPanelSessionType {
  id: string;
  durationMinutes: number;
  rate: number;
  currency: string;
  formattedRate: string;
  durationOptionLabel: string; // e.g. "45 Mins ($65)"
}

export interface BookingPanelMentor {
  id: string;
  displayName: string;
  professionalTitle: string;
  organisation: string;
  headline?: string;
  photoS3Key?: string | null;
  timezone?: string;
}

export interface BookingPanelData {
  schemaVersion: 1;
  mentor: BookingPanelMentor;
  acceptingBookings: boolean;
  sessionTypes: BookingPanelSessionType[];
  slotDays: BookingPanelSlotDay[];
}

export interface BookMentorPayload {
  sessionTypeId: string;
  scheduledAt: string; // from times[].scheduledAt
  sessionFocus?: string; // optional notes / topic
  menteeCountry?: string;
  ipCountry?: string;
  paymentCountry?: string;
  localeCountry?: string;
}

export interface BookMentorResponseData {
  bookingId?: string;
  status?: string;
  scheduledAt?: string;
  [key: string]: unknown;
}

// ─── My Sessions ─────────────────────────────────────────────────────────────

export interface MentorSessionActionJoinCall {
  enabled: boolean;
  href?: string | null;
  label: string; // "Join Call"
}

export interface MentorSessionActionMessage {
  enabled: boolean; // false
  label?: string;
  reason?: string;
}

export interface MentorSessionItem {
  bookingId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'ended' | string;
  statusLabel: string; // "Confirmed" etc.
  scheduledAt: string;
  scheduleLabel: string;
  scheduleDetail: string; // includes "(45 mins)"
  durationMinutes: number;
  topic: string | null; // from sessionFocus at book time | null
  chargedAmount: number;
  currency: string;
  formattedRate: string;
  meetingLink?: string | null;
  mentor: {
    id: string;
    displayName: string;
    professionalTitle: string;
    organisation: string;
    headline?: string;
    photoS3Key?: string | null;
  };
  sessionType: {
    id: string;
    label?: string;
    durationMinutes: number;
  } | null;
  actions: {
    joinCall: MentorSessionActionJoinCall;
    message: MentorSessionActionMessage;
  };
}

export interface MySessionsData {
  schemaVersion: 1;
  total: number;
  upcoming: MentorSessionItem[];
  past: MentorSessionItem[];
  items: MentorSessionItem[];
}
