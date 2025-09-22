import { models, WhistlAuthTokens, WhistlToken } from '@teamkeel/sdk';

export async function getWhistlAccessToken(): Promise<WhistlAuthTokens | null> {
  const tokenQuery = await models.whistlAuthTokens.findMany({
    where: {
      tokenType: {
        equals: WhistlToken.AccessToken,
      },
    },
  });
  if (!tokenQuery || tokenQuery.length < 1) {
    return null;
  }
  // The whistlAuthTokens model unique on tokenType so will only contain 1 record
  const accessToken = tokenQuery[0];
  return accessToken;
}
