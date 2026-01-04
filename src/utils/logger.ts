export const logger = {
  error: (context: string, error: unknown) => {
    if (__DEV__) {
      console.error(`[Error] ${context}:`, error);
    }
    // Optional: Send to crash reporting service (Sentry, Crashlytics) in production
  },
  info: (message: string) => {
    if (__DEV__) {
      console.log(`[Info] ${message}`);
    }
  },
};