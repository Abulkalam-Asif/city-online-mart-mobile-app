import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { convertEmulatorUrl, db } from "../../firebaseConfig";
import type { BannerMinimal } from "@/src/types";
import { logger } from "../utils/logger";

const COLLECTION_NAME = "BANNERS";

// Helper function to convert Firestore data to BannerMinimal
const firestoreToBanner = (id: string, data: any): BannerMinimal => ({
  id,
  imageUrl: convertEmulatorUrl(data.imageUrl) || "",
  linkType: data.linkType || "product",
  link: data.link || "",
  displayOrder: data.displayOrder ?? 0,
});

const bannerService = {
  /**
   * Get all active homepage banners ordered by displayOrder
   * Index required: BANNERS
   * bannerType, isActive, displayOrder, __name__
   * @returns Array of all banners
   */
  async getHomepageBanners(): Promise<BannerMinimal[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("bannerType", "==", "homepage"),
        where("isActive", "==", true),
        orderBy("displayOrder", "asc")
      );
      const querySnapshot = await getDocs(q);

      const banners = querySnapshot.docs.map((doc) =>
        firestoreToBanner(doc.id, doc.data())
      );

      return banners;
    } catch (error) {
      logger.error("getHomepageBanners", error);
      throw error;
    }
  },

  /**
   * Get active popup banner
   * @returns Popup banner or null if none found
   */
  async getPopupBanner(): Promise<BannerMinimal | null> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("bannerType", "==", "popup"),
        where("isActive", "==", true),
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return firestoreToBanner(doc.id, doc.data());
      }
      return null;
    } catch (error) {
      logger.error("getPopupBanner", error);
      throw error;
    }
  },
};

export default bannerService;
