/**
 * Maps raw technical error objects/strings into clean, user-friendly messages.
 */
export function getFriendlyErrorMessage(error: any, fallbackMessage: string = "An unexpected error occurred. Please try again."): string {
  if (!error) return fallbackMessage;

  const msg = (typeof error === 'string' ? error : error.message || "").toLowerCase();
  const code = (typeof error === 'object' && error?.code ? String(error.code) : "").toLowerCase();

  if (
    code.includes("user-disabled") ||
    msg.includes("account is disabled") ||
    msg.includes("user account is disabled") ||
    msg.includes("user-disabled")
  ) {
    return "Your account has been disabled. Please contact customer support for assistance.";
  }

  if (
    code.includes("invalid-phone-number") ||
    msg.includes("invalid phone number") ||
    msg.includes("invalid-phone-number")
  ) {
    return "Please enter a valid 11-digit mobile number.";
  }

  if (
    code.includes("invalid-verification-code") ||
    msg.includes("invalid otp") ||
    msg.includes("invalid-verification-code") ||
    msg.includes("code-expired")
  ) {
    return "The verification code entered is incorrect or expired. Please check and try again.";
  }

  if (
    code.includes("too-many-requests") ||
    msg.includes("too-many-requests") ||
    msg.includes("quota exceeded")
  ) {
    return "Too many attempts. Please wait a few minutes before trying again.";
  }

  if (
    code.includes("network-request-failed") ||
    msg.includes("network") ||
    msg.includes("offline")
  ) {
    return "Network error. Please check your internet connection and try again.";
  }

  // Return clean error messages if they don't contain raw Firebase / technical code fragments
  if (
    error.message &&
    !error.message.includes("internal") &&
    !error.message.includes("Firebase:") &&
    !error.message.includes("auth/")
  ) {
    return error.message;
  }

  return fallbackMessage;
}
