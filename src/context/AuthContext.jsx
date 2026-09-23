import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { onAuthStateChanged } from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";


const AuthContext = createContext(null);


const STAFF_ROLES = [
  "viewer",
  "operator",
  "administrator",
];


export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);


  useEffect(() => {

    let cancelled = false;


    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {

        if (cancelled) {
          return;
        }


        setUser(firebaseUser);
        setProfile(null);
        setProfileError(null);


        if (!firebaseUser) {

          setLoading(false);

          return;
        }


        setLoading(true);


        try {

          const profileRef = doc(
            db,
            "users",
            firebaseUser.uid
          );


          const profileSnap =
            await getDoc(profileRef);


          if (cancelled) {
            return;
          }


          if (!profileSnap.exists()) {

            /*
             * Authentication succeeded, but there is
             * no corresponding SmartChip profile.
             *
             * Never grant role-based access in this case.
             */

            setProfile(null);

            setProfileError(
              "Your account exists, but your SmartChip profile could not be found. Please contact an administrator."
            );

          } else {

            const profileData = {
              id: profileSnap.id,
              ...profileSnap.data(),
            };


            setProfile(profileData);

          }

        } catch (error) {

          console.error(
            "Failed to load user profile:",
            error
          );


          if (!cancelled) {

            setProfile(null);

            setProfileError(
              getFirestoreErrorMessage(error)
            );

          }

        } finally {

          if (!cancelled) {
            setLoading(false);
          }

        }

      }
    );


    return () => {

      cancelled = true;

      unsubscribe();

    };

  }, []);


  /*
   * ============================================
   * DERIVED ACCOUNT INFORMATION
   * ============================================
   */

  const role =
    profile?.role ?? null;


  const accountType =
    profile?.accountType ??
    (
      STAFF_ROLES.includes(role)
        ? "staff"
        : role === "customer"
          ? "customer"
          : null
    );


  const status =
    profile?.status ?? null;


  /*
   * ============================================
   * ROLE FLAGS
   * ============================================
   */

  const isCustomer =
    role === "customer" ||
    accountType === "customer";


  const isViewer =
    role === "viewer";


  const isOperator =
    role === "operator";


  const isAdministrator =
    role === "administrator";


  const isStaff =
    STAFF_ROLES.includes(role) ||
    accountType === "staff";


  /*
   * ============================================
   * ACCOUNT STATUS
   * ============================================
   */

  const isActive =
    status === "active";


  const isInactive =
    status === "inactive";


  const isPending =
    status === "pending";


  /*
   * ============================================
   * CONTEXT
   * ============================================
   */

  return (
    <AuthContext.Provider
      value={{

        user,
        profile,

        role,
        accountType,
        status,

        isCustomer,
        isStaff,

        isViewer,
        isOperator,
        isAdministrator,

        isActive,
        isInactive,
        isPending,

        profileError,

        loading,

      }}
    >
      {children}
    </AuthContext.Provider>
  );

}


function getFirestoreErrorMessage(error) {

  if (!error) {

    return (
      "Unable to load your account profile."
    );

  }


  if (
    error.code === "permission-denied"
  ) {

    return (
      "Your account is authenticated, but Firestore denied access to your profile."
    );

  }


  if (
    error.code === "unavailable"
  ) {

    return (
      "SmartChip could not connect to Firestore. Check your internet connection and Firebase configuration."
    );

  }


  if (
    error.message
      ?.toLowerCase()
      .includes("offline")
  ) {

    return (
      "SmartChip cannot currently connect to Firestore. Check your internet connection and Firebase configuration."
    );

  }


  return (
    error.message ||
    "Unable to load your account profile."
  );

}


export function useAuth() {

  const context =
    useContext(AuthContext);


  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider"
    );

  }


  return context;

}