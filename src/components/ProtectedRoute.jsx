import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";


export default function ProtectedRoute({
  children,
  allowedRoles = [],
}) {

  const {
    user,
    role,
    status,
    loading,
    profileError,
  } = useAuth();


  const location =
    useLocation();


  /*
   * ============================================
   * AUTH LOADING
   * ============================================
   */

  if (loading) {

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        Loading SmartChip...
      </div>
    );

  }


  /*
   * ============================================
   * NOT AUTHENTICATED
   * ============================================
   */

  if (!user) {

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );

  }


  /*
   * ============================================
   * PROFILE FAILED
   * ============================================
   */

  if (
    profileError ||
    !role
  ) {

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
        }}
      >

        <div>

          <h2>
            Unable to load your SmartChip account
          </h2>

          <p>
            {profileError ||
              "Your account profile is unavailable."}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >
            Retry
          </button>

        </div>

      </div>
    );

  }


  /*
   * ============================================
   * ACCOUNT STATUS
   * ============================================
   *
   * Inactive accounts must not access
   * protected SmartChip functionality.
   */

  if (
    status === "inactive"
  ) {

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
        }}
      >

        <div>

          <h2>
            Account Inactive
          </h2>

          <p>
            Your SmartChip account has been
            deactivated. Please contact an
            administrator.
          </p>

        </div>

      </div>
    );

  }


  /*
   * Pending accounts are also denied
   * protected application access.
   */

  if (
    status === "pending"
  ) {

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
        }}
      >

        <div>

          <h2>
            Account Pending
          </h2>

          <p>
            Your SmartChip account is waiting
            for activation.
          </p>

        </div>

      </div>
    );

  }


  /*
   * ============================================
   * NO ROLE RESTRICTION
   * ============================================
   *
   * Any authenticated active account may
   * access the route.
   */

  if (
    allowedRoles.length === 0
  ) {

    return children;

  }


  /*
   * ============================================
   * ROLE AUTHORIZATION
   * ============================================
   */

  if (
    !allowedRoles.includes(role)
  ) {

    /*
     * Customers return to the shop.
     */

    if (
      role === "customer"
    ) {

      return (
        <Navigate
          to="/shop"
          replace
        />
      );

    }


    /*
     * Staff users return to dashboard.
     */

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );

  }


  /*
   * ============================================
   * AUTHORIZED
   * ============================================
   */

  return children;

}