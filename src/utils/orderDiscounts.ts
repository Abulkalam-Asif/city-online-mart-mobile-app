import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

/**
 * Calculate applicable order-level discounts for a given subtotal
 * @param subtotal - Order subtotal after product/category discounts
 * @returns Promise<{discountAmount: number, discountName?: string}> - Discount amount and name
 */
export async function calculateOrderDiscount(subtotal: number): Promise<{ discountAmount: number, discountName?: string }> {
  try {
    console.log('🔍 Calculating order discount for subtotal:', subtotal);

    const discountsRef = collection(db, 'DISCOUNTS');
    const now = Timestamp.now();

    // Query for active order-level discounts
    const q = query(
      discountsRef,
      where('applicableTo', '==', 'order'),
      where('isActive', '==', true),
      where('startDate', '<=', now),
      where('endDate', '>=', now)
    );

    const snapshot = await getDocs(q);
    console.log('📋 Found', snapshot.docs.length, 'order-level discounts in database');

    if (snapshot.empty) {
      console.log('❌ No order-level discounts found');
      return { discountAmount: 0 };
    }

    let bestDiscount = {
      amount: 0,
      name: ''
    };

    // Find the best applicable discount
    snapshot.docs.forEach(doc => {
      const discount = doc.data();
      console.log('🎫 Checking discount:', {
        id: doc.id,
        name: discount.name,
        value: discount.value,
        minPurchaseAmount: discount.minPurchaseAmount,
        isActive: discount.isActive,
        applicableTo: discount.applicableTo
      });

      // Check if subtotal meets minimum purchase requirement
      const minPurchase = discount.minPurchaseAmount || 0;
      console.log('💰 Subtotal:', subtotal, 'vs Min Purchase:', minPurchase);

      if (subtotal >= minPurchase) {
        const discountAmount = (subtotal * discount.value) / 100;
        console.log('✅ Discount applicable! Amount:', discountAmount, '(', discount.value, '% of', subtotal, ')');

        // Keep the highest discount amount
        if (discountAmount > bestDiscount.amount) {
          bestDiscount = {
            amount: discountAmount,
            name: discount.name || 'Order Discount'
          };
          console.log('🏆 New best discount:', bestDiscount);
        }
      } else {
        console.log('❌ Discount not applicable - subtotal too low');
      }
    });

    const result = {
      discountAmount: bestDiscount.amount,
      discountName: bestDiscount.name || undefined
    };

    console.log('🎯 Final order discount result:', result);
    console.log('💵 Price after discount:', subtotal - bestDiscount.amount);

    return result;

  } catch (error) {
    console.error('❌ Error calculating order discount:', error);
    return { discountAmount: 0 };
  }
}