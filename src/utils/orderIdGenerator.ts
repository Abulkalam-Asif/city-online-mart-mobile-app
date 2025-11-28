/**
 * Generate order ID in the format: YYMMDD-XXX
 * - YYMMDD: Date part (last 2 digits of year + month + day)
 * - XXX: 3-character random alphanumeric string (uppercase)
 *
 * @returns Order ID string like "241128-A3F"
 */
export function generateOrderId(): string {
  const now = new Date();

  // Extract date components
  const year = String(now.getFullYear()).slice(-2); // Last 2 digits of year
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Month (01-12)
  const day = String(now.getDate()).padStart(2, '0'); // Day (01-31)

  // Create date part
  const datePart = `${year}${month}${day}`;

  // Generate random 3-character suffix
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 3; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Combine parts
  return `${datePart}-${randomPart}`;
}