import { WhistlToken, useDatabase } from '@teamkeel/sdk';
import { TokenV2Response } from '../../types/auth';

/**
 * @param TokenV2Response returned from Whistl TokenV1 endpoint
 * Updates singelton rows for refresh and access tokens
 * Used with Auth refreshTokens method
 */
export async function updateWhistlTokens(tokens: TokenV2Response): Promise<void> {
  const db = useDatabase();
  await db
    .insertInto('whistl_auth_tokens')
    .values([
      {
        tokenType: WhistlToken.RefreshToken,
        value: tokens.TokenV2.refreshToken,
      },
      {
        tokenType: WhistlToken.AccessToken,
        value: tokens.TokenV2.access_token,
        expiresIn: parseInt(tokens.TokenV2.expiresIn),
      },
    ])
    .onConflict(oc =>
      oc.column('tokenType').doUpdateSet({
        value: eb => eb.ref('excluded.value'),
        expiresIn: eb => eb.ref('excluded.expiresIn'),
      })
    )
    .returning(['id'])
    .execute();
}
