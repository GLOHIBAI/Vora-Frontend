/**
 * Types for VORA Talent Verified Mentorship
 * Conforms strictly to frontend handoff specification (schemaVersion === 1)
 */

export interface MentorsApiEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
}

// ─── Discover Mentors ────────────────────────────────────────────────────────

export interface MentorDiscoverSessionType {
  id: string;
  type?: string;
  customName?: string | null;
  durationMinutes: number;
  rate: number | null;
  currency: string;
  formattedRate: string | null;
  durationOptionLabel: string; // e.g. "45 Mins ($65)"
}

export interface MentorDiscoverCard {
  id: string;
  displayName: string;
  verified: boolean;
  professionalTitle: string | null;
  organisation: string | null;
  headline: string | null;
  bio: string | null;
  photoS3Key: string | null;
  photoUrl: string | null;
  focusTags: string[];
  rating: number | null; // HIDE stars when null (never show 0)
  ratingsCount: number | null; // HIDE when null
  sessionsCompleted: number;
  rate: number | null; // null -> Rate: Free
  currency: string;
  formattedRate: string | null; // prefer this when non-null (e.g. "$65 / session")
  nextSlotAt: string | null; // null if no availability (hide next slot chrome)
  nextSlotLabel: string | null;
  primarySessionType: {
    id: string;
    type: string;
    customName: string | null;
    durationMinutes: number;
  } | null;
  sessionTypes: Array<{
    id: string;
    type: string;
    customName: string | null;
    durationMinutes: number;
    rate: number | null;
    currency: string;
    formattedRate: string | null;
    durationOptionLabel: string;
  }>;
  cta: {
    label: string; // "Book 1:1 Session"
    enabled: boolean;
    hrefHint: string;
  };
}

/** Backward compatibility alias */
export type DiscoverMentorItem = MentorDiscoverCard;
export type DiscoverMentorSessionType = MentorDiscoverSessionType;

export interface MentorDiscoverResponse {
  schemaVersion: 1;
  page: number;
  limit: number;
  total: number;
  focusFilters: string[]; // ["ALL", ...] from real expertise
  mySessionsCount: number | null; // Discover Mentors tab vs My Sessions tab count
  items: MentorDiscoverCard[];
}

/** Backward compatibility alias */
export type DiscoverMentorsData = MentorDiscoverResponse;

export interface DiscoverMentorsParams {
  page?: number;
  limit?: number;
  q?: string;
  focus?: string;
}

// ─── Booking Panel & Book Modal ──────────────────────────────────────────────

export interface BookingPanelSlotTime {
  scheduledAt: string; // ISO format
  timeLabel: string; // e.g. "3:00 PM WAT"
}

export interface BookingPanelSlotDay {
  date: string; // YYYY-MM-DD
  dayLabel: string; // Today | Tomorrow | ...
  times: BookingPanelSlotTime[];
}

export interface BookingPanelSessionType {
  id: string;
  type?: string;
  customName?: string | null;
  durationMinutes: number;
  rate: number | null;
  currency: string;
  formattedRate: string | null;
  durationOptionLabel: string; // e.g. "45 Mins ($65)"
}

export interface BookingPanelMentor {
  id: string;
  displayName: string;
  professionalTitle: string | null;
  organisation: string | null;
  headline?: string | null;
  photoS3Key?: string | null;
  photoUrl?: string | null;
  timezone?: string | null;
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
  scheduledAt: string; // ISO format from times[].scheduledAt
  sessionFocus?: string; // optional notes / topic (max 2000 chars)
  menteeCountry: string; // required (PPP tier)
  ipCountry: string; // required (PPP tier)
  paymentCountry: string; // required (PPP tier)
  localeCountry: string; // required (PPP tier)
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
  topic: string | null; // from sessionFocus at book time | null -> hide line
  chargedAmount: number;
  currency: string;
  formattedRate: string;
  meetingLink?: string | null;
  mentor: {
    id: string;
    displayName: string;
    professionalTitle: string | null;
    organisation: string | null;
    headline?: string | null;
    photoS3Key?: string | null;
    photoUrl?: string | null;
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
