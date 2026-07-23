import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { format, addDays } from "date-fns";
import { DailyDeliverySlotDoc } from "../types";

export class DeliverySlotService {
  private readonly COLLECTION_NAME = "DELIVERY_SLOTS";
  
  constructor(private db: FirebaseFirestoreTypes.Module) {}

  /**
   * Get slots for the next X days for the mobile app strictly from Firestore database.
   */
  async getNextDays(daysToFetch: number = 3): Promise<DailyDeliverySlotDoc[]> {
    const today = new Date();
    const startDate = format(today, "yyyy-MM-dd");
    const endDateDate = addDays(today, daysToFetch - 1);
    const endDate = format(endDateDate, "yyyy-MM-dd");

    const slotsRef = this.db.collection(this.COLLECTION_NAME);
    const snapshot = await slotsRef
      .where("date", ">=", startDate)
      .where("date", "<=", endDate)
      .orderBy("date", "asc")
      .get();

    return snapshot.docs.map(d => d.data() as DailyDeliverySlotDoc);
  }
}
