import { Parser } from 'xml2js';

export async function xmlParser<T>(xmlString: string): Promise<T> {
  const parser = new Parser({ explicitArray: false });
  const data = await parser.parseStringPromise(xmlString);
  return data;
}
