import type { StudyHoursMap } from '../types';

// =============================================
// AREAS OF INTEREST
// =============================================
export const INTEREST_OPTIONS = [
  { label: 'Public Health', value: 'public-health' },
  { label: 'Health Policy', value: 'health-policy' },
  { label: 'Epidemiology', value: 'epidemiology' },
  { label: 'Research and Analysis', value: 'research-analysis' },
  { label: 'Clinical Trials', value: 'clinical-trials' },
  { label: 'Data Analysis', value: 'data-analysis' },
  { label: 'Community Health', value: 'community-health' },
  { label: 'Health Systems', value: 'health-systems' },
  { label: 'Biostatistics', value: 'biostatistics' },
  { label: 'Environmental Health', value: 'environmental-health' },
  { label: 'Mental Health', value: 'mental-health' },
  { label: 'Communication & Writing', value: 'communication-writing' },
  { label: 'Project Management', value: 'project-management' },
];

// =============================================
// EXPERIENCE LEVEL
// =============================================
export const EXPERIENCE_OPTIONS = [
  { label: 'Student/Graduate', value: 'student-graduate' },
  { label: 'Entry level (Academic)', value: 'entry-academic' },
  { label: 'Entry level (Non-academic)', value: 'entry-non-academic' },
  { label: 'Mid level (professional)', value: 'mid-professional' },
  { label: 'Senior level (professional)', value: 'senior-professional' },
  { label: 'Masters', value: 'masters' },
  { label: 'PhD', value: 'phd' },
  { label: 'Post Doctorate', value: 'post-doctorate' },
];

// =============================================
// CITIES / COUNTRIES (Profile country)
// =============================================
export const COUNTRY_OPTIONS = [
  // Africa
  { label: 'Lagos, Nigeria', value: 'lagos-ng' },
  { label: 'Abuja, Nigeria', value: 'abuja-ng' },
  { label: 'Port Harcourt, Nigeria', value: 'port-harcourt-ng' },
  { label: 'Accra, Ghana', value: 'accra-gh' },
  { label: 'Nairobi, Kenya', value: 'nairobi-ke' },
  { label: 'Johannesburg, South Africa', value: 'johannesburg-za' },
  { label: 'Cape Town, South Africa', value: 'cape-town-za' },
  { label: 'Cairo, Egypt', value: 'cairo-eg' },
  { label: 'Addis Ababa, Ethiopia', value: 'addis-ababa-et' },
  { label: 'Dar es Salaam, Tanzania', value: 'dar-es-salaam-tz' },
  { label: 'Kampala, Uganda', value: 'kampala-ug' },
  { label: 'Kigali, Rwanda', value: 'kigali-rw' },
  { label: 'Dakar, Senegal', value: 'dakar-sn' },
  // Americas
  { label: 'New York, USA', value: 'new-york-us' },
  { label: 'San Francisco, USA', value: 'san-francisco-us' },
  { label: 'Washington DC, USA', value: 'washington-dc-us' },
  { label: 'Boston, USA', value: 'boston-us' },
  { label: 'Chicago, USA', value: 'chicago-us' },
  { label: 'Toronto, Canada', value: 'toronto-ca' },
  { label: 'Vancouver, Canada', value: 'vancouver-ca' },
  { label: 'Montreal, Canada', value: 'montreal-ca' },
  { label: 'São Paulo, Brazil', value: 'sao-paulo-br' },
  // Europe
  { label: 'London, United Kingdom', value: 'london-uk' },
  { label: 'Edinburgh, United Kingdom', value: 'edinburgh-uk' },
  { label: 'Manchester, United Kingdom', value: 'manchester-uk' },
  { label: 'Berlin, Germany', value: 'berlin-de' },
  { label: 'Paris, France', value: 'paris-fr' },
  { label: 'Amsterdam, Netherlands', value: 'amsterdam-nl' },
  { label: 'Dublin, Ireland', value: 'dublin-ie' },
  { label: 'Stockholm, Sweden', value: 'stockholm-se' },
  { label: 'Copenhagen, Denmark', value: 'copenhagen-dk' },
  { label: 'Geneva, Switzerland', value: 'geneva-ch' },
  { label: 'Brussels, Belgium', value: 'brussels-be' },
  // Middle East & Asia
  { label: 'Dubai, UAE', value: 'dubai-ae' },
  { label: 'Abu Dhabi, UAE', value: 'abu-dhabi-ae' },
  { label: 'Singapore', value: 'singapore' },
  { label: 'Kuala Lumpur, Malaysia', value: 'kuala-lumpur-my' },
  { label: 'Mumbai, India', value: 'mumbai-in' },
  { label: 'New Delhi, India', value: 'new-delhi-in' },
  { label: 'Tokyo, Japan', value: 'tokyo-jp' },
  // Oceania
  { label: 'Sydney, Australia', value: 'sydney-au' },
  { label: 'Melbourne, Australia', value: 'melbourne-au' },
  { label: 'Auckland, New Zealand', value: 'auckland-nz' },
];

// =============================================
// NATIONALITIES
// =============================================
export const NATIONALITIES = [
  'Afghan','Albanian','Algerian','Angolan','Argentine','Armenian',
  'Australian','Austrian','Azerbaijani','Bangladeshi','Barbadian',
  'Belarusian','Belgian','Bolivian','Bosnian','Botswanan',
  'Brazilian','British','Bulgarian','Burkinabe','Burundian','Cambodian','Cameroonian',
  'Canadian','Chilean','Chinese','Colombian','Congolese','Costa Rican','Croatian','Cuban','Cypriot','Czech',
  'Danish','Dominican','Dutch','Ecuadorian','Egyptian','Emirati',
  'Eritrean','Estonian','Ethiopian','Fijian','Finnish','French',
  'Gabonese','Gambian','Georgian','German','Ghanaian','Greek','Guatemalan','Guinean','Guyanese',
  'Haitian','Honduran','Hungarian','Icelandic','Indian','Indonesian','Iranian','Iraqi',
  'Irish','Israeli','Italian','Ivorian','Jamaican','Japanese','Jordanian','Kazakhstani',
  'Kenyan','Kuwaiti','Latvian','Lebanese','Liberian','Libyan',
  'Lithuanian','Luxembourgish','Malawian','Malaysian',
  'Malian','Maltese','Mauritian','Mexican',
  'Moldovan','Mongolian','Moroccan','Mozambican','Namibian','Nepali',
  'New Zealander','Nicaraguan','Nigerian','Nigerien','Norwegian','Omani','Pakistani',
  'Panamanian','Paraguayan','Peruvian','Filipino','Polish','Portuguese',
  'Qatari','Romanian','Russian','Rwandan','Salvadoran','Saudi',
  'Senegalese','Serbian','Sierra Leonean','Singaporean','Slovak','Slovenian',
  'Somali','South African','South Korean','South Sudanese','Spanish','Sri Lankan','Sudanese',
  'Swedish','Swiss','Syrian','Taiwanese','Tanzanian','Thai',
  'Togolese','Tunisian','Turkish','Ugandan',
  'Ukrainian','Uruguayan','Uzbek','Venezuelan','Vietnamese','Yemeni','Zambian','Zimbabwean'
];

export const POPULAR_NATIONALITIES = [
  'Nigerian','British','Ghanaian','Kenyan','South African',
  'Canadian','Australian','Indian','German','French','Emirati','Singaporean','Swedish'
];

// =============================================
// RESIDENCES (for Country of current residence)
// =============================================
export const RESIDENCE_OPTIONS = [
  { label: 'Australia', value: 'Australia' },
  { label: 'Belgium', value: 'Belgium' },
  { label: 'Brazil', value: 'Brazil' },
  { label: 'Canada', value: 'Canada' },
  { label: 'China', value: 'China' },
  { label: 'Denmark', value: 'Denmark' },
  { label: 'Egypt', value: 'Egypt' },
  { label: 'Ethiopia', value: 'Ethiopia' },
  { label: 'Finland', value: 'Finland' },
  { label: 'France', value: 'France' },
  { label: 'Germany', value: 'Germany' },
  { label: 'Ghana', value: 'Ghana' },
  { label: 'India', value: 'India' },
  { label: 'Indonesia', value: 'Indonesia' },
  { label: 'Ireland', value: 'Ireland' },
  { label: 'Israel', value: 'Israel' },
  { label: 'Italy', value: 'Italy' },
  { label: 'Japan', value: 'Japan' },
  { label: 'Kenya', value: 'Kenya' },
  { label: 'Malaysia', value: 'Malaysia' },
  { label: 'Mexico', value: 'Mexico' },
  { label: 'Netherlands', value: 'Netherlands' },
  { label: 'New Zealand', value: 'New Zealand' },
  { label: 'Nigeria', value: 'Nigeria' },
  { label: 'Norway', value: 'Norway' },
  { label: 'Pakistan', value: 'Pakistan' },
  { label: 'Philippines', value: 'Philippines' },
  { label: 'Poland', value: 'Poland' },
  { label: 'Portugal', value: 'Portugal' },
  { label: 'Rwanda', value: 'Rwanda' },
  { label: 'Saudi Arabia', value: 'Saudi Arabia' },
  { label: 'Singapore', value: 'Singapore' },
  { label: 'South Africa', value: 'South Africa' },
  { label: 'South Korea', value: 'South Korea' },
  { label: 'Spain', value: 'Spain' },
  { label: 'Sweden', value: 'Sweden' },
  { label: 'Switzerland', value: 'Switzerland' },
  { label: 'Tanzania', value: 'Tanzania' },
  { label: 'Turkey', value: 'Turkey' },
  { label: 'Uganda', value: 'Uganda' },
  { label: 'United Arab Emirates', value: 'United Arab Emirates' },
  { label: 'United Kingdom', value: 'United Kingdom' },
  { label: 'United States', value: 'United States' },
  { label: 'Vietnam', value: 'Vietnam' },
  { label: 'Zimbabwe', value: 'Zimbabwe' },
];

// =============================================
// RIGHT-TO-WORK grouped options
// =============================================
export const RTW_GROUPS = [
  {
    label: 'No visa or permit required',
    options: [
      { label: 'National of the role country, no visa required', value: 'national' },
      { label: 'EU / EEA freedom of movement rights', value: 'eu_eea' },
    ],
  },
  {
    label: 'Study permit / student visa',
    options: [
      { label: 'Study permit or student visa with limited work rights', value: 'study_permit' },
    ],
  },
  {
    label: 'Work permit or visa held',
    options: [
      { label: 'I hold a valid work visa or permit for the role country', value: 'work_permit' },
      { label: 'Open work permit valid in multiple countries', value: 'open_permit' },
    ],
  },
  {
    label: 'Permanent residence / settled status',
    options: [
      { label: 'ILR or Settled Status, United Kingdom', value: 'ilr_uk' },
      { label: 'Lawful Permanent Residence (Green Card), United States', value: 'green_card' },
      { label: 'Permanent Residency, Canada', value: 'pr_canada' },
      { label: 'Permanent Residency, Australia or New Zealand', value: 'pr_aus_nz' },
      { label: 'Permanent Residency, EU member state', value: 'pr_eu' },
      { label: 'Long-term or permanent residence, other', value: 'pr_other' },
    ],
  },
  {
    label: 'Sponsorship required',
    options: [
      { label: 'I require visa sponsorship from the employer', value: 'need_sponsorship' },
      { label: 'Remote or consultancy roles only, no country-specific rights', value: 'remote_only' },
    ],
  },
];

// =============================================
// RELOCATION OPTIONS
// =============================================
export const RELOCATION_OPTIONS = [
  { label: 'Yes, open to relocation anywhere', value: 'open' },
  { label: 'Yes, specific countries or regions only', value: 'specific' },
  { label: 'No, staying in my current location', value: 'no' },
  { label: 'Remote only, no physical relocation', value: 'remote' },
];

// =============================================
// WORK ARRANGEMENT OPTIONS
// =============================================
export const WORK_ARRANGEMENT_OPTIONS = [
  { label: 'Fully remote', value: 'fully-remote' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'Onsite / in-person', value: 'onsite' },
  { label: 'Flexible, open to any', value: 'flexible' },
];

// =============================================
// STUDY PERMIT HOURS (per country)
// =============================================
export const STUDY_HOURS: StudyHoursMap = {
  'United Kingdom':    { term: '20 hrs/week', holidays: 'Full-time during vacations' },
  'United States':     { term: '20 hrs/week on campus; off-campus OPT/CPT eligible', holidays: 'Full-time during breaks' },
  'Canada':            { term: '24 hrs/week off-campus (from Nov 2024)', holidays: 'Full-time during scheduled breaks' },
  'Australia':         { term: '48 hrs per fortnight (Subclass 500)', holidays: 'Unlimited when course not in session' },
  'New Zealand':       { term: '25 hrs/week (from Nov 2025)', holidays: 'Full-time during holidays' },
  'Germany':           { term: '120 full days or 240 half-days per year', holidays: 'Included in annual limit' },
  'France':            { term: '964 hrs/year (~20 hrs/week)', holidays: 'Included in annual limit' },
  'Netherlands':       { term: '16 hrs/week during term', holidays: 'Full-time during summer break' },
  'Ireland':           { term: '20 hrs/week during term', holidays: 'Full-time during summer (June–Sept)' },
  'Sweden':            { term: 'No statutory cap (check visa)', holidays: 'No statutory cap' },
  'Denmark':           { term: '20 hrs/week during academic year', holidays: 'Full-time during breaks' },
  'Norway':            { term: '20 hrs/week during term', holidays: 'Full-time during holidays' },
  'Finland':           { term: '25 hrs/week during term', holidays: 'Full-time during holidays' },
  'Spain':             { term: '30 hrs/week', holidays: 'Full-time during academic breaks' },
  'Portugal':          { term: '20 hrs/week', holidays: 'Full-time during vacations' },
  'Italy':             { term: '20 hrs/week', holidays: 'Full-time during breaks' },
  'Belgium':           { term: '20 hrs/week', holidays: 'Full-time during vacations' },
  'Switzerland':       { term: '15 hrs/week during term', holidays: 'Full-time during holidays' },
  'Singapore':         { term: '16 hrs/week (Student Pass)', holidays: 'Full-time during scheduled vacations' },
  'Japan':             { term: '28 hrs/week', holidays: 'Full-time during designated vacation periods' },
  'South Korea':       { term: '20 hrs/week', holidays: 'Full-time during vacation periods' },
  'South Africa':      { term: '20 hrs/week (Study Visa)', holidays: 'Full-time during vacations' },
};
