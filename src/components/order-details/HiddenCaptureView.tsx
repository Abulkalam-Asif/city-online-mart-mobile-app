import { StyleSheet, Text, View, Platform } from "react-native";
import React from "react";
import ViewShot from "react-native-view-shot";
import { DisplayItem } from "@/src/components/common/OrderItemsList";

import { formatSlotTimeRange } from "@/src/utils/slotUtils";
import { OrderRefundSummary, roundAmount } from "@/src/utils/refundUtils";
import { format, parse } from "date-fns";

const formatSlotDate = (dateStr?: string) => {
  if (!dateStr || dateStr === "fast") return "";
  try {
    const parsed = parse(dateStr, "yyyy-MM-dd", new Date());
    if (isNaN(parsed.getTime())) return dateStr;
    return format(parsed, "EEE, d MMM yyyy");
  } catch {
    return dateStr;
  }
};

type HiddenCaptureViewProps = {
  viewShotRef: React.RefObject<ViewShot | null>;
  orderId: string;
  subtotal: number;
  deliveryFee: number;
  /** Free delivery was applied (the fee on the order is 0); the receipt says so. */
  isFreeDelivery?: boolean;
  totalAmount: number;
  appliedOrderDiscount?: { percentage: number; amount: number };
  appliedOnlinePaymentDiscount?: { percentage: number; amount: number };
  getStatusText: () => string;
  deliveryAddress: string;
  deliverySlot?: {
    date: string;
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    expressDurationMinutes?: number;
  };
  paymentMethodLabel: string;
  paymentStatusLabel: string;
  displayItems: DisplayItem[];
  customerPhone?: string;
  /** Active refunds only (from getOrderRefundSummary); null hides the refund block. */
  refundSummary: OrderRefundSummary | null;
};

const DottedLine = () => (
  <View style={styles.dottedLine} />
);

const HiddenCaptureView = ({
  viewShotRef,
  orderId,
  subtotal,
  deliveryFee,
  isFreeDelivery,
  totalAmount,
  appliedOrderDiscount,
  appliedOnlinePaymentDiscount,
  getStatusText,
  deliveryAddress,
  deliverySlot,
  paymentMethodLabel,
  paymentStatusLabel,
  displayItems,
  customerPhone,
  refundSummary,
}: HiddenCaptureViewProps) => {
  return (
    <>
      <View style={styles.hiddenCaptureContainer}>
        <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 1 }}>
          <View style={styles.captureView}>

            {/* Store Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.storeName}>City Online Mart</Text>
            </View>

            {/* Meta Info */}
            <View style={styles.metaContainer}>
              <View style={styles.metaRow}>
                <Text style={styles.posText}>Order: #{orderId}</Text>
                <Text style={styles.posText}>Date: {new Date().toLocaleDateString()}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.posText}>Cust Phone: {customerPhone || "N/A"}</Text>
                <Text style={styles.posText}>Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            </View>

            <DottedLine />

            {/* Items Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.posTextBold, styles.colQty]}>QTY</Text>
              <Text style={[styles.posTextBold, styles.colItem]}>ITEM</Text>
              <Text style={[styles.posTextBold, styles.colUnit, styles.textRight]}>UNIT</Text>
              <Text style={[styles.posTextBold, styles.colTotal, styles.textRight]}>TOTAL</Text>
              <Text style={[styles.posTextBold, styles.colDisc, styles.textCenter]}>DISC</Text>
              <Text style={[styles.posTextBold, styles.colFinal, styles.textRight]}>FINAL</Text>
            </View>

            <DottedLine />

            {/* Items List */}
            <View style={styles.itemsContainer}>
              {displayItems.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={[styles.posText, styles.colQty]}>{item.quantity}</Text>
                  <Text style={[styles.posText, styles.colItem]}>{item.name}</Text>
                  <Text style={[styles.posText, styles.colUnit, styles.textRight]}>{item.originalPrice || item.unitPrice}</Text>
                  <Text style={[styles.posText, styles.colTotal, styles.textRight]}>{(item.originalPrice || item.unitPrice) * item.quantity}</Text>
                  <Text style={[styles.posText, styles.colDisc, styles.textCenter]}>
                    {item.discountPercentage ? `${item.discountPercentage}%` : '-'}
                  </Text>
                  <Text style={[styles.posText, styles.colFinal, styles.textRight]}>{item.totalPrice}</Text>
                </View>
              ))}
            </View>

            <DottedLine />

            {/* Billing Summary */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.posText}>Subtotal:</Text>
                <Text style={styles.posText}>{subtotal}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.posText}>{deliverySlot?.id === "fast-delivery" ? "Express Delivery Fee:" : isFreeDelivery ? "Delivery Fee (FREE):" : "Delivery Fee:"}</Text>
                <Text style={styles.posText}>{deliveryFee}</Text>
              </View>
              {appliedOrderDiscount && (
                <View style={styles.summaryRow}>
                  <Text style={styles.posText}>Order Discount ({appliedOrderDiscount.percentage}% OFF):</Text>
                  <Text style={styles.posText}>-{appliedOrderDiscount.amount}</Text>
                </View>
              )}
              {appliedOnlinePaymentDiscount && (
                <View style={styles.summaryRow}>
                  <Text style={styles.posText}>Online Discount ({appliedOnlinePaymentDiscount.percentage}% OFF):</Text>
                  <Text style={styles.posText}>-{appliedOnlinePaymentDiscount.amount}</Text>
                </View>
              )}
            </View>

            <DottedLine />

            {/* Grand Total */}
            <View style={styles.grandTotalContainer}>
              <Text style={styles.grandTotalText}>GRAND TOTAL:</Text>
              <Text style={styles.grandTotalText}>Rs {totalAmount}</Text>
            </View>

            {/* Refunds Applied: active refunds only, never the reason (same as AdminPrintReceipt) */}
            {refundSummary && (
              <>
                <DottedLine />
                <View style={styles.summaryContainer}>
                  <Text style={[styles.posTextBold, styles.refundsTitle]}>Refunds Applied:</Text>
                  {refundSummary.refundedItems.map((item, index) => (
                    <View key={`refund-item-${index}`} style={styles.summaryRow}>
                      <Text style={[styles.posText, styles.refundLabel]}>- {item.quantity}x {item.productName}:</Text>
                      <Text style={styles.posText}>-Rs {roundAmount(item.subtotal)}</Text>
                    </View>
                  ))}
                  {refundSummary.refundsWithoutDetails.map((refund) => (
                    <View key={`refund-${refund.refundId}`} style={styles.summaryRow}>
                      <Text style={[styles.posText, styles.refundLabel]}>- Refund:</Text>
                      <Text style={styles.posText}>-Rs {roundAmount(refund.amount)}</Text>
                    </View>
                  ))}
                  {refundSummary.deliveryFeeRefunded > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={[styles.posText, styles.refundLabel]}>- Delivery Fee Refunded:</Text>
                      <Text style={styles.posText}>-Rs {refundSummary.deliveryFeeRefunded}</Text>
                    </View>
                  )}
                  {refundSummary.orderDiscountRecovered > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={[styles.posText, styles.refundLabel]}>- Order Discount No Longer Applies:</Text>
                      <Text style={styles.posText}>+Rs {refundSummary.orderDiscountRecovered}</Text>
                    </View>
                  )}
                  {refundSummary.onlineDiscountRecovered > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={[styles.posText, styles.refundLabel]}>- Online Discount No Longer Applies:</Text>
                      <Text style={styles.posText}>+Rs {refundSummary.onlineDiscountRecovered}</Text>
                    </View>
                  )}
                  {refundSummary.customAdjustment !== 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={[styles.posText, styles.refundLabel]}>- Adjustment:</Text>
                      <Text style={styles.posText}>
                        {refundSummary.customAdjustment > 0 ? "-" : "+"}Rs {Math.abs(refundSummary.customAdjustment)}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.summaryRow, styles.totalRefundedRow]}>
                    <Text style={styles.posTextBold}>TOTAL REFUNDED:</Text>
                    <Text style={styles.posTextBold}>-Rs {refundSummary.totalRefunded}</Text>
                  </View>
                </View>
                <DottedLine />
                <View style={styles.grandTotalContainer}>
                  <Text style={styles.grandTotalText}>ADJUSTED TOTAL:</Text>
                  <Text style={styles.grandTotalText}>Rs {refundSummary.adjustedTotal}</Text>
                </View>
              </>
            )}

            {/* Extra Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailsRow}>
                <Text style={styles.posText}>Order Status:</Text>
                <Text style={styles.posText}>
                  {getStatusText()}
                  {/* A full refund locks the order without changing its status */}
                  {refundSummary?.isFullyRefunded ? " (Fully Refunded)" : ""}
                </Text>
              </View>
              <View style={styles.detailsRow}>
                <Text style={styles.posText}>Payment Method:</Text>
                <Text style={styles.posText}>{paymentMethodLabel}</Text>
              </View>
              <View style={styles.detailsRow}>
                <Text style={styles.posText}>Payment Status:</Text>
                <Text style={styles.posText}>{paymentStatusLabel}</Text>
              </View>
              <View style={[styles.detailsRow, { alignItems: 'flex-start' }]}>
                <Text style={styles.posText}>Delivery Address:</Text>
                <Text style={[styles.posText, { flex: 1, textAlign: 'right', marginLeft: 16 }]}>{deliveryAddress || "N/A"}</Text>
              </View>
              {deliverySlot && (
                <View style={styles.detailsRow}>
                  <Text style={styles.posText}>Delivery Slot:</Text>
                  <Text style={styles.posText}>
                    {deliverySlot.id === "fast-delivery"
                      ? `⚡ Express (Within ${deliverySlot.expressDurationMinutes || 45}m)`
                      : `${formatSlotDate(deliverySlot.date)} (${formatSlotTimeRange(deliverySlot.startTime, deliverySlot.endTime)})`}
                  </Text>
                </View>
              )}
            </View>

            {/* Footer */}
            <View style={styles.footerContainer}>
              <Text style={styles.posText}>Thank you and see you again!</Text>
              <Text style={styles.posText}>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>

          </View>
        </ViewShot>
      </View>
    </>
  );
};

export default HiddenCaptureView;

const fontFamily = Platform.OS === 'ios' ? 'Courier' : 'monospace';

const styles = StyleSheet.create({
  hiddenCaptureContainer: {
    position: "absolute",
    left: -9999,
    top: 0,
  },
  captureView: {
    width: 450, // Slightly wider for table columns
    backgroundColor: "#fff",
    padding: 16,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  storeName: {
    fontSize: 22,
    fontFamily,
    fontWeight: "bold",
    color: "#000",
  },
  metaContainer: {
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  dottedLine: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#000',
    marginVertical: 8,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  itemsContainer: {
    paddingVertical: 4,
  },
  itemRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  posText: {
    fontSize: 13,
    fontFamily,
    color: "#000",
  },
  posTextBold: {
    fontSize: 13,
    fontFamily,
    fontWeight: "bold",
    color: "#000",
  },
  colQty: {
    width: 30,
  },
  colItem: {
    flex: 1,
    paddingRight: 8,
  },
  colUnit: {
    width: 45,
  },
  colTotal: {
    width: 55,
    paddingRight: 4,
  },
  colDisc: {
    width: 45,
    paddingRight: 4,
  },
  colFinal: {
    width: 55,
  },
  textRight: {
    textAlign: "right",
  },
  textCenter: {
    textAlign: "center",
  },
  summaryContainer: {
    paddingVertical: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingLeft: 40, // Indent summary
  },
  grandTotalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingLeft: 40,
  },
  grandTotalText: {
    fontSize: 16,
    fontFamily,
    fontWeight: "bold",
    color: "#000",
  },
  refundsTitle: {
    marginBottom: 4,
  },
  refundLabel: {
    flex: 1,
    marginRight: 8,
  },
  totalRefundedRow: {
    marginTop: 4,
  },
  detailsContainer: {
    marginTop: 8,
    paddingVertical: 8,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  footerContainer: {
    alignItems: "center",
    marginTop: 16,
    gap: 4,
  },
});
