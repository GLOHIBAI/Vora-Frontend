export const COUNTRY_OPTIONS = [
  { label: 'Switzerland (T1 · HIC)', value: 't1_ch' },
  { label: 'United States (T1 · HIC)', value: 't1_us' },
  { label: 'United Kingdom (T1 · HIC)', value: 't1_uk' },
  { label: 'Germany (T1 · HIC)', value: 't1_de' },
  { label: 'Brazil (T2 · UMIC)', value: 't2_br' },
  { label: 'China (T2 · UMIC)', value: 't2_cn' },
  { label: 'Poland (T2 · UMIC)', value: 't2_pl' },
  { label: 'South Africa (T2 · UMIC)', value: 't2_za' },
  { label: 'Nigeria (T3 · LMIC)', value: 't3_ng' },
  { label: 'India (T3 · LMIC)', value: 't3_in' },
  { label: 'Kenya (T3 · LMIC)', value: 't3_ke' },
  { label: 'Ghana (T3 · LMIC)', value: 't3_gh' },
];

export const TIMEZONE_OPTIONS = [
  { label: 'GMT+1 (WAT · Lagos)', value: 'WAT' },
  { label: 'GMT+0 (UTC · Geneva)', value: 'UTC' },
  { label: 'GMT-5 (EST · New York)', value: 'EST' },
  { label: 'GMT+5:30 (IST · Mumbai)', value: 'IST' },
  { label: 'GMT+3 (EAT · Nairobi)', value: 'EAT' },
];

export const START_TIMES = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

export const DURATION_OPTIONS = [
  { label: '30 min', value: '30' },
  { label: '45 min', value: '45' },
  { label: '60 min', value: '60' },
  { label: '90 min', value: '90' },
];

export const MULTIPLIERS = {
  t1: { t1: 1, t2: 0.418, t3: 0.136 },
  t2: { t1: 2.39, t2: 1, t3: 0.326 },
  t3: { t1: 7.33, t2: 3.07, t3: 1 }
};

export const TIER_INFO = {
  t1: {
    cls: 'bg-[#EBF6FF] text-[#0047CC] border-[#BFDBFE]',
    msg: 'You are in a Tier 1 (HIC) market. Your local rate is the global baseline — VORA scales it down for T2/T3 mentees using PPP, expanding your reach to 2.3M+ candidates worldwide.'
  },
  t2: {
    cls: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]',
    msg: 'You are in a Tier 2 (UMIC) market. VORA scales your rate up for T1 mentees and down for T3 mentees — maximising both your income and your global accessibility.'
  },
  t3: {
    cls: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
    msg: 'You are in a Tier 3 (LMIC) market. Your local rate anchors global pricing — VORA scales it up for T1/T2 mentees so you earn globally competitive rates while remaining accessible locally.'
  }
};
