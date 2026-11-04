import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { httpsCallable, type Functions } from "@react-native-firebase/functions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Referral } from "../types/referral.types";
import { convertTimestamp } from "../utils/firestoreUtils";
import { logger } from "../utils/logger";

const REFERRALS_COLLECTION = "REFERRALS";

/** Codes are 6 characters from an alphabet without 0/O/1/I; accept 4-12 letters/digits when typed. */
export const normalizeReferralCode = (code: string) => code.trim().toUpperCase();
export const isValidReferralCode = (code: string) => /^[A-Z0-9]{4,12}$/.test(code);

export type PendingReferralResult = "none" | "applied" | "rejected" | "retry";

/**
 * Referral codes (B-063). The code of a customer and the link between inviter and invitee are handled by
 * Cloud Functions (`getMyReferralCode`, `applyReferralCode`): a phone cannot look up another customer's
 * code or write a referral record. A code typed before sign-in is kept on the phone until the first
 * sign-in, then applied (a customer who is not new is refused and the code is dropped).
 */
export class ReferralService {
  constructor(
    private db: FirebaseFirestoreTypes.Module,
    private functions: Functions
  ) { }

  // Scoped to the city (each city has its own accounts and codes), like the auth and cart keys
  private get pendingKey(): string {
    return `@pending_referral_code_${this.db.app.name}`;
  }

  /** The customer's permanent referral code (created on the first call). */
  async getMyReferralCode(): Promise<string> {
    const call = httpsCallable(this.functions, "getMyReferralCode");
    const result = await call({});
    return (result.data as { code: string }).code;
  }

  async applyReferralCode(code: string): Promise<void> {
    const call = httpsCallable(this.functions, "applyReferralCode");
    await call({ code: normalizeReferralCode(code) });
  }

  /** The customers this customer invited, newest first. */
  async getMyInvitedFriends(inviterId: string): Promise<Referral[]> {
    const snap = await getDocs(query(collection(this.db, REFERRALS_COLLECTION), where("inviterId", "==", inviterId)));
    return snap.docs
      .map((d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => this.toReferral(d.id, d.data()))
      .sort((a: Referral, b: Referral) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /** The referral that brought this customer in, if any. */
  async getMyInviter(inviteeId: string): Promise<Referral | null> {
    const snap = await getDoc(doc(this.db, REFERRALS_COLLECTION, inviteeId));
    return snap.exists() ? this.toReferral(snap.id, snap.data()!) : null;
  }

  private toReferral(id: string, data: FirebaseFirestoreTypes.DocumentData): Referral {
    return {
      id,
      inviteeId: data.inviteeId,
      inviterId: data.inviterId,
      inviterName: data.inviterName,
      inviteePhone: data.inviteePhone || undefined,
      code: data.code,
      status: data.status,
      createdAt: convertTimestamp(data.createdAt),
      successfulAt: data.successfulAt ? convertTimestamp(data.successfulAt) : undefined,
      rewardCouponCode: data.rewardCouponCode || undefined,
    };
  }

  // ----- A code typed on the login screen, kept until the first sign-in -----

  async setPendingCode(code: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.pendingKey, normalizeReferralCode(code));
    } catch (error) {
      logger.warn("setPendingCode", error);
    }
  }

  async clearPendingCode(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.pendingKey);
    } catch (error) {
      logger.warn("clearPendingCode", error);
    }
  }

  /**
   * Call after a successful sign-in. "retry": a network or server problem, the code is kept for the next
   * try. "rejected": the server refused it for good (unknown code, not a new customer, ...), so it is dropped.
   */
  async applyPendingCode(): Promise<PendingReferralResult> {
    let code: string | null = null;
    try {
      code = await AsyncStorage.getItem(this.pendingKey);
    } catch {
      return "none";
    }
    if (!code) return "none";

    try {
      await this.applyReferralCode(code);
      await this.clearPendingCode();
      return "applied";
    } catch (error: any) {
      const refusedForGood = ["functions/not-found", "functions/failed-precondition", "functions/already-exists", "functions/invalid-argument", "functions/permission-denied"].includes(error?.code);
      if (refusedForGood) {
        logger.info(`applyPendingCode: code refused (${error?.code})`);
        await this.clearPendingCode();
        return "rejected";
      }
      logger.warn("applyPendingCode", error);
      return "retry";
    }
  }
}
