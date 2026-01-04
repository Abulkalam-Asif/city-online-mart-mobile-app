import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/react-query";
import { collection, getDocs, getDoc, doc, query, where, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "@/firebaseConfig";

interface Product {
  id: string;
  slug: string;
  info: {
    name: string;
    nameLower: string;
    description: string;
    categoryIds: string[];
    manufacturerId: string;
    isActive: boolean;
    productTags: string[];
    allowCustomerReviews: boolean;
    markAsNew: boolean;
    markAsNewStartDate?: Date;
    markAsNewEndDate?: Date;
  };
  price: number;
  discountIds: string[];
  featuredDiscountIds: string[];
  minimumStockQuantity: number;
  multimedia: {
    images: string[];
    video: string;
  };
  similarProductIds: string[];
  boughtTogetherProductIds: string[];
  batchStock?: {
    usableStock: number;
    expiredStock: number;
    totalStock: number;
    activeBatchCount: number;
  };
}

interface Discount {
  id: string;
  name: string;
  description?: string;
  value: number;
  applicableTo: "products" | "categories" | "order";
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
  minPurchaseAmount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  currentUsageCount: number;
  createdAt: Date;
}

interface ProductWithDiscount extends Product {
  discountPercentage: number;
  savings: number;
}

// Helper function to check if discount is active
function isDiscountActive(discount: Discount): boolean {
  const now = Timestamp.now().toDate();
  return discount.isActive &&
         discount.startDate <= now &&
         discount.endDate >= now;
}

// Hook to fetch best price products (featured discounts for mobile app)
export function useBestPriceProducts(limitCount: number = 10) {
  return useQuery({
    queryKey: queryKeys.products.bestPrices(limitCount),
    queryFn: async (): Promise<ProductWithDiscount[]> => {
      // Step 1: Get products that have featured discounts
      const productsRef = collection(db, 'PRODUCTS');
      const productsQuery = query(
        productsRef,
        where('info.isActive', '==', true),
        where('featuredDiscountIds', '!=', []) // Products with featured discounts
      );

      const productsSnapshot = await getDocs(productsQuery);
      const productsWithFeaturedDiscounts = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      if (productsWithFeaturedDiscounts.length === 0) {
        return []; // No products with featured discounts
      }

      // Step 2: Collect all featured discount IDs
      const allFeaturedDiscountIds: string[] = [];
      productsWithFeaturedDiscounts.forEach(product => {
        if (product.featuredDiscountIds && product.featuredDiscountIds.length > 0) {
          allFeaturedDiscountIds.push(...product.featuredDiscountIds);
        }
      });

      // Remove duplicates
      const uniqueDiscountIds = [...new Set(allFeaturedDiscountIds)];

      if (uniqueDiscountIds.length === 0) {
        return []; // No featured discount IDs
      }

      // Step 3: Get discount details for featured discounts
      const discountsRef = collection(db, 'DISCOUNTS');

      // Query discounts individually (since we have specific IDs)
      const discountPromises = uniqueDiscountIds.map((discountId: string) =>
        getDoc(doc(discountsRef, discountId)).then((docSnap): Discount | null => {
          if (docSnap.exists()) {
            const rawData = docSnap.data();
            const discount = {
              id: docSnap.id,
              ...rawData,
              startDate: rawData?.startDate?.toDate() || new Date(0),
              endDate: rawData?.endDate?.toDate() || new Date(0)
            } as Discount;

            // Check if discount is active
            const now = Timestamp.now().toDate();
            const isActive = discount.isActive &&
                           discount.startDate <= now &&
                           discount.endDate >= now;

            if (isActive) {
              return discount;
            }
          }
          return null;
        })
      );

      const discountResults = await Promise.all(discountPromises);
      const activeFeaturedDiscounts = discountResults.filter(
        (discount: Discount | null): discount is Discount => discount !== null
      );

      // Step 4: Map products to their highest featured discount
      const productsWithDiscounts: ProductWithDiscount[] = productsWithFeaturedDiscounts
        .map(product => {
          let highestDiscount = 0;

          // Find applicable featured discounts for this product
          const applicableDiscounts = activeFeaturedDiscounts.filter((discount: Discount) =>
            product.featuredDiscountIds?.includes(discount.id)
          );

          // Find highest discount percentage among featured discounts
          if (applicableDiscounts.length > 0) {
            highestDiscount = Math.max(...applicableDiscounts.map((d: Discount) => d.value));
          }

          return {
            ...product,
            discountPercentage: highestDiscount,
            savings: product.price * (highestDiscount / 100)
          };
        })
        .filter(product => product.discountPercentage > 0) // Only products with active featured discounts
        .sort((a, b) => b.discountPercentage - a.discountPercentage) // Sort by highest discount first
        .slice(0, limitCount); // Limit results

      return productsWithDiscounts;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - discount data changes less frequently
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}