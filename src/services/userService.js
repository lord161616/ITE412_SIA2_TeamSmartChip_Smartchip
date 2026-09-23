import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  db,
} from "../firebase";


/*
 * ============================================
 * CONSTANTS
 * ============================================
 */

export const USER_ROLES = [
  "customer",
  "viewer",
  "operator",
  "administrator",
];


export const STAFF_ROLES = [
  "viewer",
  "operator",
  "administrator",
];


export const USER_STATUSES = [
  "active",
  "inactive",
  "pending",
];


/*
 * ============================================
 * GET USERS
 * ============================================
 *
 * Returns a realtime unsubscribe function.
 *
 * Firestore Security Rules remain the actual
 * authorization boundary.
 */

export function subscribeToUsers(
  callback,
  onError
) {

  const usersQuery = query(
    collection(db, "users"),
    orderBy("createdAt", "desc")
  );


  return onSnapshot(
    usersQuery,
    (snapshot) => {

      const users =
        snapshot.docs.map((userDoc) => ({
          id: userDoc.id,
          ...userDoc.data(),
        }));


      callback(users);

    },
    (error) => {

      console.error(
        "Failed to subscribe to users:",
        error
      );


      if (onError) {
        onError(error);
      }

    }
  );

}


/*
 * ============================================
 * GET SINGLE USER REFERENCE
 * ============================================
 */

export async function getUserReference(
  uid
) {

  if (!uid) {

    throw new Error(
      "A user UID is required."
    );

  }


  return doc(
    db,
    "users",
    uid
  );

}


/*
 * ============================================
 * UPDATE USER PROFILE
 * ============================================
 *
 * Only editable profile fields are accepted:
 *
 *   nickname
 *   phone
 *
 * Authorization fields are intentionally NOT
 * accepted here:
 *
 *   role
 *   accountType
 *   status
 *
 * The Firestore Security Rules remain the final
 * security boundary.
 */

export async function updateUserProfile(
  uid,
  profileData
) {

  if (!uid) {

    throw new Error(
      "A user UID is required."
    );

  }


  if (
    !profileData ||
    typeof profileData !== "object"
  ) {

    throw new Error(
      "Invalid profile data."
    );

  }


  /*
   * Explicit allow-list.
   *
   * Never spread profileData directly into
   * updateDoc().
   */

  const nickname =
    typeof profileData.nickname === "string"
      ? profileData.nickname.trim()
      : "";


  const phone =
    typeof profileData.phone === "string"
      ? profileData.phone.trim()
      : "";


  /*
   * Application-level validation.
   *
   * Firestore Rules independently enforce
   * authorization and document integrity.
   */

  if (
    nickname.length > 100
  ) {

    throw new Error(
      "Name cannot exceed 100 characters."
    );

  }


  if (
    phone.length > 30
  ) {

    throw new Error(
      "Phone number cannot exceed 30 characters."
    );

  }


  await updateDoc(
    doc(db, "users", uid),
    {
      nickname,
      phone,
      updatedAt: serverTimestamp(),
    }
  );

}


/*
 * ============================================
 * UPDATE USER ROLE
 * ============================================
 *
 * Administrators can change another user's role.
 *
 * The Firestore Security Rules enforce the actual
 * authorization and self-protection.
 */

export async function updateUserRole(
  uid,
  nextRole
) {

  if (!uid) {

    throw new Error(
      "A user UID is required."
    );

  }


  if (
    !USER_ROLES.includes(nextRole)
  ) {

    throw new Error(
      "Invalid user role."
    );

  }


  /*
   * Customer profiles must use customer
   * account type.
   *
   * Staff roles must use staff account type.
   */

  const nextAccountType =
    nextRole === "customer"
      ? "customer"
      : "staff";


  await updateDoc(
    doc(db, "users", uid),
    {
      role: nextRole,
      accountType: nextAccountType,
      updatedAt: serverTimestamp(),
    }
  );

}


/*
 * ============================================
 * UPDATE USER STATUS
 * ============================================
 *
 * Administrators can activate/deactivate another
 * user's account.
 *
 * Firestore Security Rules enforce administrator
 * authorization and self-protection.
 */

export async function updateUserStatus(
  uid,
  nextStatus
) {

  if (!uid) {

    throw new Error(
      "A user UID is required."
    );

  }


  if (
    !USER_STATUSES.includes(nextStatus)
  ) {

    throw new Error(
      "Invalid account status."
    );

  }


  await updateDoc(
    doc(db, "users", uid),
    {
      status: nextStatus,
      updatedAt: serverTimestamp(),
    }
  );

}