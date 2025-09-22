export interface TokenRequest {
  grant_type: 'bearer';
  username: string;
  password: string;
}

export interface TokenV2Response {
  TokenV2: {
    refreshToken: string;
    access_token: string;
    expiresIn: string;
  };
}
