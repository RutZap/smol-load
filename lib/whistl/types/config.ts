import { ContextAPI } from '@teamkeel/sdk';

export interface WhistlClientConfig {
  baseUrl: string;
  accessToken: string;
}

export interface WhistlConfig {
  secrets: ContextAPI['secrets'];
  env: ContextAPI['env'];
}

export type LabelDataType = 'ZPL' | 'EPL' | 'PNG' | 'PDF' | 'JPG';

export const LabelDataType: LabelDataType[] = ['ZPL', 'EPL', 'PNG', 'PDF', 'JPG'];

export type LabelSize = '4' | '6' | '8';

export const LabelSize: LabelSize[] = ['4', '6', '8'];

export const LabelDataMimeType = {
  ZPL: 'text/plain', // Consider 'application/zpl' if/when supported
  EPL: 'text/plain', // Consider 'application/vnd.epl' if/when supported
  PNG: 'image/png',
  PDF: 'application/pdf',
  JPG: 'image/jpeg',
};
