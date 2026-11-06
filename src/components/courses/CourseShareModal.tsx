import React, { useState } from 'react';
import ModalDialog from '../common/ModalDialog';
import Button from '../common/Button';
import CopyLinkField from '../jobs/CopyLinkField';
import ShareViaButtons from '../jobs/ShareViaButtons';
import { SHARE_CHANNELS } from '../../constants/jobPostedConfirmation';
import type { ShareChannel } from '../../types/jobs';
import { getCourseShareUrl } from '../../utils/courseSignup';
import { GlobeIcon, LockIcon, ShieldIcon, GraduationCapIcon, AlertTriangleIcon } from '../common/Icons';

export interface CourseShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  slug?: string;
  thumbnailUrl?: string;
  status?: string;
}

export const CourseShareModal: React.FC<CourseShareModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  slug,
  thumbnailUrl,
  status = 'PUBLISHED',
}) => {
  const isPublished = status === 'PUBLISHED';
  const shareIdentifier = slug || courseId;
  const shareUrl = getCourseShareUrl(shareIdentifier);
  const [pendingChannel, setPendingChannel] = useState<ShareChannel | null>(null);

  const handleShareClick = (channelId: ShareChannel['id']) => {
    const channel = SHARE_CHANNELS.find((c) => c.id === channelId);
    if (channel) {
      setPendingChannel(channel);
    }
  };

  const getShareHref = (channelId: ShareChannel['id']): string => {
    const subject = encodeURIComponent(`Masterclass: ${courseTitle} on VORA`);
    const shareMessage = encodeURIComponent(
      `Check out "${courseTitle}" on VORA — specialized masterclass and verified credentialing for healthcare leaders.`
    );
    const encodedUrl = encodeURIComponent(shareUrl);

    switch (channelId) {
      case 'email':
        return `mailto:?subject=${subject}&body=${shareMessage}%0A%0AEnroll%20here:%20${encodedUrl}`;
      case 'whatsapp':
        return `https://wa.me/?text=${shareMessage}%20${encodedUrl}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${shareMessage}&url=${encodedUrl}`;
      default:
        return shareUrl;
    }
  };

  const confirmShare = () => {
    if (pendingChannel) {
      const href = getShareHref(pendingChannel.id);
      window.open(href, '_blank', 'noopener,noreferrer');
      setPendingChannel(null);
    }
  };

  return (
    <>
      <ModalDialog
        open={isOpen}
        title="Share Course"
        subtitle="Share this course with talents on and off VORA."
        onClose={onClose}
        maxWidth="max-w-[540px]"
        showCloseButton={true}
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-6 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-slate-300"
            >
              Done
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Unpublished Warning if Course is in Draft / Under Review */}
          {!isPublished && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
              <AlertTriangleIcon size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong className="font-semibold block mb-0.5 text-amber-950">
                  Course is not published yet
                </strong>
                This course is currently in draft. Publish the course from your instructor dashboard before external talents can access lessons.
              </div>
            </div>
          )}

          {/* Course Summary Row: 16:9 thumbnail fallback, 2-line title, high-contrast metadata */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div className="aspect-video w-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shrink-0 flex items-center justify-center">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={courseTitle}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center text-white/50">
                  <GraduationCapIcon size={20} />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4
                className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug"
                title={courseTitle}
              >
                {courseTitle}
              </h4>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {isPublished ? (
                  <>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200/70 text-slate-700">
                      Public link
                    </span>
                    <span className="text-[13px] text-slate-600 flex items-center gap-1 font-normal">
                      <GlobeIcon size={13} className="text-slate-400 shrink-0" />
                      Anyone with link can enroll
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800">
                      Draft
                    </span>
                    <span className="text-[13px] text-slate-600 flex items-center gap-1 font-normal">
                      <LockIcon size={13} className="text-slate-400 shrink-0" />
                      Publish to enable enrollment
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Course Public Link Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Course public link
            </label>
            <CopyLinkField url={shareUrl} inputAriaLabel="Course public link" />
          </div>

          {/* Streamlined Onboarding Info Box: Blue panel, blue icon, 14px dark text, bold lead */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 flex items-start gap-3">
            <ShieldIcon size={18} className="text-[#0047CC] shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm font-semibold text-slate-900 block mb-0.5">
                Streamlined talent onboarding
              </strong>
              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                External talents who don&apos;t have an account get a fast 30-second signup and immediate access to this course.
              </p>
            </div>
          </div>

          {/* Direct Share Options: Left-aligned label, 40px height equal width buttons */}
          <div className="pt-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
              Or share directly via
            </label>
            <ShareViaButtons channels={SHARE_CHANNELS} onSelect={handleShareClick} />
          </div>
        </div>
      </ModalDialog>

      {/* Confirmation Modal for leaving VORA to third-party share channel */}
      <ModalDialog
        open={!!pendingChannel}
        title="Leaving VORA"
        subtitle={`You are about to be redirected to ${pendingChannel?.label} to share this course.`}
        onClose={() => setPendingChannel(null)}
        maxWidth="max-w-[460px]"
        showCloseButton={true}
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              size="md"
              pill={false}
              className="rounded-xl h-11 px-5"
              onClick={() => setPendingChannel(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              pill={false}
              className="rounded-xl h-11 px-5"
              onClick={confirmShare}
            >
              Continue to {pendingChannel?.label}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600 leading-relaxed font-normal">
          The link will open in a new tab with your pre-filled message, which you can personalize before posting.
        </p>
      </ModalDialog>
    </>
  );
};

export default CourseShareModal;
