import { auth, db, functions } from "../../firebaseConfig";
import { AuthService } from "./AuthService";
import { SettingsService } from "./SettingsService";

// Initialize services with dependencies (DI pattern)
const authService = new AuthService(auth, db, functions);
const settingsService = new SettingsService(db);

// Export service instances
export { authService, settingsService };

/**
 * Note: Existing services (cartService, productService, etc.) are currently 
 * exported as plain objects and don't use the DI pattern yet.
 * They can be imported directly from their respective files for now.
 * In the future, we will refactor them into classes and add them here.
 */
