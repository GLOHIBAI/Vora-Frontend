import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { COURSES_DATA } from '../../constants/coursesData';
import type { Course, CourseQuestion, ChapterItem } from '../../constants/coursesData';
import { 
  ChevronLeftIcon, 
  ChevronDownIcon, 
  PlayIcon, 
  VideoIcon, 
  StarIcon,
  TwitterIcon,
  LinkedinIcon,
  InstagramIcon,
  CloseIcon
} from '../../components/common/Icons';
import { toast } from 'react-hot-toast';

type TabType = 'overview' | 'instructor' | 'qa' | 'chapters';

const CourseDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [expandedSections, setExpandedSections] = useState<number[]>([1]);
  const [selectedLessonId, setSelectedLessonId] = useState<number>(101);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  // Q&A state
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionBody, setNewQuestionBody] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  // Course lookup
  const course: Course = COURSES_DATA.find(c => c.id === id) || COURSES_DATA[0];
  const [questionsList, setQuestionsList] = useState<CourseQuestion[]>(course.questions || []);

  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(s => s !== sectionId) 
        : [...prev, sectionId]
    );
  };

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionTitle.trim()) return;

    const newQ: CourseQuestion = {
      id: Date.now(),
      title: newQuestionTitle,
      preview: newQuestionBody || 'Question submitted for review.',
      repliesCount: 0,
      timeAgo: 'Just now'
    };

    setQuestionsList([newQ, ...questionsList]);
    setNewQuestionTitle('');
    setNewQuestionBody('');
    setIsAskModalOpen(false);
    toast.success('Your question has been posted to the community!');
  };

  const handlePostReply = (qId: number) => {
    if (!replyText.trim()) return;
    setQuestionsList(prev =>
      prev.map(q => q.id === qId ? { ...q, repliesCount: q.repliesCount + 1 } : q)
    );
    setReplyText('');
    setActiveReplyId(null);
    toast.success('Reply submitted!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 max-w-[1360px] mx-auto px-4 sm:px-6">
      {/* Header & Back Navigation */}
      <div className="space-y-1.5 pt-2">
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Courses</h1>
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center gap-2.5 text-gray-900 hover:text-[#0052CC] transition-colors cursor-pointer bg-transparent border-none p-0 group font-bold text-[18px] max-w-full"
        >
          <ChevronLeftIcon size={20} strokeWidth={2.5} className="text-gray-700 transition-transform group-hover:-translate-x-1 shrink-0" />
          <span className="truncate max-w-[260px] sm:max-w-none">{course.title}</span>
        </button>
      </div>

      {/* Main 2-Column Grid with mobile-first ordering */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar: Lesson Outline (Image 1 - order-2 on mobile so video is first) */}
        <div className="order-2 lg:order-1 lg:col-span-4 bg-white border border-gray-100 rounded-[20px] overflow-hidden shadow-xs w-full">
          {/* Header */}
          <div className="bg-[#F9FAFB] px-5 py-4 border-b border-gray-100">
            <h2 className="text-[14px] font-bold text-gray-900">Lesson Outline</h2>
          </div>

          {/* Accordion List */}
          <div className="divide-y divide-gray-100">
            {course.outline && course.outline.length > 0 ? (
              course.outline.map(section => {
                const isExpanded = expandedSections.includes(section.id);
                return (
                  <div key={section.id} className="transition-colors">
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[11px] text-gray-400 font-medium">
                          Lesson {section.id}
                        </span>
                        <h3 className="text-[13px] font-bold text-gray-900">
                          {section.title}
                        </h3>
                      </div>
                      <ChevronDownIcon 
                        size={16} 
                        className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                      />
                    </button>

                    {isExpanded && (
                      <div className="bg-white border-t border-gray-50 divide-y divide-gray-50/80 animate-in fade-in duration-200">
                        {section.lessons.map(lesson => {
                          const isSelected = selectedLessonId === lesson.id;
                          return (
                            <button
                              key={lesson.id}
                              type="button"
                              onClick={() => {
                                setSelectedLessonId(lesson.id);
                                setIsPlayingVideo(true);
                              }}
                              className={`w-full px-5 py-3 flex items-start gap-3 text-left transition-colors cursor-pointer ${
                                isSelected 
                                  ? 'bg-[#EFF6FF] border-l-4 border-[#0052CC]' 
                                  : 'hover:bg-gray-50/50'
                              }`}
                            >
                              <div className="pt-0.5 shrink-0">
                                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                  isSelected ? 'border-[#0052CC] bg-white' : 'border-gray-300'
                                }`}>
                                  {isSelected && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#0052CC]" />
                                  )}
                                </div>
                              </div>

                              <div className="space-y-0.5">
                                <p className={`text-[12px] leading-snug font-medium ${
                                  isSelected ? 'text-gray-900 font-semibold' : 'text-gray-700'
                                }`}>
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                  <VideoIcon size={12} className="text-gray-400" />
                                  <span>{lesson.duration}</span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-5 text-center text-gray-400 text-[13px]">
                Outline loading...
              </div>
            )}
          </div>
        </div>

        {/* Right Main Area: Video Player & Tabs (order-1 on mobile) */}
        <div className="order-1 lg:order-2 lg:col-span-8 space-y-6 w-full">
          {/* Video Player Box */}
          <div className="aspect-video bg-[#E5E7EB] rounded-[24px] relative overflow-hidden shadow-xs flex items-center justify-center group cursor-pointer border border-gray-100">
            <img 
              src={course.bannerImage} 
              alt="Course Video"
              className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-102"
            />
            <div 
              onClick={() => setIsPlayingVideo(!isPlayingVideo)}
              className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center border-2 border-white/80 text-white shadow-lg group-hover:scale-110 transition-all duration-300">
                <PlayIcon size={26} className="ml-1 fill-white" />
              </div>
            </div>
          </div>

          {/* Underline Tabs: Course Overview | Instructor's Information | Questions & Answer | All Chapters */}
          <div className="border-b border-gray-200 flex items-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar whitespace-nowrap">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 text-[14px] transition-colors relative cursor-pointer font-medium ${
                activeTab === 'overview'
                  ? 'text-[#0052CC] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0052CC]'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Course Overview
            </button>
            <button
              onClick={() => setActiveTab('instructor')}
              className={`pb-3 text-[14px] transition-colors relative cursor-pointer font-medium ${
                activeTab === 'instructor'
                  ? 'text-[#0052CC] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0052CC]'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Instructor&apos;s Information
            </button>
            <button
              onClick={() => setActiveTab('qa')}
              className={`pb-3 text-[14px] transition-colors relative cursor-pointer font-medium ${
                activeTab === 'qa'
                  ? 'text-[#0052CC] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0052CC]'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Questions & Answer
            </button>
            <button
              onClick={() => setActiveTab('chapters')}
              className={`pb-3 text-[14px] transition-colors relative cursor-pointer font-medium ${
                activeTab === 'chapters'
                  ? 'text-[#0052CC] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0052CC]'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              All Chapters
            </button>
          </div>

          {/* ══════════════════ TAB 1: COURSE OVERVIEW ══════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-[18px] font-bold text-gray-900">{course.title}</h2>

              {/* 5-Column Metrics Strip */}
              <div className="bg-[#EFF6FF] rounded-[16px] p-4 border border-blue-100/60 grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-0 sm:divide-x sm:divide-blue-200/50">
                <div className="sm:px-4 text-center">
                  <p className="text-[11px] text-gray-500 font-medium">Skill level</p>
                  <p className="text-[13px] font-bold text-[#0052CC] mt-0.5">{course.skillLevel}</p>
                </div>
                <div className="sm:px-4 text-center">
                  <p className="text-[11px] text-gray-500 font-medium">Student</p>
                  <p className="text-[13px] font-bold text-[#0052CC] mt-0.5">{course.studentsCount}</p>
                </div>
                <div className="sm:px-4 text-center">
                  <p className="text-[11px] text-gray-500 font-medium">Language</p>
                  <p className="text-[13px] font-bold text-[#0052CC] mt-0.5">{course.language}</p>
                </div>
                <div className="sm:px-4 text-center">
                  <p className="text-[11px] text-gray-500 font-medium">Ratings</p>
                  <p className="text-[13px] font-bold text-amber-500 mt-0.5 flex items-center justify-center gap-1">
                    <StarIcon size={13} filled className="text-amber-500" /> {course.ratings}
                  </p>
                </div>
                <div className="sm:px-4 text-center">
                  <p className="text-[11px] text-gray-500 font-medium">Video</p>
                  <p className="text-[13px] font-bold text-[#0052CC] mt-0.5">{course.videoDuration}</p>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-2">
                <h3 className="text-[15px] font-bold text-gray-900">Description</h3>
                <p className="text-[13px] text-gray-600 leading-relaxed">{course.description}</p>
              </div>

              {/* Students Feedback */}
              <div className="space-y-4 pt-2">
                <h3 className="text-[15px] font-bold text-gray-900">Students Feedback</h3>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Left: Ratings Summary */}
                  <div className="md:col-span-4 bg-[#FAFAFA] border border-gray-100 rounded-[20px] p-6 space-y-4">
                    <h4 className="text-[13px] font-bold text-gray-900">Ratings</h4>

                    <div className="text-center space-y-1">
                      <div className="text-[44px] font-bold text-gray-900 leading-none">
                        {course.ratings}
                      </div>
                      <div className="flex items-center justify-center gap-1 text-amber-400 pt-1">
                        <StarIcon size={16} filled className="text-amber-400" />
                        <StarIcon size={16} filled className="text-amber-400" />
                        <StarIcon size={16} filled className="text-amber-400" />
                        <StarIcon size={16} filled className="text-amber-400" />
                        <StarIcon size={16} filled={false} className="text-gray-300" />
                      </div>
                      <p className="text-[11px] text-gray-400">{course.ratingsCount} ratings</p>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      {[
                        { stars: 5, pct: 75 },
                        { stars: 4, pct: 20 },
                        { stars: 3, pct: 5 },
                        { stars: 2, pct: 2 },
                        { stars: 1, pct: 1 },
                      ].map(bar => (
                        <div key={bar.stars} className="flex items-center gap-2 text-[11px]">
                          <span className="w-5 text-gray-600 font-medium flex items-center gap-0.5">
                            {bar.stars} <StarIcon size={10} filled className="text-amber-400" />
                          </span>
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#0052CC] rounded-full" 
                              style={{ width: `${bar.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Reviews List */}
                  <div className="md:col-span-8 space-y-3">
                    <h4 className="text-[13px] font-bold text-gray-900">Reviews</h4>

                    <div className="space-y-3">
                      {course.reviews.map(review => (
                        <div 
                          key={review.id} 
                          className="bg-[#FAFAFA] border border-gray-100 rounded-[18px] p-4 sm:p-5 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                              <div>
                                <h5 className="text-[13px] font-bold text-gray-900">{review.author}</h5>
                                <span className="text-[11px] text-gray-400">{review.timeAgo}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon 
                                  key={i} 
                                  size={13} 
                                  filled={i < review.rating} 
                                  className={i < review.rating ? "text-amber-400" : "text-gray-300"} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-[12px] text-gray-600 leading-relaxed">
                            {review.content}
                          </p>
                        </div>
                      ))}
                    </div>

                    <button 
                      type="button" 
                      className="w-full py-2.5 rounded-full border border-gray-200 text-gray-700 text-[13px] font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      See more
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════ TAB 2: INSTRUCTOR'S INFORMATION ══════════════════ */}
          {activeTab === 'instructor' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-gray-200 shadow-xs">
                  <img 
                    src={course.instructorPhoto} 
                    alt={course.instructor}
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-[17px] font-bold text-gray-900">{course.instructor}</h3>
                  <p className="text-[12px] text-gray-500">{course.instructorTitle}</p>
                  <div className="flex items-center gap-3 pt-1">
                    <a href="#twitter" className="text-[#1DA1F2] hover:opacity-80 transition-opacity">
                      <TwitterIcon size={16} />
                    </a>
                    <a href="#linkedin" className="text-[#0077B5] hover:opacity-80 transition-opacity">
                      <LinkedinIcon size={16} />
                    </a>
                    <a href="#instagram" className="text-[#E1306C] hover:opacity-80 transition-opacity">
                      <InstagramIcon size={16} />
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-[14px] font-bold text-gray-900">Details</h4>
                <p className="text-[13px] text-gray-600 leading-relaxed">{course.instructorBio}</p>
              </div>
            </div>
          )}

          {/* ══════════════════ TAB 3: QUESTIONS & ANSWER (Image 1) ══════════════════ */}
          {activeTab === 'qa' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-[16px] font-bold text-gray-900">All Questions ({questionsList.length * 4})</h3>
                <button
                  type="button"
                  onClick={() => setIsAskModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-2 bg-[#0052CC] hover:bg-[#0047CC] text-white rounded-full font-bold text-[13px] shadow-xs cursor-pointer transition-colors text-center"
                >
                  Ask a Question
                </button>
              </div>

              {/* Questions List matching Image 1 */}
              <div className="space-y-3">
                {questionsList.map(q => (
                  <div
                    key={q.id}
                    className="bg-[#FAFAFA] border border-gray-100 rounded-[18px] p-4 sm:p-5 space-y-2 transition-all hover:border-gray-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                      <div className="space-y-1 flex-1 min-w-0">
                        <h4 className="text-[14px] font-bold text-gray-900 leading-snug">{q.title}</h4>
                        <p className="text-[12px] text-gray-500 leading-relaxed">{q.preview}</p>
                        
                        <div className="flex items-center gap-3 pt-1 text-[11px]">
                          <span className="text-gray-400 flex items-center gap-1 font-medium">
                            ↩ {q.repliesCount} replies
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveReplyId(activeReplyId === q.id ? null : q.id)}
                            className="text-[#0052CC] font-semibold hover:underline cursor-pointer"
                          >
                            Add reply
                          </button>
                        </div>

                        {/* Inline Reply Box */}
                        {activeReplyId === q.id && (
                          <div className="pt-2 flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              placeholder="Write a constructive reply..."
                              className="flex-1 px-3 py-1.5 rounded-[10px] border border-gray-200 text-[12px] focus:outline-none focus:border-[#0052CC]"
                            />
                            <button
                              type="button"
                              onClick={() => handlePostReply(q.id)}
                              className="w-full sm:w-auto px-4 py-1.5 bg-[#0052CC] text-white rounded-[10px] text-[11px] font-bold hover:bg-[#0047CC] cursor-pointer text-center"
                            >
                              Post
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* See More Button */}
              <div>
                <button
                  type="button"
                  onClick={() => toast('More community discussions loaded.')}
                  className="w-full py-3 rounded-full border border-gray-200 text-gray-700 text-[13px] font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  See more
                </button>
              </div>

              {/* Can't find answers Link (Image 1) */}
              <div className="text-center pt-2">
                <p className="text-[12px] text-gray-500">
                  Can&apos;t find answers?{' '}
                  <button
                    type="button"
                    onClick={() => setIsAskModalOpen(true)}
                    className="text-[#0052CC] font-bold hover:underline cursor-pointer bg-transparent border-none p-0"
                  >
                    Ask a new question
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ══════════════════ TAB 4: ALL CHAPTERS ══════════════════ */}
          {activeTab === 'chapters' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {course.chapters && course.chapters.length > 0 ? (
                course.chapters.map(chap => (
                  <div
                    key={chap.id}
                    onClick={() => {
                      setIsPlayingVideo(true);
                      toast.success(`Playing Chapter ${chap.chapterNumber}: ${chap.title}`);
                    }}
                    className="bg-white border border-gray-100 rounded-[18px] p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:border-blue-100 hover:bg-gray-50/50 transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
                      <div className="relative w-28 h-18 sm:w-36 sm:h-22 rounded-[14px] overflow-hidden shrink-0 bg-gray-200 border border-gray-100 group">
                        <img src={chap.thumbnail} alt={chap.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center border border-white/80 text-white">
                            <PlayIcon size={14} className="ml-0.5 fill-white" />
                          </div>
                        </div>
                        <span className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                          {chap.duration}
                        </span>
                      </div>

                      <div className="space-y-1 min-w-0">
                        <span className="text-[11px] text-gray-400 font-medium">Chapter {chap.chapterNumber}</span>
                        <h4 className="text-[14px] sm:text-[15px] font-bold text-gray-900 leading-snug truncate">{chap.title}</h4>
                        <div className="pt-0.5">
                          {chap.status === 'Completed' && (
                            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#0052CC] border border-blue-100">
                              Completed
                            </span>
                          )}
                          {chap.status === 'Ongoing' && (
                            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-[#D97706] border border-amber-200">
                              Ongoing
                            </span>
                          )}
                          {chap.status === 'Upcoming' && (
                            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="text-[#0052CC] font-bold text-[13px] px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors hidden sm:block"
                    >
                      Play
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400">Chapters outline available in Lesson Outline.</div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ══════════════════ ASK A QUESTION MODAL ══════════════════ */}
      {isAskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-5 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-[18px] font-bold text-gray-900">Ask a Question</h3>
              <button
                onClick={() => setIsAskModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <form onSubmit={handlePostQuestion} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-gray-700">Topic or Question Title</label>
                <input
                  type="text"
                  value={newQuestionTitle}
                  onChange={e => setNewQuestionTitle(e.target.value)}
                  placeholder="e.g. Statistical telemetry in Lesson 3"
                  required
                  className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 text-[13px] focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-gray-700">Detailed Description</label>
                <textarea
                  rows={4}
                  value={newQuestionBody}
                  onChange={e => setNewQuestionBody(e.target.value)}
                  placeholder="Explain your question with relevant timestamps or modules..."
                  className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 text-[13px] focus:outline-none focus:border-[#0052CC] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAskModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-700 text-[13px] font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0052CC] hover:bg-[#0047CC] text-white rounded-full text-[13px] font-bold shadow-xs transition-colors"
                >
                  Submit Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
