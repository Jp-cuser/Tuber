import { useEffect, useRef } from 'react';
import type { PngTuberState } from '@/features/avatar/pngtuber';

interface PngTuberRendererProps {
  idleSource: string;
  talkingSource: string;
  state: PngTuberState;
}

export function PngTuberRenderer({
  idleSource,
  talkingSource,
  state,
}: PngTuberRendererProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const source = state === 'talking' ? talkingSource : idleSource;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    void video.play().catch(() => undefined);
  }, [source]);

  return (
    <video
      ref={videoRef}
      key={source}
      src={source}
      className="h-full w-full object-contain"
      aria-label="PNGTuber renderer"
      autoPlay
      muted
      loop
      playsInline
    />
  );
}
