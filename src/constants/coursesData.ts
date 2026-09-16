export interface ChapterItem {
  id: number;
  chapterNumber: number;
  title: string;
  duration: string;
  status: 'Completed' | 'Ongoing' | 'Upcoming' | 'Locked';
  thumbnail: string;
  description?: string;
}

export interface LessonOutlineItem {
  id: number;
  title: string;
  duration: string;
  type: 'video' | 'quiz' | 'reading';
}

export interface LessonOutlineSection {
  id: number;
  title: string;
  lessons: LessonOutlineItem[];
}

export interface CourseReview {
  id: number;
  author: string;
  timeAgo: string;
  rating: number;
  content: string;
}

export interface CourseQuestion {
  id: number;
  title: string;
  preview: string;
  repliesCount: number;
  timeAgo: string;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  instructorTitle: string;
  instructorBio: string;
  instructorPhoto: string;
  thumbnail: string;
  bannerImage: string;
  category: string;
  price: number;
  totalTime: string;
  estimatedCompletion: string;
  progressPercentage: number;
  completedChapters: number;
  totalChapters: number;
  currentChapterNumber: number;
  currentChapterTitle: string;
  skillLevel: string;
  studentsCount: string;
  language: string;
  ratings: number;
  ratingsCount: string;
  videoDuration: string;
  description: string;
  status: 'ongoing' | 'completed' | 'recommended';
  assessmentScore?: number;
  lessonsCompletedCount?: number;
  dateCompleted?: string;
  tags?: string[];
  chapters: ChapterItem[];
  outline: LessonOutlineSection[];
  reviews: CourseReview[];
  questions: CourseQuestion[];
}

export const COURSES_DATA: Course[] = [
  {
    id: 'advance-proficiency-in-health-data',
    title: 'Advance Proficiency in Health Data',
    instructor: 'Dr. Krishna Kashmir (Senior Researcher Google)',
    instructorTitle: 'Senior Manager KPMG | Ex-Google | Life coach | Mentor',
    instructorBio: 'Dr. Krishna specializes in translating high-dimensional clinical records, public health surveillance telemetry, and predictive modeling into actionable interventions for health systems worldwide.',
    instructorPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
    category: 'Health Data',
    price: 140,
    totalTime: '2 hours',
    estimatedCompletion: 'Jan 27, 2026',
    progressPercentage: 8,
    completedChapters: 5,
    totalChapters: 20,
    currentChapterNumber: 5,
    currentChapterTitle: 'Introduction to Health Data',
    skillLevel: 'Beginners',
    studentsCount: '3,234',
    language: 'English',
    ratings: 4.8,
    ratingsCount: '1,234',
    videoDuration: '2 hours',
    description: 'Lorem ipsum dolor sit amet consectetur. A odio scelerisque id ultricies blandit. Scelerisque bibendum vulputate fames odio tellus sed blandit convallis. Lorem ipsum dolor sit amet consectetur. A odio scelerisque id ultricies blandit. Scelerisque bibendum vulputate fames odio tellus sed blandit convallis. Lorem ipsum dolor sit amet consectetur. A odio scelerisque id ultricies blandit. Scelerisque bibendum vulputate fames odio tellus sed blandit convallis.',
    status: 'ongoing',
    tags: ['Intermediate', 'Online-video', 'Self-paced'],
    chapters: [
      {
        id: 1,
        chapterNumber: 1,
        title: 'Meet your Instructor',
        duration: '12:00',
        status: 'Completed',
        thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 2,
        chapterNumber: 2,
        title: 'Meet your Instructor',
        duration: '12:00',
        status: 'Ongoing',
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 3,
        chapterNumber: 3,
        title: 'Health Systems Diagnostics',
        duration: '15:00',
        status: 'Upcoming',
        thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 4,
        chapterNumber: 4,
        title: 'Predictive Outbreak Modeling',
        duration: '18:00',
        status: 'Upcoming',
        thumbnail: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=400&auto=format&fit=crop'
      }
    ],
    outline: [
      {
        id: 1,
        title: 'Introduction to Health Data',
        lessons: [
          { id: 101, title: 'Welcome to Health Data Basics', duration: 'Video (2 minutes)', type: 'video' },
          { id: 102, title: 'Welcome to Health Data Basics', duration: 'Video (2 minutes)', type: 'video' },
          { id: 103, title: 'Welcome to Health Data Basics', duration: 'Video (2 minutes)', type: 'video' }
        ]
      },
      {
        id: 2,
        title: 'Introduction to Health Data',
        lessons: [
          { id: 201, title: 'Data Gathering Principles', duration: 'Video (3 minutes)', type: 'video' },
          { id: 202, title: 'Clinical Survey Design', duration: 'Video (4 minutes)', type: 'video' }
        ]
      },
      {
        id: 3,
        title: 'Introduction to Health Data',
        lessons: [
          { id: 301, title: 'Quantitative Analytics Models', duration: 'Video (5 minutes)', type: 'video' }
        ]
      },
      {
        id: 4,
        title: 'Introduction to Health Data',
        lessons: [
          { id: 401, title: 'Epidemiological Metrics', duration: 'Video (3 minutes)', type: 'video' }
        ]
      },
      {
        id: 5,
        title: 'Introduction to Health Data',
        lessons: [
          { id: 501, title: 'Predictive Outbreak Modeling', duration: 'Video (6 minutes)', type: 'video' }
        ]
      },
      {
        id: 6,
        title: 'Introduction to Health Data',
        lessons: [
          { id: 601, title: 'Summary & Next Steps', duration: 'Video (2 minutes)', type: 'video' }
        ]
      }
    ],
    reviews: [
      {
        id: 1,
        author: 'Jack Harrison',
        timeAgo: '2 weeks ago',
        rating: 4,
        content: 'Lorem ipsum dolor sit amet consectetur. A odio scelerisque id ultricies blandit. Scelerisque bibendum vulputate fames odio tellus sed blandit convallis.'
      },
      {
        id: 2,
        author: 'Jack Harrison',
        timeAgo: '2 weeks ago',
        rating: 4,
        content: 'Lorem ipsum dolor sit amet consectetur. A odio scelerisque id ultricies blandit. Scelerisque bibendum vulputate fames odio tellus sed blandit convallis.'
      },
      {
        id: 3,
        author: 'Jack Harrison',
        timeAgo: '2 weeks ago',
        rating: 4,
        content: 'Lorem ipsum dolor sit amet consectetur. A odio scelerisque id ultricies blandit. Scelerisque bibendum vulputate fames odio tellus sed blandit convallis.'
      },
      {
        id: 4,
        author: 'Jack Harrison',
        timeAgo: '2 weeks ago',
        rating: 4,
        content: 'Lorem ipsum dolor sit amet consectetur. A odio scelerisque id ultricies blandit. Scelerisque bibendum vulputate fames odio tellus sed blandit convallis.'
      }
    ],
    questions: [
      {
        id: 1,
        title: 'Health Data Basics',
        preview: 'I just finished the first course but need clarity on Health Data telemetry integration.',
        repliesCount: 7,
        timeAgo: '2 days ago'
      },
      {
        id: 2,
        title: 'Health Data Basics',
        preview: 'I just finished the first course but need clarity on Health Data statistical variance.',
        repliesCount: 7,
        timeAgo: '3 days ago'
      },
      {
        id: 3,
        title: 'Health Data Basics',
        preview: 'I just finished the first course but need clarity on Health Data clinical governance.',
        repliesCount: 7,
        timeAgo: '5 days ago'
      },
      {
        id: 4,
        title: 'Health Data Basics',
        preview: 'I just finished the first course but need clarity on Health Data pipeline protocols.',
        repliesCount: 7,
        timeAgo: '1 week ago'
      },
      {
        id: 5,
        title: 'Health Data Basics',
        preview: 'I just finished the first course but need clarity on Health Data ethics in clinical trials.',
        repliesCount: 7,
        timeAgo: '1 week ago'
      }
    ]
  },
  {
    id: 'rethinking-health-systems',
    title: 'Rethinking Health Systems in Low-Resource Settings',
    instructor: 'Alex Samson',
    instructorTitle: 'Senior Health Systems Specialist | Ex-WHO Advisory | Global Health Lead',
    instructorBio: 'Alex Samson is a seasoned health systems architect with over 14 years of experience optimizing healthcare supply lines, primary clinics, and workforce policies across sub-Saharan Africa.',
    instructorPhoto: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=300&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
    category: 'Public Health',
    price: 140,
    totalTime: '3.5 hours',
    estimatedCompletion: 'Feb 15, 2026',
    progressPercentage: 53,
    completedChapters: 8,
    totalChapters: 15,
    currentChapterNumber: 9,
    currentChapterTitle: 'Title of the lesson',
    skillLevel: 'Intermediate',
    studentsCount: '4,120',
    language: 'English',
    ratings: 4.9,
    ratingsCount: '1,420',
    videoDuration: '3.5 hours',
    description: 'Lorem ipsum dolor sit amet consectetur. A odio scelerisque id ultricies blandit. Scelerisque bibendum vulputate fames odio tellus sed blandit convallis. Lorem ipsum dolor sit amet consectetur. A odio scelerisque id ultricies blandit. Scelerisque bibendum vulputate fames odio tellus sed blandit convallis.',
    status: 'ongoing',
    tags: ['Intermediate', 'Online-video', 'Self-paced'],
    chapters: [
      {
        id: 1,
        chapterNumber: 1,
        title: 'Meet your Instructor',
        duration: '12:00',
        status: 'Completed',
        thumbnail: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 2,
        chapterNumber: 2,
        title: 'Meet your Instructor',
        duration: '12:00',
        status: 'Ongoing',
        thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 3,
        chapterNumber: 3,
        title: 'Supply Chain Diagnostics',
        duration: '15:00',
        status: 'Upcoming',
        thumbnail: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 4,
        chapterNumber: 4,
        title: 'Community Health Worker Networks',
        duration: '16:00',
        status: 'Upcoming',
        thumbnail: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=400&auto=format&fit=crop'
      }
    ],
    outline: [
      {
        id: 1,
        title: 'Introduction to Health Data',
        lessons: [
          { id: 101, title: 'Welcome to Health Data Basics', duration: 'Video (2 minutes)', type: 'video' },
          { id: 102, title: 'Welcome to Health Data Basics', duration: 'Video (2 minutes)', type: 'video' },
          { id: 103, title: 'Welcome to Health Data Basics', duration: 'Video (2 minutes)', type: 'video' }
        ]
      }
    ],
    reviews: [
      {
        id: 1,
        author: 'Jack Harrison',
        timeAgo: '2 weeks ago',
        rating: 5,
        content: 'Transformative course. The frameworks for rural supply chain risk mitigation immediately informed our regional immunization rollout.'
      }
    ],
    questions: [
      {
        id: 1,
        title: 'Health Data Basics',
        preview: 'I just finished the first course but need clarity on Health Data.',
        repliesCount: 7,
        timeAgo: '2 days ago'
      }
    ]
  },
  {
    id: 'redefining-global-health-leadership',
    title: 'Redefining Global Health Leadership',
    instructor: 'Anne Michael',
    instructorTitle: 'Director of Policy & Research | Global Health Institute',
    instructorBio: 'Anne Michael has spent two decades at the intersection of international epidemiology, health negotiation, and multilateral diplomacy.',
    instructorPhoto: 'https://images.unsplash.com/photo-1594824813581-2292f7f90e96?q=80&w=300&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop',
    category: 'Leadership & Policy',
    price: 160,
    totalTime: '4 hours',
    estimatedCompletion: 'Mar 10, 2026',
    progressPercentage: 0,
    completedChapters: 0,
    totalChapters: 15,
    currentChapterNumber: 0,
    currentChapterTitle: 'Title of the lesson',
    skillLevel: 'Advanced',
    studentsCount: '2,890',
    language: 'English',
    ratings: 4.9,
    ratingsCount: '890',
    videoDuration: '4 hours',
    description: 'How today leaders navigate policy, power dynamics, multilateral governance, and measurable population outcomes.',
    status: 'ongoing',
    tags: ['Advanced', 'Online-video', 'Self-paced'],
    chapters: [],
    outline: [],
    reviews: [],
    questions: []
  },
  {
    id: 'advance-proficiency-in-health-data-completed-1',
    title: 'Advance Proficiency in Health Data',
    instructor: 'Dr. Krishna Kashmir (Senior Researcher Google)',
    instructorTitle: 'Senior Manager KPMG | Ex-Google | Life coach | Mentor',
    instructorBio: 'Dr. Krishna specializes in health data and machine learning diagnostics.',
    instructorPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
    category: 'Health Data',
    price: 140,
    totalTime: '2 hours',
    estimatedCompletion: 'Jan 27, 2026',
    progressPercentage: 100,
    completedChapters: 20,
    totalChapters: 20,
    currentChapterNumber: 20,
    currentChapterTitle: 'Capstone Project Evaluation',
    assessmentScore: 85,
    lessonsCompletedCount: 20,
    dateCompleted: 'Nov 27th, 2026',
    skillLevel: 'Beginners',
    studentsCount: '3,234',
    language: 'English',
    ratings: 4.8,
    ratingsCount: '1,234',
    videoDuration: '2 hours',
    description: 'Master practical predictive modelling, clinical datasets, and evidence-based decision frameworks.',
    status: 'completed',
    tags: ['Intermediate', 'Online-video', 'Self-paced'],
    chapters: [],
    outline: [],
    reviews: [],
    questions: []
  },
  {
    id: 'advance-proficiency-in-health-data-completed-2',
    title: 'Advance Proficiency in Health Data',
    instructor: 'Dr. Krishna Kashmir (Senior Researcher Google)',
    instructorTitle: 'Senior Manager KPMG | Ex-Google | Life coach | Mentor',
    instructorBio: 'Dr. Krishna specializes in health data and machine learning diagnostics.',
    instructorPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
    category: 'Health Data',
    price: 140,
    totalTime: '2 hours',
    estimatedCompletion: 'Jan 27, 2026',
    progressPercentage: 8,
    completedChapters: 20,
    totalChapters: 20,
    currentChapterNumber: 20,
    currentChapterTitle: 'Capstone Project Evaluation',
    assessmentScore: 85,
    lessonsCompletedCount: 20,
    dateCompleted: 'Nov 27th, 2026',
    skillLevel: 'Beginners',
    studentsCount: '3,234',
    language: 'English',
    ratings: 4.8,
    ratingsCount: '1,234',
    videoDuration: '2 hours',
    description: 'Master practical predictive modelling, clinical datasets, and evidence-based decision frameworks.',
    status: 'completed',
    tags: ['Intermediate', 'Online-video', 'Self-paced'],
    chapters: [],
    outline: [],
    reviews: [],
    questions: []
  },
  {
    id: 'advance-proficiency-in-health-data-completed-3',
    title: 'Advance Proficiency in Health Data',
    instructor: 'Dr. Krishna Kashmir (Senior Researcher Google)',
    instructorTitle: 'Senior Manager KPMG | Ex-Google | Life coach | Mentor',
    instructorBio: 'Dr. Krishna specializes in health data and machine learning diagnostics.',
    instructorPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
    category: 'Health Data',
    price: 140,
    totalTime: '2 hours',
    estimatedCompletion: 'Jan 27, 2026',
    progressPercentage: 8,
    completedChapters: 20,
    totalChapters: 20,
    currentChapterNumber: 20,
    currentChapterTitle: 'Capstone Project Evaluation',
    assessmentScore: 85,
    lessonsCompletedCount: 20,
    dateCompleted: 'Nov 27th, 2026',
    skillLevel: 'Beginners',
    studentsCount: '3,234',
    language: 'English',
    ratings: 4.8,
    ratingsCount: '1,234',
    videoDuration: '2 hours',
    description: 'Master practical predictive modelling, clinical datasets, and evidence-based decision frameworks.',
    status: 'completed',
    tags: ['Intermediate', 'Online-video', 'Self-paced'],
    chapters: [],
    outline: [],
    reviews: [],
    questions: []
  }
];

export const SAMPLE_COURSES = COURSES_DATA;
