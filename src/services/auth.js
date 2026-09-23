
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase";


/*
 * ============================================================
 * PUBLIC REGISTRATION
 * ============================================================
 *
 * Public registration is CUSTOMER registration only.
 *
 * The caller cannot provide:
 *
 *   role
 *   accountType
 *   status
 *
 * Those values are controlled here.
 *
 * This is important because a user must never be able to
 * register themselves as:
 *
 *   viewer
 *   operator
 *   administrator
 *
 * Staff account creation will eventually be handled by a
 * trusted backend using the Firebase Admin SDK.
 */

const CUSTOMER_ROLE =
  "customer";

const CUSTOMER_ACCOUNT_TYPE =
  "customer";

const ACTIVE_STATUS =
  "active";


/**
 * Register a new SmartChip customer.
 *
 * @param {string} email
 * @param {string} password
 * @param {object} profile
 * @param {string} profile.nickname
 * @param {string} profile.phone
 *
 * @returns {{
 *   user: import("firebase/auth").User,
 *   profile: object
 * }}
 */
export async function registerUser(
  email,
  password,
  profile = {}
) {

  /*
   * ==========================================================
   * NORMALIZE INPUT
   * ==========================================================
   */

  const normalizedEmail =
    String(email ?? "")
      .trim()
      .toLowerCase();


  const nickname =
    String(profile.nickname ?? "")
      .trim();


  const phone =
    String(profile.phone ?? "")
      .trim();


  /*
   * ==========================================================
   * BASIC VALIDATION
   * ==========================================================
   */

  if (!normalizedEmail) {

    throw new Error(
      "Email is required."
    );

  }


  if (!password) {

    throw new Error(
      "Password is required."
    );

  }


  if (!nickname) {

    throw new Error(
      "Nickname is required."
    );

  }


  /*
   * ==========================================================
   * CREATE FIREBASE AUTH USER
   * ==========================================================
   */

  const credential =
    await createUserWithEmailAndPassword(
      auth,
      normalizedEmail,
      password
    );


  const firebaseUser =
    credential.user;


  /*
   * ==========================================================
   * CREATE CUSTOMER PROFILE
   * ==========================================================
   *
   * IMPORTANT:
   *
   * role/accountType/status are intentionally NOT taken
   * from the function caller.
   *
   * Every public registration is a customer.
   */

  const userProfile = {

    uid:
      firebaseUser.uid,

    email:
      firebaseUser.email ??
      normalizedEmail,

    nickname,

    phone,

    role:
      CUSTOMER_ROLE,

    accountType:
      CUSTOMER_ACCOUNT_TYPE,

    status:
      ACTIVE_STATUS,

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp(),

  };


  /*
   * ==========================================================
   * CREATE FIRESTORE PROFILE
   * ==========================================================
   */

  try {

    await setDoc(
      doc(
        db,
        "users",
        firebaseUser.uid
      ),
      userProfile
    );

  } catch (error) {

    /*
     * ========================================================
     * PARTIAL REGISTRATION HANDLING
     * ========================================================
     *
     * Firebase Authentication has already succeeded.
     *
     * We sign the user out so AuthContext does not treat the
     * user as an authenticated SmartChip application user
     * without a corresponding Firestore profile.
     *
     * IMPORTANT:
     *
     * signOut() does NOT delete the Firebase Auth account.
     *
     * The account may therefore remain in Firebase
     * Authentication if Firestore creation fails.
     *
     * A trusted backend can later provide proper compensating
     * cleanup if required.
     */

    try {

      await signOut(auth);

    } catch (signOutError) {

      console.error(
        "Failed to sign out after profile creation failure:",
        signOutError
      );

    }


    console.error(
      "Customer profile creation failed:",
      error
    );


    throw error;

  }


  /*
   * ==========================================================
   * SUCCESS
   * ==========================================================
   */

  return {

    user:
      firebaseUser,

    profile:
      userProfile,

  };

}


/**
 * Authenticate an existing SmartChip user.
 *
 * Firebase Authentication verifies the email/password.
 *
 * AuthContext is responsible for loading the corresponding
 * Firestore profile and determining:
 *
 *   role
 *   accountType
 *   status
 */
export async function loginUser(
  email,
  password
) {

  const normalizedEmail =
    String(email ?? "")
      .trim()
      .toLowerCase();


  if (!normalizedEmail) {

    throw new Error(
      "Email is required."
    );

  }


  if (!password) {

    throw new Error(
      "Password is required."
    );

  }


  const credential =
    await signInWithEmailAndPassword(
      auth,
      normalizedEmail,
      password
    );


  return credential.user;

}


/**
 * Sign out the current SmartChip user.
 */
export async function logoutUser() {

  await signOut(auth);

}

