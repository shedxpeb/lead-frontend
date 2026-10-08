let accessToken: string | null = null;

export function setAccessToken(token: string): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function clearSession(): void {
  accessToken = null;
}

export function hasSession(): boolean {
  return !!accessToken;
}
