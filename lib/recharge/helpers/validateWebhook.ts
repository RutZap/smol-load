import { createHash, timingSafeEqual } from 'crypto';

interface validateWebhookParams {
  clientSecret: string;
  requestBody: string;
  hmacHeader: string;
}

export function validateWebhook(params: validateWebhookParams): boolean {
  const expectedHmac = createHash('sha256')
    .update(params.clientSecret + params.requestBody)
    .digest('hex');

  const expectedHmacBuffer = Buffer.from(expectedHmac, 'hex');

  const webhookHmacBuffer = Buffer.from(params.hmacHeader, 'hex');

  return timingSafeEqual(expectedHmacBuffer, webhookHmacBuffer);
}
