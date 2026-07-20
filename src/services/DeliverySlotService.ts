import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { format, addDays } from "date-fns";
import { DailyDeliverySlotDoc, DeliverySlot, DeliverySlotTemplate } from "../types";

export class DeliverySlotService {
  private readonly COLLECTION_NAME = "DELIVERY_SLOTS";
  
  constructor(private db: FirebaseFirestoreTypes.Module) {}

  /**
   * Get slots for the next X days for the mobile app.
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

    const existingDocs = snapshot.docs.map(d => d.data() as DailyDeliverySlotDoc);
    
    // Check for missing days and mock them up as empty (since admin generates them, 
    // if they are missing on mobile it means the admin hasn't configured them or it's a fallback)
    const existingDates = new Set(existingDocs.map(d => d.date));
    
    const finalDays: DailyDeliverySlotDoc[] = [];
    
    for (let i = 0; i < daysToFetch; i++) {
      const dateStr = format(addDays(today, i), "yyyy-MM-dd");
      const existingDoc = existingDocs.find(d => d.date === dateStr);
      if (existingDoc) {
        finalDays.push(existingDoc);
      } else {
        // Fallback for ungenerated days (should rarely happen if admin visits the page)
        finalDays.push({
          id: dateStr,
          date: dateStr,
          slots: []
        });
      }
    }

    return finalDays;
  }
}
