export type JobBadgeType = 'top_match' | 'actively_hiring' | null;

export interface CourseRelatedJob {
  id: string;
  slug: string;
  title: string;
  companyName: string;
  companyInitials: string;
  companyLogoUrl?: string;
  isVerifiedEmployer?: boolean;
  location: string;
  workArrangement: 'Remote' | 'Hybrid' | 'On-site';
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryFormatted?: string;
  salaryPeriod?: 'yr' | 'mo' | string;
  currency?: string;
  matchedSkills: string[];
  description?: string;
  badgeType?: JobBadgeType;
  badgeLabel?: string;
  isApplied?: boolean;
}

/**
 * Strips noise words ("The", "A", "An") to produce clean 2-letter initials
 */
export const getCleanCompanyInitials = (name: string): string => {
  if (!name) return 'VO';
  const clean = name.replace(/^(the|a|an)\s+/i, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
};

/**
 * Standardizes salary formatting with an en-dash and annual/monthly period label:
 * e.g., "$85,000 – $115,000 / yr"
 */
export const formatSalaryRange = (
  min?: number | string | null,
  max?: number | string | null,
  period: 'yr' | 'mo' | string = 'yr',
  currency = '$'
): string => {
  const parseNum = (v: any): number | null => {
    if (v == null) return null;
    if (typeof v === 'number') return isNaN(v) ? null : v;
    if (typeof v === 'string') {
      const cleaned = v.replace(/[^0-9.]/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    }
    return null;
  };

  const numMin = parseNum(min);
  const numMax = parseNum(max);

  if (numMin != null && numMax != null) {
    const minStr = numMin.toLocaleString('en-US');
    const maxStr = numMax.toLocaleString('en-US');
    return `${currency}${minStr} – ${currency}${maxStr} / ${period}`;
  }

  if (numMin != null) {
    return `From ${currency}${numMin.toLocaleString('en-US')} / ${period}`;
  }

  if (numMax != null) {
    return `Up to ${currency}${numMax.toLocaleString('en-US')} / ${period}`;
  }

  return 'Competitive compensation';
};

export const getRelatedJobsForCourse = (
  courseTitle?: string,
  category?: string
): CourseRelatedJob[] => {
  const normTitle = (courseTitle || '').toLowerCase();
  const normCat = (category || '').toLowerCase();

  // 1. Epidemiology & Health Systems / Outbreak
  if (
    normCat.includes('epidemiolog') ||
    normCat.includes('health') ||
    normTitle.includes('epidemiolog') ||
    normTitle.includes('surveillance') ||
    normTitle.includes('outbreak') ||
    normTitle.includes('global health')
  ) {
    return [
      {
        id: 'job-epi-lead-1',
        slug: 'lead-field-epidemiologist',
        title: 'Lead Field Epidemiologist',
        companyName: 'West Africa Health Collaborative',
        companyInitials: getCleanCompanyInitials('West Africa Health Collaborative'),
        isVerifiedEmployer: true,
        location: 'Accra, Ghana',
        workArrangement: 'Hybrid',
        salaryMin: 85000,
        salaryMax: 115000,
        salaryPeriod: 'yr',
        currency: '$',
        matchedSkills: [
          'Disease Outbreak Telemetry',
          'Field Epidemiology',
          'Surveillance Systems',
          'Data Hygiene',
        ],
        description:
          'Coordinate rapid-response epidemiological investigations, analyze field telemetry across LMIC communities, and deploy intervention protocols.',
        badgeType: 'top_match',
      },
      {
        id: 'job-health-sys-2',
        slug: 'public-health-surveillance-officer',
        title: 'Public Health Surveillance Officer',
        companyName: 'Global Health Telemetry Labs',
        companyInitials: getCleanCompanyInitials('Global Health Telemetry Labs'),
        isVerifiedEmployer: true,
        location: 'Sub-Saharan Africa',
        workArrangement: 'Remote',
        salaryMin: 72000,
        salaryMax: 95000,
        salaryPeriod: 'yr',
        currency: '$',
        matchedSkills: [
          'Contact Tracing Workflows',
          'Clinical Data Hygiene',
          'Multilateral Reporting',
          'Protocol Auditing',
        ],
        description:
          'Design resilient surveillance architectures and monitor epidemic indicators with regional health ministries and donor partners.',
        badgeType: 'actively_hiring',
      },
      {
        id: 'job-clinical-coord-3',
        slug: 'clinical-trial-operations-manager',
        title: 'Clinical Trial Operations Manager',
        companyName: 'The Wellcome Clinical Consortium',
        companyInitials: getCleanCompanyInitials('The Wellcome Clinical Consortium'),
        isVerifiedEmployer: true,
        location: 'Nairobi, Kenya',
        workArrangement: 'Hybrid',
        salaryMin: 80000,
        salaryMax: 105000,
        salaryPeriod: 'yr',
        currency: '$',
        matchedSkills: [
          'Clinical Trial Protocols',
          'Cross-Border Ethics',
          'Healthcare Infrastructure',
        ],
        description:
          'Supervise clinical phase trials, manage data integrity protocols, and bridge local clinic deployments with international standards.',
        badgeType: null,
      },
    ];
  }

  // 2. Health Data, Informatics & Biostatistics
  if (
    normCat.includes('data') ||
    normTitle.includes('data') ||
    normTitle.includes('informatics') ||
    normTitle.includes('biostat')
  ) {
    return [
      {
        id: 'job-data-analyst-1',
        slug: 'health-data-analyst-lead',
        title: 'Health Data Systems Analyst',
        companyName: 'UNICEF Health Informatics Group',
        companyInitials: getCleanCompanyInitials('UNICEF Health Informatics Group'),
        isVerifiedEmployer: true,
        location: 'Africa & LMIC',
        workArrangement: 'Remote',
        salaryMin: 78000,
        salaryMax: 102000,
        salaryPeriod: 'yr',
        currency: '$',
        matchedSkills: [
          'Biostatistical Modeling',
          'Predictive Analytics',
          'Data Hygiene',
        ],
        description:
          'Analyze high-dimensional clinical records, public health surveillance telemetry, and predictive models into actionable interventions.',
        badgeType: 'top_match',
      },
      {
        id: 'job-biostat-fellow-2',
        slug: 'biostatistician-outbreak-modeling-fellow',
        title: 'Biostatistician & Outbreak Modeling Fellow',
        companyName: 'African Center of Excellence for Genomics',
        companyInitials: getCleanCompanyInitials('African Center of Excellence for Genomics'),
        isVerifiedEmployer: true,
        location: 'Lagos, Nigeria',
        workArrangement: 'Hybrid',
        salaryMin: 84000,
        salaryMax: 110000,
        salaryPeriod: 'yr',
        currency: '$',
        matchedSkills: [
          'Statistical Software Toolkits',
          'Epidemic Curve Modeling',
          'Clinical Trials',
        ],
        description:
          'Build computational models of viral propagation and advise emergency response teams on resource allocation.',
        badgeType: 'actively_hiring',
      },
    ];
  }

  // 3. General Global Health Masterclasses
  return [
    {
      id: 'job-health-fellow-1',
      slug: 'global-health-research-fellow',
      title: 'Global Health Systems Research Fellow',
      companyName: 'International Health Alliance',
      companyInitials: getCleanCompanyInitials('International Health Alliance'),
      isVerifiedEmployer: true,
      location: 'Global',
      workArrangement: 'Remote',
      salaryMin: 75000,
      salaryMax: 98000,
      salaryPeriod: 'yr',
      currency: '$',
      matchedSkills: [
        'Healthcare Delivery Frameworks',
        'Policy Analysis',
        'Field Implementation',
      ],
      description:
        'Collaborate with international NGOs on health equity, primary healthcare resilience, and strategic donor funding.',
      badgeType: 'top_match',
    },
    {
      id: 'job-health-coord-2',
      slug: 'public-health-program-coordinator',
      title: 'Public Health Program Coordinator',
      companyName: 'The Alliance for Community Resilience',
      companyInitials: getCleanCompanyInitials('The Alliance for Community Resilience'),
      isVerifiedEmployer: true,
      location: 'Accra, Ghana',
      workArrangement: 'Hybrid',
      salaryMin: 68000,
      salaryMax: 88000,
      salaryPeriod: 'yr',
      currency: '$',
      matchedSkills: [
        'Community Worker Deployment',
        'Health Economics',
        'Operational Logistics',
      ],
      description:
        'Drive field execution of clinical and preventive health initiatives across urban and peri-urban regional centers.',
      badgeType: null,
    },
  ];
};
