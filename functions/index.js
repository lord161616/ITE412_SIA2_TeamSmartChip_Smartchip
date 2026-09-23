/* global require, exports */

const {
  setGlobalOptions,
} = require("firebase-functions");

const {
  onCall,
  HttpsError,
} = require("firebase-functions/v2/https");

const {
  initializeApp,
} = require("firebase-admin/app");

const {
  getAuth,
} = require("firebase-admin/auth");

const {
  getFirestore,
  FieldValue,
} = require("firebase-admin/firestore");


/*
 * ============================================================
 * FIREBASE ADMIN INITIALIZATION
 * ============================================================
 *
 * The Admin SDK exists only inside Cloud Functions.
 *
 * It must NEVER be imported into the React/Vite application.
 */

initializeApp();


/*
 * ============================================================
 * GLOBAL CLOUD FUNCTION OPTIONS
 * ============================================================
 */

setGlobalOptions({
  region: "asia-southeast1",
  maxInstances: 10,
});


/*
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

const STAFF_ROLES = [
  "viewer",
  "operator",
  "administrator",
];


/*
 * ============================================================
 * INPUT VALIDATION
 * ============================================================
 */


/**
 * Validate staff nickname.
 *
 * @param {unknown} nickname Staff nickname.
 * @return {string} Sanitized nickname.
 */
function validateNickname(nickname) {

  if (
    typeof nickname !== "string"
  ) {

    throw new HttpsError(
      "invalid-argument",
      "Nickname is required."
    );

  }


  const value =
    nickname.trim();


  if (!value) {

    throw new HttpsError(
      "invalid-argument",
      "Nickname is required."
    );

  }


  if (
    value.length > 100
  ) {

    throw new HttpsError(
      "invalid-argument",
      "Nickname cannot exceed 100 characters."
    );

  }


  return value;

}


/**
 * Validate email address.
 *
 * @param {unknown} email Email address.
 * @return {string} Normalized email address.
 */
function validateEmail(email) {

  if (
    typeof email !== "string"
  ) {

    throw new HttpsError(
      "invalid-argument",
      "A valid email address is required."
    );

  }


  const value =
    email.trim().toLowerCase();


  if (!value) {

    throw new HttpsError(
      "invalid-argument",
      "A valid email address is required."
    );

  }


  if (
    value.length > 254
  ) {

    throw new HttpsError(
      "invalid-argument",
      "Email address is too long."
    );

  }


  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value
    )
  ) {

    throw new HttpsError(
      "invalid-argument",
      "Please provide a valid email address."
    );

  }


  return value;

}


/**
 * Validate optional phone number.
 *
 * @param {unknown} phone Phone number.
 * @return {string} Sanitized phone number.
 */
function validatePhone(phone) {

  if (
    phone === undefined ||
    phone === null ||
    phone === ""
  ) {

    return "";

  }


  if (
    typeof phone !== "string"
  ) {

    throw new HttpsError(
      "invalid-argument",
      "Phone number must be text."
    );

  }


  const value =
    phone.trim();


  if (
    value.length > 30
  ) {

    throw new HttpsError(
      "invalid-argument",
      "Phone number cannot exceed 30 characters."
    );

  }


  return value;

}


/**
 * Validate staff role.
 *
 * @param {unknown} role Staff role.
 * @return {string} Validated staff role.
 */
function validateRole(role) {

  if (
    typeof role !== "string" ||
    !STAFF_ROLES.includes(role)
  ) {

    throw new HttpsError(
      "invalid-argument",
      "Invalid staff role."
    );

  }


  return role;

}


/*
 * ============================================================
 * CREATE STAFF ACCOUNT
 * ============================================================
 *
 * Secure flow:
 *
 * Administrator
 *      ↓
 * React
 *      ↓
 * Callable Cloud Function
 *      ↓
 * Verify administrator
 *      ↓
 * Validate request
 *      ↓
 * Firebase Authentication
 *      ↓
 * Firestore profile
 */


/**
 * Create a SmartChip staff account.
 */
exports.createStaffAccount = onCall(
  async (request) => {

    /*
     * ========================================================
     * 1. REQUIRE AUTHENTICATION
     * ========================================================
     */

    if (!request.auth) {

      throw new HttpsError(
        "unauthenticated",
        "Authentication is required."
      );

    }


    const administratorUid =
      request.auth.uid;


    /*
     * ========================================================
     * 2. INITIALIZE FIRESTORE
     * ========================================================
     */

    const db =
      getFirestore();


    /*
     * ========================================================
     * 3. LOAD CALLER PROFILE
     * ========================================================
     */

    const administratorRef =
      db
        .collection("users")
        .doc(administratorUid);


    const administratorSnapshot =
      await administratorRef.get();


    if (
      !administratorSnapshot.exists
    ) {

      throw new HttpsError(
        "permission-denied",
        "Administrator profile was not found."
      );

    }


    const administrator =
      administratorSnapshot.data();


    /*
     * ========================================================
     * 4. VERIFY ADMINISTRATOR
     * ========================================================
     *
     * The role is read from Firestore.
     *
     * Do not trust a role supplied by React.
     */

    if (
      administrator.role !==
      "administrator"
    ) {

      throw new HttpsError(
        "permission-denied",
        "Only administrators can create staff accounts."
      );

    }


    /*
     * ========================================================
     * 5. VERIFY ACTIVE STATUS
     * ========================================================
     */

    if (
      administrator.status !==
      "active"
    ) {

      throw new HttpsError(
        "permission-denied",
        "Your administrator account is not active."
      );

    }


    /*
     * ========================================================
     * 6. VALIDATE REQUEST
     * ========================================================
     */

    const data =
      request.data;


    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data)
    ) {

      throw new HttpsError(
        "invalid-argument",
        "Invalid staff account data."
      );

    }


    /*
     * Only these fields are accepted.
     */

    const allowedFields = [
      "nickname",
      "email",
      "phone",
      "role",
    ];


    const receivedFields =
      Object.keys(data);


    const hasUnexpectedField =
      receivedFields.some(
        (field) =>
          !allowedFields.includes(field)
      );


    if (
      hasUnexpectedField
    ) {

      throw new HttpsError(
        "invalid-argument",
        "Staff account contains unsupported fields."
      );

    }


    /*
     * ========================================================
     * 7. VALIDATE INPUT
     * ========================================================
     */

    const nickname =
      validateNickname(
        data.nickname
      );


    const email =
      validateEmail(
        data.email
      );


    const phone =
      validatePhone(
        data.phone
      );


    const role =
      validateRole(
        data.role
      );


    /*
     * ========================================================
     * 8. CREATE AUTHENTICATION USER
     * ========================================================
     *
     * No password is accepted from the browser.
     *
     * The staff account will receive its credentials through
     * the account activation/password setup process that we
     * implement next.
     */

    let userRecord;


    try {

      userRecord =
        await getAuth()
          .createUser({

            email,

            displayName:
              nickname,

            disabled: false,

            emailVerified: false,

          });

    } catch (error) {

      console.error(
        "Failed to create Firebase Authentication user:",
        error
      );


      if (
        error.code ===
        "auth/email-already-exists"
      ) {

        throw new HttpsError(
          "already-exists",
          "An account with this email address already exists."
        );

      }


      if (
        error.code ===
        "auth/invalid-email"
      ) {

        throw new HttpsError(
          "invalid-argument",
          "The email address is invalid."
        );

      }


      throw new HttpsError(
        "internal",
        "Unable to create the staff authentication account."
      );

    }


    const newUid =
      userRecord.uid;


    /*
     * ========================================================
     * 9. CREATE FIRESTORE PROFILE
     * ========================================================
     */

    try {

      await db
        .collection("users")
        .doc(newUid)
        .set({

          nickname,

          email,

          phone,

          role,

          accountType:
            "staff",

          status:
            "active",

          createdAt:
            FieldValue.serverTimestamp(),

          updatedAt:
            FieldValue.serverTimestamp(),

        });

    } catch (error) {

      console.error(
        "Failed to create staff Firestore profile:",
        error
      );


      /*
       * Authentication and Firestore are separate systems.
       *
       * If Firestore creation fails after Authentication
       * succeeds, remove the newly-created Auth account.
       */

      try {

        await getAuth()
          .deleteUser(newUid);

      } catch (rollbackError) {

        console.error(
          "CRITICAL: Failed to roll back Auth user:",
          rollbackError
        );

      }


      throw new HttpsError(
        "internal",
        "Unable to create the staff profile."
      );

    }


    /*
     * ========================================================
     * 10. RETURN RESULT
     * ========================================================
     */

    return {

      success: true,

      uid:
        newUid,

      email,

      role,

      accountType:
        "staff",

      status:
        "active",

    };

  }
);