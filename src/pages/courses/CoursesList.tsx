import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COURSES_DATA } from '../../constants/coursesData';
import type { Course } from '../../constants/coursesData';
import { 
  PlayIcon, 
  CloseIcon, 
  StarIcon,
  ArrowRightIcon,
  DownloadIcon,
  CheckCircleIcon,
  LockIcon
} from '../../components/common/Icons';
import { toast } from 'react-hot-toast';

type TabType = 'ongoing' | 'completed' | 'recommended';
type PaymentMethod = 'card' | 'paypal' | 'apple' | 'google';

const CoursesList: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('recommended');
  const [courses, setCourses] = useState<Course[]>(COURSES_DATA);
  
  // Modals
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [checkoutCourse, setCheckoutCourse] = useState<Course | null>(null);
  const [certificateCourse, setCertificateCourse] = useState<Course | null>(null);
  
  // Checkout Form
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardName, setCardName] = useState('Alex Morgan');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const ongoingCourses = courses.filter(c => c.status === 'ongoing');
  const completedCourses = courses.filter(c => c.status === 'completed');

  const handleOpenCourse = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleMakePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutCourse) return;

    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      // Mark as enrolled ongoing course
      setCourses(prev =>
        prev.map(c =>
          c.id === checkoutCourse.id ? { ...c, status: 'ongoing', isEnrolled: true } : c
        )
      );
      toast.success(`Successfully enrolled in "${checkoutCourse.title}"!`);
      const targetId = checkoutCourse.id;
      setCheckoutCourse(null);
      setPreviewCourse(null);
      setActiveTab('ongoing');
    }, 900);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 max-w-[1360px] mx-auto px-4 sm:px-6">
      {/* Top Header */}
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Courses</h1>
      </div>

      {/* Tabs matching Images: Ongoing courses | Completed courses | Recommended courses */}
      <div className="border-b border-gray-200 flex items-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar whitespace-nowrap">
        <button
          onClick={() => setActiveTab('ongoing')}
          className={`pb-3 text-[14px] transition-colors relative cursor-pointer font-medium ${
            activeTab === 'ongoing'
              ? 'text-[#0052CC] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0052CC]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Ongoing courses
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 text-[14px] transition-colors relative cursor-pointer font-medium ${
            activeTab === 'completed'
              ? 'text-[#0052CC] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0052CC]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Completed courses
        </button>
        <button
          onClick={() => setActiveTab('recommended')}
          className={`pb-3 text-[14px] transition-colors relative cursor-pointer font-medium ${
            activeTab === 'recommended'
              ? 'text-[#0052CC] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0052CC]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Recommended courses
        </button>
      </div>

      {/* ══════════════════ TAB 1: ONGOING COURSES (Desktop - 143 & Prior Images) ══════════════════ */}
      {activeTab === 'ongoing' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {ongoingCourses.length === 0 ? (
            <div className="text-center py-16 bg-[#FAFAFA] rounded-[24px] border border-gray-100 space-y-3">
              <p className="text-gray-500 text-[15px] font-medium">You have no active ongoing courses.</p>
              <button
                type="button"
                onClick={() => setActiveTab('recommended')}
                className="px-6 py-2.5 bg-[#0052CC] text-white rounded-full text-[13px] font-semibold hover:bg-[#0047CC] transition-colors cursor-pointer"
              >
                Explore Recommended Courses
              </button>
            </div>
          ) : (
            ongoingCourses.map(course => (
              <div
                key={course.id}
                className="bg-white border border-gray-100 rounded-[24px] p-5 sm:p-8 flex flex-col gap-5 sm:gap-6 shadow-xs hover:border-blue-100 transition-all"
              >
                {/* Header Row: Instructor Avatar + Info + Resume Button (order-2 on mobile, order-1 on desktop) */}
                <div className="order-2 sm:order-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 border-2 border-gray-100">
                      <img
                        src={course.instructorPhoto}
                        alt={course.instructor}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h3 className="text-[15px] sm:text-[16px] font-bold text-gray-900 leading-tight">
                        {course.instructor}
                      </h3>
                      <h4 className="text-[13px] sm:text-[14px] font-semibold text-gray-700">
                        {course.title}
                      </h4>
                      <p className="text-[11px] text-gray-400 font-medium">
                        {course.category} • {course.completedChapters}/{course.totalChapters} chapters completed
                      </p>
                      <p className="text-[12px] text-[#0052CC] font-semibold pt-0.5">
                        Chapter {course.currentChapterNumber} • {course.currentChapterTitle}
                      </p>
                    </div>
                  </div>

                  {/* Resume Course Button */}
                  <div className="shrink-0 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleOpenCourse(course.id)}
                      className="w-full sm:w-auto px-7 py-3 bg-[#0052CC] hover:bg-[#0047CC] text-white rounded-full font-semibold text-[14px] shadow-xs cursor-pointer transition-all active:scale-[0.98]"
                    >
                      {course.completedChapters > 0 ? 'Resume course' : 'Start course'}
                    </button>
                  </div>
                </div>

                {/* Wide Video Banner with "Watch trailer" overlay (order-1 on mobile, on top!) */}
                <div
                  onClick={() => handleOpenCourse(course.id)}
                  className="order-1 sm:order-2 relative aspect-16/9 sm:aspect-21/9 md:aspect-24/9 rounded-[20px] overflow-hidden group cursor-pointer shadow-xs border border-gray-100"
                >
                  <img
                    src={course.bannerImage}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center border-2 border-white/80 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <PlayIcon size={22} className="ml-0.5 fill-white" />
                    </div>
                    <span className="text-white text-[12px] sm:text-[13px] font-semibold drop-shadow-sm">
                      Watch trailer
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ══════════════════ TAB 2: COMPLETED COURSES (Image 2) ══════════════════ */}
      {activeTab === 'completed' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {completedCourses.map(course => (
            <div
              key={course.id}
              className="bg-white border border-gray-100/90 rounded-[20px] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-100 transition-all"
            >
              {/* Left Portion: Thumbnail + Meta + Progress */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
                <div 
                  onClick={() => handleOpenCourse(course.id)}
                  className="w-full sm:w-36 h-28 rounded-[14px] overflow-hidden shrink-0 relative group cursor-pointer border border-gray-100"
                >
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center transition-colors group-hover:bg-black/35">
                    <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center border border-white/70 shadow-sm text-white">
                      <PlayIcon size={14} className="ml-0.5 fill-white" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <h3
                    onClick={() => handleOpenCourse(course.id)}
                    className="text-[15px] sm:text-[16px] font-bold text-gray-900 truncate hover:text-[#0052CC] transition-colors cursor-pointer"
                  >
                    {course.title}
                  </h3>
                  <p className="text-[12px] text-gray-500 truncate">{course.instructor}</p>
                  <p className="text-[11px] text-gray-400">
                    Total time: {course.totalTime} • Estimated completion: {course.estimatedCompletion}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="pt-1.5">
                    <span className="text-[11px] text-gray-500 font-medium">
                      {course.progressPercentage}% completed
                    </span>
                    <div className="w-full max-w-[260px] h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-[#0052CC] rounded-full"
                        style={{ width: `${course.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Portion: Assessment Score & Download Certificate (Image 2) */}
              <div className="bg-[#FAFAFA] border border-gray-100/90 rounded-[16px] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:w-[380px] lg:w-[420px] shrink-0">
                <div className="space-y-0.5">
                  <span className="text-[11px] text-gray-400 font-medium">Interview score</span>
                  <div className="text-[28px] font-bold text-[#0052CC] leading-tight">
                    {course.assessmentScore || 85}%
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 pt-0.5">
                    <span>Lessons: <strong className="font-semibold text-gray-700">{course.lessonsCompletedCount || 20}</strong></span>
                    <span>Date: <strong className="font-semibold text-gray-700">{course.dateCompleted || 'Nov 27th, 2026'}</strong></span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCertificateCourse(course)}
                  className="w-full sm:w-auto bg-[#0052CC] hover:bg-[#0047CC] text-white px-5 sm:px-6 py-2.5 rounded-full text-[13px] font-semibold whitespace-nowrap shadow-xs cursor-pointer transition-all active:scale-[0.98]"
                >
                  Download certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════ TAB 3: RECOMMENDED COURSES (Images 3, 4, Desktop 142) ══════════════════ */}
      {activeTab === 'recommended' && (
        <div className="space-y-12 animate-in fade-in duration-300">
          
          {/* Hero Banner: Gain Experience from the World's Best (Image 4) */}
          <div className="bg-white rounded-[24px] p-6 sm:p-8 md:p-12 border border-gray-200/80 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xs">
            {/* Left Title */}
            <div className="space-y-3 max-w-md z-10 w-full text-center lg:text-left">
              <h2 className="text-[28px] sm:text-[38px] md:text-[44px] font-bold text-gray-900 leading-[1.15] tracking-tight">
                Gain Experience <br className="hidden sm:inline" />
                from the <br className="hidden sm:inline" />
                World&apos;s Best
              </h2>
            </div>

            {/* Right Photo Mosaic (Image 4 exact layout, fully responsive) */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 z-10 justify-center">
              <div className="w-16 h-20 sm:w-24 sm:h-28 md:w-28 md:h-32 rounded-[14px] sm:rounded-[16px] overflow-hidden border-2 border-blue-100 shadow-sm">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop" alt="Mentor" className="w-full h-full object-cover" />
              </div>
              <div className="w-16 h-20 sm:w-24 sm:h-28 md:w-28 md:h-32 rounded-[14px] sm:rounded-[16px] overflow-hidden border-2 border-blue-100 shadow-sm mt-2 sm:mt-3">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop" alt="Mentor" className="w-full h-full object-cover" />
              </div>
              <div className="w-16 h-20 sm:w-24 sm:h-28 md:w-28 md:h-32 rounded-[14px] sm:rounded-[16px] overflow-hidden border-2 border-blue-100 shadow-sm">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop" alt="Mentor" className="w-full h-full object-cover" />
              </div>
              <div className="w-16 h-20 sm:w-24 sm:h-28 md:w-28 md:h-32 rounded-[14px] sm:rounded-[16px] overflow-hidden border-2 border-blue-100 shadow-sm mt-2 sm:mt-3">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop" alt="Mentor" className="w-full h-full object-cover" />
              </div>
              
              <div className="w-16 h-20 sm:w-24 sm:h-28 md:w-28 md:h-32 rounded-[14px] sm:rounded-[16px] overflow-hidden border-2 border-blue-100 shadow-sm -mt-2">
                <img src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=300&auto=format&fit=crop" alt="Mentor" className="w-full h-full object-cover" />
              </div>
              <div className="w-16 h-20 sm:w-24 sm:h-28 md:w-28 md:h-32 rounded-[14px] sm:rounded-[16px] overflow-hidden border-2 border-blue-100 shadow-sm">
                <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop" alt="Mentor" className="w-full h-full object-cover" />
              </div>
              <div className="w-16 h-20 sm:w-24 sm:h-28 md:w-28 md:h-32 rounded-[14px] sm:rounded-[16px] overflow-hidden border-2 border-blue-100 shadow-sm -mt-2">
                <img src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=300&auto=format&fit=crop" alt="Mentor" className="w-full h-full object-cover" />
              </div>
              <div className="w-16 h-20 sm:w-24 sm:h-28 md:w-28 md:h-32 rounded-[14px] sm:rounded-[16px] overflow-hidden border-2 border-blue-100 shadow-sm">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop" alt="Mentor" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Section 1: Learn from the Architects of Modern Public Health (Image 4) */}
          <div className="space-y-5">
            <div className="space-y-1">
              <h3 className="text-[20px] font-bold text-gray-900 tracking-tight">
                Learn from the Architects of Modern Public Health
              </h3>
              <p className="text-[13px] text-gray-500">
                Mentorships led by practitioners shaping health systems, policy, and outcomes across the world.
              </p>
            </div>

            {/* 4 Portrait Masterclass Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  id: 'redefining-global-health-leadership',
                  title: 'Redefining Global Health Leadership',
                  subtitle: 'How today leaders navigate policy, power, and impact at scale.',
                  image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=600&auto=format&fit=crop',
                  mentor: 'Anne Michael',
                  price: 160
                },
                {
                  id: 'rethinking-health-systems',
                  title: 'Rethinking Health Systems in Low-Resource Settings',
                  subtitle: 'Strategies to optimize frontline clinics and primary triage.',
                  image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=600&auto=format&fit=crop',
                  mentor: 'Alex Samson',
                  price: 140
                },
                {
                  id: 'health-policy-diplomacy',
                  title: 'Global Health Policy & Negotiation',
                  subtitle: 'Multilateral treaties and pandemic preparedness protocols.',
                  image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
                  mentor: 'Dr. Fatima Al-Mansoor',
                  price: 150
                },
                {
                  id: 'community-surveillance',
                  title: 'Epidemiology in Crisis Response',
                  subtitle: 'Field epidemiology under acute emergency settings.',
                  image: 'https://images.unsplash.com/photo-1594824813581-2292f7f90e96?q=80&w=600&auto=format&fit=crop',
                  mentor: 'Dr. Tariq Mansour',
                  price: 130
                }
              ].map(card => {
                const fullCourse = courses.find(c => c.id === card.id) || courses[0];
                return (
                  <div
                    key={card.id}
                    onClick={() => setPreviewCourse(fullCourse)}
                    className="group cursor-pointer space-y-3"
                  >
                    <div className="aspect-4/5 rounded-[22px] overflow-hidden relative shadow-sm group-hover:shadow-md transition-all duration-300">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                        <span className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider">
                          Masterclass
                        </span>
                        <h4 className="text-[16px] font-bold leading-snug pt-1">
                          {card.title}
                        </h4>
                        <p className="text-[12px] text-gray-300 line-clamp-2 pt-1 font-normal">
                          {card.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Courses specially curated for your growth (Image 3) */}
          <div className="space-y-5">
            <h3 className="text-[18px] font-bold text-gray-900 tracking-tight">
              Courses specially curated for your growth
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => {
                const targetCourse = courses[0];
                return (
                  <div
                    key={i}
                    className="bg-white border border-gray-100 rounded-[22px] overflow-hidden shadow-xs flex flex-col hover:border-blue-100 hover:shadow-md transition-all duration-300 group"
                  >
                    {/* Thumbnail on top with Play button */}
                    <div 
                      onClick={() => setPreviewCourse(targetCourse)}
                      className="w-full aspect-16/9 overflow-hidden relative group cursor-pointer bg-gray-100"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop"
                        alt="Course"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center transition-colors group-hover:bg-black/35">
                        <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center border-2 border-white/80 text-white shadow-md group-hover:scale-110 transition-transform">
                          <PlayIcon size={18} className="ml-0.5 fill-white" />
                        </div>
                      </div>
                    </div>

                    {/* Course Info underneath */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h4 
                          onClick={() => setPreviewCourse(targetCourse)}
                          className="text-[15px] sm:text-[16px] font-bold text-gray-900 leading-snug group-hover:text-[#0052CC] transition-colors cursor-pointer"
                        >
                          Advance Proficiency in Health Data
                        </h4>
                        <p className="text-[12px] text-gray-500 font-medium">
                          Dr. Krishna Kashmir (Senior Researcher Google)
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400">
                          <span>8 total hours</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-amber-500 font-semibold">
                            ★ 4.8 <span className="text-gray-400 font-normal">(128 reviews)</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">Intermediate</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">Online-video</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">Self-paced</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => setPreviewCourse(targetCourse)}
                          className="text-[12px] font-bold text-[#0052CC] hover:text-[#003d99] flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          Take this course →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Upgrade your Excel Skills (Image 3) */}
          <div className="space-y-5">
            <h3 className="text-[18px] font-bold text-gray-900 tracking-tight">
              Upgrade your Excel Skills
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => {
                const targetCourse = courses[0];
                return (
                  <div
                    key={i}
                    className="bg-white border border-gray-100 rounded-[22px] overflow-hidden shadow-xs flex flex-col hover:border-blue-100 hover:shadow-md transition-all duration-300 group"
                  >
                    {/* Thumbnail on top with Play button */}
                    <div 
                      onClick={() => setPreviewCourse(targetCourse)}
                      className="w-full aspect-16/9 overflow-hidden relative group cursor-pointer bg-gray-100"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop"
                        alt="Course"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center transition-colors group-hover:bg-black/35">
                        <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center border-2 border-white/80 text-white shadow-md group-hover:scale-110 transition-transform">
                          <PlayIcon size={18} className="ml-0.5 fill-white" />
                        </div>
                      </div>
                    </div>

                    {/* Course Info underneath */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h4 
                          onClick={() => setPreviewCourse(targetCourse)}
                          className="text-[15px] sm:text-[16px] font-bold text-gray-900 leading-snug group-hover:text-[#0052CC] transition-colors cursor-pointer"
                        >
                          Advance Proficiency in Health Data
                        </h4>
                        <p className="text-[12px] text-gray-500 font-medium">
                          Dr. Krishna Kashmir (Senior Researcher Google)
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400">
                          <span>8 total hours</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-amber-500 font-semibold">
                            ★ 4.8 <span className="text-gray-400 font-normal">(128 reviews)</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">Intermediate</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">Online-video</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">Self-paced</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => setPreviewCourse(targetCourse)}
                          className="text-[12px] font-bold text-[#0052CC] hover:text-[#003d99] flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          Take this course →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════ COURSE PREVIEW MODAL (Desktop - 137) ══════════════════ */}
      {previewCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative max-h-[92vh] flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setPreviewCourse(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
            >
              <CloseIcon size={16} />
            </button>

            {/* Video Banner with "Watch trailer" overlay (Compact, content-first) */}
            <div className="relative h-44 sm:h-52 w-full bg-gray-900 shrink-0 overflow-hidden">
              <img
                src={previewCourse.bannerImage}
                alt={previewCourse.title}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-black/25 flex flex-col items-center justify-center gap-1.5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/45 backdrop-blur-xs flex items-center justify-center border-2 border-white/80 text-white shadow-md group-hover:scale-105 transition-transform">
                  <PlayIcon size={18} className="ml-0.5 fill-white" />
                </div>
                <span className="text-white text-[12px] font-semibold drop-shadow-sm">
                  Watch trailer
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              {/* Instructor Header & "Get started with $140" button (Desktop - 137, responsive) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-[14px] overflow-hidden shrink-0 border border-gray-200">
                    <img
                      src={previewCourse.instructorPhoto}
                      alt={previewCourse.instructor}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[15px] font-bold text-gray-900 leading-snug truncate">{previewCourse.instructor}</h4>
                    <p className="text-[11px] text-gray-500 line-clamp-1">{previewCourse.instructorTitle}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCheckoutCourse(previewCourse);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#0052CC] hover:bg-[#0047CC] text-white rounded-full font-bold text-[13px] shadow-xs cursor-pointer whitespace-nowrap transition-all active:scale-[0.98] text-center shrink-0"
                >
                  Get started with ${previewCourse.price}
                </button>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-[17px] font-bold text-gray-900 leading-snug">{previewCourse.title}</h3>
                <p className="text-[12px] text-gray-600 leading-relaxed">
                  {previewCourse.description}
                </p>
              </div>

              {/* All Chapters List with Locked status (Desktop - 137, responsive) */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[14px] font-bold text-gray-900">All Chapters</h4>

                <div className="space-y-2.5">
                  {[
                    { id: 1, title: 'Meet your Instructor', duration: '12:00' },
                    { id: 2, title: 'Health Delivery Context in Clinics', duration: '12:00' },
                    { id: 3, title: 'Supply Chain & Cold Storage Realities', duration: '15:00' },
                  ].map(chap => (
                    <div
                      key={chap.id}
                      className="bg-[#FAFAFA] border border-gray-100 rounded-[14px] p-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-14 sm:w-16 h-11 sm:h-12 rounded-[10px] overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center">
                          <PlayIcon size={14} className="text-gray-400" />
                          <span className="absolute bottom-1 right-1 text-[9px] text-white bg-black/60 px-1 rounded font-medium">
                            {chap.duration}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] text-gray-400 font-medium">Chapter {chap.id}</span>
                          <h5 className="text-[12px] sm:text-[13px] font-bold text-gray-800 leading-snug line-clamp-1">{chap.title}</h5>
                        </div>
                      </div>

                      <span className="text-[11px] font-medium text-gray-400 bg-gray-200/60 px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <LockIcon size={11} /> Locked
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ CHECKOUT MODAL (Desktop - 142) ══════════════════ */}
      {checkoutCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-7 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-[20px] font-bold text-gray-900">Checkout</h3>
              <button
                onClick={() => setCheckoutCourse(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer transition-colors"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Summary */}
            <div className="bg-[#FAFAFA] rounded-[18px] p-5 border border-gray-100 space-y-3">
              <h4 className="text-[13px] font-bold text-gray-900">Summary</h4>
              <div className="flex justify-between items-start text-[13px] pt-1">
                <div>
                  <p className="font-bold text-gray-900">{checkoutCourse.instructor}</p>
                  <p className="text-gray-500 text-[12px]">{checkoutCourse.title}</p>
                </div>
                <span className="font-bold text-gray-900">${checkoutCourse.price}</span>
              </div>
              <div className="border-t border-gray-200/80 pt-2 space-y-1 text-[12px] text-gray-500">
                <div className="flex justify-between">
                  <span>Sub total</span>
                  <span className="text-gray-900 font-medium">${checkoutCourse.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="text-gray-900 font-medium">$0</span>
                </div>
                <div className="flex justify-between text-[14px] font-bold text-gray-900 pt-1 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-[#0052CC]">${checkoutCourse.price}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleMakePayment} className="space-y-5">
              {/* Payment Options */}
              <div className="space-y-2">
                <h4 className="text-[13px] font-bold text-gray-900">Payment options</h4>
                <p className="text-[11px] text-gray-400">Select your preferred payment method</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-1 text-center rounded-[12px] text-[11px] font-semibold border transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-[#0052CC] bg-blue-50/60 text-[#0052CC]'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    💳 Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`py-2 px-1 text-center rounded-[12px] text-[11px] font-semibold border transition-all cursor-pointer ${
                      paymentMethod === 'paypal'
                        ? 'border-[#0052CC] bg-blue-50/60 text-[#0052CC]'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    PayPal
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple')}
                    className={`py-2 px-1 text-center rounded-[12px] text-[11px] font-semibold border transition-all cursor-pointer ${
                      paymentMethod === 'apple'
                        ? 'border-[#0052CC] bg-blue-50/60 text-[#0052CC]'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('google')}
                    className={`py-2 px-1 text-center rounded-[12px] text-[11px] font-semibold border transition-all cursor-pointer ${
                      paymentMethod === 'google'
                        ? 'border-[#0052CC] bg-blue-50/60 text-[#0052CC]'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    GPay
                  </button>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-[13px] font-bold text-gray-900">Payment details</h4>
                  <p className="text-[11px] text-gray-400">Provide the payment details</p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-gray-600">Cardholder&apos;s name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      required
                      placeholder="Alex Morgan"
                      className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 text-[13px] focus:outline-none focus:border-[#0052CC]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-gray-600">Card number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      required
                      placeholder="0000 0000 0000 0000"
                      className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 text-[13px] focus:outline-none focus:border-[#0052CC]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-600">Expiry date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        required
                        placeholder="MM/DD/YYYY"
                        className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 text-[13px] focus:outline-none focus:border-[#0052CC]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-600">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                        required
                        maxLength={4}
                        placeholder="123"
                        className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 text-[13px] focus:outline-none focus:border-[#0052CC]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 px-6 bg-[#0052CC] hover:bg-[#0047CC] disabled:opacity-50 text-white rounded-full font-bold text-[14px] shadow-sm cursor-pointer transition-all active:scale-[0.99]"
                >
                  {isProcessingPayment ? 'Processing payment...' : 'Make payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════ CERTIFICATE MODAL ══════════════════ */}
      {certificateCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 sm:space-y-6 text-center animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setCertificateCourse(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <CloseIcon size={18} />
            </button>

            <div className="w-16 h-16 bg-blue-50 text-[#0052CC] rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircleIcon size={32} />
            </div>

            <div className="space-y-1">
              <span className="text-[12px] font-semibold text-[#0052CC] uppercase tracking-wider">VORA Verified Certificate</span>
              <h3 className="text-[20px] sm:text-[22px] font-bold text-gray-900">Certificate of Completion</h3>
              <p className="text-[13px] text-gray-500">Awarded for successfully mastering the curriculum of</p>
              <p className="text-[15px] sm:text-[16px] font-bold text-gray-900 pt-1 leading-snug">{certificateCourse.title}</p>
            </div>

            <div className="bg-[#F8FAFC] border border-gray-100 rounded-[16px] p-3 sm:p-4 text-[12px] text-gray-600 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-gray-400 text-[10px] sm:text-[11px]">Interview Score</p>
                <p className="font-bold text-[#0052CC] text-[15px] sm:text-[16px]">{certificateCourse.assessmentScore || 85}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] sm:text-[11px]">Date Completed</p>
                <p className="font-bold text-gray-800 text-[12px] sm:text-[14px] truncate">{certificateCourse.dateCompleted || 'Nov 27, 2026'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] sm:text-[11px]">Lessons</p>
                <p className="font-bold text-gray-800 text-[12px] sm:text-[14px]">{certificateCourse.lessonsCompletedCount || 20} Completed</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  toast.success('Certificate downloaded as PDF');
                  setCertificateCourse(null);
                }}
                className="flex-1 py-3 bg-[#0052CC] hover:bg-[#0047CC] text-white rounded-full font-bold text-[14px] shadow-xs cursor-pointer transition-all"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CoursesList;
