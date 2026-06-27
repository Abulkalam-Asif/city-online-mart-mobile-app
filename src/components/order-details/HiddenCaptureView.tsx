import { StyleSheet, Text, View, Platform } from "react-native";
import React from "react";
import ViewShot from "react-native-view-shot";
import { DisplayItem } from "@/src/components/common/OrderItemsList";

type HiddenCaptureViewProps = {
  viewShotRef: React.RefObject<ViewShot | null>;
  orderId: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  appliedOrderDiscount?: { percentage: number; amount: number };
  appliedOnlinePaymentDiscount?: { percentage: number; amount: number };
  getStatusText: () => string;
  deliveryAddress: string;
  paymentMethodLabel: string;
  paymentStatusLabel: string;
  displayItems: DisplayItem[];
  customerPhone?: string;
};

const DottedLine = () => (
  <View style={styles.dottedLine} />
);

const HiddenCaptureView = ({
  viewShotRef,
  orderId,
  subtotal,
  deliveryFee,
  totalAmount,
  appliedOrderDiscount,
  appliedOnlinePaymentDiscount,
  getStatusText,
  deliveryAddress,
  paymentMethodLabel,
  paymentStatusLabel,
  displayItems,
  customerPhone,
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
                <Text style={styles.posText}>Delivery Fee:</Text>
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

            {/* Extra Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailsRow}>
                <Text style={styles.posText}>Order Status:</Text>
                <Text style={styles.posText}>{getStatusText()}</Text>
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
                <Text style={styles.posText}>Delivery:</Text>
                <Text style={[styles.posText, { flex: 1, textAlign: 'right', marginLeft: 16 }]}>{deliveryAddress || "N/A"}</Text>
              </View>
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
