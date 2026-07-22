import { AppError } from '@/lib/errors/app-error';
import { readImageAttachment, type ImageAttachment } from './image-attachment';

export interface CaptureFrameOptions {
  maximumDimension?: number;
  quality?: number;
  canvasFactory?: () => HTMLCanvasElement;
}

export async function captureVideoFrame(
  video: HTMLVideoElement,
  options: CaptureFrameOptions = {},
): Promise<ImageAttachment> {
  if (video.readyState < 2 || video.videoWidth < 1 || video.videoHeight < 1)
    throw new AppError('BAD_REQUEST', 400, 'Video frame is not ready');

  const maximumDimension = options.maximumDimension ?? 768;
  const scale = Math.min(
    1,
    maximumDimension / Math.max(video.videoWidth, video.videoHeight),
  );
  const canvas = options.canvasFactory?.() ?? document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
  const context = canvas.getContext('2d');
  if (!context)
    throw new AppError('BAD_REQUEST', 400, 'Unable to capture video frame');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) =>
        value
          ? resolve(value)
          : reject(
              new AppError('BAD_REQUEST', 400, 'Unable to encode video frame'),
            ),
      'image/jpeg',
      options.quality ?? 0.75,
    ),
  );
  return readImageAttachment(
    new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' }),
  );
}
