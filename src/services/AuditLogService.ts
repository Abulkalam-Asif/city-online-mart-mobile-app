import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
  Timestamp,
  type FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { ACTION_META, AUDIT_RETENTION_DAYS, type AuditLogInput } from "../types/audit.types";
import { sanitizeForFirestore } from "../utils/firestoreUtils";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Builds and writes the customer's audit log entries (B-045, spec: docs/LOGGING_SPEC.md in the
 * root docs repo). The app only writes, it never reads the log (super-admins read it in the admin).
 *
 * `OrderService` calls `addToTransaction` so the entry commits together with the order change;
 * `write` is for events with no change to attach to (sign-in).
 *
 * Unlike the admin, the actor is passed with every entry instead of being kept in the service:
 * the order methods already know the customer (the order's own `customerId` / `customerName`),
 * and the rules refuse an entry whose actor is not the signed-in user.
 */
export class AuditLogService {
  static readonly COLLECTION = "AUDIT_LOGS";

  constructor(private db: FirebaseFirestoreTypes.Module) { }

  /** Turn what a service passes in into the document to store. */
  build(input: AuditLogInput): Record<string, unknown> {
    const meta = ACTION_META[input.action];
    const data = {
      action: input.action,
      module: meta.module,
      severity: meta.severity,
      actor: { uid: input.actor.uid, name: input.actor.name, role: input.actor.role },
      source: "mobile-app",
      target: input.target,
      refs: [...new Set(input.refs)],
      summary: input.summary,
      ...(input.changes && Object.keys(input.changes).length > 0 ? { changes: input.changes } : {}),
      ...(input.context && Object.keys(input.context).length > 0 ? { context: input.context } : {}),
      client: { appVersion: Constants.expoConfig?.version, platform: Platform.OS },
    };
    // Sanitize first (drops undefined), then add the timestamps: the serverTimestamp() sentinel
    // must not go through sanitizeForFirestore, which would copy it into a plain object.
    return {
      ...sanitizeForFirestore(data),
      createdAt: serverTimestamp(),
      expireAt: Timestamp.fromMillis(Date.now() + AUDIT_RETENTION_DAYS * DAY_MS),
    };
  }

  addToTransaction(transaction: FirebaseFirestoreTypes.Transaction, input: AuditLogInput): void {
    transaction.set(this.newDocRef(), this.build(input));
  }

  /** Write one entry on its own (sign-in). */
  async write(input: AuditLogInput): Promise<void> {
    await setDoc(this.newDocRef(), this.build(input));
  }

  private newDocRef() {
    return doc(collection(this.db, AuditLogService.COLLECTION));
  }
}
