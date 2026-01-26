export interface AuthSettings {
  requireOTP: boolean;
}

export interface SettingsState {
  auth: AuthSettings | null;
  isLoading: boolean;
  error: string | null;
}

export type SettingsType = "auth";
