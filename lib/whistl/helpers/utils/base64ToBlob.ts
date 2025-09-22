import { LabelDataType, LabelDataMimeType } from '../../types/config';

export async function base64ToBlob(base64String: string, type: LabelDataType): Promise<Blob> {
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length)
    .fill(0)
    .map((_, i) => byteCharacters.charCodeAt(i));
  const byteArray = new Uint8Array(byteNumbers);
  const mimeType = LabelDataMimeType[type];
  const blob = new Blob([byteArray], { type: mimeType });
  return blob;
}
