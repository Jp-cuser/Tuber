import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { BackgroundMode } from '@/features/settings/types';
import { captureVideoFrame } from '@/features/ai/capture-frame';
import type { ImageAttachment } from '@/features/ai/image-attachment';

export interface MediaBackgroundHandle {
  captureFrame: () => Promise<ImageAttachment>;
}

export const MediaBackground = forwardRef<
  MediaBackgroundHandle,
  { mode: BackgroundMode; source?: string }
>(function MediaBackground({ mode, source }, ref) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useImperativeHandle(ref, () => ({
    captureFrame: async () => {
      if (!videoRef.current || (mode !== 'webcam' && mode !== 'capture'))
        throw new Error('Webcam or screen capture is not active');
      return captureVideoFrame(videoRef.current);
    },
  }));
  useEffect(() => {
    if (mode !== 'webcam' && mode !== 'capture') return;
    let stream: MediaStream | undefined;
    const start = async () => {
      stream =
        mode === 'webcam'
          ? await navigator.mediaDevices.getUserMedia({ video: true })
          : await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    };
    void start().catch(() => undefined);
    return () => stream?.getTracks().forEach((track) => track.stop());
  }, [mode]);
  if (mode === 'green')
    return (
      <div
        className="absolute inset-0 bg-[#00b140]"
        data-testid="media-background"
      />
    );
  if (mode === 'image' && source)
    return (
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${source})` }}
        data-testid="media-background"
      />
    );
  if (mode === 'video' && source)
    return (
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={source}
        autoPlay
        muted
        loop
        playsInline
        data-testid="media-background"
      />
    );
  if (mode === 'webcam' || mode === 'capture')
    return (
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        playsInline
        data-testid="media-background"
      />
    );
  return (
    <div
      className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,#164e63_0%,#0f172a_40%,#020617_100%)]"
      data-testid="media-background"
    />
  );
});
