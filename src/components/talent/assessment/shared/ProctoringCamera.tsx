import React, { useEffect, useRef, useState } from 'react';

interface ProctoringCameraProps {
  className?: string;
}

/**
 * Proctoring camera recording emulator for Stage 1 & Stage 2 assessments.
 * Displays live mirrored webcam video feed with a pulsating red REC indicator.
 * Can be enabled/disabled via VITE_ENABLE_CAMERA_RECORDING in .env for local debugging.
 */
const ProctoringCamera: React.FC<ProctoringCameraProps> = ({
  className = 'w-[130px] h-[74px] rounded-none border-[1.5px] border-white shadow-[0_4px_12px_rgba(0,0,0,0.12)] overflow-hidden bg-slate-900 flex items-center justify-center relative',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState(false);

  // Check if camera is enabled in .env (default to true if not explicitly 'false')
  const isCameraEnabled =
    import.meta.env.VITE_ENABLE_CAMERA_RECORDING !== 'false' &&
    import.meta.env.VITE_ENABLE_PROCTORING_CAMERA !== 'false';

  useEffect(() => {
    if (!isCameraEnabled) {
      setHasCamera(false);
      return;
    }

    let isMounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
          audio: true,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        setHasCamera(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Proctoring camera access denied or unavailable', err);
        if (isMounted) {
          setHasCamera(false);
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isCameraEnabled]);

  return (
    <div className={className}>
      {hasCamera ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover scale-x-[-1]"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-center text-white/50 bg-[#0B0F14]">
          <span className="text-[6.5px] font-extrabold tracking-wider leading-none">
            {isCameraEnabled ? 'PROCTOR' : 'CAMERA OFF'}
          </span>
        </div>
      )}

      {/* REC Indicator */}
      <div className="absolute top-1 right-1 flex items-center gap-1 bg-black/50 backdrop-blur-xs px-1.5 py-0.5 rounded-full select-none">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
        </span>
        <span className="text-[7.5px] font-[800] text-white tracking-[0.4px] leading-none">
          REC
        </span>
      </div>
    </div>
  );
};

export default ProctoringCamera;
