import { AppError } from '@/lib/errors/app-error';

export const MAX_IMAGE_ATTACHMENT_BYTES = 650 * 1024;
export const supportedImageMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export interface ImageAttachment {
  data: string;
  mimeType: string;
  name: string;
}

export function readImageAttachment(
  file: File,
  maximumBytes = MAX_IMAGE_ATTACHMENT_BYTES,
): Promise<ImageAttachment> {
  if (!supportedImageMimeTypes.includes(file.type as never))
    return Promise.reject(
      new AppError('BAD_REQUEST', 400, 'Unsupported image format'),
    );
  if (file.size > maximumBytes)
    return Promise.reject(
      new AppError('PAYLOAD_TOO_LARGE', 413, 'Image attachment is too large'),
    );

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () =>
      reject(
        new AppError('BAD_REQUEST', 400, 'Unable to read image attachment'),
      );
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(
          new AppError('BAD_REQUEST', 400, 'Unable to read image attachment'),
        );
        return;
      }
      resolve({ data: reader.result, mimeType: file.type, name: file.name });
    };
    reader.readAsDataURL(file);
  });
}
