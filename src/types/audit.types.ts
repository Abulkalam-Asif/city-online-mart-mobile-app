import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

/**
 * Audit log types (B-045). Mirror of `admin/src/types/audit.types.ts` (spec: docs/LOGGING_SPEC.md
 * in the root docs repo). Entries live in the AUDIT_LOGS collection of each city project.
 *
 * The app only writes the four customer actions below (the Firestore rules refuse any other
 * action from a customer), so `ACTION_META` lists just those; the admin file has the full list.
 * Keep the shared types and these four lines in sync with the admin file.
 */

/** How long an entry is kept before Firestore deletes it (TTL on `expireAt`). */
export const AUDIT_RETENTION_DAYS = 365;

export type AuditModule =
  | "orders"
  | "refunds"
  | "products"
  | "batches"
  | "categories"
  | "manufacturers"
  | "banners"
  | "discounts"
  | "payment_methods"
  | "delivery_slots"
  | "settings"
  | "customers"
  | "admin_users"
  | "auth"
  | "reports"
  | "notifications"
  | "system";

/** critical = money, payment details, admin accounts; warning = cancel, delete, deactivate */
export type AuditSeverity = "info" | "warning" | "critical";

export type AuditActorRole = "super-admin" | "admin" | "user" | "system";

export type AuditSource = "admin-web" | "mobile-app" | "cloud-function" | "script";

export type AuditTargetType =
  | "order"
  | "refund"
  | "product"
  | "batch"
  | "category"
  | "sub_category"
  | "manufacturer"
  | "banner"
  | "discount"
  | "payment_method"
  | "delivery_slot"
  | "settings"
  | "customer"
  | "admin_user"
  | "report"
  | "notification"
  | "system";

interface AuditActionMeta {
  module: AuditModule;
  severity: AuditSeverity;
  /** Readable name shown in the admin Activity Logs page. */
  label: string;
}

/** The actions a customer may write (module, severity and label as in the admin file). */
export const ACTION_META = {
  ORDER_CREATED: { module: "orders", severity: "info", label: "Order created" },
  ORDER_DETAILS_UPDATED: { module: "orders", severity: "info", label: "Order details updated by customer" },
  ORDER_CANCELLED: { module: "orders", severity: "warning", label: "Order cancelled" },
  CUSTOMER_SIGNED_IN: { module: "auth", severity: "info", label: "Customer signed in" },
} as const satisfies Record<string, AuditActionMeta>;

export type AuditAction = keyof typeof ACTION_META;

/** The record an entry is about, e.g. { type: "order", id: "75ZD0R8", label: "#75ZD0R8" }. */
export interface AuditTarget {
  type: AuditTargetType;
  id: string;
  label: string;
}

export interface AuditActor {
  /** Firebase Auth uid; must be the signed-in user's own (the rules check it). */
  uid: string;
  /** Display name or phone at the time of the action. */
  name: string;
  role: AuditActorRole;
}

/** A change to one field. Only fields whose value changed are listed. */
export interface AuditFieldChange {
  from: unknown;
  to: unknown;
}

export interface AuditClientInfo {
  appVersion?: string;
  platform?: string;
}

/** An entry as stored in AUDIT_LOGS/{id}. The app only writes entries, it never reads them back. */
export interface AuditLogEntry {
  action: AuditAction;
  module: AuditModule;
  severity: AuditSeverity;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  /** createdAt + AUDIT_RETENTION_DAYS; Firestore deletes the entry after this time (TTL field). */
  expireAt: FirebaseFirestoreTypes.Timestamp;
  actor: AuditActor;
  source: AuditSource;
  target: AuditTarget;
  /** "type:id" values to search by, e.g. "order:75ZD0R8", "customer:<uid>", "phone:03001234567". */
  refs: string[];
  /** One readable line, written when the entry is created. */
  summary: string;
  changes?: Record<string, AuditFieldChange>;
  context?: Record<string, unknown>;
  client?: AuditClientInfo;
}

/**
 * What a service passes in. The module, severity, source, client, createdAt and expireAt
 * are filled by AuditLogService, so callers cannot get them wrong.
 */
export interface AuditLogInput {
  action: AuditAction;
  actor: AuditActor;
  target: AuditTarget;
  refs: string[];
  summary: string;
  changes?: Record<string, AuditFieldChange>;
  context?: Record<string, unknown>;
}
