import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  CoursesIcon,
  PlayIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  DollarSignIcon,
  AwardIcon,
  BookOpenIcon,
  MessageSquareIcon,
  CalendarIcon,
  ExternalLinkIcon,
  EyeIcon,
  SearchIcon,
  CheckIcon,
  CloseIcon,
  ArrowRightIcon,
} from '../../components/common/Icons';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import ModalDialog from '../../components/common/ModalDialog';
import { toast } from 'react-hot-toast';

interface InstructorCourse {
  id: string;
  title: string;
  category: string;
  level: string;
  thumbnail: string;
  status: 'PUBLISHED' | 'IN_REVIEW' | 'DRAFT';
  price: number;
  isFree?: boolean;
  chaptersCount: number;
  totalHours: number;
  enrolledStudents: number;
  revenue: number;
  rating: number;
  reviewsCount: number;
  lastUpdated: string;
  description: string;
}

interface StudentSubmission {
  id: string;
  studentName: string;
  studentAvatar: string;
  courseTitle: string;
  progress: number;
  lastActive: string;
  submissionTitle: string;
  submissionStatus: 'SUBMITTED' | 'GRADED' | 'IN_PROGRESS';
  grade?: number;
}

interface MenteeSession {
  id: string;
  menteeName: string;
  menteeAvatar: string;
  courseContext: string;
  topic: string;
  scheduledTime: string;
  duration: string;
  tier: 'Tier 1 (HIC)' | 'Tier 2 (UMIC)' | 'Tier 3 (LMIC)';
  rate: string;
  status: 'UPCOMING' | 'COMPLETED' | 'REQUESTED';
}

const INITIAL_COURSES: InstructorCourse[] = [
  {
    id: 'course-1',
    title: 'High-Throughput Microservices & Event-Driven Architecture',
    category: 'Backend & Systems',
    level: 'Advanced',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600',
    status: 'PUBLISHED',
    price: 89,
    chaptersCount: 12,
    totalHours: 18.5,
    enrolledStudents: 642,
    revenue: 14280,
    rating: 4.9,
    reviewsCount: 184,
    lastUpdated: 'Aug 18, 2026',
    description: 'Master asynchronous message queues, distributed idempotency, distributed caching, and failover architectures built for high-scale environments.',
  },
  {
    id: 'course-2',
    title: 'Production Kubernetes & Cloud-Native Reliability',
    category: 'DevOps & Cloud',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&q=80&w=600',
    status: 'PUBLISHED',
    price: 75,
    chaptersCount: 10,
    totalHours: 14,
    enrolledStudents: 480,
    revenue: 9600,
    rating: 4.85,
    reviewsCount: 128,
    lastUpdated: 'Jul 22, 2026',
    description: 'Hands-on orchestration with multi-cluster ingress, GitOps with ArgoCD, cluster telemetry with Prometheus, and zero-downtime rolling updates.',
  },
  {
    id: 'course-3',
    title: 'Clinical AI Decision Pipelines & Vector Reasoning',
    category: 'Health Tech & AI',
    level: 'Advanced',
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
    status: 'PUBLISHED',
    price: 99,
    chaptersCount: 8,
    totalHours: 12,
    enrolledStudents: 218,
    revenue: 4570,
    rating: 4.95,
    reviewsCount: 62,
    lastUpdated: 'Aug 04, 2026',
    description: 'Build HIPAA-compliant vector search and entity extraction systems querying medical guideline knowledge bases in real-time.',
  },
  {
    id: 'course-4',
    title: 'Distributed Transaction Processing in Go',
    category: 'Backend & Systems',
    level: 'Advanced',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600',
    status: 'IN_REVIEW',
    price: 65,
    chaptersCount: 9,
    totalHours: 11.5,
    enrolledStudents: 0,
    revenue: 0,
    rating: 5.0,
    reviewsCount: 0,
    lastUpdated: 'Sep 12, 2026',
    description: 'Two-phase commit, Saga patterns, and write-ahead logging patterns implemented from scratch in pure Go.',
  },
  {
    id: 'course-5',
    title: 'Senior Engineering Leadership & System Design Interviews',
    category: 'Career & Leadership',
    level: 'All Levels',
    thumbnail: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600',
    status: 'DRAFT',
    price: 49,
    chaptersCount: 6,
    totalHours: 8,
    enrolledStudents: 0,
    revenue: 0,
    rating: 0,
    reviewsCount: 0,
    lastUpdated: 'Sep 18, 2026',
    description: 'How to structure system design solutions, explain architectural trade-offs, and conduct effective technical leadership simulations.',
  },
];

const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  {
    id: 'sub-1',
    studentName: 'Farhan Patel',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    courseTitle: 'High-Throughput Microservices',
    progress: 92,
    lastActive: '2 hours ago',
    submissionTitle: 'Capstone: Distributed Redis Stream Worker Pool',
    submissionStatus: 'SUBMITTED',
  },
  {
    id: 'sub-2',
    studentName: 'Elena Rostova',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    courseTitle: 'Production Kubernetes',
    progress: 78,
    lastActive: '1 day ago',
    submissionTitle: 'ArgoCD Multi-Environment Deployment Manifests',
    submissionStatus: 'GRADED',
    grade: 96,
  },
  {
    id: 'sub-3',
    studentName: 'Kofi Mensah',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    courseTitle: 'Clinical AI Decision Pipelines',
    progress: 65,
    lastActive: '3 days ago',
    submissionTitle: 'Vector Ingestion Pipeline with Qdrant',
    submissionStatus: 'IN_PROGRESS',
  },
];

const INITIAL_MENTEES: MenteeSession[] = [
  {
    id: 'mentee-1',
    menteeName: 'Chiamaka Eze',
    menteeAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    courseContext: 'High-Throughput Microservices',
    topic: 'System Architecture & Concurrency Bottlenecks',
    scheduledTime: 'Tomorrow, 3:00 PM WAT',
    duration: '45 mins',
    tier: 'Tier 3 (LMIC)',
    rate: '$25 / session',
    status: 'UPCOMING',
  },
  {
    id: 'mentee-2',
    menteeName: 'David Chen',
    menteeAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    courseContext: 'Production Kubernetes',
    topic: 'Cloud-Native Career Transition & Mock Interview',
    scheduledTime: 'Thursday, 5:30 PM WAT',
    duration: '60 mins',
    tier: 'Tier 1 (HIC)',
    rate: '$95 / session',
    status: 'UPCOMING',
  },
];

interface MentorCoursesPageProps {
  onToggleLearnerView?: () => void;
}

const MentorCoursesPage: React.FC<MentorCoursesPageProps> = ({ onToggleLearnerView }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'my-courses' | 'students' | 'mentorship' | 'reviews'>('my-courses');
  const [courseFilter, setCourseFilter] = useState<'ALL' | 'PUBLISHED' | 'IN_REVIEW' | 'DRAFT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [courses, setCourses] = useState<InstructorCourse[]>(INITIAL_COURSES);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(INITIAL_SUBMISSIONS);
  const [mentees, setMentees] = useState<MenteeSession[]>(INITIAL_MENTEES);

  // Create/Edit Course Modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState<{
    title: string;
    category: string;
    level: string;
    price: number;
    isFree: boolean;
    description: string;
    thumbnail: string;
    status: 'PUBLISHED' | 'IN_REVIEW' | 'DRAFT';
  }>({
    title: '',
    category: 'Backend & Systems',
    level: 'Intermediate',
    price: 69,
    isFree: false,
    description: '',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
    status: 'PUBLISHED',
  });

  // Grade Modal
  const [gradingSub, setGradingSub] = useState<StudentSubmission | null>(null);
  const [gradeInput, setGradeInput] = useState('95');
  const [feedbackInput, setFeedbackInput] = useState('Excellent architectural implementation with clean error handling.');

  // Q&A
  const [qaReplies, setQaReplies] = useState<Record<string, string>>({});

  const filteredCourses = courses.filter((c) => {
    if (courseFilter !== 'ALL' && c.status !== courseFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
    }
    return true;
  });

  const totalEnrolled = courses.reduce((acc, c) => acc + c.enrolledStudents, 0);
  const totalRevenue = courses.reduce((acc, c) => acc + c.revenue, 0);
  const publishedCount = courses.filter((c) => c.status === 'PUBLISHED').length;

  const handleOpenCreateModal = () => {
    setEditingCourseId(null);
    setCourseForm({
      title: '',
      category: 'Backend & Systems',
      level: 'Intermediate',
      price: 69,
      isFree: false,
      description: '',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
      status: 'PUBLISHED',
    });
    setIsCourseModalOpen(true);
  };

  const handleOpenEditModal = (c: InstructorCourse) => {
    setEditingCourseId(c.id);
    setCourseForm({
      title: c.title,
      category: c.category,
      level: c.level,
      price: c.price,
      isFree: Boolean(c.isFree),
      description: c.description,
      thumbnail: c.thumbnail,
      status: c.status,
    });
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title.trim()) {
      toast.error('Please enter a course title');
      return;
    }

    if (editingCourseId) {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === editingCourseId
            ? {
                ...c,
                title: courseForm.title,
                category: courseForm.category,
                level: courseForm.level,
                price: courseForm.isFree ? 0 : Number(courseForm.price),
                isFree: courseForm.isFree,
                description: courseForm.description,
                thumbnail: courseForm.thumbnail,
                status: courseForm.status,
                lastUpdated: 'Just now',
              }
            : c
        )
      );
      toast.success('Course updated successfully!');
    } else {
      const newCourse: InstructorCourse = {
        id: `course-${Date.now()}`,
        title: courseForm.title,
        category: courseForm.category,
        level: courseForm.level,
        price: courseForm.isFree ? 0 : Number(courseForm.price),
        isFree: courseForm.isFree,
        thumbnail: courseForm.thumbnail,
        status: courseForm.status,
        chaptersCount: 8,
        totalHours: 10,
        enrolledStudents: 0,
        revenue: 0,
        rating: 5.0,
        reviewsCount: 0,
        lastUpdated: 'Just now',
        description: courseForm.description,
      };
      setCourses((prev) => [newCourse, ...prev]);
      toast.success('Course created and added to your portfolio!');
    }
    setIsCourseModalOpen(false);
  };

  const handleTogglePublish = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const nextStatus = c.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
          toast.success(`Course status changed to ${nextStatus}`);
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm('Are you sure you want to remove this course?')) {
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      toast.success('Course removed');
    }
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSub) return;
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === gradingSub.id
          ? { ...s, submissionStatus: 'GRADED', grade: Number(gradeInput) }
          : s
      )
    );
    toast.success(`Grade (${gradeInput}%) recorded and mentee notified!`);
    setGradingSub(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Course Management & Mentorship Hub
            </h1>
            <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
              Instructor Portal
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Author, publish, and track your instructional courses, cohorts, and student progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onToggleLearnerView ? (
            <Button
              variant="outline"
              size="sm"
              pill={false}
              onClick={onToggleLearnerView}
              className="text-xs font-semibold gap-1.5"
            >
              <EyeIcon size={14} />
              Preview Learner View
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              pill={false}
              onClick={() => navigate('/courses?view=catalog')}
              className="text-xs font-semibold gap-1.5"
            >
              <EyeIcon size={14} />
              Learner Catalog
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            pill={false}
            onClick={handleOpenCreateModal}
            className="text-xs font-semibold gap-1.5 shadow-xs"
          >
            <PlusIcon size={14} />
            Create Course
          </Button>
        </div>
      </div>

      {/* KPI Instructor Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Enrolled</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900">{totalEnrolled.toLocaleString()}</span>
            <span className="text-xs font-semibold text-emerald-600">+14% mo</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Active Courses</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900">{publishedCount}</span>
            <span className="text-xs text-gray-400">of {courses.length} total</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Average Rating</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl font-bold text-gray-900">4.9</span>
            <StarIcon size={16} className="text-amber-500 fill-amber-500" />
            <span className="text-xs text-gray-400 ml-1">(382)</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Revenue</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#0047CC]">${totalRevenue.toLocaleString()}</span>
            <span className="text-[10px] font-medium text-gray-400">USD</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-xs col-span-2 lg:col-span-1">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Completion Rate</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900">78%</span>
            <span className="text-xs font-semibold text-emerald-600">High engagement</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap">
        <button
          type="button"
          onClick={() => setActiveTab('my-courses')}
          className={`pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'my-courses'
              ? 'text-[#0047CC] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0047CC]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          My Courses ({courses.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'students'
              ? 'text-[#0047CC] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0047CC]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Student Roster & Submissions ({submissions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('mentorship')}
          className={`pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'mentorship'
              ? 'text-[#0047CC] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0047CC]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Course Mentorship & Cohorts ({mentees.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'reviews'
              ? 'text-[#0047CC] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0047CC]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Reviews & Q&A
        </button>
      </div>

      {/* Tab: My Courses */}
      {activeTab === 'my-courses' && (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {(['ALL', 'PUBLISHED', 'IN_REVIEW', 'DRAFT'] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  type="button"
                  onClick={() => setCourseFilter(filterKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    courseFilter === filterKey
                      ? 'bg-[#0047CC] text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {filterKey === 'ALL'
                    ? `All (${courses.length})`
                    : filterKey === 'PUBLISHED'
                    ? `Published (${courses.filter((c) => c.status === 'PUBLISHED').length})`
                    : filterKey === 'IN_REVIEW'
                    ? `In Review (${courses.filter((c) => c.status === 'IN_REVIEW').length})`
                    : `Drafts (${courses.filter((c) => c.status === 'DRAFT').length})`}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your courses..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#0047CC]"
              />
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail Banner */}
                  <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {course.status === 'PUBLISHED' ? (
                        <span className="bg-emerald-500/90 text-white backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                          PUBLISHED
                        </span>
                      ) : course.status === 'IN_REVIEW' ? (
                        <span className="bg-amber-500/90 text-white backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                          UNDER REVIEW
                        </span>
                      ) : (
                        <span className="bg-gray-700/90 text-white backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                          DRAFT
                        </span>
                      )}
                    </div>

                    {/* Price & Level */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="font-bold bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded">
                        {course.isFree ? 'Free' : `$${course.price} USD`}
                      </span>
                      <span className="bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded text-[11px]">
                        {course.level}
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    <p className="text-[11px] font-bold text-[#0047CC] uppercase tracking-wider">
                      {course.category}
                    </p>

                    <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug">
                      {course.title}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Meta numbers */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-50 text-center text-xs">
                      <div>
                        <p className="text-gray-400 text-[10px]">Students</p>
                        <p className="font-bold text-gray-800">{course.enrolledStudents}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[10px]">Revenue</p>
                        <p className="font-bold text-emerald-600">
                          ${course.revenue.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[10px]">Rating</p>
                        <p className="font-bold text-gray-800 flex items-center justify-center gap-0.5">
                          {course.rating} <StarIcon size={11} className="text-amber-500 fill-amber-500" />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(course.id)}
                    className="text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    {course.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      pill={false}
                      onClick={() => handleOpenEditModal(course)}
                      className="text-xs gap-1 py-1"
                    >
                      <PencilIcon size={12} />
                      Edit
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-white transition-colors"
                      title="Delete course"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Student Roster & Submissions */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Enrolled Talents & Project Submissions</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Review capstone submissions, provide mentor feedback, and track student completion.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-[11px] uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Student</th>
                    <th className="pb-3 font-semibold">Course</th>
                    <th className="pb-3 font-semibold">Progress</th>
                    <th className="pb-3 font-semibold">Submission Item</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={sub.studentAvatar}
                            alt={sub.studentName}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                          />
                          <div>
                            <p className="font-bold text-gray-900">{sub.studentName}</p>
                            <p className="text-[10px] text-gray-400">Active {sub.lastActive}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 font-medium text-gray-700">{sub.courseTitle}</td>
                      <td className="py-3.5 pr-4">
                        <div className="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#0047CC] h-full rounded-full" style={{ width: `${sub.progress}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-500 font-semibold">{sub.progress}%</span>
                      </td>
                      <td className="py-3.5 pr-4 font-semibold text-gray-800">{sub.submissionTitle}</td>
                      <td className="py-3.5 pr-4">
                        {sub.submissionStatus === 'GRADED' ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            Graded: {sub.grade}%
                          </span>
                        ) : sub.submissionStatus === 'SUBMITTED' ? (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            Needs Review
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium text-[10px]">
                            In Progress
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-right">
                        {sub.submissionStatus === 'SUBMITTED' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            pill={false}
                            onClick={() => {
                              setGradingSub(sub);
                              setGradeInput('95');
                            }}
                            className="text-xs py-1 px-3"
                          >
                            Review & Grade
                          </Button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toast.success(`Chat opened with ${sub.studentName}`)}
                            className="text-xs text-[#0047CC] hover:underline font-semibold"
                          >
                            Message
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Course Mentorship & Cohorts */}
      {activeTab === 'mentorship' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">1:1 Mentorship Attached to Courses</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Talents enrolled in your courses can book targeted 1:1 office hours and project reviews.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                pill={false}
                onClick={() => navigate('/settings')}
                className="text-xs gap-1"
              >
                Configure Availability & PPP Rates
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mentees.map((m) => (
                <div key={m.id} className="border border-gray-200 rounded-2xl p-5 bg-gray-50/40 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={m.menteeAvatar}
                        alt={m.menteeName}
                        className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{m.menteeName}</p>
                        <p className="text-xs text-[#0047CC] font-medium">{m.courseContext}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {m.tier}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-100 space-y-1 text-xs">
                    <p className="text-gray-500 font-medium">Session Focus:</p>
                    <p className="font-semibold text-gray-800">{m.topic}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 text-gray-600">
                    <span className="flex items-center gap-1 font-medium">
                      <CalendarIcon size={12} className="text-gray-400" />
                      {m.scheduledTime}
                    </span>
                    <span className="font-bold text-emerald-700">{m.rate}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <Button
                      variant="primary"
                      size="sm"
                      pill={false}
                      onClick={() => toast.success(`Meeting room link launched for ${m.menteeName}`)}
                      className="text-xs flex-1 py-1"
                    >
                      Start Call
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      pill={false}
                      onClick={() => toast.success(`Direct message opened with ${m.menteeName}`)}
                      className="text-xs flex-1 py-1"
                    >
                      Message
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Reviews & Q&A */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">Student Reviews & Community Q&A</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Respond to student questions and engage with feedback across your published catalog.
              </p>
            </div>

            {/* Q&A Item */}
            <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-900">Farhan Patel · High-Throughput Microservices (Chapter 4)</span>
                <span className="text-gray-400">3 hours ago</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                "In Lesson 4.2 on Redis Streams consumer groups, how do we prevent idle worker starvation if one batch takes longer to acknowledge?"
              </p>

              <div className="pt-2">
                <input
                  type="text"
                  placeholder="Write an instructor response..."
                  value={qaReplies['qa-1'] || ''}
                  onChange={(e) => setQaReplies({ ...qaReplies, 'qa-1': e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#0047CC]"
                />
                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    pill={false}
                    onClick={() => {
                      toast.success('Instructor response posted!');
                      setQaReplies({ ...qaReplies, 'qa-1': '' });
                    }}
                    className="text-xs px-3 py-1"
                  >
                    Reply to Student
                  </Button>
                </div>
              </div>
            </div>

            {/* Review Item */}
            <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <StarIcon key={s} size={14} className="text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <span className="text-xs text-gray-400">Elena Rostova · 4 days ago</span>
              </div>
              <p className="text-xs font-semibold text-gray-800">
                "One of the best production Kubernetes deep dives on the platform. The failure simulation scenarios were exceptionally realistic."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Course Modal */}
      {isCourseModalOpen && (
        <ModalDialog
          isOpen={isCourseModalOpen}
          onClose={() => setIsCourseModalOpen(false)}
          title={editingCourseId ? 'Edit Course Details' : 'Create New Course'}
          actions={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                variant="outline"
                size="sm"
                pill={false}
                onClick={() => setIsCourseModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                pill={false}
                onClick={handleSaveCourse}
              >
                {editingCourseId ? 'Update Course' : 'Publish Course'}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveCourse} className="space-y-4 text-left max-h-[70vh] overflow-y-auto pr-1">
            <Input
              label="Course Title"
              value={courseForm.title}
              onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
              placeholder="e.g. Asynchronous Distributed Architecture"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Category"
                value={courseForm.category}
                onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                options={[
                  { label: 'Backend & Systems', value: 'Backend & Systems' },
                  { label: 'DevOps & Cloud', value: 'DevOps & Cloud' },
                  { label: 'Health Tech & AI', value: 'Health Tech & AI' },
                  { label: 'Career & Leadership', value: 'Career & Leadership' },
                ]}
              />
              <Select
                label="Difficulty Level"
                value={courseForm.level}
                onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                options={[
                  { label: 'Beginner', value: 'Beginner' },
                  { label: 'Intermediate', value: 'Intermediate' },
                  { label: 'Advanced', value: 'Advanced' },
                  { label: 'All Levels', value: 'All Levels' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Price (USD)"
                type="number"
                value={String(courseForm.price)}
                onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                disabled={courseForm.isFree}
              />
              <Select
                label="Publish Status"
                value={courseForm.status}
                onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value as any })}
                options={[
                  { label: 'Published (Live)', value: 'PUBLISHED' },
                  { label: 'In Review', value: 'IN_REVIEW' },
                  { label: 'Draft', value: 'DRAFT' },
                ]}
              />
            </div>

            <Textarea
              label="Course Description & Overview"
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              rows={3}
              placeholder="Describe what talents will master, prerequisites, and target learning outcomes..."
            />

            <Input
              label="Cover Thumbnail URL"
              value={courseForm.thumbnail}
              onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
              placeholder="https://images.unsplash.com/..."
            />
          </form>
        </ModalDialog>
      )}

      {/* Review Submission Modal */}
      {gradingSub && (
        <ModalDialog
          isOpen={Boolean(gradingSub)}
          onClose={() => setGradingSub(null)}
          title={`Grade Submission: ${gradingSub.studentName}`}
          actions={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                variant="outline"
                size="sm"
                pill={false}
                onClick={() => setGradingSub(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                pill={false}
                onClick={handleGradeSubmit}
              >
                Submit Grade & Feedback
              </Button>
            </div>
          }
        >
          <form onSubmit={handleGradeSubmit} className="space-y-4 text-left">
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs space-y-1">
              <p className="font-bold text-gray-900">{gradingSub.submissionTitle}</p>
              <p className="text-gray-500">Student: {gradingSub.studentName} · {gradingSub.courseTitle}</p>
            </div>

            <Input
              label="Grade Percentage (%)"
              type="number"
              value={gradeInput}
              onChange={(e) => setGradeInput(e.target.value)}
              min="0"
              max="100"
              required
            />

            <Textarea
              label="Mentor Feedback"
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              rows={3}
              placeholder="Provide constructive feedback and pointers on their architecture implementation..."
              required
            />
          </form>
        </ModalDialog>
      )}
    </div>
  );
};

export default MentorCoursesPage;
