import { captureVideoFrame } from '@/features/ai/capture-frame';

describe('captureVideoFrame', () => {
  it('scales, draws, and encodes a ready video frame', async () => {
    const drawImage = jest.fn();
    const canvas = {
      width: 0,
      height: 0,
      getContext: jest.fn(() => ({ drawImage })),
      toBlob: jest.fn((callback: BlobCallback) =>
        callback(new Blob([new Uint8Array([1, 2])], { type: 'image/jpeg' })),
      ),
    } as unknown as HTMLCanvasElement;
    const video = {
      readyState: 4,
      videoWidth: 1920,
      videoHeight: 1080,
    } as HTMLVideoElement;

    const result = await captureVideoFrame(video, {
      maximumDimension: 768,
      canvasFactory: () => canvas,
    });

    expect(canvas.width).toBe(768);
    expect(canvas.height).toBe(432);
    expect(drawImage).toHaveBeenCalledWith(video, 0, 0, 768, 432);
    expect(result.mimeType).toBe('image/jpeg');
    expect(result.data).toMatch(/^data:image\/jpeg;base64,/);
  });

  it('rejects capture before a frame is ready', async () => {
    await expect(
      captureVideoFrame({ readyState: 1 } as HTMLVideoElement),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST', status: 400 });
  });

  it('rejects a failed canvas encoding', async () => {
    const canvas = {
      width: 0,
      height: 0,
      getContext: jest.fn(() => ({ drawImage: jest.fn() })),
      toBlob: jest.fn((callback: BlobCallback) => callback(null)),
    } as unknown as HTMLCanvasElement;

    await expect(
      captureVideoFrame(
        {
          readyState: 4,
          videoWidth: 640,
          videoHeight: 480,
        } as HTMLVideoElement,
        { canvasFactory: () => canvas },
      ),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST', status: 400 });
  });
});
