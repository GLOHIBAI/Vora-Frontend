import type { OptionGroup, Option } from '../types';

export const STEPS = [
  { id: 1, title: 'Role details', sub: 'Title, level & location' },
  { id: 2, title: 'Responsibilities & skills', sub: 'What they will do' },
  { id: 3, title: 'Experience & background', sub: 'Qualifications & languages' },
  { id: 4, title: 'Team collaboration & communication', sub: 'Culture & style' },
  { id: 5, title: 'Compensation & documentation', sub: 'Budget & benefits' },
  { id: 6, title: 'Preview', sub: 'Final review' }
];

export const ROLE_TYPE_GROUPS: OptionGroup[] = [
  {
    label: 'Employment',
    options: [
      { label: 'Full-time employment', value: 'Full-time employment' },
      { label: 'Part-time employment', value: 'Part-time employment' }
    ]
  },
  {
    label: 'Contract & Consultancy',
    options: [
      { label: 'Contract', value: 'Contract' },
      { label: 'Consultancy', value: 'Consultancy' },
      { label: 'Locum / Agency shift', value: 'Locum / Agency shift' },
      { label: 'Secondment', value: 'Secondment' }
    ]
  },
  {
    label: 'Internships & Placements',
    options: [
      { label: 'Internship (paid)', value: 'Internship (paid)' },
      { label: 'Internship (unpaid)', value: 'Internship (unpaid)' },
      { label: 'Academic placement (degree requirement)', value: 'Academic placement (degree requirement)' },
      { label: 'Traineeship', value: 'Traineeship' },
      { label: 'Volunteer placement', value: 'Volunteer placement' }
    ]
  },
  {
    label: 'Fellowships & Scholarships',
    options: [
      { label: 'Fellowship', value: 'Fellowship' },
      { label: 'Postdoctoral fellowship', value: 'Postdoctoral fellowship' }
    ]
  },
  {
    label: 'Academic & Research',
    options: [
      { label: 'PhD studentship (funded)', value: 'PhD studentship (funded)' },
      { label: 'PhD studentship (self-funded)', value: 'PhD studentship (self-funded)' },
      { label: 'Research associate / postdoc', value: 'Research associate / postdoc' },
      { label: 'Teaching post', value: 'Teaching post' }
    ]
  },
  {
    label: 'Clinical Training',
    options: [
      { label: 'Residency / Foundation year placement', value: 'Residency / Foundation year placement' },
      { label: 'Government / VSO placement', value: 'Government / VSO placement' },
      { label: 'Clinical elective (student observership)', value: 'Clinical elective (student observership)' },
      { label: 'Pre-registration placement (pharmacy / allied health)', value: 'Pre-registration placement (pharmacy / allied health)' }
    ]
  },
  {
    label: 'University — Student Matching',
    options: [
      { label: 'Offer of admission — undergraduate programme', value: 'Offer of admission — undergraduate programme' },
      { label: 'Offer of admission — postgraduate taught (MSc / MPH / MBA)', value: 'Offer of admission — postgraduate taught (MSc / MPH / MBA)' },
      { label: 'Offer of admission — PhD / doctoral programme', value: 'Offer of admission — PhD / doctoral programme' },
      { label: 'Scholarship offer — full or partial funding', value: 'Scholarship offer — full or partial funding' },
      { label: 'Short course / CPD / professional certificate', value: 'Short course / CPD / professional certificate' },
      { label: 'Exchange / visiting student placement', value: 'Exchange / visiting student placement' },
      { label: 'Intercalating year / BSc placement (medical student)', value: 'Intercalating year / BSc placement (medical student)' },
      { label: 'Summer school / intensive programme', value: 'Summer school / intensive programme' }
    ]
  },
  {
    label: 'Health-Adjacent — Operations & Support',
    options: [
      { label: 'Finance / Accounting', value: 'Finance / Accounting' },
      { label: 'Human Resources (HR)', value: 'Human Resources (HR)' },
      { label: 'Procurement / Supply Chain / Logistics', value: 'Procurement / Supply Chain / Logistics' },
      { label: 'Legal / Compliance / Regulatory Affairs', value: 'Legal / Compliance / Regulatory Affairs' },
      { label: 'Administration / Office Management', value: 'Administration / Office Management' },
      { label: 'Customer Service / Patient Services', value: 'Customer Service / Patient Services' },
      { label: 'Facilities / Estates / Engineering', value: 'Facilities / Estates / Engineering' },
      { label: 'Catering / Nutrition Support Services', value: 'Catering / Nutrition Support Services' },
      { label: 'Security / Safeguarding Officer', value: 'Security / Safeguarding Officer' },
      { label: 'Driver / Transport Coordinator', value: 'Driver / Transport Coordinator' }
    ]
  },
  {
    label: 'Health-Adjacent — Technology & Data',
    options: [
      { label: 'Software Engineer / Developer', value: 'Software Engineer / Developer' },
      { label: 'Data Engineer / Analyst', value: 'Data Engineer / Analyst' },
      { label: 'IT Support / Systems Administrator', value: 'IT Support / Systems Administrator' },
      { label: 'Cybersecurity Specialist', value: 'Cybersecurity Specialist' },
      { label: 'UX / Product Designer', value: 'UX / Product Designer' }
    ]
  },
  {
    label: 'Health-Adjacent — Communications & Creative',
    options: [
      { label: 'Graphic Designer', value: 'Graphic Designer' },
      { label: 'Videographer / Photographer', value: 'Videographer / Photographer' },
      { label: 'Social Media Manager', value: 'Social Media Manager' },
      { label: 'Copywriter / Content Creator', value: 'Copywriter / Content Creator' },
      { label: 'Translator / Interpreter', value: 'Translator / Interpreter' },
      { label: 'Fundraising / Development Officer', value: 'Fundraising / Development Officer' },
      { label: 'Grant Writer', value: 'Grant Writer' }
    ]
  }
];

export const EMPLOYMENT_LEVEL_OPTIONS: Option[] = [
  { label: 'Student / Graduate', value: 'Student / Graduate' },
  { label: 'Entry level', value: 'Entry level' },
  { label: 'Mid level', value: 'Mid level' },
  { label: 'Senior level', value: 'Senior level' },
  { label: 'Executive / Director', value: 'Executive / Director' }
];

export const WORK_FORMAT_OPTIONS: Option[] = [
  { label: 'Fully onsite', value: 'Fully onsite' },
  { label: 'Hybrid', value: 'Hybrid' },
  { label: 'Remote - specific timezone(s) required', value: 'Remote - specific timezone(s) required' },
  { label: 'Remote - no timezone restriction', value: 'Remote - no timezone restriction' },
  { label: 'Flexible / candidate preference', value: 'Flexible / candidate preference' }
];

export const INT_POLICY_OPTIONS: Option[] = [
  { label: 'Local candidates only - no international applicants', value: 'Local candidates only - no international applicants' },
  { label: 'Open to international - visa sponsorship offered', value: 'Open to international - visa sponsorship offered' },
  { label: 'Open to international - candidate must have their own right to work', value: 'Open to international - candidate must have their own right to work' },
  { label: 'Global remote - no country-of-residence restriction', value: 'Global remote - no country-of-residence restriction' }
];

export const SECURITY_CLEARANCE_OPTIONS: Option[] = [
  { label: 'None required', value: 'None required' },
  { label: 'Basic background check only', value: 'Basic background check only' },
  { label: 'Government / national security clearance', value: 'Government / national security clearance' },
  { label: 'Five Eyes / allied clearance required', value: 'Five Eyes / allied clearance required' }
];

export const WORK_PERMIT_OPTIONS: Option[] = [
  { label: 'Full right to work required', value: 'Full right to work required' },
  { label: 'Skilled worker / sponsored visa', value: 'Skilled worker / sponsored visa' },
  { label: 'Student visa with work rights', value: 'Student visa with work rights' },
  { label: 'Open / unrestricted work permit', value: 'Open / unrestricted work permit' },
  { label: 'Permanent residency / settled status', value: 'Permanent residency / settled status' },
  { label: 'Consultancy / self-employed arrangement possible', value: 'Consultancy / self-employed arrangement possible' }
];

export const TZ_REGIONS: Record<string, string[]> = {
  EMEA: [
    'UTC+0 (GMT – London, Dublin, Accra, Dakar, Abidjan)',
    'UTC+1 (CET – Paris, Berlin, Rome, Lagos, Kinshasa, Tunis)',
    'UTC+2 (EET – Cairo, Johannesburg, Harare, Lusaka, Helsinki, Athens)',
    'UTC+3 (EAT – Nairobi, Addis Ababa, Mogadishu, Moscow, Riyadh, Kuwait)'
  ],
  AMER: [
    'UTC-8 (PST – Los Angeles, Vancouver)',
    'UTC-7 (MST – Denver, Phoenix)',
    'UTC-6 (CST – Chicago, Mexico City)',
    'UTC-5 (EST – New York, Toronto)',
    'UTC-4 (AST – Caracas, La Paz, Halifax)',
    'UTC-3 (BRT – São Paulo, Buenos Aires, Montevideo)'
  ],
  APAC: [
    'UTC+5:30 (IST – Mumbai, New Delhi)',
    'UTC+6 (BST – Dhaka, Almaty)',
    'UTC+7 (ICT – Bangkok, Jakarta, Hanoi, Phnom Penh)',
    'UTC+8 (SGT/CST – Singapore, Beijing, Manila, Kuala Lumpur, Perth)',
    'UTC+9 (JST/KST – Tokyo, Seoul)',
    'UTC+10 (AEST – Sydney, Melbourne, Brisbane)',
    'UTC+12 (NZST – Auckland, Fiji)'
  ],
  AFRICA: [
    'UTC+0 (GMT – London, Dublin, Accra, Dakar, Abidjan)',
    'UTC+1 (CET – Paris, Berlin, Rome, Lagos, Kinshasa, Tunis)',
    'UTC+2 (EET – Cairo, Johannesburg, Harare, Lusaka, Helsinki, Athens)',
    'UTC+3 (EAT – Nairobi, Addis Ababa, Mogadishu, Moscow, Riyadh, Kuwait)'
  ],
  MENA: [
    'UTC+2 (EET – Cairo, Johannesburg, Harare, Lusaka, Helsinki, Athens)',
    'UTC+3 (EAT – Nairobi, Addis Ababa, Mogadishu, Moscow, Riyadh, Kuwait)',
    'UTC+3:30 (IRST – Tehran)',
    'UTC+4 (GST – Dubai, Abu Dhabi, Baku, Tbilisi)',
    'UTC+5 (PKT – Islamabad, Karachi, Tashkent)'
  ],
  ALL: [
    'UTC+0 (GMT – London, Dublin, Accra, Dakar, Abidjan)',
    'UTC+1 (CET – Paris, Berlin, Rome, Lagos, Kinshasa, Tunis)',
    'UTC+2 (EET – Cairo, Johannesburg, Harare, Lusaka, Helsinki, Athens)',
    'UTC+3 (EAT – Nairobi, Addis Ababa, Mogadishu, Moscow, Riyadh, Kuwait)',
    'UTC+4 (GST – Dubai, Abu Dhabi, Baku, Tbilisi)',
    'UTC+5:30 (IST – Mumbai, New Delhi)',
    'UTC+7 (ICT – Bangkok, Jakarta, Hanoi, Phnom Penh)',
    'UTC+8 (SGT/CST – Singapore, Beijing, Manila, Kuala Lumpur, Perth)',
    'UTC-5 (EST – New York, Toronto)',
    'UTC-3 (BRT – São Paulo, Buenos Aires, Montevideo)',
    'UTC+10 (AEST – Sydney, Melbourne, Brisbane)'
  ]
};

export const TZ_GROUPS = [
  {
    label: 'Americas (AMER)',
    options: [
      { label: 'UTC-8 (PST – Los Angeles, Vancouver)', value: 'UTC-8 (PST – Los Angeles, Vancouver)' },
      { label: 'UTC-7 (MST – Denver, Phoenix)', value: 'UTC-7 (MST – Denver, Phoenix)' },
      { label: 'UTC-6 (CST – Chicago, Mexico City)', value: 'UTC-6 (CST – Chicago, Mexico City)' },
      { label: 'UTC-5 (EST – New York, Toronto)', value: 'UTC-5 (EST – New York, Toronto)' },
      { label: 'UTC-4 (AST – Caracas, La Paz, Halifax)', value: 'UTC-4 (AST – Caracas, La Paz, Halifax)' },
      { label: 'UTC-3 (BRT – São Paulo, Buenos Aires, Montevideo)', value: 'UTC-3 (BRT – São Paulo, Buenos Aires, Montevideo)' }
    ]
  },
  {
    label: 'Western Europe & West Africa (part of EMEA)',
    options: [
      { label: 'UTC+0 (GMT – London, Dublin, Accra, Dakar, Abidjan)', value: 'UTC+0 (GMT – London, Dublin, Accra, Dakar, Abidjan)' },
      { label: 'UTC+1 (CET – Paris, Berlin, Rome, Lagos, Kinshasa, Tunis)', value: 'UTC+1 (CET – Paris, Berlin, Rome, Lagos, Kinshasa, Tunis)' }
    ]
  },
  {
    label: 'Eastern Europe & East/Southern Africa (part of EMEA)',
    options: [
      { label: 'UTC+2 (EET – Cairo, Johannesburg, Harare, Lusaka, Helsinki, Athens)', value: 'UTC+2 (EET – Cairo, Johannesburg, Harare, Lusaka, Helsinki, Athens)' },
      { label: 'UTC+3 (EAT – Nairobi, Addis Ababa, Mogadishu, Moscow, Riyadh, Kuwait)', value: 'UTC+3 (EAT – Nairobi, Addis Ababa, Mogadishu, Moscow, Riyadh, Kuwait)' }
    ]
  },
  {
    label: 'Middle East & Central/South Asia (MENA / part of APAC)',
    options: [
      { label: 'UTC+3:30 (IRST – Tehran)', value: 'UTC+3:30 (IRST – Tehran)' },
      { label: 'UTC+4 (GST – Dubai, Abu Dhabi, Baku, Tbilisi)', value: 'UTC+4 (GST – Dubai, Abu Dhabi, Baku, Tbilisi)' },
      { label: 'UTC+4:30 (AFT – Kabul)', value: 'UTC+4:30 (AFT – Kabul)' },
      { label: 'UTC+5 (PKT – Islamabad, Karachi, Tashkent)', value: 'UTC+5 (PKT – Islamabad, Karachi, Tashkent)' },
      { label: 'UTC+5:30 (IST – Mumbai, New Delhi, Colombo)', value: 'UTC+5:30 (IST – Mumbai, New Delhi, Colombo)' },
      { label: 'UTC+5:45 (NPT – Kathmandu)', value: 'UTC+5:45 (NPT – Kathmandu)' },
      { label: 'UTC+6 (BST – Dhaka, Almaty)', value: 'UTC+6 (BST – Dhaka, Almaty)' }
    ]
  },
  {
    label: 'Southeast & East Asia (APAC)',
    options: [
      { label: 'UTC+7 (ICT – Bangkok, Jakarta, Hanoi, Phnom Penh)', value: 'UTC+7 (ICT – Bangkok, Jakarta, Hanoi, Phnom Penh)' },
      { label: 'UTC+8 (SGT/CST – Singapore, Beijing, Manila, Kuala Lumpur, Perth)', value: 'UTC+8 (SGT/CST – Singapore, Beijing, Manila, Kuala Lumpur, Perth)' },
      { label: 'UTC+9 (JST/KST – Tokyo, Seoul)', value: 'UTC+9 (JST/KST – Tokyo, Seoul)' },
      { label: 'UTC+9:30 (ACST – Darwin, Adelaide)', value: 'UTC+9:30 (ACST – Darwin, Adelaide)' },
      { label: 'UTC+10 (AEST – Sydney, Melbourne, Brisbane)', value: 'UTC+10 (AEST – Sydney, Melbourne, Brisbane)' },
      { label: 'UTC+12 (NZST – Auckland, Fiji)', value: 'UTC+12 (NZST – Auckland, Fiji)' }
    ]
  }
];

export const PREFERRED_WORKING_STYLE_OPTIONS: Option[] = [
  { label: 'Independent / autonomous', value: 'Independent / autonomous' },
  { label: 'Collaborative / team-based', value: 'Collaborative / team-based' },
  { label: 'Field-based / on-the-ground', value: 'Field-based / on-the-ground' },
  { label: 'Clinic or ward-based', value: 'Clinic or ward-based' },
  { label: 'Lab or bench-based', value: 'Lab or bench-based' },
  { label: 'Data-driven / analytical', value: 'Data-driven / analytical' },
  { label: 'Process-oriented / protocol-led', value: 'Process-oriented / protocol-led' },
  { label: 'Fast-paced / adaptive', value: 'Fast-paced / adaptive' },
  { label: 'Research-first', value: 'Research-first' }
];

export const PERSONALITY_TRAITS_OPTIONS: Option[] = [
  { label: 'Empathetic', value: 'Empathetic' },
  { label: 'Patient-focused', value: 'Patient-focused' },
  { label: 'Curious / inquisitive', value: 'Curious / inquisitive' },
  { label: 'Detail-oriented', value: 'Detail-oriented' },
  { label: 'Resilient under pressure', value: 'Resilient under pressure' },
  { label: 'Proactive / self-starting', value: 'Proactive / self-starting' },
  { label: 'Analytical', value: 'Analytical' },
  { label: 'Decisive under uncertainty', value: 'Decisive under uncertainty' },
  { label: 'Tactful / diplomatically aware', value: 'Tactful / diplomatically aware' },
  { label: 'Strong communicator', value: 'Strong communicator' }
];

export const WORK_ENVIRONMENT_OPTIONS: Option[] = [
  { label: 'Collaborative', value: 'Collaborative' },
  { label: 'Remote-first', value: 'Remote-first' },
  { label: 'Onsite / in-person', value: 'Onsite / in-person' },
  { label: 'High clinical standards', value: 'High clinical standards' },
  { label: 'Mission-driven / purpose-led', value: 'Mission-driven / purpose-led' },
  { label: 'High-autonomy', value: 'High-autonomy' },
  { label: 'Structured / protocol-led', value: 'Structured / protocol-led' },
  { label: 'Inclusive / diverse', value: 'Inclusive / diverse' },
  { label: 'Research-oriented', value: 'Research-oriented' },
{ label: 'Commercial / performance-focused', value: 'Commercial / performance-focused' },
  { label: 'Boutique / specialist practice', value: 'Boutique / specialist practice' }
];

export const EXPERIENCE_YEARS_OPTIONS: Option[] = [
  { label: 'No experience required (student / graduate)', value: 'No experience required (student / graduate)' },
  { label: 'Up to 1 year', value: 'Up to 1 year' },
  { label: '1 to 3 years', value: '1 to 3 years' },
  { label: '3 to 5 years', value: '3 to 5 years' },
  { label: '5 to 8 years', value: '5 to 8 years' },
  { label: '8 to 12 years', value: '8 to 12 years' },
  { label: '12+ years (senior / director level)', value: '12+ years (senior / director level)' }
];

export const EXPERIENCE_TYPES_GROUPS: OptionGroup[] = [
  {
    label: 'Clinical',
    options: [
      { label: 'Direct clinical practice', value: 'Direct clinical practice' },
      { label: 'Clinical research / trials', value: 'Clinical research / trials' },
      { label: 'Clinical teaching / training', value: 'Clinical teaching / training' }
    ]
  },
  {
    label: 'Research & Data',
    options: [
      { label: 'Academic / peer-reviewed research', value: 'Academic / peer-reviewed research' },
      { label: 'Quantitative / statistical analysis', value: 'Quantitative / statistical analysis' },
      { label: 'Qualitative research / fieldwork', value: 'Qualitative research / fieldwork' },
      { label: 'Monitoring, evaluation and learning', value: 'Monitoring, evaluation and learning' }
    ]
  },
  {
    label: 'Policy & Programmes',
    options: [
      { label: 'Health policy development or advocacy', value: 'Health policy development or advocacy' },
      { label: 'Programme design and implementation', value: 'Programme design and implementation' },
      { label: 'Donor-funded project management', value: 'Donor-funded project management' }
    ]
  },
  {
    label: 'Operational',
    options: [
      { label: 'Budget management and financial oversight', value: 'Budget management and financial oversight' },
      { label: 'People management / team leadership', value: 'People management / team leadership' },
      { label: 'Stakeholder engagement (government, NGO, multilateral)', value: 'Stakeholder engagement (government, NGO, multilateral)' }
    ]
  }
];

export const MIN_QUALIFICATION_OPTIONS: Option[] = [
  { label: 'No formal qualification required', value: 'No formal qualification required' },
  { label: 'Undergraduate degree (any field)', value: 'Undergraduate degree (any field)' },
  { label: 'Undergraduate degree (health or life science)', value: 'Undergraduate degree (health or life science)' },
  { label: 'Postgraduate degree (Masters or equivalent)', value: 'Postgraduate degree (Masters or equivalent)' },
  { label: 'Postgraduate degree in public health, global health, or epidemiology (MPH, MSc, etc.)', value: 'Postgraduate degree in public health, global health, or epidemiology (MPH, MSc, etc.)' },
  { label: 'Professional clinical qualification (MBBS, MD, MBChB, etc.)', value: 'Professional clinical qualification (MBBS, MD, MBChB, etc.)' },
  { label: 'Professional nursing qualification (RN, RM, BSN, etc.)', value: 'Professional nursing qualification (RN, RM, BSN, etc.)' },
  { label: 'Professional allied health qualification (physiotherapy, OT, radiography, etc.)', value: 'Professional allied health qualification (physiotherapy, OT, radiography, etc.)' },
  { label: 'Professional pharmacy qualification (BPharm, MPharm, PharmD, etc.)', value: 'Professional pharmacy qualification (BPharm, MPharm, PharmD, etc.)' },
  { label: 'Specialist / postgraduate clinical training (MRCP, FRCS, MRCGP, fellowship, residency, etc.)', value: 'Specialist / postgraduate clinical training (MRCP, FRCS, MRCGP, fellowship, residency, etc.)' },
  { label: 'Doctoral degree (PhD or equivalent)', value: 'Doctoral degree (PhD or equivalent)' },
  { label: 'Professional certificate or vocational qualification', value: 'Professional certificate or vocational qualification' }
];

export const SECTOR_BACKGROUND_GROUPS: OptionGroup[] = [
  {
    label: 'Public & Government Sector',
    options: [
      { label: 'National government / ministry of health', value: 'National government / ministry of health' },
      { label: 'National disease control agency (CDC equivalent)', value: 'National disease control agency (CDC equivalent)' },
      { label: 'Sub-national / county / district health office', value: 'Sub-national / county / district health office' },
      { label: 'Public hospital / NHS trust / district hospital', value: 'Public hospital / NHS trust / district hospital' },
      { label: 'Primary care / community health centre', value: 'Primary care / community health centre' },
      { label: 'Armed forces / military health service', value: 'Armed forces / military health service' },
      { label: 'Prison / correctional health service', value: 'Prison / correctional health service' }
    ]
  },
  {
    label: 'International Organisations',
    options: [
      { label: 'UN agency / multilateral organisation (WHO, UNICEF, UNFPA, etc.)', value: 'UN agency / multilateral organisation (WHO, UNICEF, UNFPA, etc.)' },
      { label: 'Bilateral donor agency (USAID, FCDO, GIZ, Sida, etc.)', value: 'Bilateral donor agency (USAID, FCDO, GIZ, Sida, etc.)' },
      { label: 'Development bank (World Bank, AfDB, ADB, etc.)', value: 'Development bank (World Bank, AfDB, ADB, etc.)' },
      { label: 'Global health financing body (GFATM, Gavi, PEPFAR, CEPI, etc.)', value: 'Global health financing body (GFATM, Gavi, PEPFAR, CEPI, etc.)' }
    ]
  },
  {
    label: 'NGO & Civil Society',
    options: [
      { label: 'International NGO (MSF, IRC, CARE, Save the Children, etc.)', value: 'International NGO (MSF, IRC, CARE, Save the Children, etc.)' },
      { label: 'National / local NGO', value: 'National / local NGO' },
      { label: 'Faith-based organisation / mission hospital', value: 'Faith-based organisation / mission hospital' },
      { label: 'Social enterprise / impact organisation', value: 'Social enterprise / impact organisation' }
    ]
  },
  {
    label: 'Private Sector',
    options: [
      { label: 'Private hospital or clinic', value: 'Private hospital or clinic' },
      { label: 'Specialist / boutique clinic (cosmetic, fertility, dental, ophthalmology, etc.)', value: 'Specialist / boutique clinic (cosmetic, fertility, dental, ophthalmology, etc.)' },
      { label: 'Pharmaceutical company', value: 'Pharmaceutical company' },
      { label: 'Biotech / vaccine / biologics company', value: 'Biotech / vaccine / biologics company' },
      { label: 'Medical device / MedTech / surgical equipment company', value: 'Medical device / MedTech / surgical equipment company' },
      { label: 'Diagnostic laboratory / pathology service', value: 'Diagnostic laboratory / pathology service' },
      { label: 'Health insurance / managed care / HMO', value: 'Health insurance / managed care / HMO' },
      { label: 'Digital health / health tech / telehealth startup', value: 'Digital health / health tech / telehealth startup' },
      { label: 'Occupational health / employee wellness provider', value: 'Occupational health / employee wellness provider' },
      { label: 'Oil, gas, mining, or extractives sector health service', value: 'Oil, gas, mining, or extractives sector health service' }
    ]
  },
  {
    label: 'Academic & Research',
    options: [
      { label: 'University / academic institution (faculty hiring)', value: 'University / academic institution (faculty hiring)' },
      { label: 'University / medical school (student matching / admissions)', value: 'University / medical school (student matching / admissions)' },
      { label: 'School of Public Health (MPH / MSc student recruitment)', value: 'School of Public Health (MPH / MSc student recruitment)' },
      { label: 'Research institute or think tank', value: 'Research institute or think tank' },
      { label: 'Teaching hospital (clinical training / elective hosting)', value: 'Teaching hospital (clinical training / elective hosting)' },
      { label: 'Clinical trials / CRO / regulatory environment', value: 'Clinical trials / CRO / regulatory environment' }
    ]
  }
];

export const GEOGRAPHIC_EXPERIENCE_OPTIONS: Option[] = [
  { label: 'Sub-Saharan Africa', value: 'Sub-Saharan Africa' },
  { label: 'East Africa', value: 'East Africa' },
  { label: 'West Africa', value: 'West Africa' },
  { label: 'South Asia', value: 'South Asia' },
  { label: 'South-East Asia', value: 'South-East Asia' },
  { label: 'Middle East and North Africa', value: 'Middle East and North Africa' },
  { label: 'Latin America and Caribbean', value: 'Latin America and Caribbean' },
  { label: 'Eastern Europe or Central Asia', value: 'Eastern Europe or Central Asia' },
  { label: 'High-income country (OECD)', value: 'High-income country (OECD)' },
  { label: 'LMIC experience (any region)', value: 'LMIC experience (any region)' }
];

export const PUBLICATIONS_OPTIONS: Option[] = [
  { label: 'Not required', value: 'Not required' },
  { label: 'At least one peer-reviewed publication', value: 'At least one peer-reviewed publication' },
  { label: '5 or more peer-reviewed publications', value: '5 or more peer-reviewed publications' },
  { label: 'Active publication record in relevant field', value: 'Active publication record in relevant field' },
  { label: 'Policy publications or grey literature', value: 'Policy publications or grey literature' }
];

export const BUDGET_MANAGEMENT_OPTIONS: Option[] = [
  { label: 'Not required', value: 'Not required' },
  { label: 'Under USD 100,000', value: 'Under USD 100,000' },
  { label: 'USD 100,000 to 500,000', value: 'USD 100,000 to 500,000' },
  { label: 'USD 500,000 to 2 million', value: 'USD 500,000 to 2 million' },
  { label: 'Over USD 2 million', value: 'Over USD 2 million' }
];

export const TEAM_MANAGEMENT_OPTIONS: Option[] = [
  { label: 'Not required', value: 'Not required' },
  { label: 'Managed 1 to 5 people', value: 'Managed 1 to 5 people' },
  { label: 'Managed 5 to 20 people', value: 'Managed 5 to 20 people' },
  { label: 'Managed 20+ people or cross-functional teams', value: 'Managed 20+ people or cross-functional teams' }
];

export const INT_POLICY_ELIGIBILITY_OPTIONS: Option[] = [
  { label: 'Open to all nationalities', value: 'Open to all nationalities' },
  { label: 'Work permit / visa sponsorship available', value: 'Work permit / visa sponsorship available' },
  { label: 'Must already hold right to work in posting country', value: 'Must already hold right to work in posting country' },
  { label: 'US federal funding restrictions apply (nationality screening required)', value: 'US federal funding restrictions apply (nationality screening required)' },
  { label: 'EU funding restrictions apply', value: 'EU funding restrictions apply' },
  { label: 'UK ODA restrictions apply', value: 'UK ODA restrictions apply' }
];

export const SECURITY_CLEARANCE_ELIGIBILITY_OPTIONS: Option[] = [
  { label: 'Not required', value: 'Not required' },
  { label: 'Basic DBS / background check', value: 'Basic DBS / background check' },
  { label: 'Enhanced DBS', value: 'Enhanced DBS' },
  { label: 'National security clearance (SC level)', value: 'National security clearance (SC level)' },
  { label: 'Developed Vetting (DV) or equivalent', value: 'Developed Vetting (DV) or equivalent' },
  { label: 'UN security clearance', value: 'UN security clearance' }
];

export const TECHNICAL_SKILLS_GROUPS: OptionGroup[] = [
  {
    label: 'Clinical & Direct Patient Care',
    options: [
      { label: 'Clinical Assessment & Diagnosis', value: 'Clinical Assessment & Diagnosis' },
      { label: 'Patient Management & Treatment Planning', value: 'Patient Management & Treatment Planning' },
      { label: 'Surgical / Procedural Skills', value: 'Surgical / Procedural Skills' },
      { label: 'Emergency & Critical Care', value: 'Emergency & Critical Care' },
      { label: 'Diagnostic Interpretation', value: 'Diagnostic Interpretation' },
      { label: 'Anaesthesia & Perioperative Care', value: 'Anaesthesia & Perioperative Care' },
      { label: 'Intensive Care / ICU Management', value: 'Intensive Care / ICU Management' },
      { label: 'Oncology & Palliative Care', value: 'Oncology & Palliative Care' },
      { label: 'Mental Health Assessment & Therapy', value: 'Mental Health Assessment & Therapy' },
      { label: 'Midwifery & Obstetric Care', value: 'Midwifery & Obstetric Care' },
      { label: 'Paediatric & Neonatal Care', value: 'Paediatric & Neonatal Care' },
      { label: 'Infection Prevention & Control', value: 'Infection Prevention & Control' },
      { label: 'Wound Care & Tissue Viability', value: 'Wound Care & Tissue Viability' },
      { label: 'Point-of-Care Testing', value: 'Point-of-Care Testing' }
    ]
  },
  {
    label: 'Pharmacy & Medicines',
    options: [
      { label: 'Clinical Pharmacology & Medicines Management', value: 'Clinical Pharmacology & Medicines Management' },
      { label: 'Medicines Regulatory Affairs', value: 'Medicines Regulatory Affairs' },
      { label: 'Pharmacovigilance & Drug Safety', value: 'Pharmacovigilance & Drug Safety' },
      { label: 'Clinical Trials Pharmacy & IMP Management', value: 'Clinical Trials Pharmacy & IMP Management' },
      { label: 'Aseptic Services / IV Admixture', value: 'Aseptic Services / IV Admixture' },
      { label: 'Supply Chain & Medicines Procurement', value: 'Supply Chain & Medicines Procurement' }
    ]
  },
  {
    label: 'Allied Health & Therapy',
    options: [
      { label: 'Physiotherapy & Rehabilitation', value: 'Physiotherapy & Rehabilitation' },
      { label: 'Occupational Therapy', value: 'Occupational Therapy' },
      { label: 'Speech & Language Therapy', value: 'Speech & Language Therapy' },
      { label: 'Diagnostic Radiography / Medical Imaging', value: 'Diagnostic Radiography / Medical Imaging' },
      { label: 'Radiotherapy & Oncology', value: 'Radiotherapy & Oncology' },
      { label: 'Dietetics & Nutrition Assessment', value: 'Dietetics & Nutrition Assessment' },
      { label: 'Optometry & Vision Care', value: 'Optometry & Vision Care' },
      { label: 'Dental / Oral Health Practice', value: 'Dental / Oral Health Practice' },
      { label: 'Prosthetics & Orthotics', value: 'Prosthetics & Orthotics' }
    ]
  },
  {
    label: 'Laboratory & Diagnostics',
    options: [
      { label: 'Clinical Laboratory Techniques', value: 'Clinical Laboratory Techniques' },
      { label: 'Microbiology & Bacteriology', value: 'Microbiology & Bacteriology' },
      { label: 'Virology & Molecular Diagnostics', value: 'Virology & Molecular Diagnostics' },
      { label: 'Histopathology & Cytology', value: 'Histopathology & Cytology' },
      { label: 'Haematology & Blood Bank', value: 'Haematology & Blood Bank' },
      { label: 'Lab QA & Accreditation (ISO 15189)', value: 'Lab QA & Accreditation (ISO 15189)' }
    ]
  },
  {
    label: 'Research & Epidemiology',
    options: [
      { label: 'Epidemiological Methods', value: 'Epidemiological Methods' },
      { label: 'Research Study Design', value: 'Research Study Design' },
      { label: 'Clinical Trials Management', value: 'Clinical Trials Management' },
      { label: 'Biostatistics', value: 'Biostatistics' },
      { label: 'Data Analysis & Statistics', value: 'Data Analysis & Statistics' },
      { label: 'Qualitative Research Methods', value: 'Qualitative Research Methods' },
      { label: 'Health Economics Modelling', value: 'Health Economics Modelling' },
      { label: 'Systematic Reviews & Meta-analysis', value: 'Systematic Reviews & Meta-analysis' }
    ]
  },
  {
    label: 'Public Health & Health Systems',
    options: [
      { label: 'Health Systems Analysis', value: 'Health Systems Analysis' },
      { label: 'Monitoring, Evaluation & Learning', value: 'Monitoring, Evaluation & Learning' },
      { label: 'Programme Design & Implementation', value: 'Programme Design & Implementation' },
      { label: 'Health Policy Analysis & Advocacy', value: 'Health Policy Analysis & Advocacy' },
      { label: 'Health Financing & Costing', value: 'Health Financing & Costing' },
      { label: 'Community Health Programming', value: 'Community Health Programming' },
      { label: 'Nutrition Programme Management', value: 'Nutrition Programme Management' }
    ]
  },
  {
    label: 'Operations & Management',
    options: [
      { label: 'Project & Programme Management', value: 'Project & Programme Management' },
      { label: 'Grant Writing & Proposal Development', value: 'Grant Writing & Proposal Development' },
      { label: 'Budget Management & Financial Oversight', value: 'Budget Management & Financial Oversight' },
      { label: 'Procurement & Supply Chain', value: 'Procurement & Supply Chain' },
      { label: 'Human Resources for Health', value: 'Human Resources for Health' },
      { label: 'Stakeholder Engagement', value: 'Stakeholder Engagement' },
      { label: 'Health Communication & SBCC', value: 'Health Communication & SBCC' }
    ]
  },
  {
    label: 'Digital Health & Informatics',
    options: [
      { label: 'Health Information Systems', value: 'Health Information Systems' },
      { label: 'Interoperability (HL7, FHIR)', value: 'Interoperability (HL7, FHIR)' },
      { label: 'Telemedicine & Digital Platforms', value: 'Telemedicine & Digital Platforms' },
      { label: 'AI / Machine Learning in Health', value: 'AI / Machine Learning in Health' }
    ]
  },
  {
    label: 'Creative & Communications (Health Sector)',
    options: [
      { label: 'Graphic Design', value: 'Graphic Design' },
      { label: 'Video Production / Photography', value: 'Video Production / Photography' },
      { label: 'Copywriting / Medical Writing', value: 'Copywriting / Medical Writing' },
      { label: 'Social Media Management', value: 'Social Media Management' },
      { label: 'Translation / Interpretation', value: 'Translation / Interpretation' },
      { label: 'Fundraising & Development', value: 'Fundraising & Development' }
    ]
  },
  {
    label: 'Technology (Health Sector)',
    options: [
      { label: 'Software Development', value: 'Software Development' },
      { label: 'Data Engineering', value: 'Data Engineering' },
      { label: 'UX / Product Design', value: 'UX / Product Design' },
      { label: 'Cybersecurity', value: 'Cybersecurity' },
      { label: 'IT Support & Systems Admin', value: 'IT Support & Systems Admin' }
    ]
  },
  {
    label: 'Finance, HR & Administration (Health Sector)',
    options: [
      { label: 'Financial Accounting', value: 'Financial Accounting' },
      { label: 'HR Management', value: 'HR Management' },
      { label: 'Legal & Regulatory Compliance', value: 'Legal & Regulatory Compliance' },
      { label: 'Logistics & Fleet Management', value: 'Logistics & Fleet Management' },
      { label: 'Facilities & Estates Management', value: 'Facilities & Estates Management' }
    ]
  }
];

export const TOOLS_SOFTWARE_GROUPS: OptionGroup[] = [
  {
    label: 'Research & Statistics',
    options: [
      { label: 'STATA', value: 'STATA' },
      { label: 'R / RStudio', value: 'R / RStudio' },
      { label: 'SPSS', value: 'SPSS' },
      { label: 'Python', value: 'Python' },
      { label: 'SAS', value: 'SAS' },
      { label: 'MATLAB', value: 'MATLAB' },
      { label: 'NVivo (qualitative)', value: 'NVivo (qualitative)' },
      { label: 'MS Excel (advanced)', value: 'MS Excel (advanced)' },
      { label: 'Tableau / Power BI', value: 'Tableau / Power BI' }
    ]
  },
  {
    label: 'Health Information Systems',
    options: [
      { label: 'DHIS2', value: 'DHIS2' },
      { label: 'OpenMRS', value: 'OpenMRS' },
      { label: 'KoBoToolbox / ODK', value: 'KoBoToolbox / ODK' },
      { label: 'REDCap', value: 'REDCap' },
      { label: 'SurveyCTO / CommCare', value: 'SurveyCTO / CommCare' },
      { label: 'LMIS / Supply chain systems', value: 'LMIS / Supply chain systems' }
    ]
  },
  {
    label: 'Clinical Systems & EHR',
    options: [
      { label: 'Epic / Cerner / NHS Spine', value: 'Epic / Cerner / NHS Spine' },
      { label: 'iClinic / Meditech / Sunrise', value: 'iClinic / Meditech / Sunrise' },
      { label: 'PACS / RIS (radiology)', value: 'PACS / RIS (radiology)' },
      { label: 'LIMS (laboratory)', value: 'LIMS (laboratory)' },
      { label: 'Pharmacy dispensing software', value: 'Pharmacy dispensing software' }
    ]
  },
  {
    label: 'Field & Spatial',
    options: [
      { label: 'GIS / QGIS / ArcGIS', value: 'GIS / QGIS / ArcGIS' },
      { label: 'Google Earth Engine', value: 'Google Earth Engine' },
      { label: 'Mobile data collection', value: 'Mobile data collection' }
    ]
  },
  {
    label: 'Finance, Operations & PM',
    options: [
      { label: 'SAP / Oracle Financials', value: 'SAP / Oracle Financials' },
      { label: 'MS Project / Asana / Jira', value: 'MS Project / Asana / Jira' },
      { label: 'Salesforce / CRM', value: 'Salesforce / CRM' },
      { label: 'QuickBooks / Sage', value: 'QuickBooks / Sage' }
    ]
  },
  {
    label: 'Creative & Communications',
    options: [
      { label: 'Adobe InDesign / Illustrator / Photoshop', value: 'Adobe InDesign / Illustrator / Photoshop' },
      { label: 'Canva / Figma / Sketch', value: 'Canva / Figma / Sketch' },
      { label: 'Adobe Premiere / Final Cut (video)', value: 'Adobe Premiere / Final Cut (video)' },
      { label: 'WordPress / Webflow / CMS', value: 'WordPress / Webflow / CMS' },
      { label: 'Mailchimp / HubSpot', value: 'Mailchimp / HubSpot' },
      { label: 'Social media scheduling tools', value: 'Social media scheduling tools' }
    ]
  },
  {
    label: 'Technology & Engineering',
    options: [
      { label: 'Python / R / SQL', value: 'Python / R / SQL' },
      { label: 'JavaScript / TypeScript / React', value: 'JavaScript / TypeScript / React' },
      { label: 'Cloud platforms (AWS / Azure / GCP)', value: 'Cloud platforms (AWS / Azure / GCP)' },
      { label: 'Tableau / Power BI / Looker', value: 'Tableau / Power BI / Looker' },
      { label: 'Data pipeline tools (dbt / Airflow)', value: 'Data pipeline tools (dbt / Airflow)' }
    ]
  },
  {
    label: 'HR, Finance & Administration',
    options: [
      { label: 'BambooHR / Workday / HRIS', value: 'BambooHR / Workday / HRIS' },
      { label: 'Xero / NetSuite / ERP', value: 'Xero / NetSuite / ERP' },
      { label: 'Raiser\'s Edge / Salesforce NPSP', value: 'Raiser\'s Edge / Salesforce NPSP' }
    ]
  }
];

export const LANGUAGE_OPTIONS: Option[] = [
  { label: 'English', value: 'English' },
  { label: 'French', value: 'French' },
  { label: 'Spanish', value: 'Spanish' },
  { label: 'Arabic', value: 'Arabic' },
  { label: 'Portuguese', value: 'Portuguese' },
  { label: 'Swahili', value: 'Swahili' },
  { label: 'Mandarin', value: 'Mandarin' },
  { label: 'German', value: 'German' },
  { label: 'Dutch', value: 'Dutch' },
  { label: 'Russian', value: 'Russian' }
];

export const PRE_ASSESSMENT_GROUPS: OptionGroup[] = [
  {
    label: 'Written & Research',
    options: [
      { label: 'Writing sample (any format)', value: 'Writing sample (any format)' },
      { label: 'Published research paper or preprint', value: 'Published research paper or preprint' },
      { label: 'Policy brief or situation report', value: 'Policy brief or situation report' },
      { label: 'Grant proposal or project report', value: 'Grant proposal or project report' },
      { label: 'Literature review or systematic review', value: 'Literature review or systematic review' },
      { label: 'Dissertation or thesis chapter', value: 'Dissertation or thesis chapter' }
    ]
  },
  {
    label: 'Clinical & Practice',
    options: [
      { label: 'Clinical case summary (anonymised)', value: 'Clinical case summary (anonymised)' },
      { label: 'Procedure log or operative record (anonymised)', value: 'Procedure log or operative record (anonymised)' },
      { label: 'Clinical audit or quality improvement report', value: 'Clinical audit or quality improvement report' },
      { label: 'Before/after portfolio (aesthetic or reconstructive)', value: 'Before/after portfolio (aesthetic or reconstructive)' },
      { label: 'Patient education material or discharge summary', value: 'Patient education material or discharge summary' }
    ]
  },
  {
    label: 'Technical & Data',
    options: [
      { label: 'Code repository, script or data pipeline', value: 'Code repository, script or data pipeline' },
      { label: 'Data analysis or dashboard sample', value: 'Data analysis or dashboard sample' },
      { label: 'Protocol or standard operating procedure', value: 'Protocol or standard operating procedure' }
    ]
  },
  {
    label: 'Portfolio & Creative',
    options: [
      { label: 'Professional portfolio or work samples', value: 'Professional portfolio or work samples' },
      { label: 'Training material or curriculum sample', value: 'Training material or curriculum sample' },
      { label: 'Communication or campaign material', value: 'Communication or campaign material' }
    ]
  }
];
