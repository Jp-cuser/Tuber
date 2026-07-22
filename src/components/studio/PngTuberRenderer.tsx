import { useEffect, useRef } from 'react';
import type { PngTuberState } from '@/features/avatar/pngtuber';
import {
  applyChromaKey,
  hexToRgb,
  type PngTuberPresentation,
} from '@/features/avatar/pngtuber-presentation';

interface PngTuberRendererProps {
  idleSource: string;
  talkingSource: string;
  state: PngTuberState;
  presentation: PngTuberPresentation;
}

export function PngTuberRenderer({
  idleSource,
  talkingSource,
  state,
  presentation,
}: PngTuberRendererProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const presentationRef = useRef(presentation);
  const source = state === 'talking' ? talkingSource : idleSource;

  useEffect(() => {
    presentationRef.current = presentation;
  }, [presentation]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    void video.play().catch(() => undefined);
  }, [source]);

  useEffect(() => {
    let frame = 0;
    const draw = () => {
      frame = requestAnimationFrame(draw);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;
      if (
        canvas.width !== video.videoWidth ||
        canvas.height !== video.videoHeight
      ) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context || canvas.width === 0 || canvas.height === 0) return;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const view = presentationRef.current;
      if (view.chromaEnabled) {
        const image = context.getImageData(0, 0, canvas.width, canvas.height);
        applyChromaKey(
          image.data,
          hexToRgb(view.chromaColor),
          view.chromaTolerance,
        );
        context.putImageData(image, 0, 0);
      }
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="h-full w-full overflow-hidden">
      <video
        ref={videoRef}
        key={source}
        src={source}
        className="hidden"
        autoPlay
        muted
        loop
        playsInline
      />
      <canvas
        ref={canvasRef}
        className="h-full w-full object-contain"
        aria-label="PNGTuber renderer"
        style={{
          transform: `translate(${presentation.offsetX}px, ${presentation.offsetY}px) scale(${presentation.scale})`,
        }}
      />
    </div>
  );
}
