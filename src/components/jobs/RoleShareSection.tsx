import { useState } from 'react';
import type { ShareChannel } from '../../types/jobs';
import { buildShareHref } from '../../utils/shareLinks';
import CopyLinkField from './CopyLinkField';
import ShareViaButtons from './ShareViaButtons';
import ModalDialog from '../common/ModalDialog';
import Button from '../common/Button';

interface RoleShareSectionProps {
  channels: ShareChannel[];
  shareUrl: string;
  shareTitle: string;
  className?: string;
}

const RoleShareSection: React.FC<RoleShareSectionProps> = ({
  channels,
  shareUrl,
  shareTitle,
  className = '',
}) => {
  const [pendingChannel, setPendingChannel] = useState<ShareChannel | null>(null);

  const handleShareClick = (channelId: ShareChannel['id']) => {
    const channel = channels.find((c) => c.id === channelId);
    if (channel) {
      setPendingChannel(channel);
    }
  };

  const confirmShare = () => {
    if (pendingChannel) {
      const href = buildShareHref(pendingChannel.id, shareUrl, shareTitle);
      window.open(href, '_blank', 'noopener,noreferrer');
      setPendingChannel(null);
    }
  };

  return (
    <div className={className}>
      <CopyLinkField url={shareUrl} className="mb-4" />
      <ShareViaButtons
        channels={channels}
        onSelect={handleShareClick}
      />

      <ModalDialog
        open={!!pendingChannel}
        title="Leaving VORA"
        subtitle={`You are about to be redirected to ${pendingChannel?.label} to share this role.`}
        onClose={() => setPendingChannel(null)}
        footer={
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="outline" size="md" pill={false} className="rounded-xl" onClick={() => setPendingChannel(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" pill={false} className="rounded-xl" onClick={confirmShare}>
              Continue to {pendingChannel?.label}
            </Button>
          </div>
        }
      >
        <p className="text-[14px] text-[#4A4A4A] leading-relaxed">
          The link will open in a new tab where you can customize your post before sharing.
        </p>
      </ModalDialog>
    </div>
  );
};

export default RoleShareSection;
