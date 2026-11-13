import { collection, getDocs, query, where } from "@react-native-firebase/firestore";
import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import type { DeliveryArea } from "../types/delivery_area.types";
import { compareAreaNames } from "../utils/deliveryAreas";

/**
 * The delivery areas of the active city (B-072). The app only reads them: the admin portal manages
 * the list (super-admins). Rules: DELIVERY_AREAS is readable by any signed-in user.
 */
export class DeliveryAreaService {
  constructor(private db: FirebaseFirestoreTypes.Module) {}

  private static readonly COLLECTION_NAME = "DELIVERY_AREAS";

  /**
   * The active areas, sorted by name (chak numbers in number order). An empty list means the city
   * has the area check switched off. One equality filter, so no composite index is needed.
   * Throws when the list cannot be read: the caller must not treat that as "no areas".
   */
  async getActiveAreas(): Promise<DeliveryArea[]> {
    try {
      const snapshot = await getDocs(
        query(collection(this.db, DeliveryAreaService.COLLECTION_NAME), where("isActive", "==", true)),
      );
      return snapshot.docs
        .map((d: FirebaseFirestoreTypes.DocumentData): DeliveryArea => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name ?? "",
            keywords: Array.isArray(data.keywords) ? data.keywords : [],
            isActive: true,
          };
        })
        .filter((a: DeliveryArea) => a.name !== "")
        .sort((a: DeliveryArea, b: DeliveryArea) => compareAreaNames(a.name, b.name));
    } catch (error) {
      console.error("Error fetching delivery areas:", error);
      throw error;
    }
  }
}
