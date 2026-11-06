import React from 'react';
import type { ShareChannel } from '../../types/jobs';
import { MailIcon, WhatsappIcon, LinkedinIcon, TwitterIcon } from '../common/Icons';

interface ShareViaButtonsProps {
  channels: ShareChannel[];
  onSelect: (id: ShareChannel['id']) => void;
  className?: string;
}

const channelIcon = (id: ShareChannel['id']) => {
  switch (id) {
    case 'email':
      return <MailIcon size={18} className="text-slate-600 group-hover:text-slate-900 transition-colors" />;
    case 'whatsapp':
      return <WhatsappIcon size={18} className="text-slate-600 group-hover:text-slate-900 transition-colors" />;
    case 'linkedin':
      return <LinkedinIcon size={18} className="text-slate-600 group-hover:text-slate-900 transition-colors" />;
    case 'twitter':
      return <TwitterIcon size={18} className="text-slate-600 group-hover:text-slate-900 transition-colors" />;
    default:
      return null;
  }
};

export const ShareViaButtons: React.FC<ShareViaButtonsProps> = ({
  channels,
  onSelect,
  className = '',
}) => (
  <div className={className}>
    <div
      className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
      role="group"
      aria-label="Direct share options"
    >
      {channels.map((channel) => (
        <button
          key={channel.id}
          type="button"
          onClick={() => onSelect(channel.id)}
          className="group h-10 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 active:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0047CC]/20 focus:border-[#0047CC] transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-98"
        >
          {channelIcon(channel.id)}
          <span className="truncate">{channel.label}</span>
        </button>
      ))}
    </div>
  </div>
);

export default ShareViaButtons;
