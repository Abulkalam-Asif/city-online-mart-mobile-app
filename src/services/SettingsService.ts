import { doc, getDoc, type FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { logger } from "../utils/logger";
import { SettingsType } from "../types";

export class SettingsService {
  private static readonly SETTINGS_COLLECTION = "SETTINGS";

  constructor(private db: FirebaseFirestoreTypes.Module) { }

  /**
   * Get specific app settings from Firestore
   * @param domain The settings document ID (e.g. 'auth')
   */
  async getSettings<T>(domain: SettingsType): Promise<T | null> {
    try {
      const settingsRef = doc(this.db, SettingsService.SETTINGS_COLLECTION, domain);
      const settingsDoc = await getDoc(settingsRef);

      if (settingsDoc.exists()) {
        return settingsDoc.data() as T;
      }

      return null;
    } catch (error) {
      logger.error(`getSettings for ${domain}`, error);
      return null;
    }
  }
}
