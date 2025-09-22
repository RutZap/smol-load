import { Builder } from 'xml2js';

interface xmlBuilderParams {
  data: object;
  rootName: string;
  isTokenRequest: boolean;
}

export function xmlBuilder(params: xmlBuilderParams): string {
  const builder = new Builder({
    xmldec: { version: '1.0', encoding: 'UTF-8' },
  });
  const namespaces: Record<string, string> = {
    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
  };
  if (!params.isTokenRequest) {
    namespaces['xmlns'] = 'http://api.parcelhub.net/schemas/api/parcelhub-api-v0.4.xsd';
  }
  const obj = {
    [params.rootName]: {
      $: namespaces,
      ...params.data,
    },
  };
  return builder.buildObject(obj);
}
