import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "../styles/Users.css";

import {
  useAuth,
} from "../context/AuthContext";

import {
  subscribeToUsers,
  updateUserProfile,
  updateUserRole,
  updateUserStatus,
} from "../services/userService";

import UserDetailsModal from "../components/UserDetailsModal";


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


function normalizeUser(user) {

  return {

    id: user.id,

    /*
     * Keep the original Firestore fields available.
     * This is important for the details modal.
     */

    nickname:
      user.nickname ||
      "",

    name:
      user.nickname ||
      user.email ||
      "—",

    email:
      user.email ||
      "—",

    phone:
      user.phone ||
      "",

    role:
      user.role ||
      "customer",

    accountType:
      user.accountType ||
      "customer",

    status:
      user.status ||
      "active",

    lastLoginAt:
      user.lastLoginAt ||
      null,

    createdAt:
      user.createdAt ||
      null,

    updatedAt:
      user.updatedAt ||
      null,

    lastLogin:
      user.lastLoginAt
        ? formatTimestamp(user.lastLoginAt)
        : "—",

    created:
      user.createdAt
        ? formatTimestamp(user.createdAt)
        : "—",

  };

}


export default function Users() {

  const {
    user,
    isAdministrator,
    loading: authLoading,
  } = useAuth();


  const [users, setUsers] =
    useState([]);


  const [loading, setLoading] =
    useState(true);


  const [errMsg, setErrMsg] =
    useState("");


  const [searchTerm, setSearchTerm] =
    useState("");


  const [activeTab, setActiveTab] =
    useState("total");


  const [updatingUserId, setUpdatingUserId] =
    useState(null);


  /*
   * ============================================
   * USER DETAILS MODAL
   * ============================================
   */

  const [selectedUserId, setSelectedUserId] =
    useState(null);


  const [savingProfile, setSavingProfile] =
    useState(false);


  /*
   * ============================================
   * LOAD USERS
   * ============================================
   */

  useEffect(() => {

    if (authLoading) {
      return;
    }


    if (!user?.uid) {

      setUsers([]);
      setLoading(false);

      return;

    }


    if (!isAdministrator) {

      setUsers([]);
      setLoading(false);

      setErrMsg(
        "Only administrators can manage users."
      );

      return;

    }


    setLoading(true);
    setErrMsg("");


    const unsubscribe =
      subscribeToUsers(
        (userList) => {

          setUsers(userList);

          setLoading(false);

        },

        (error) => {

          console.error(
            "User management error:",
            error
          );


          setLoading(false);


          if (
            error.code ===
            "permission-denied"
          ) {

            setErrMsg(
              "Firestore denied access to the user list. Verify that this account has the administrator role."
            );

          } else {

            setErrMsg(
              error.message ||
              "Failed to load users."
            );

          }

        }
      );


    return () => {

      if (unsubscribe) {
        unsubscribe();
      }

    };

  }, [
    user?.uid,
    isAdministrator,
    authLoading,
  ]);


  /*
   * ============================================
   * NORMALIZE
   * ============================================
   */

  const normalizedUsers =
    useMemo(
      () => users.map(normalizeUser),
      [users]
    );


  /*
   * ============================================
   * SELECTED USER
   * ============================================
   */

  const selectedUser =
    useMemo(
      () =>
        normalizedUsers.find(
          (currentUser) =>
            currentUser.id === selectedUserId
        ) || null,
      [
        normalizedUsers,
        selectedUserId,
      ]
    );


  /*
   * ============================================
   * FILTER
   * ============================================
   */

  const filteredUsers =
    useMemo(() => {

      const term =
        searchTerm
          .trim()
          .toLowerCase();


      return normalizedUsers.filter(
        (currentUser) => {

          const matchesSearch =
            !term ||
            currentUser.name
              .toLowerCase()
              .includes(term) ||

            currentUser.email
              .toLowerCase()
              .includes(term) ||

            currentUser.phone
              .toLowerCase()
              .includes(term);


          let matchesTab = true;


          if (
            activeTab === "active"
          ) {

            matchesTab =
              currentUser.status ===
              "active";

          }


          if (
            activeTab === "pending"
          ) {

            matchesTab =
              currentUser.status ===
              "pending";

          }


          if (
            activeTab === "admin"
          ) {

            matchesTab =
              currentUser.role ===
              "administrator";

          }


          return (
            matchesSearch &&
            matchesTab
          );

        }
      );

    }, [
      normalizedUsers,
      searchTerm,
      activeTab,
    ]);


  /*
   * ============================================
   * COUNTS
   * ============================================
   */

  const tabCounts =
    useMemo(() => {

      return {

        total:
          normalizedUsers.length,

        active:
          normalizedUsers.filter(
            (currentUser) =>
              currentUser.status ===
              "active"
          ).length,

        pending:
          normalizedUsers.filter(
            (currentUser) =>
              currentUser.status ===
              "pending"
          ).length,

        admin:
          normalizedUsers.filter(
            (currentUser) =>
              currentUser.role ===
              "administrator"
          ).length,

      };

    }, [
      normalizedUsers,
    ]);


  /*
   * ============================================
   * ROLE CHANGE
   * ============================================
   */

  async function handleRoleChange(
    userId,
    nextRole
  ) {

    if (!isAdministrator) {
      return;
    }


    if (
      userId === user?.uid
    ) {

      alert(
        "You cannot change your own administrator role."
      );

      return;

    }


    const targetUser =
      normalizedUsers.find(
        (currentUser) =>
          currentUser.id === userId
      );


    if (!targetUser) {
      return;
    }


    const confirmed =
      window.confirm(
        `Change ${targetUser.name}'s role from "${targetUser.role}" to "${nextRole}"?`
      );


    if (!confirmed) {
      return;
    }


    try {

      setUpdatingUserId(userId);


      await updateUserRole(
        userId,
        nextRole
      );

    } catch (error) {

      console.error(
        "Role update failed:",
        error
      );


      alert(
        error.message ||
        "Failed to update user role."
      );

    } finally {

      setUpdatingUserId(null);

    }

  }


  /*
   * ============================================
   * STATUS CHANGE
   * ============================================
   */

  async function handleStatusChange(
    userId,
    nextStatus
  ) {

    if (!isAdministrator) {
      return;
    }


    if (
      userId === user?.uid &&
      nextStatus === "inactive"
    ) {

      alert(
        "You cannot deactivate your own administrator account."
      );

      return;

    }


    const targetUser =
      normalizedUsers.find(
        (currentUser) =>
          currentUser.id === userId
      );


    if (!targetUser) {
      return;
    }


    const action =
      nextStatus === "inactive"
        ? "deactivate"
        : "activate";


    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} ${targetUser.name}'s account?`
      );


    if (!confirmed) {
      return;
    }


    try {

      setUpdatingUserId(userId);


      await updateUserStatus(
        userId,
        nextStatus
      );

    } catch (error) {

      console.error(
        "Status update failed:",
        error
      );


      alert(
        error.message ||
        "Failed to update account status."
      );

    } finally {

      setUpdatingUserId(null);

    }

  }


  /*
   * ============================================
   * OPEN DETAILS
   * ============================================
   */

  function handleOpenDetails(userId) {

    if (!isAdministrator) {
      return;
    }


    setSelectedUserId(userId);

  }


  /*
   * ============================================
   * CLOSE DETAILS
   * ============================================
   */

  function handleCloseDetails() {

    if (savingProfile) {
      return;
    }


    setSelectedUserId(null);

  }


  /*
   * ============================================
   * SAVE PROFILE
   * ============================================
   */

  async function handleSaveProfile(
    profileData
  ) {

    if (!isAdministrator) {

      throw new Error(
        "Only administrators can edit user profiles."
      );

    }


    if (!selectedUserId) {

      throw new Error(
        "No user is selected."
      );

    }


    try {

      setSavingProfile(true);


      await updateUserProfile(
        selectedUserId,
        profileData
      );


      /*
       * No manual user-list refresh is necessary.
       *
       * subscribeToUsers() already provides the
       * real-time Firestore listener.
       */

      setSelectedUserId(null);

    } catch (error) {

      console.error(
        "Profile update failed:",
        error
      );


      throw error;

    } finally {

      setSavingProfile(false);

    }

  }


  /*
   * ============================================
   * AUTH CHECK
   * ============================================
   */

  if (!user) {

    return (
      <div className="users-container">
        Not logged in.
      </div>
    );

  }


  if (!isAdministrator) {

    return (
      <div className="users-container">

        <div className="privacy-notice">

          Only administrators can access
          User Management.

        </div>

      </div>
    );

  }


  /*
   * ============================================
   * UI
   * ============================================
   */

  return (

    <div className="users-container">

      <header className="users-header">

        <h1>
          <i className="fas fa-users-cog"></i>
          User Management
        </h1>

        <p className="subtitle">
          Manage user accounts, roles, and
          permissions
        </p>

      </header>


      {errMsg && (

        <div className="privacy-notice">
          {errMsg}
        </div>

      )}


      {/* =====================================
          ACCOUNT OVERVIEW
          ===================================== */}

      <div className="tabs-container">

        <div className="tabs-header">

          <div className="tabs-title">
            Account Overview
          </div>


          <div className="tabs">

            {[
              "total",
              "active",
              "pending",
              "admin",
            ].map((tab) => (

              <button
                key={tab}
                type="button"
                className={
                  `tab ${
                    activeTab === tab
                      ? "active"
                      : ""
                  }`
                }
                onClick={() =>
                  setActiveTab(tab)
                }
              >

                <div className="tab-count">
                  {tabCounts[tab]}
                </div>

                <div className="tab-label">

                  {tab === "total"
                    ? "Total Users"
                    : tab === "active"
                      ? "Active Users"
                      : tab === "pending"
                        ? "Pending Users"
                        : "Administrators"}

                </div>

                <div className="tab-subtitle">

                  {tab === "total"
                    ? "All accounts"
                    : tab === "active"
                      ? "Currently active"
                      : tab === "pending"
                        ? "Awaiting activation"
                        : "Full access"}

                </div>

              </button>

            ))}

          </div>

        </div>

      </div>


      {/* =====================================
          SEARCH
          ===================================== */}

      <div className="search-container">

        <div className="search-box">

          <i className="fas fa-search"></i>

          <input
            type="text"
            placeholder="Search user accounts..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

        </div>

      </div>


      {/* =====================================
          USER TABLE
          ===================================== */}

      <div className="table-container">

        <h2 className="table-title">
          User Accounts
        </h2>


        {loading ? (

          <p className="users-loading">
            Loading users…
          </p>

        ) : (

          <table>

            <thead>

              <tr>

                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Account Type</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Created</th>
                <th>Actions</th>

              </tr>

            </thead>


            <tbody>

              {filteredUsers.map(
                (currentUser) => {

                  const isUpdating =
                    updatingUserId ===
                    currentUser.id;


                  return (

                    <tr
                      key={
                        currentUser.id
                      }
                    >

                      {/* USER */}

                      <td>

                        <div className="user-info">

                          <div className="user-name">
                            {currentUser.name}
                          </div>

                          <div className="user-permissions">

                            {currentUser.phone
                              ? `Phone: ${currentUser.phone}`
                              : "—"}

                          </div>

                        </div>

                      </td>


                      {/* EMAIL */}

                      <td className="user-email">
                        {currentUser.email}
                      </td>


                      {/* ROLE */}

                      <td>

                        <select
                          className="role-select"
                          value={
                            currentUser.role
                          }
                          onChange={(event) =>
                            handleRoleChange(
                              currentUser.id,
                              event.target.value
                            )
                          }
                          disabled={
                            isUpdating ||
                            currentUser.id ===
                              user.uid
                          }
                        >

                          <option value="customer">
                            customer
                          </option>

                          <option value="viewer">
                            viewer
                          </option>

                          <option value="operator">
                            operator
                          </option>

                          <option value="administrator">
                            administrator
                          </option>

                        </select>

                      </td>


                      {/* ACCOUNT TYPE */}

                      <td>

                        <span
                          className={
                            `role-badge role-${
                              currentUser.accountType
                            }`
                          }
                        >
                          {currentUser.accountType}
                        </span>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={
                            `status-badge status-${
                              currentUser.status
                            }`
                          }
                        >
                          {currentUser.status}
                        </span>

                      </td>


                      {/* LAST LOGIN */}

                      <td className="datetime">
                        {currentUser.lastLogin}
                      </td>


                      {/* CREATED */}

                      <td className="datetime">
                        {currentUser.created}
                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="users-actions">

                          <button
                            type="button"
                            disabled={
                              isUpdating
                            }
                            onClick={() =>
                              handleOpenDetails(
                                currentUser.id
                              )
                            }
                          >
                            Details
                          </button>


                          {currentUser.id ===
                          user.uid ? (

                            <span className="users-actionMuted">
                              Current account
                            </span>

                          ) : (

                            <button
                              type="button"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                handleStatusChange(
                                  currentUser.id,
                                  currentUser.status ===
                                    "inactive"
                                    ? "active"
                                    : "inactive"
                                )
                              }
                            >

                              {isUpdating
                                ? "Updating..."
                                : currentUser.status ===
                                  "inactive"
                                  ? "Activate"
                                  : "Deactivate"}

                            </button>

                          )}

                        </div>

                      </td>

                    </tr>

                  );

                }
              )}


              {!filteredUsers.length && (

                <tr>

                  <td
                    colSpan={8}
                    className="users-empty"
                  >
                    No users match your
                    search/filter.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        )}

      </div>


      {/* =====================================
          USER DETAILS MODAL
          ===================================== */}

      <UserDetailsModal
        user={selectedUser}
        isOpen={Boolean(selectedUser)}
        isSaving={savingProfile}
        onClose={handleCloseDetails}
        onSave={handleSaveProfile}
      />

    </div>

  );

}