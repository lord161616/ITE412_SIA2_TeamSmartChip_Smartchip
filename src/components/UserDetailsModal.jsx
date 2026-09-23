import {
  useEffect,
  useState,
} from "react";


function formatTimestamp(timestamp) {

  if (!timestamp) {
    return "—";
  }


  try {

    const date =
      timestamp?.toDate
        ? timestamp.toDate()
        : new Date(timestamp);


    if (
      Number.isNaN(date.getTime())
    ) {

      return "—";

    }


    return date.toLocaleString();

  } catch {

    return "—";

  }

}


function getDisplayName(user) {

  return (
    user.nickname ||
    user.email ||
    "Unnamed User"
  );

}


export default function UserDetailsModal({
  user,
  isOpen,
  isSaving,
  onClose,
  onSave,
}) {

  const [nickname, setNickname] =
    useState("");


  const [phone, setPhone] =
    useState("");


  const [formError, setFormError] =
    useState("");


  /*
   * ============================================
   * LOAD USER INTO FORM
   * ============================================
   */

  useEffect(() => {

    if (!user || !isOpen) {
      return;
    }


    setNickname(
      user.nickname || ""
    );


    setPhone(
      user.phone || ""
    );


    setFormError("");

  }, [
    user,
    isOpen,
  ]);


  if (!isOpen || !user) {
    return null;
  }


  /*
   * ============================================
   * SAVE
   * ============================================
   */

  async function handleSubmit(event) {

    event.preventDefault();

    setFormError("");


    const trimmedNickname =
      nickname.trim();


    const trimmedPhone =
      phone.trim();


    /*
     * Client-side validation.
     *
     * The service and Firestore Rules provide
     * additional protection.
     */

    if (
      trimmedNickname.length > 100
    ) {

      setFormError(
        "Name cannot exceed 100 characters."
      );

      return;

    }


    if (
      trimmedPhone.length > 30
    ) {

      setFormError(
        "Phone number cannot exceed 30 characters."
      );

      return;

    }


    try {

      await onSave({
        nickname: trimmedNickname,
        phone: trimmedPhone,
      });

    } catch (error) {

      console.error(
        "User profile save failed:",
        error
      );


      setFormError(
        error?.message ||
        "Failed to save user profile."
      );

    }

  }


  return (

    <div
      className="user-modal-overlay"
      role="presentation"
      onMouseDown={(event) => {

        if (
          event.target === event.currentTarget &&
          !isSaving
        ) {

          onClose();

        }

      }}
    >

      <div
        className="user-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-details-title"
      >

        {/* =====================================
            HEADER
            ===================================== */}

        <div className="user-modal-header">

          <div>

            <h2 id="user-details-title">
              User Details
            </h2>

            <p>
              {getDisplayName(user)}
            </p>

          </div>


          <button
            type="button"
            className="user-modal-close"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close user details"
          >
            ×
          </button>

        </div>


        {/* =====================================
            FORM
            ===================================== */}

        <form
          onSubmit={handleSubmit}
          className="user-modal-form"
        >

          {formError && (

            <div
              className="user-modal-error"
              role="alert"
            >
              {formError}
            </div>

          )}


          {/* NAME */}

          <div className="user-form-group">

            <label htmlFor="user-nickname">
              Name
            </label>

            <input
              id="user-nickname"
              type="text"
              value={nickname}
              onChange={(event) =>
                setNickname(event.target.value)
              }
              maxLength={100}
              disabled={isSaving}
              autoComplete="name"
            />

          </div>


          {/* PHONE */}

          <div className="user-form-group">

            <label htmlFor="user-phone">
              Phone
            </label>

            <input
              id="user-phone"
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              maxLength={30}
              disabled={isSaving}
              autoComplete="tel"
            />

          </div>


          {/* EMAIL */}

          <div className="user-form-group">

            <label htmlFor="user-email">
              Email
            </label>

            <input
              id="user-email"
              type="email"
              value={user.email || ""}
              disabled
              readOnly
            />

            <small>
              Login email is managed by Firebase
              Authentication.
            </small>

          </div>


          {/* UID */}

          <div className="user-form-group">

            <label htmlFor="user-id">
              User ID
            </label>

            <input
              id="user-id"
              type="text"
              value={user.id || ""}
              disabled
              readOnly
            />

          </div>


          {/* ACCOUNT INFORMATION */}

          <div className="user-details-grid">

            <div className="user-detail-item">

              <span>
                Role
              </span>

              <strong>
                {user.role || "—"}
              </strong>

            </div>


            <div className="user-detail-item">

              <span>
                Account Type
              </span>

              <strong>
                {user.accountType || "—"}
              </strong>

            </div>


            <div className="user-detail-item">

              <span>
                Status
              </span>

              <strong>
                {user.status || "—"}
              </strong>

            </div>


            <div className="user-detail-item">

              <span>
                Last Login
              </span>

              <strong>
                {formatTimestamp(
                  user.lastLoginAt
                )}
              </strong>

            </div>


            <div className="user-detail-item">

              <span>
                Created
              </span>

              <strong>
                {formatTimestamp(
                  user.createdAt
                )}
              </strong>

            </div>


            <div className="user-detail-item">

              <span>
                Updated
              </span>

              <strong>
                {formatTimestamp(
                  user.updatedAt
                )}
              </strong>

            </div>

          </div>


          {/* ACTIONS */}

          <div className="user-modal-actions">

            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={isSaving}
            >

              {isSaving
                ? "Saving..."
                : "Save Changes"}

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}