import { expect, test } from '@playwright/test';

function generatedVrmFixture(): Buffer {
  const boneNames = [
    'hips',
    'spine',
    'head',
    'leftUpperLeg',
    'leftLowerLeg',
    'leftFoot',
    'rightUpperLeg',
    'rightLowerLeg',
    'rightFoot',
    'leftUpperArm',
    'leftLowerArm',
    'leftHand',
    'rightUpperArm',
    'rightLowerArm',
    'rightHand',
  ];
  const positions = Buffer.alloc(36);
  [-0.4, 0, 0, 0.4, 0, 0, 0, 1.2, 0].forEach((value, index) =>
    positions.writeFloatLE(value, index * 4),
  );
  const document = {
    asset: { version: '2.0', generator: 'LocalAITuber E2E' },
    scene: 0,
    scenes: [{ nodes: boneNames.map((_name, index) => index) }],
    nodes: boneNames.map((name, index) => ({
      name,
      ...(index === 0 ? { mesh: 0 } : {}),
    })),
    buffers: [
      {
        byteLength: positions.length,
        uri: `data:application/octet-stream;base64,${positions.toString('base64')}`,
      },
    ],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: positions.length }],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 3,
        type: 'VEC3',
        min: [-0.4, 0, 0],
        max: [0.4, 1.2, 0],
      },
    ],
    materials: [
      { pbrMetallicRoughness: { baseColorFactor: [0.1, 0.8, 0.9, 1] } },
    ],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, material: 0 }] }],
    extensionsUsed: ['VRMC_vrm'],
    extensions: {
      VRMC_vrm: {
        specVersion: '1.0',
        meta: {
          name: 'Generated test avatar',
          authors: ['LocalAITuber tests'],
          licenseUrl: 'https://vrm.dev/licenses/1.0/',
        },
        humanoid: {
          humanBones: Object.fromEntries(
            boneNames.map((name, node) => [name, { node }]),
          ),
        },
        expressions: {
          preset: Object.fromEntries(
            ['aa', 'blink', 'happy', 'sad', 'angry', 'surprised'].map(
              (name) => [name, {}],
            ),
          ),
        },
        lookAt: { type: 'bone' },
      },
    },
  };
  const json = Buffer.from(JSON.stringify(document));
  const paddedLength = Math.ceil(json.length / 4) * 4;
  const output = Buffer.alloc(12 + 8 + paddedLength, 0x20);
  output.writeUInt32LE(0x46546c67, 0);
  output.writeUInt32LE(2, 4);
  output.writeUInt32LE(output.length, 8);
  output.writeUInt32LE(paddedLength, 12);
  output.writeUInt32LE(0x4e4f534a, 16);
  json.copy(output, 20);
  return output;
}

test('introduction, studio, settings, and chat work', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'あなたのローカルAIキャラクター' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'はじめる' }).click();
  await expect(page.getByLabel('character stage')).toBeVisible();
  await page.getByPlaceholder('メッセージを入力').fill('こんにちは');
  await page.getByRole('button', { name: '送信' }).click();
  await expect(page.getByLabel('チャットログ')).toContainText('こんにちは');
  await page.getByRole('button', { name: '設定' }).click();
  await expect(page.getByRole('complementary', { name: '設定' })).toBeVisible();
  await page.getByLabel('テーマ').selectOption('forest');
  await page.getByRole('button', { name: '閉じる' }).click();
  await expect(page.locator('main')).toHaveClass(/theme-forest/);
});

test('switches to Arabic and applies RTL direction', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'はじめる' }).click();
  await page.getByRole('button', { name: '設定' }).click();
  await page.getByLabel('言語').selectOption('ar');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('complementary')).toContainText('الإعدادات');
});

test('loads, restores, and deletes an original generated VRM fixture', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'はじめる' }).click();
  await page.locator('input[accept=".vrm,model/gltf-binary"]').setInputFiles({
    name: 'generated-fixture.vrm',
    mimeType: 'model/gltf-binary',
    buffer: generatedVrmFixture(),
  });

  await expect(page.getByText('VRM model ready')).toBeVisible();
  await expect(page.getByLabel('VRM avatar renderer')).toBeVisible();
  await expect(page.getByLabel('VRM model')).toHaveValue(/.+/);

  await page.reload();
  await page.getByRole('button', { name: 'はじめる' }).click();
  await expect(page.getByText('VRM model ready')).toBeVisible();
  await expect(page.getByLabel('VRM avatar renderer')).toBeVisible();

  await page.getByRole('button', { name: 'Delete selected VRM' }).click();
  await expect(page.getByLabel('VRM avatar renderer')).toHaveCount(0);
  await expect(page.getByLabel('VRM model')).toHaveValue('');
});

test('persists and clears a local MotionPNGTuber video pair', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'はじめる' }).click();
  await page.getByLabel('Avatar mode').selectOption('pngtuber');
  const videoInputs = page.locator('input[accept="video/mp4,video/webm"]');
  await videoInputs.nth(0).setInputFiles({
    name: 'idle.webm',
    mimeType: 'video/webm',
    buffer: Buffer.from([0x1a, 0x45, 0xdf, 0xa3]),
  });
  await videoInputs.nth(1).setInputFiles({
    name: 'talking.webm',
    mimeType: 'video/webm',
    buffer: Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x01]),
  });
  await expect(page.getByText('Idle and talking videos ready')).toBeVisible();
  await expect(page.getByLabel('PNGTuber renderer')).toBeVisible();
  await page.getByLabel('Enable PNGTuber chroma key').check();
  await page.getByLabel('PNGTuber scale').fill('1.5');
  await expect(page.getByLabel('PNGTuber renderer')).toHaveAttribute(
    'style',
    /scale\(1\.5\)/,
  );

  await page.reload();
  await page.getByRole('button', { name: 'はじめる' }).click();
  await page.getByLabel('Avatar mode').selectOption('pngtuber');
  await expect(page.getByLabel('PNGTuber renderer')).toBeVisible();
  await expect(page.getByLabel('Enable PNGTuber chroma key')).toBeChecked();
  await expect(page.getByLabel('PNGTuber scale')).toHaveValue('1.5');

  await page.getByRole('button', { name: 'Clear PNGTuber videos' }).click();
  await expect(page.getByLabel('PNGTuber renderer')).toHaveCount(0);
  await expect(page.getByText('Select idle and talking videos')).toBeVisible();
});

test('runs the original Live2D bridge fixture lifecycle', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'はじめる' }).click();
  await page.getByLabel('Avatar mode').selectOption('live2d');
  await page.getByLabel('Live2D Core script').fill('/live2d-fixture/core.js');
  await page
    .getByLabel('Live2D bridge script')
    .fill('/live2d-fixture/runtime.js');
  await page
    .getByLabel('Live2D model manifest')
    .fill('/live2d-fixture/avatar.model3.json');
  await page.getByRole('button', { name: 'Load Live2D' }).click();

  const renderer = page.getByLabel('Live2D renderer');
  await expect(page.getByText('Live2D model ready')).toBeVisible();
  await expect(renderer).toHaveAttribute(
    'data-live2d-model',
    '/live2d-fixture/avatar.model3.json',
  );
  await page.getByLabel('Live2D expression').selectOption('happy');
  await expect(renderer).toHaveAttribute('data-live2d-expression', 'happy');
  await page.getByLabel('Live2D motion group').fill('TapBody');
  await page.getByLabel('Live2D motion index').fill('2');
  await page.getByRole('button', { name: 'Play Live2D motion' }).click();
  await expect(renderer).toHaveAttribute('data-live2d-motion', 'TapBody:2');
});

test('reports browser microphone availability safely', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'SpeechRecognition', {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      configurable: true,
      value: undefined,
    });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'はじめる' }).click();
  await page.getByLabel('Start microphone').click();
  await expect(
    page.getByText('Browser speech recognition is not supported'),
  ).toBeVisible();
});

test('transcribes an audio file through the protected application route', async ({
  page,
}) => {
  await page.route('**/api/audio/transcribe', async (route) => {
    const request = route.request();
    expect(request.method()).toBe('POST');
    expect(request.postDataJSON()).toMatchObject({
      model: 'gpt-4o-mini-transcribe',
      mimeType: 'audio/webm',
    });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ text: 'fixture transcript' }),
    });
  });
  await page.goto('/');
  await page.locator('button').first().click();
  await page.getByLabel('Audio file for transcription').setInputFiles({
    name: 'voice.webm',
    mimeType: 'audio/webm',
    buffer: Buffer.from([0x1a, 0x45, 0xdf, 0xa3]),
  });
  await expect(page.getByLabel('Chat message')).toHaveValue(
    'fixture transcript',
  );
  await expect(page.getByText('Transcript ready')).toBeVisible();
});

test('synthesizes and plays a VOICEVOX preview through the application route', async ({
  page,
}) => {
  await page.addInitScript(() => {
    class AudioFixture {
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      pause() {}
      async play() {}
    }
    Object.defineProperty(window, 'Audio', {
      configurable: true,
      value: AudioFixture,
    });
  });
  await page.route('**/api/tts/synthesize', async (route) => {
    expect(route.request().postDataJSON()).toMatchObject({
      engine: 'voicevox',
      text: 'voice fixture',
      options: {
        speakerId: '1',
        speed: 1,
        pitch: 0,
        intonation: 1,
      },
    });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ audioBase64: 'UklGRg==', mimeType: 'audio/wav' }),
    });
  });
  await page.goto('/');
  await page.locator('button').first().click();
  await page.getByLabel('Chat message').fill('voice fixture');
  await page.getByRole('button', { name: 'Test synthesized speech' }).click();
  await expect(page.getByText('Playing synthesized speech')).toBeVisible();
});

test('sends Koeiromap coordinates and style through the protected route', async ({
  page,
}) => {
  await page.addInitScript(() => {
    class AudioFixture {
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      pause() {}
      async play() {}
    }
    Object.defineProperty(window, 'Audio', {
      configurable: true,
      value: AudioFixture,
    });
  });
  await page.route('**/api/tts/synthesize', async (route) => {
    expect(route.request().postDataJSON()).toMatchObject({
      engine: 'koeiromap',
      text: 'koeiromap fixture',
      options: { speakerX: -3, speakerY: 4, style: 'happy' },
    });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ audioBase64: 'UklGRg==', mimeType: 'audio/wav' }),
    });
  });
  await page.goto('/');
  await page.locator('button').first().click();
  await page.getByLabel('TTS engine').selectOption('koeiromap');
  await page.getByLabel('Koeiromap voice X').fill('-3');
  await page.getByLabel('Koeiromap voice Y').fill('4');
  await page.getByLabel('Koeiromap style').selectOption('happy');
  await page.getByLabel('Chat message').fill('koeiromap fixture');
  await page.getByRole('button', { name: 'Test synthesized speech' }).click();
  await expect(page.getByText('Playing synthesized speech')).toBeVisible();
});
