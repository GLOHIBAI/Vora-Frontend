import type { MatchDevelopment } from '../../../types/profileMatchWaitlist';
import Tag from '../../common/Tag';
import { FileIcon, UserIcon } from '../../common/Icons';

interface MatchDevelopmentPanelProps {
  development: MatchDevelopment;
  roleTitle: string;
  score: number;
  matchThreshold: number;
  summary?: string;
}

const MatchDevelopmentPanel: React.FC<MatchDevelopmentPanelProps> = ({
  development,
  roleTitle,
  score,
  matchThreshold,
  summary,
}) => {
  const headline = development.message;
  const focusAreas = development.focusAreas ?? [];

  return (
    <div className="bg-white border border-[#E6E6E6] rounded-[10px] overflow-hidden mb-[18px]">
      <div className="bg-white border-b border-[#E6E6E6] p-6 pb-5">
        <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight mb-2">{headline}</h2>
        {summary && summary !== headline ? (
          <p className="text-sm text-[#4A5568] leading-relaxed">{summary}</p>
        ) : null}
      </div>

      <div className="p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row items-center gap-5 bg-[#F7F7F7] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[18px] sm:px-[22px] mb-[18px]">
          <div className="text-center sm:text-left shrink-0">
            <div className="text-4xl font-extrabold text-[#0047CC] leading-none">{score}%</div>
            <div className="text-[13px] font-bold text-[#1A1A1A] mt-1">Match for {roleTitle}</div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-[13px] text-[#4A5568] leading-relaxed">
              This role requires a {matchThreshold}% match or higher. Focus on the areas below to
              strengthen your profile before reapplying.
            </p>
          </div>
        </div>

        {focusAreas.length > 0 ? (
          <div className="mb-[18px]">
            <div className="text-sm font-bold text-[#1A1A1A] mb-2.5">Recommended focus areas</div>
            <div className="flex flex-wrap gap-2">
              {focusAreas.map((area) => (
                <Tag key={area} variant="blue" label={area} />
              ))}
            </div>
          </div>
        ) : null}

        {development.hasResources ? (
          <>
            {development.courses.length > 0 ? (
              <div className="mb-5">
                <div className="text-sm font-bold text-[#1A1A1A] mb-3">Recommended courses</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {development.courses.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      className="text-left bg-[#EBF6FF] border border-[#C7E0FF] rounded-xl p-4 hover:border-[#387DFF] hover:shadow-[0_4px_16px_-4px_rgba(56,125,255,0.12)] transition-all duration-200 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white border border-[#C7E0FF] flex items-center justify-center shrink-0">
                          <FileIcon size={18} className="text-[#0047CC]" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[14px] font-bold text-[#1A1A1A] group-hover:text-[#0047CC] transition-colors">
                            {course.title}
                          </div>
                          <div className="text-[12px] text-[#808080] mt-0.5">View course</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {development.mentors.length > 0 ? (
              <div className="mb-2">
                <div className="text-sm font-bold text-[#1A1A1A] mb-3">Recommended mentors</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {development.mentors.map((mentor) => (
                    <button
                      key={mentor.id}
                      type="button"
                      className="text-left bg-white border border-[#E6E6E6] rounded-xl p-4 hover:border-[#387DFF] hover:shadow-[0_4px_16px_-4px_rgba(56,125,255,0.12)] transition-all duration-200 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#F7F7F7] border border-[#E6E6E6] flex items-center justify-center shrink-0">
                          <UserIcon size={18} className="text-[#0047CC]" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[14px] font-bold text-[#1A1A1A] group-hover:text-[#0047CC] transition-colors">
                            {mentor.name}
                          </div>
                          <div className="text-[12px] text-[#808080] mt-0.5">View mentor profile</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-5">
            <div className="text-sm font-bold text-[#92400E] mb-1.5">Self-directed study</div>
            <p className="text-[13px] text-[#78350F] leading-relaxed">
              There aren&apos;t any mentors or courses for this role on the platform yet. Use the
              focus areas above to guide your own upskilling, then reapply once you&apos;ve built
              the experience.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchDevelopmentPanel;
