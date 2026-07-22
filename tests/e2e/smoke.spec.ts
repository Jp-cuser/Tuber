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
