import {
  MAX_IMAGE_ATTACHMENT_BYTES,
  readImageAttachment,
} from '@/features/ai/image-attachment';

describe('image attachments', () => {
  it('reads a supported image as a data URL', async () => {
    const attachment = await readImageAttachment(
      new File([new Uint8Array([1, 2, 3])], 'avatar.png', {
        type: 'image/png',
      }),
    );

    expect(attachment).toMatchObject({
      name: 'avatar.png',
      mimeType: 'image/png',
    });
    expect(attachment.data).toMatch(/^data:image\/png;base64,/);
  });

  it('rejects unsupported formats', async () => {
    await expect(
      readImageAttachment(
        new File(['svg'], 'vector.svg', { type: 'image/svg+xml' }),
      ),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST', status: 400 });
  });

  it('rejects images that could exceed the API request limit after encoding', async () => {
    await expect(
      readImageAttachment(
        new File(
          [new Uint8Array(MAX_IMAGE_ATTACHMENT_BYTES + 1)],
          'large.jpg',
          {
            type: 'image/jpeg',
          },
        ),
      ),
    ).rejects.toMatchObject({ code: 'PAYLOAD_TOO_LARGE', status: 413 });
  });
});
