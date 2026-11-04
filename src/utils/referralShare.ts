/** The text a customer shares with friends (B-063). The store link is still a placeholder, see BACKLOG. */
export const APP_LINK_PLACEHOLDER = "[App Link Here]";

export const buildShareMessage = (referralCode?: string | null): string =>
  referralCode
    ? `Check out City Online Mart: ${APP_LINK_PLACEHOLDER}\nSign up and enter my referral code ${referralCode} on the login screen.`
    : `Check out this awesome app: ${APP_LINK_PLACEHOLDER}`;
