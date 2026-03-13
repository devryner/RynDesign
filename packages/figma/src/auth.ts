export interface FigmaAuthConfig {
  personalAccessToken?: string;
  oauthClientId?: string;
  oauthClientSecret?: string;
  oauthToken?: string;
}

export class FigmaAuth {
  private config: FigmaAuthConfig;

  constructor(config: FigmaAuthConfig) {
    this.config = config;
  }

  getToken(): string {
    if (this.config.personalAccessToken) {
      return this.config.personalAccessToken;
    }
    if (this.config.oauthToken) {
      return this.config.oauthToken;
    }
    throw new Error(
      'No Figma authentication configured. Set FIGMA_TOKEN environment variable or provide personalAccessToken in config.'
    );
  }

  isAuthenticated(): boolean {
    return !!(this.config.personalAccessToken || this.config.oauthToken);
  }

  static fromEnv(): FigmaAuth {
    return new FigmaAuth({
      personalAccessToken: process.env.FIGMA_TOKEN || process.env.FIGMA_PERSONAL_ACCESS_TOKEN,
    });
  }
}
