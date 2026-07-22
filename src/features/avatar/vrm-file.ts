export const MAX_VRM_FILE_BYTES = 100 * 1024 * 1024;

export function validateVrmFile(file: Pick<File, 'name' | 'size'>): void {
  if (!file.name.toLowerCase().endsWith('.vrm'))
    throw new Error('Select a .vrm model file');
  if (file.size <= 0) throw new Error('The VRM model file is empty');
  if (file.size > MAX_VRM_FILE_BYTES)
    throw new Error('The VRM model exceeds the 100 MB limit');
}
